import { useState, useRef, useEffect, Fragment } from 'react';
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
    findNestedObjArr,
    secondsToTime,
    useLocalStorage,
} from './helpers';
import DumbbellIcon from './icons/Dumbbell';
import HourglassIcon from './icons/Hourglass';

const Workout = ({ dayOfWeek }) => {
    const [workout, setWorkout] = useLocalStorage(`${dayOfWeek}Workout`, []);
    const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false);
    const [isDeleteRoutineOpen, setIsDeleteRoutineOpen] = useState(false);
    const [deleteRoutineName, setDeleteRoutineName] = useState(null);
    const [currentExerciseId, setCurrentExerciseId] = useState(null);
    const [currentEditSetId, setCurrentEditSetId] = useState(null);
    const [previousExercise, setPreviousExercise] = useState(null);
    const [isSetRest, setIsSetRest] = useState(false);
    const [previousElementAnimate, setPreviousElementAnimate] = useState(null);
    const exercisesRef = useRef(null);
    const speech = new Speech();
    const startDate = useRef(Date.now());

    speech.init({
        lang: 'ja-JP',
        rate: 1.02,
        pitch: 0.85,
    });

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

    const isExerciseNameLongerThanWidth = (id) => {
        const element = document?.getElementById(`exercise-${id}-name`);
        const elementWidth = element?.getBoundingClientRect()?.width;
        const width = window.innerWidth - 80;
        const widthOffset = String(width - 8 - elementWidth);
        const elementAnimate = element?.animate(
            [
                { transform: 'translateX(0%)' },
                { transform: `translateX(${widthOffset}px)` },
                { transform: 'translateX(0%)' },
            ],
            { duration: 7000, iterations: Infinity },
        );

        elementAnimate?.pause();

        if (elementWidth > width) {
            elementAnimate?.play();
            setPreviousElementAnimate(elementAnimate);
        }
        if (previousElementAnimate !== elementAnimate) {
            previousElementAnimate?.cancel();
        }
    };

    useEffect(() => {
        if (currentExerciseId) {
            isExerciseNameLongerThanWidth(currentExerciseId);
        }
    }, [currentExerciseId]);

    useEffect(() => {
        const dayOfWeekWorkout = localStorage.getItem(`${dayOfWeek}Workout`);

        if (dayOfWeekWorkout) {
            setWorkout(JSON.parse(dayOfWeekWorkout));
        } else {
            localStorage.setItem(`${dayOfWeek}Workout`, JSON.stringify([]));
            setWorkout([]);
        }
    }, [dayOfWeek]);

    return (
        <>
            {workout.map((routine, idx) => (
                <Disclosure key={idx} defaultOpen>
                    {(panel) => {
                        const { open, close } = panel;

                        return (
                            <>
                                <Disclosure.Button
                                    className="sticky top-0 z-10 mb-8 flex w-full items-center justify-between overflow-hidden rounded-lg border-4 border-gray-50 bg-black p-4 text-left font-medium capitalize text-gray-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!open) {
                                            close();
                                        }
                                    }}
                                >
                                    <span className="flex items-center gap-3">
                                        {routine.name}
                                        <TrashIcon
                                            className="h-10 w-10 text-red-300 hover:cursor-pointer hover:text-red-400"
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
                                            'h-10 w-10 text-gray-50',
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
                                                        <div className="flex justify-center pb-4">
                                                            <button
                                                                type="button"
                                                                className="flex w-80 justify-center rounded-lg bg-green-300 p-4 font-medium capitalize text-black hover:bg-green-400"
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
                                                            'flex max-w-full items-center justify-center gap-4 px-2 hover:cursor-pointer',
                                                            currentExerciseId ===
                                                                exercise.id &&
                                                                'text-8xl font-extrabold text-gray-50',
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
                                                        <div className="max-w-full overflow-x-clip overflow-y-visible">
                                                            <span
                                                                className={classNames(
                                                                    'left-0 inline-block whitespace-nowrap capitalize',
                                                                )}
                                                                id={`exercise-${exercise.id}-name`}
                                                            >
                                                                {exercise.name}
                                                            </span>
                                                        </div>
                                                        {exercise.timer &&
                                                        currentExerciseId ===
                                                            exercise.id ? (
                                                            <Countdown
                                                                date={
                                                                    startDate.current +
                                                                    exercise.timer *
                                                                        1000
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
                                                                <ClockIcon className="h-10 w-10" />
                                                                {secondsToTime(
                                                                    exercise.timer,
                                                                )}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    {exercise.sets ? (
                                                        <table className="w-full overflow-hidden rounded-lg text-center text-gray-400">
                                                            <thead className="h-8 bg-gray-700 capitalize text-gray-400">
                                                                <tr>
                                                                    <th className="py-2">
                                                                        set
                                                                    </th>
                                                                    <th className="py-2">
                                                                        weight
                                                                    </th>
                                                                    <th className="py-2">
                                                                        reps
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-gray-800">
                                                                {exercise.sets.map(
                                                                    (
                                                                        set,
                                                                        idx,
                                                                        sets,
                                                                    ) =>
                                                                        currentEditSetId ===
                                                                        set.id ? (
                                                                            <Fragment
                                                                                key={
                                                                                    idx
                                                                                }
                                                                            >
                                                                                <tr
                                                                                    key={
                                                                                        idx
                                                                                    }
                                                                                    className="h-10 hover:cursor-pointer"
                                                                                >
                                                                                    <td className="py-2">
                                                                                        <span className="flex items-center justify-center gap-1 text-8xl font-extrabold text-gray-50">
                                                                                            <div className="h-10 w-2" />
                                                                                            {idx +
                                                                                                1}
                                                                                            <div className="h-10 w-2" />
                                                                                        </span>
                                                                                    </td>
                                                                                    <td className="py-2">
                                                                                        <span className="flex items-center justify-center gap-4 text-8xl font-extrabold text-gray-50">
                                                                                            <MinusCircleIcon
                                                                                                className="h-20 w-20 text-red-300 hover:cursor-pointer hover:text-red-400"
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
                                                                                            <span className="flex items-center">
                                                                                                {
                                                                                                    set.weight
                                                                                                }
                                                                                            </span>
                                                                                            <PlusCircleIcon
                                                                                                className="h-20 w-20 text-blue-300 hover:cursor-pointer hover:text-blue-400"
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
                                                                                    <td className="py-2">
                                                                                        <span className="flex items-center justify-center gap-4 text-8xl font-extrabold text-gray-50">
                                                                                            <MinusCircleIcon
                                                                                                className="h-20 w-20 text-red-300 hover:cursor-pointer hover:text-red-400"
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
                                                                                                className="h-20 w-20 text-blue-300 hover:cursor-pointer hover:text-blue-400"
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
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colSpan="3">
                                                                                        <span className="flex w-full items-center justify-center border-b border-gray-700 py-4">
                                                                                            {isSetRest ? (
                                                                                                <Countdown
                                                                                                    autoStart
                                                                                                    date={
                                                                                                        startDate.current +
                                                                                                        exercise.setRest *
                                                                                                            1000
                                                                                                    }
                                                                                                    renderer={({
                                                                                                        minutes,
                                                                                                        seconds,
                                                                                                    }) => (
                                                                                                        <span className="flex items-center justify-center gap-1 text-7xl capitalize text-gray-50">
                                                                                                            rest
                                                                                                            <HourglassIcon className="h-16 w-16" />
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
                                                                                                            timeObj.seconds ===
                                                                                                            59
                                                                                                        ) {
                                                                                                            textToSpeech(
                                                                                                                `${
                                                                                                                    exercise.setRest /
                                                                                                                    60
                                                                                                                }分休憩`,
                                                                                                            );
                                                                                                        }
                                                                                                        if (
                                                                                                            timeObj.seconds <=
                                                                                                            5
                                                                                                        ) {
                                                                                                            textToSpeech(
                                                                                                                timeObj.seconds,
                                                                                                            );
                                                                                                        }
                                                                                                    }}
                                                                                                    onComplete={() => {
                                                                                                        setIsSetRest(
                                                                                                            false,
                                                                                                        );
                                                                                                        setCurrentEditSetId(
                                                                                                            sets[
                                                                                                                idx +
                                                                                                                    1
                                                                                                            ]
                                                                                                                .id,
                                                                                                        );
                                                                                                        scrollToExercise(
                                                                                                            exercise.id,
                                                                                                            exercise.jpSpeech,
                                                                                                        );
                                                                                                    }}
                                                                                                />
                                                                                            ) : (
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="flex w-80 justify-center rounded-lg bg-green-300 p-4 font-medium capitalize text-black hover:bg-green-400"
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
                                                                                                            exercise.setRest &&
                                                                                                            sets[
                                                                                                                idx +
                                                                                                                    1
                                                                                                            ]
                                                                                                        ) {
                                                                                                            setIsSetRest(
                                                                                                                true,
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
                                                                                            )}
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                            </Fragment>
                                                                        ) : (
                                                                            <tr
                                                                                key={
                                                                                    idx
                                                                                }
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
                                                                                <td className="py-2">
                                                                                    <span className="flex items-center justify-center gap-2">
                                                                                        <div className="h-10 w-2" />
                                                                                        {idx +
                                                                                            1}
                                                                                        <div className="h-10 w-2" />
                                                                                    </span>
                                                                                </td>
                                                                                <td className="py-2">
                                                                                    <span className="flex items-center justify-center gap-2">
                                                                                        <div className="h-10 w-10" />
                                                                                        <DumbbellIcon className="h-10 w-10" />
                                                                                        {`${set.weight} lbs`}
                                                                                        <div className="h-10 w-10" />
                                                                                    </span>
                                                                                </td>
                                                                                <td className="py-2">
                                                                                    <span className="flex items-center justify-center gap-2">
                                                                                        <div className="h-10 w-10" />
                                                                                        {
                                                                                            set.reps
                                                                                        }
                                                                                        <div className="h-10 w-10" />
                                                                                    </span>
                                                                                </td>
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
                                                            className="flex items-center justify-center gap-4 hover:cursor-pointer"
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
                                                            <span
                                                                className={classNames(
                                                                    'inline-flex items-center whitespace-nowrap rounded-lg px-2 py-1 text-xl font-medium ring-1 ring-inset ring-red-600/10',
                                                                    exercise.superset ===
                                                                        1
                                                                        ? 'bg-red-100 text-red-700'
                                                                        : exercise.superset ===
                                                                            2
                                                                          ? 'bg-blue-100 text-blue-700'
                                                                          : exercise.superset ===
                                                                              3
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : exercise.superset ===
                                                                                4
                                                                              ? 'bg-orange-100 text-orange-700'
                                                                              : exercise.superset ===
                                                                                  5
                                                                                ? 'bg-gray-100 text-gray-700'
                                                                                : '',
                                                                )}
                                                            >
                                                                {`Superset ${exercise.superset}`}
                                                            </span>
                                                            {currentExerciseId ===
                                                            `${routine.id}-superset-${exercise.superset}` ? (
                                                                <Countdown
                                                                    autoStart
                                                                    date={
                                                                        startDate.current +
                                                                        exercise.supersetRest *
                                                                            1000
                                                                    }
                                                                    renderer={({
                                                                        minutes,
                                                                        seconds,
                                                                    }) => (
                                                                        <span className="flex items-center justify-center gap-1 text-8xl font-extrabold capitalize text-gray-50">
                                                                            rest
                                                                            <HourglassIcon className="h-20 w-20" />
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
                                                                    <HourglassIcon className="h-7 w-7" />
                                                                    {secondsToTime(
                                                                        exercise.supersetRest,
                                                                    )}
                                                                    <ArrowsUpDownIcon className="h-10 w-10" />
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : idx + 1 <
                                                          routine.exercises
                                                              .length &&
                                                      exercise.rest ? (
                                                        <div
                                                            className="flex items-center justify-center gap-1 py-2 hover:cursor-pointer"
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
                                                                        startDate.current +
                                                                        exercise.rest *
                                                                            1000
                                                                    }
                                                                    renderer={({
                                                                        minutes,
                                                                        seconds,
                                                                    }) => (
                                                                        <span className="flex items-center justify-center gap-1 text-8xl font-extrabold capitalize text-gray-50">
                                                                            rest
                                                                            <HourglassIcon className="h-20 w-20" />
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
                                                                    <HourglassIcon className="h-7 w-7" />
                                                                    {secondsToTime(
                                                                        exercise.rest,
                                                                    )}
                                                                    <ArrowDownIcon className="h-10 w-10" />
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
                                                                'mb-8 flex w-full justify-center px-4 py-2 uppercase',
                                                                currentExerciseId ===
                                                                    `${routine.id}-end`
                                                                    ? 'text-8xl font-extrabold text-gray-50'
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
            <PlusCircleIcon
                className="sticky bottom-0 h-20 w-20 rounded-full bg-black text-gray-50 hover:cursor-pointer hover:bg-gray-700"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsAddRoutineOpen(true);
                }}
            >
                add routine
            </PlusCircleIcon>
            <AddRoutine
                isOpen={isAddRoutineOpen}
                setIsOpen={setIsAddRoutineOpen}
                workout={workout}
                setWorkout={setWorkout}
            />
        </>
    );
};

export default Workout;
