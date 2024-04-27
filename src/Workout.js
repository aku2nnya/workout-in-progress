import { useState, useRef } from 'react';
import Countdown, { zeroPad } from 'react-countdown';
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
    const [workout, setWorkout] = useLocalStorage('workout', []);
    const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false);
    const [isDeleteRoutineOpen, setIsDeleteRoutineOpen] = useState(false);
    const [deleteRoutineName, setDeleteRoutineName] = useState(null);
    // const [activeDisclosurePanel, setActiveDisclosurePanel] = useState(null);
    const [currentExerciseId, setCurrentExerciseId] = useState(null);
    const [editSetId, setEditSetId] = useState(null);
    const exercisesRef = useRef(null);

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

    const scrollToExercise = (exerciseId) => {
        const map = getMap();
        const node = map.get(exerciseId);

        node.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
        setCurrentExerciseId(exerciseId);
    };

    const getMap = () => {
        if (!exercisesRef.current) {
            // Initialize the Map on first usage.
            exercisesRef.current = new Map();
        }
        return exercisesRef.current;
    };

    const selectFirstEditSet = (routine, exerciseId) => {
        const exercise = findNestedObjArr(routine, 'id', exerciseId)[0];
        console.log({ exercise });
        if (
            exercise.sets &&
            exercise.sets.find((set) => set.id !== editSetId)
        ) {
            setEditSetId(exercise.sets[0].id);
        }
    };

    const selectNextEditset = (routine, exercise, setIdx) => {
        if (exercise.superset) {
            // `${exercise.id}-${exercise.supersetRest}`;
            const supersetExercises = findNestedObjArr(
                routine,
                'superset',
                exercise.superset,
            );
            console.log({ exercise, supersetExercises, setIdx });
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

    return (
        <>
            <button
                type="button"
                className="mb-4 mt-2 flex w-full justify-center rounded-lg bg-purple-100 px-4 py-2 text-left text-lg font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                onClick={() => {
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
                                    className="sticky top-4 my-2 flex w-full items-center justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-lg font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                                    onClick={() => {
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
                                    {routine.exercises.map((exercise, idx) => (
                                        <Disclosure.Panel
                                            key={idx}
                                            className="flex flex-col justify-center gap-2 text-lg text-gray-500"
                                        >
                                            {idx === 0 && open ? (
                                                <div className="flex justify-center">
                                                    <button
                                                        type="button"
                                                        className="my-2 flex w-40 justify-center rounded-lg bg-purple-100 px-4 py-2 text-lg font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            scrollToExercise(
                                                                exercise.id,
                                                            );
                                                            selectFirstEditSet(
                                                                routine,
                                                                exercise.id,
                                                            );
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
                                                        'text-4xl font-extrabold',
                                                    exercise.sets &&
                                                        'justify-between',
                                                    !exercise.sets &&
                                                        'flex-col',
                                                )}
                                                ref={(node) => {
                                                    const map = getMap();
                                                    if (node) {
                                                        map.set(
                                                            exercise.id,
                                                            node,
                                                        );
                                                    } else {
                                                        map.delete(exercise.id);
                                                    }
                                                }}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    scrollToExercise(
                                                        exercise.id,
                                                    );
                                                    selectFirstEditSet(
                                                        routine,
                                                        exercise.id,
                                                    );
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
                                                            exercise.timer *
                                                                1000
                                                        }
                                                        renderer={({
                                                            minutes,
                                                            seconds,
                                                        }) => (
                                                            <span className="flex items-center gap-1">
                                                                <ClockIcon className="h-8 w-8" />
                                                                {zeroPad(
                                                                    minutes,
                                                                )}
                                                                :
                                                                {zeroPad(
                                                                    seconds,
                                                                )}
                                                            </span>
                                                        )}
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
                                                            'inline-flex items-center rounded-md px-2 py-1 text-base font-medium ring-1 ring-inset ring-red-600/10',
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
                                                <table className="w-full overflow-hidden rounded-lg text-center text-lg text-gray-400">
                                                    <thead className="h-8 bg-gray-700 capitalize text-gray-400">
                                                        <tr>
                                                            <th>set</th>
                                                            <th>weight</th>
                                                            <th>reps</th>
                                                            <th></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {exercise.sets.map(
                                                            (set, idx) => (
                                                                <tr
                                                                    key={idx}
                                                                    className="h-10 border-b border-gray-700 bg-gray-800"
                                                                    onClick={(
                                                                        e,
                                                                    ) => {
                                                                        e.preventDefault();
                                                                        setEditSetId(
                                                                            set.id,
                                                                        );
                                                                        scrollToExercise(
                                                                            exercise.id,
                                                                        );
                                                                    }}
                                                                >
                                                                    {editSetId ===
                                                                    set.id ? (
                                                                        <>
                                                                            <td>
                                                                                <span className="flex items-center justify-center gap-1 text-4xl font-extrabold">
                                                                                    <div className="h-5 w-2" />
                                                                                    {idx +
                                                                                        1}
                                                                                    <div className="h-5 w-2" />
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                <span className="flex items-center justify-center gap-4 text-4xl font-extrabold">
                                                                                    <MinusCircleIcon
                                                                                        className="h-10 w-10 text-red-300"
                                                                                        onClick={(
                                                                                            e,
                                                                                        ) => {
                                                                                            e.preventDefault();
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
                                                                                            e.preventDefault();
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
                                                                                <span className="flex items-center justify-center gap-4 text-4xl font-extrabold">
                                                                                    <MinusCircleIcon
                                                                                        className="h-10 w-10 text-red-300 hover:text-red-400"
                                                                                        onClick={(
                                                                                            e,
                                                                                        ) => {
                                                                                            e.preventDefault();
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
                                                                                            e.preventDefault();
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
                                                                            <td className="flex justify-center">
                                                                                <button
                                                                                    type="button"
                                                                                    className="my-2 flex w-32 justify-center rounded-lg bg-green-300 p-1 text-lg font-medium capitalize text-gray-800 hover:bg-green-400"
                                                                                    onClick={(
                                                                                        e,
                                                                                    ) => {
                                                                                        e.preventDefault();
                                                                                        selectNextEditset(
                                                                                            routine,
                                                                                            exercise,
                                                                                            idx,
                                                                                        );
                                                                                        // scrollToExercise(
                                                                                        //     exercise.id,
                                                                                        // );
                                                                                        // selectFirstEditSet(
                                                                                        //     exercise.id,
                                                                                        // );
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
                                                routine.exercises[idx + 1]
                                                    ?.superset ? (
                                                <div
                                                    ref={(node) => {
                                                        const map = getMap();
                                                        if (node) {
                                                            map.set(
                                                                `${exercise.id}-${exercise.supersetRest}`,
                                                                node,
                                                            );
                                                        } else {
                                                            map.delete(
                                                                `${exercise.id}-${exercise.supersetRest}`,
                                                            );
                                                        }
                                                    }}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        scrollToExercise(
                                                            `${exercise.id}-${exercise.supersetRest}`,
                                                        );
                                                        setEditSetId(null);
                                                    }}
                                                >
                                                    {currentExerciseId ===
                                                    `${exercise.id}-${exercise.supersetRest}` ? (
                                                        <Countdown
                                                            autoStart
                                                            date={
                                                                Date.now() +
                                                                exercise.supersetRest *
                                                                    1000
                                                            }
                                                            renderer={({
                                                                minutes,
                                                                seconds,
                                                            }) => (
                                                                <span className="flex items-center justify-center gap-1 text-4xl font-extrabold">
                                                                    <ArrowsUpDownIcon className="h-8 w-8" />
                                                                    <HourglassIcon className="h-8 w-8" />
                                                                    {zeroPad(
                                                                        minutes,
                                                                    )}
                                                                    :
                                                                    {zeroPad(
                                                                        seconds,
                                                                    )}
                                                                </span>
                                                            )}
                                                        />
                                                    ) : (
                                                        <span className="flex items-center justify-center gap-1">
                                                            <ArrowsUpDownIcon className="h-5 w-5" />
                                                            <HourglassIcon className="h-5 w-5" />
                                                            {secondsToTime(
                                                                exercise.supersetRest,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : idx + 1 <
                                                  routine.exercises.length &&
                                              exercise.rest ? (
                                                <div
                                                    className="flex items-center justify-center gap-1 py-2"
                                                    ref={(node) => {
                                                        const map = getMap();
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
                                                        e.preventDefault();
                                                        scrollToExercise(
                                                            `${exercise.id}-${exercise.rest}`,
                                                        );
                                                        setEditSetId(null);
                                                    }}
                                                >
                                                    {currentExerciseId ===
                                                    `${exercise.id}-${exercise.rest}` ? (
                                                        <Countdown
                                                            autoStart
                                                            date={
                                                                Date.now() +
                                                                exercise.rest *
                                                                    1000
                                                            }
                                                            renderer={({
                                                                minutes,
                                                                seconds,
                                                            }) => (
                                                                <span className="flex items-center justify-center gap-1 text-4xl font-extrabold">
                                                                    <ArrowDownIcon className="h-8 w-8" />
                                                                    <HourglassIcon className="h-8 w-8" />
                                                                    {zeroPad(
                                                                        minutes,
                                                                    )}
                                                                    :
                                                                    {zeroPad(
                                                                        seconds,
                                                                    )}
                                                                </span>
                                                            )}
                                                        />
                                                    ) : (
                                                        <span className="flex items-center justify-center gap-1">
                                                            <ArrowDownIcon className="h-5 w-5" />
                                                            <HourglassIcon className="h-5 w-5" />
                                                            {secondsToTime(
                                                                exercise.rest,
                                                            )}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : idx + 1 <
                                              routine.exercises.length ? (
                                                <div className="flex items-center justify-center">
                                                    <ArrowDownIcon className="h-5 w-5" />
                                                </div>
                                            ) : (
                                                <span className="my-0.25"></span>
                                            )}
                                        </Disclosure.Panel>
                                    ))}
                                </div>
                            </>
                        );
                    }}
                </Disclosure>
            ))}
            <div className="mb-4 mt-2 flex w-full justify-center px-4 py-2 text-left text-lg font-medium uppercase">
                end
            </div>
        </>
    );
};

export default Workout;
