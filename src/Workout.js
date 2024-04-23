import { useState, useRef } from 'react';
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
import { classNames, useLocalStorage, findNestedObj } from './helpers';
import DumbbellIcon from './icons/Dumbbell';
import HourglassIcon from './icons/Hourglass';

const Workout = () => {
    const [workout, setWorkout] = useLocalStorage('workout', []);
    const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false);
    const [isDeleteRoutineOpen, setIsDeleteRoutineOpen] = useState(false);
    const [deleteRoutineName, setDeleteRoutineName] = useState(null);
    const [activeDisclosurePanel, setActiveDisclosurePanel] = useState(null);
    const [currentExerciseId, setCurrentExerciseId] = useState(null);
    const [editSetId, setEditSetId] = useState(null);
    const exercisesRef = useRef(null);

    const togglePanels = (newPanel) => {
        if (activeDisclosurePanel) {
            if (
                activeDisclosurePanel.key !== newPanel.key &&
                activeDisclosurePanel.open
            ) {
                activeDisclosurePanel.close();
            }
        }

        setActiveDisclosurePanel({
            ...newPanel,
            open: !newPanel.open,
        });
    };

    const scrollToExercise = (exerciseId) => {
        const map = getMap();
        const node = map.get(exerciseId);

        node.scrollIntoView({
            behavior: 'smooth',
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

    const selectFirstEditSet = (exerciseId) => {
        const exercise = findNestedObj(workout, 'id', exerciseId);
        if (
            exercise.sets &&
            exercise.sets.find((set) => set.id !== editSetId)
        ) {
            setEditSetId(exercise.sets[0].id);
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
                                    className="my-2 flex w-full items-center justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-lg font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                                    onClick={() => {
                                        if (!open) {
                                            close();
                                        }

                                        togglePanels({
                                            ...panel,
                                            key: idx,
                                        });
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
                                            className="flex scroll-mt-2 flex-col justify-center gap-2 text-lg text-gray-500"
                                            ref={(node) => {
                                                const map = getMap();
                                                if (node) {
                                                    map.set(exercise.id, node);
                                                } else {
                                                    map.delete(exercise.id);
                                                }
                                            }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                scrollToExercise(exercise.id);
                                                selectFirstEditSet(exercise.id);
                                            }}
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
                                                    'py- flex items-center justify-center gap-2 rounded-md px-2',
                                                    currentExerciseId ===
                                                        exercise.id &&
                                                        'bg-red-100',
                                                    exercise.sets &&
                                                        'justify-between',
                                                )}
                                            >
                                                <span className="capitalize">
                                                    {exercise.name}
                                                </span>
                                                {exercise.timer ? (
                                                    <span className="flex items-center gap-1">
                                                        <ClockIcon className="h-5 w-5" />
                                                        {`${exercise.timer}s`}
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
                                                                                <span className="flex items-center justify-center gap-1">
                                                                                    <div className="h-5 w-2" />
                                                                                    {idx +
                                                                                        1}
                                                                                    <div className="h-5 w-2" />
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                <span className="flex items-center justify-center gap-1">
                                                                                    <MinusCircleIcon
                                                                                        className="h-5 w-5"
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
                                                                                    <DumbbellIcon className="h-5 w-5" />
                                                                                    {`${set.weight} lbs`}
                                                                                    <PlusCircleIcon
                                                                                        className="h-5 w-5"
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
                                                                                <span className="flex items-center justify-center gap-1">
                                                                                    <MinusCircleIcon
                                                                                        className="h-5 w-5"
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
                                                                                        className="h-5 w-5"
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
                                                <div className="flex items-center justify-center gap-1">
                                                    <ArrowsUpDownIcon className="h-5 w-5" />
                                                    <HourglassIcon className="h-5 w-5" />
                                                    {`${exercise.supersetRest}s`}
                                                </div>
                                            ) : idx + 1 <
                                              routine.exercises.length ? (
                                                <div
                                                    className={classNames(
                                                        'flex items-center justify-center gap-1',
                                                        exercise.rest
                                                            ? ' py-2'
                                                            : '',
                                                    )}
                                                >
                                                    <ArrowDownIcon className="h-5 w-5" />
                                                    {exercise.rest ? (
                                                        <span className="flex items-center justify-center gap-1">
                                                            <HourglassIcon className="h-5 w-5" />
                                                            {`${exercise.rest}s`}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            ) : null}
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
