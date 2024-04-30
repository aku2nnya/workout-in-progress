import { useState, useRef } from 'react';
import Countdown, { zeroPad } from 'react-countdown';
import Speech from 'speak-tts';
import { Disclosure } from '@headlessui/react';
import {
    ArrowDownIcon,
    ArrowsUpDownIcon,
    ChevronUpIcon,
    ClockIcon,
    MinusCircleIcon,
    PlusCircleIcon,
    TrashIcon,
} from '@heroicons/react/20/solid';

import AddRoutine from './AddRoutine';
import DeleteRoutine from './DeleteRoutine';
import {
    classNames,
    useLocalStorage,
    findNestedObjArr,
    secondsToTime,
} from './helpers';
import DumbbellIcon from './icons/Dumbbell';
import HourglassIcon from './icons/Hourglass';

const Workout = () => {
    const dayOfWeek = new Date()
        .toLocaleString('en', {
            weekday: 'long',
            timeZone: 'America/Los_Angeles',
        })
        .toLowerCase();
    const [workout, setWorkout] = useLocalStorage(`${dayOfWeek}Workout`, []);
    const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false);
    const [isDeleteRoutineOpen, setIsDeleteRoutineOpen] = useState(false);
    const [deleteRoutineName, setDeleteRoutineName] = useState(null);
    // const [activeDisclosurePanel, setActiveDisclosurePanel] = useState(null);
    const [currentExerciseId, setCurrentExerciseId] = useState(null);
    const [currentEditSetId, setCurrentEditSetId] = useState(null);
    const [previousExercise, setPreviousExercise] = useState(null);
    const exercisesRef = useRef(null);
    const speech = new Speech();

    speech.init({
        lang: 'ja-JP',
        rate: 1.02,
        pitch: 0.85,
    });

    // const togglePanels = (newPanel) => {
    //     if (activeDisclosurePanel) {
    //         if (
    //             activeDisclosurePanel.key !== newPanel.key &&
    //             activeDisclosurePanel.open
    //         ) {
    //             activeDisclosurePanel.close();
    //         }
    //     }

    //     setActiveDisclosurePanel({
    //         ...newPanel,
    //         open: !newPanel.open,
    //     });
    // };

    const scrollToExercise = (exerciseId, speech) => {
        const map = getMap();
        const node = map.get(exerciseId);

        node.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
        setCurrentExerciseId(exerciseId);

        if (speech) {
            textToSpeech(speech);
        }
    };

    const getMap = () => {
        if (!exercisesRef.current) {
            // Initialize the Map on first usage.
            exercisesRef.current = new Map();
        }

        return exercisesRef.current;
    };

    const selectEditSetId = (routine, exerciseId, setIdx) => {
        const exercise = findNestedObjArr(routine, 'id', exerciseId)[0];

        if (exercise?.sets.find((set) => set?.id !== currentEditSetId)) {
            setCurrentEditSetId(exercise?.sets[setIdx]?.id);
        }
    };

    const selectSupersetRest = (routine, exercise, setIdx, isLastExercise) => {
        const supersetExercises = findNestedObjArr(
            routine,
            'superset',
            exercise.superset,
        );
        const isLastSet = exercise.sets.length - 1 === setIdx;
        const isLastSuperset =
            supersetExercises.findIndex((exrcs) => exrcs.id === exercise.id) +
                1 ===
            supersetExercises.length;

        if (isLastExercise && isLastSuperset && isLastSet) {
            scrollToExercise(`${routine.id}-end`, 'どうもお疲れさまでした');
        } else if (isLastSuperset && isLastSet) {
            scrollToExercise(
                `${exercise.id}-${exercise.rest}`,
                `${exercise.rest / 60}分休憩`,
            );
        } else {
            scrollToExercise(
                `${routine.id}-superset-${exercise.superset}`,
                `${exercise.supersetRest / 60}分休憩`,
            );
        }
    };

    const selectNextSuperset = (routine, exercise) => {
        const supersetExercises = findNestedObjArr(
            routine,
            'superset',
            exercise?.superset,
        );
        const previousExerciseIdx = supersetExercises.findIndex(
            (supersetExercise) =>
                supersetExercise?.id === previousExercise?.exercise?.id,
        );

        if (previousExerciseIdx < supersetExercises?.length - 1) {
            scrollToExercise(
                supersetExercises[previousExerciseIdx + 1]?.id,
                supersetExercises[previousExerciseIdx + 1]?.jpSpeech,
            );
            selectEditSetId(
                routine,
                supersetExercises[previousExerciseIdx + 1]?.id,
                previousExercise?.setIdx,
            );
        } else {
            scrollToExercise(
                supersetExercises[0]?.id,
                supersetExercises[0]?.jpSpeech,
            );
            selectEditSetId(
                routine,
                supersetExercises[0]?.id,
                previousExercise?.setIdx + 1,
            );
        }
    };

    const updateWorkoutSet = (workoutData, setInfo, parameter, addSubtract) => {
        const newWorkoutData = [...workoutData];

        newWorkoutData.forEach((rtn) => {
            rtn.exercises?.forEach((exrcs) => {
                exrcs.sets?.forEach((st) => {
                    if (st.id === setInfo.id) {
                        if (
                            parameter === 'weight' &&
                            addSubtract === 'subtract'
                        ) {
                            const newWeight = setInfo.weight - 5;
                            setInfo.weight = newWeight;
                        } else if (
                            parameter === 'weight' &&
                            addSubtract === 'add'
                        ) {
                            const newWeight = setInfo.weight + 5;
                            setInfo.weight = newWeight;
                        } else if (
                            parameter === 'reps' &&
                            addSubtract === 'subtract'
                        ) {
                            const newReps = setInfo.reps - 1;
                            setInfo.reps = newReps;
                        } else if (
                            parameter === 'reps' &&
                            addSubtract === 'add'
                        ) {
                            const newReps = setInfo.reps + 1;
                            setInfo.reps = newReps;
                        }
                    }
                });
            });
        });

        setWorkout(newWorkoutData);
    };

    const textToSpeech = (text) => {
        return speech.speak({ text: String(text) });
    };

    return (
        <>
            <button
                type="button"
                className="mb-8 flex w-full justify-center rounded bg-purple-100 px-4 py-2 text-left font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsAddRoutineOpen(true);
                }}
            >
                add routine
            </button>
            <AddRoutine
                isOpen={isAddRoutineOpen}
                setIsOpen={setIsAddRoutineOpen}
                workout={workout}
                setWorkout={setWorkout}
            />
            {workout.map((routine, idx) => (
                <Disclosure key={idx} defaultOpen>
                    {(panel) => {
                        const { open, close } = panel;

                        return (
                            <>
                                <Disclosure.Button
                                    className="sticky top-0 flex w-full items-center justify-between rounded bg-purple-100 px-4 py-2 text-left font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!open) {
                                            close();
                                        }

                                        // togglePanels({
                                        //     ...panel,
                                        //     key: idx,
                                        // });
                                    }}
                                >
                                    <span className="flex items-center gap-1">
                                        {routine.name}
                                        <TrashIcon
                                            className="h-5 w-5 text-purple-500"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteRoutineName(
                                                    routine.name,
                                                    setIsDeleteRoutineOpen(
                                                        true,
                                                    ),
                                                );
                                            }}
                                        />
                                    </span>
                                    <ChevronUpIcon
                                        className={classNames(
                                            'h-5 w-5 text-purple-500',
                                            open ? 'rotate-180 transform' : '',
                                        )}
                                    />
                                </Disclosure.Button>
                                <DeleteRoutine
                                    isOpen={isDeleteRoutineOpen}
                                    setIsOpen={setIsDeleteRoutineOpen}
                                    workout={workout}
                                    setWorkout={setWorkout}
                                    routineName={deleteRoutineName}
                                />
                                <div className="flex flex-col justify-center gap-2">
                                    {routine.exercises.map(
                                        (exercise, idx, exercises) => {
                                            const isLastExercise =
                                                routine.exercises.findIndex(
                                                    (exrcs) =>
                                                        exrcs.id ===
                                                        exercise.id,
                                                ) +
                                                    1 ===
                                                routine.exercises.length;
                                            return (
                                                <Disclosure.Panel
                                                    key={idx}
                                                    className="flex flex-col justify-center gap-4 text-gray-500"
                                                >
                                                    {idx === 0 && open ? (
                                                        <div className="flex justify-center">
                                                            <button
                                                                type="button"
                                                                className="mt-8 flex w-40 justify-center rounded bg-purple-100 px-4 py-2 font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    scrollToExercise(
                                                                        exercise.id,
                                                                        exercise.jpSpeech,
                                                                    );
                                                                    if (
                                                                        exercise.sets
                                                                    ) {
                                                                        selectEditSetId(
                                                                            routine,
                                                                            exercise.id,
                                                                            0,
                                                                        );
                                                                    } else {
                                                                        setCurrentEditSetId(
                                                                            null,
                                                                        );
                                                                    }
                                                                }}
                                                            >
                                                                start
                                                            </button>
                                                        </div>
                                                    ) : null}
                                                    <div
                                                        className={classNames(
                                                            'flex items-center justify-center px-2',
                                                            currentExerciseId ===
                                                                exercise.id &&
                                                                'text-8xl font-extrabold text-white',
                                                            exercise.sets &&
                                                                'justify-between',
                                                            !exercise.sets &&
                                                                'flex-col text-center',
                                                        )}
                                                        ref={(node) => {
                                                            const map =
                                                                getMap();
                                                            if (node) {
                                                                map.set(
                                                                    exercise.id,
                                                                    node,
                                                                );
                                                            } else {
                                                                map.delete(
                                                                    exercise.id,
                                                                );
                                                            }
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            scrollToExercise(
                                                                exercise.id,
                                                                exercise.jpSpeech,
                                                            );
                                                            if (exercise.sets) {
                                                                selectEditSetId(
                                                                    routine,
                                                                    exercise.id,
                                                                    0,
                                                                );
                                                            } else {
                                                                setCurrentEditSetId(
                                                                    null,
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <span className="capitalize">
                                                            {exercise.name}
                                                        </span>
                                                        {exercise.timer &&
                                                        currentExerciseId ===
                                                            exercise.id ? (
                                                            <Countdown
                                                                date={
                                                                    Date.now() +
                                                                    // exercise.timer *
                                                                    //     1000
                                                                    10 * 1000
                                                                }
                                                                renderer={({
                                                                    minutes,
                                                                    seconds,
                                                                    api,
                                                                }) => (
                                                                    <span
                                                                        className="flex items-center gap-1"
                                                                        onClick={(
                                                                            e,
                                                                        ) => {
                                                                            e.stopPropagation();
                                                                            if (
                                                                                api.isPaused()
                                                                            ) {
                                                                                api.start();
                                                                            } else {
                                                                                api.pause();
                                                                            }
                                                                        }}
                                                                    >
                                                                        <ClockIcon className="h-24 w-24" />
                                                                        {zeroPad(
                                                                            minutes,
                                                                        )}
                                                                        :
                                                                        {zeroPad(
                                                                            seconds,
                                                                        )}
                                                                    </span>
                                                                )}
                                                                onTick={(
                                                                    timeObj,
                                                                ) => {
                                                                    if (
                                                                        timeObj.seconds <=
                                                                        5
                                                                    ) {
                                                                        return textToSpeech(
                                                                            timeObj.seconds,
                                                                        );
                                                                    }
                                                                }}
                                                                onComplete={() => {
                                                                    if (
                                                                        exercises[
                                                                            idx +
                                                                                1
                                                                        ]
                                                                    ) {
                                                                        scrollToExercise(
                                                                            exercises[
                                                                                idx +
                                                                                    1
                                                                            ]
                                                                                .id,
                                                                            exercises[
                                                                                idx +
                                                                                    1
                                                                            ]
                                                                                .jpSpeech,
                                                                        );
                                                                    }
                                                                    if (
                                                                        exercises[
                                                                            idx +
                                                                                1
                                                                        ].sets
                                                                    ) {
                                                                        selectEditSetId(
                                                                            routine,
                                                                            exercises[
                                                                                idx +
                                                                                    1
                                                                            ]
                                                                                .id,
                                                                            0,
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        ) : exercise.timer ? (
                                                            <span className="flex items-center gap-1">
                                                                <ClockIcon className="h-5 w-5" />
                                                                {secondsToTime(
                                                                    exercise.timer,
                                                                )}
                                                            </span>
                                                        ) : null}
                                                        {exercise.superset ? (
                                                            <span
                                                                className={classNames(
                                                                    'inline-flex items-center whitespace-nowrap rounded px-2 py-1 text-xl font-medium ring-1 ring-inset ring-red-600/10',
                                                                    exercise.superset ===
                                                                        1
                                                                        ? 'bg-red-50 text-red-700'
                                                                        : exercise.superset ===
                                                                            2
                                                                          ? 'bg-blue-50 text-blue-700'
                                                                          : exercise.superset ===
                                                                              3
                                                                            ? 'bg-green-50 text-green-700'
                                                                            : exercise.superset ===
                                                                                4
                                                                              ? 'bg-orange-50 text-orange-700'
                                                                              : exercise.superset ===
                                                                                  5
                                                                                ? 'bg-gray-50 text-gray-600'
                                                                                : '',
                                                                )}
                                                            >
                                                                {`Superset ${exercise.superset}`}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    {exercise.sets ? (
                                                        <table className="w-full overflow-hidden rounded text-center text-gray-400">
                                                            <thead className="h-8 bg-gray-700 capitalize text-gray-400">
                                                                <tr>
                                                                    <th>set</th>
                                                                    <th>
                                                                        weight
                                                                    </th>
                                                                    <th>
                                                                        reps
                                                                    </th>
                                                                    <th></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {exercise.sets.map(
                                                                    (
                                                                        set,
                                                                        idx,
                                                                        sets,
                                                                    ) => (
                                                                        <tr
                                                                            key={
                                                                                idx
                                                                            }
                                                                            className="h-10 border-b border-gray-700 bg-gray-800"
                                                                            onClick={(
                                                                                e,
                                                                            ) => {
                                                                                e.stopPropagation();
                                                                                setCurrentEditSetId(
                                                                                    set.id,
                                                                                );
                                                                                scrollToExercise(
                                                                                    exercise.id,
                                                                                    exercise.jpSpeech,
                                                                                );
                                                                            }}
                                                                        >
                                                                            {currentEditSetId ===
                                                                            set.id ? (
                                                                                <>
                                                                                    <td>
                                                                                        <span className="flex items-center justify-center gap-1 text-8xl font-extrabold text-white">
                                                                                            <div className="h-5 w-2" />
                                                                                            {idx +
                                                                                                1}
                                                                                            <div className="h-5 w-2" />
                                                                                        </span>
                                                                                    </td>
                                                                                    <td>
                                                                                        <span className="flex items-center justify-center gap-4 text-8xl font-extrabold text-white">
                                                                                            <MinusCircleIcon
                                                                                                className="h-10 w-10 text-red-300"
                                                                                                onClick={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    updateWorkoutSet(
                                                                                                        workout,
                                                                                                        set,
                                                                                                        'weight',
                                                                                                        'subtract',
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                            <span className="flex items-center gap-1">
                                                                                                {
                                                                                                    set.weight
                                                                                                }
                                                                                            </span>
                                                                                            <PlusCircleIcon
                                                                                                className="h-10 w-10 text-blue-300"
                                                                                                onClick={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    updateWorkoutSet(
                                                                                                        workout,
                                                                                                        set,
                                                                                                        'weight',
                                                                                                        'add',
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                        </span>
                                                                                    </td>
                                                                                    <td>
                                                                                        <span className="flex items-center justify-center gap-4 text-8xl font-extrabold text-white">
                                                                                            <MinusCircleIcon
                                                                                                className="h-10 w-10 text-red-300 hover:text-red-400"
                                                                                                onClick={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    updateWorkoutSet(
                                                                                                        workout,
                                                                                                        set,
                                                                                                        'reps',
                                                                                                        'subtract',
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                            {
                                                                                                set.reps
                                                                                            }
                                                                                            <PlusCircleIcon
                                                                                                className="h-10 w-10 text-blue-300 hover:text-blue-400"
                                                                                                onClick={(
                                                                                                    e,
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    updateWorkoutSet(
                                                                                                        workout,
                                                                                                        set,
                                                                                                        'reps',
                                                                                                        'add',
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="flex h-[99px] items-center justify-center">
                                                                                        <button
                                                                                            type="button"
                                                                                            className="flex- my-2 flex w-32 justify-center rounded bg-green-300 p-1 font-medium capitalize text-black hover:bg-green-400"
                                                                                            onClick={(
                                                                                                e,
                                                                                            ) => {
                                                                                                e.stopPropagation();
                                                                                                if (
                                                                                                    exercise.superset
                                                                                                ) {
                                                                                                    setPreviousExercise(
                                                                                                        {
                                                                                                            exercise,
                                                                                                            setIdx: idx,
                                                                                                        },
                                                                                                    );
                                                                                                    selectSupersetRest(
                                                                                                        routine,
                                                                                                        exercise,
                                                                                                        idx,
                                                                                                        isLastExercise,
                                                                                                    );
                                                                                                    setCurrentEditSetId(
                                                                                                        null,
                                                                                                    );
                                                                                                } else if (
                                                                                                    sets[
                                                                                                        idx +
                                                                                                            1
                                                                                                    ]
                                                                                                ) {
                                                                                                    setCurrentEditSetId(
                                                                                                        sets[
                                                                                                            idx +
                                                                                                                1
                                                                                                        ]
                                                                                                            .id,
                                                                                                    );
                                                                                                } else {
                                                                                                    if (
                                                                                                        isLastExercise
                                                                                                    ) {
                                                                                                        scrollToExercise(
                                                                                                            `${routine.id}-end`,
                                                                                                            'どうもお疲れさまでした',
                                                                                                        );
                                                                                                    } else {
                                                                                                        scrollToExercise(
                                                                                                            `${exercise.id}-${exercise.rest}`,
                                                                                                            `${
                                                                                                                exercise.rest /
                                                                                                                60
                                                                                                            }分休憩`,
                                                                                                        );
                                                                                                    }
                                                                                                    setCurrentEditSetId(
                                                                                                        null,
                                                                                                    );
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            next
                                                                                        </button>
                                                                                    </td>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <td>
                                                                                        <span className="flex items-center justify-center gap-1">
                                                                                            <div className="h-5 w-2" />
                                                                                            {idx +
                                                                                                1}
                                                                                            <div className="h-5 w-2" />
                                                                                        </span>
                                                                                    </td>
                                                                                    <td>
                                                                                        <span className="flex items-center justify-center gap-1">
                                                                                            <div className="h-5 w-5" />
                                                                                            <DumbbellIcon className="h-5 w-5" />
                                                                                            {`${set.weight} lbs`}
                                                                                            <div className="h-5 w-5" />
                                                                                        </span>
                                                                                    </td>
                                                                                    <td>
                                                                                        <span className="flex items-center justify-center gap-1">
                                                                                            <div className="h-5 w-5" />
                                                                                            {
                                                                                                set.reps
                                                                                            }
                                                                                            <div className="h-5 w-5" />
                                                                                        </span>
                                                                                    </td>
                                                                                    <td></td>
                                                                                </>
                                                                            )}
                                                                        </tr>
                                                                    ),
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    ) : null}
                                                    {exercise.superset &&
                                                    exercise.superset ===
                                                        routine.exercises[
                                                            idx + 1
                                                        ]?.superset ? (
                                                        <div
                                                            ref={(node) => {
                                                                const map =
                                                                    getMap();
                                                                if (node) {
                                                                    map.set(
                                                                        `${routine.id}-superset-${exercise.superset}`,
                                                                        node,
                                                                    );
                                                                } else {
                                                                    map.delete(
                                                                        `${routine.id}-superset-${exercise.superset}`,
                                                                    );
                                                                }
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                scrollToExercise(
                                                                    `${routine.id}-superset-${exercise.superset}`,
                                                                    `${
                                                                        exercise.supersetRest /
                                                                        60
                                                                    }分休憩`,
                                                                );
                                                                setCurrentEditSetId(
                                                                    null,
                                                                );
                                                            }}
                                                        >
                                                            {currentExerciseId ===
                                                            `${routine.id}-superset-${exercise.superset}` ? (
                                                                <Countdown
                                                                    autoStart
                                                                    date={
                                                                        Date.now() +
                                                                        // exercise.supersetRest *
                                                                        //     1000
                                                                        10 *
                                                                            1000
                                                                    }
                                                                    renderer={({
                                                                        minutes,
                                                                        seconds,
                                                                    }) => (
                                                                        <span className="flex items-center justify-center gap-1 text-8xl font-extrabold capitalize">
                                                                            rest
                                                                            <HourglassIcon className="h-24 w-24" />
                                                                            {zeroPad(
                                                                                minutes,
                                                                            )}
                                                                            :
                                                                            {zeroPad(
                                                                                seconds,
                                                                            )}
                                                                            <ArrowsUpDownIcon className="h-24 w-24" />
                                                                        </span>
                                                                    )}
                                                                    onTick={(
                                                                        timeObj,
                                                                    ) => {
                                                                        if (
                                                                            timeObj.seconds <=
                                                                            5
                                                                        ) {
                                                                            return textToSpeech(
                                                                                timeObj.seconds,
                                                                            );
                                                                        }
                                                                    }}
                                                                    onComplete={() =>
                                                                        previousExercise &&
                                                                        selectNextSuperset(
                                                                            routine,
                                                                            exercise,
                                                                        )
                                                                    }
                                                                />
                                                            ) : (
                                                                <span className="flex items-center justify-center gap-1 capitalize">
                                                                    rest
                                                                    <HourglassIcon className="h-5 w-5" />
                                                                    {secondsToTime(
                                                                        exercise.supersetRest,
                                                                    )}
                                                                    <ArrowsUpDownIcon className="h-5 w-5" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : idx + 1 <
                                                          routine.exercises
                                                              .length &&
                                                      exercise.rest ? (
                                                        <div
                                                            className="flex items-center justify-center gap-1 py-2"
                                                            ref={(node) => {
                                                                const map =
                                                                    getMap();
                                                                if (node) {
                                                                    map.set(
                                                                        `${exercise.id}-${exercise.rest}`,
                                                                        node,
                                                                    );
                                                                } else {
                                                                    map.delete(
                                                                        `${exercise.id}-${exercise.rest}`,
                                                                    );
                                                                }
                                                            }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                scrollToExercise(
                                                                    `${exercise.id}-${exercise.rest}`,
                                                                    `${
                                                                        exercise.rest /
                                                                        60
                                                                    }分休憩`,
                                                                );
                                                                setCurrentEditSetId(
                                                                    null,
                                                                );
                                                            }}
                                                        >
                                                            {currentExerciseId ===
                                                            `${exercise.id}-${exercise.rest}` ? (
                                                                <Countdown
                                                                    autoStart
                                                                    date={
                                                                        Date.now() +
                                                                        // exercise.rest *
                                                                        //     1000
                                                                        10 *
                                                                            1000
                                                                    }
                                                                    renderer={({
                                                                        minutes,
                                                                        seconds,
                                                                    }) => (
                                                                        <span className="flex items-center justify-center gap-1 text-8xl font-extrabold capitalize">
                                                                            rest
                                                                            <HourglassIcon className="h-24 w-24" />
                                                                            {zeroPad(
                                                                                minutes,
                                                                            )}
                                                                            :
                                                                            {zeroPad(
                                                                                seconds,
                                                                            )}
                                                                            <ArrowDownIcon className="h-24 w-24" />
                                                                        </span>
                                                                    )}
                                                                    onTick={(
                                                                        timeObj,
                                                                    ) => {
                                                                        if (
                                                                            timeObj.seconds <=
                                                                            5
                                                                        ) {
                                                                            return textToSpeech(
                                                                                timeObj.seconds,
                                                                            );
                                                                        }
                                                                    }}
                                                                    onComplete={() => {
                                                                        if (
                                                                            exercises[
                                                                                idx +
                                                                                    1
                                                                            ]
                                                                        ) {
                                                                            scrollToExercise(
                                                                                exercises[
                                                                                    idx +
                                                                                        1
                                                                                ]
                                                                                    .id,
                                                                                exercises[
                                                                                    idx +
                                                                                        1
                                                                                ]
                                                                                    .jpSpeech,
                                                                            );
                                                                        }
                                                                        if (
                                                                            exercises[
                                                                                idx +
                                                                                    1
                                                                            ]
                                                                                .sets
                                                                        ) {
                                                                            selectEditSetId(
                                                                                routine,
                                                                                exercises[
                                                                                    idx +
                                                                                        1
                                                                                ]
                                                                                    .id,
                                                                                0,
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="flex items-center justify-center gap-1 capitalize">
                                                                    rest
                                                                    <HourglassIcon className="h-5 w-5" />
                                                                    {secondsToTime(
                                                                        exercise.rest,
                                                                    )}
                                                                    <ArrowDownIcon className="h-5 w-5" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : idx + 1 <
                                                      routine.exercises
                                                          .length ? (
                                                        <div className="flex items-center justify-center">
                                                            <ArrowDownIcon className="h-5 w-5" />
                                                        </div>
                                                    ) : (
                                                        <span className="my-0.25"></span>
                                                    )}
                                                    {isLastExercise ? (
                                                        <div
                                                            className={classNames(
                                                                'mb-4 flex w-full justify-center px-4 py-2 uppercase',
                                                                currentExerciseId ===
                                                                    `${routine.id}-end`
                                                                    ? 'text-8xl font-extrabold'
                                                                    : '',
                                                            )}
                                                            ref={(node) => {
                                                                const map =
                                                                    getMap();
                                                                if (node) {
                                                                    map.set(
                                                                        `${routine.id}-end`,
                                                                        node,
                                                                    );
                                                                } else {
                                                                    map.delete(
                                                                        `${routine.id}-end`,
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            end
                                                        </div>
                                                    ) : null}
                                                </Disclosure.Panel>
                                            );
                                        },
                                    )}
                                </div>
                            </>
                        );
                    }}
                </Disclosure>
            ))}
        </>
    );
};

export default Workout;
