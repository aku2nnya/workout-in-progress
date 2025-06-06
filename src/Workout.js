import { useState, useRef, useEffect, Fragment } from 'react';
import Countdown, { zeroPad } from 'react-countdown';
import Speech from 'speak-tts';
import { Disclosure } from '@headlessui/react';
import {
    ArrowDownIcon,
    ArrowsUpDownIcon,
    ChevronUpIcon,
    ClockIcon,
    MinusIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/20/solid';

import AddRoutine from './AddRoutine';
import DeleteRoutine from './DeleteRoutine';
import {
    classNames,
    findNestedObjArr,
    secondsToTime,
    useLocalStorage
} from './helpers';
import DumbbellIcon from './icons/Dumbbell';
import HourglassIcon from './icons/Hourglass';

const Workout = ({ dayOfWeek }) => {
    const [workout, setWorkout] = useLocalStorage(`${dayOfWeek}Workout`, []);
    const [isAddRoutineOpen, setIsAddRoutineOpen] = useState(false);
    const [isDeleteRoutineOpen, setIsDeleteRoutineOpen] = useState(false);
    const [deleteRoutineId, setDeleteRoutineId] = useState(null);
    const [currentExerciseId, setCurrentExerciseId] = useState(null);
    const [currentEditSetId, setCurrentEditSetId] = useState(null);
    const [previousExercise, setPreviousExercise] = useState(null);
    const [isSetRest, setIsSetRest] = useState(false);
    const [previousElementAnimate, setPreviousElementAnimate] = useState(null);
    const exercisesRef = useRef(null);
    const speech = new Speech();

    speech.init({
        lang: 'ja-JP',
        rate: 1.02,
        pitch: 0.85
    });

    const scrollToExercise = (exerciseId, speech) => {
        const map = getMap();
        const node = map.get(exerciseId);

        node.scrollIntoView({ block: 'start' });

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
            exercise.superset
        );
        const isLastSet = exercise.sets.length - 1 === setIdx;
        const isLastSuperset =
            supersetExercises.findIndex((exrcs) => exrcs.id === exercise.id) +
                1 ===
            supersetExercises.length;

        if (isLastExercise && isLastSuperset && isLastSet) {
            scrollToExercise(`${routine.id}-end`, 'お疲れさまでした');
        } else if (isLastSuperset && isLastSet) {
            scrollToExercise(
                `${exercise.id}-${exercise.rest}`,
                `${exercise.rest / 60}分休憩`
            );
        } else {
            scrollToExercise(
                `${routine.id}-superset-${exercise.superset}`,
                `${exercise.supersetRest / 60}分休憩`
            );
        }
    };

    const selectNextSuperset = (routine, exercise) => {
        const supersetExercises = findNestedObjArr(
            routine,
            'superset',
            exercise?.superset
        );
        const previousExerciseIdx = supersetExercises.findIndex(
            (supersetExercise) =>
                supersetExercise?.id === previousExercise?.exercise?.id
        );

        if (previousExerciseIdx < supersetExercises?.length - 1) {
            scrollToExercise(
                supersetExercises[previousExerciseIdx + 1]?.id,
                supersetExercises[previousExerciseIdx + 1]?.jpSpeech
            );
            selectEditSetId(
                routine,
                supersetExercises[previousExerciseIdx + 1]?.id,
                previousExercise?.setIdx
            );
        } else {
            scrollToExercise(
                supersetExercises[0]?.id,
                supersetExercises[0]?.jpSpeech
            );
            selectEditSetId(
                routine,
                supersetExercises[0]?.id,
                previousExercise?.setIdx + 1
            );
        }
    };

    const updateWorkoutSet = (
        workoutData,
        setInfo,
        parameter,
        method,
        input
    ) => {
        const newWorkoutData = [...workoutData];

        newWorkoutData.forEach((rtn) => {
            rtn.exercises?.forEach((exrcs) => {
                exrcs.sets?.forEach((st) => {
                    if (st.id === setInfo.id) {
                        if (parameter === 'weight' && method === 'subtract') {
                            const newWeight = setInfo.weight - 1;
                            setInfo.weight = newWeight;
                        } else if (parameter === 'weight' && method === 'add') {
                            const newWeight = setInfo.weight + 1;
                            setInfo.weight = newWeight;
                        } else if (
                            parameter === 'weight' &&
                            method === 'manual'
                        ) {
                            const newWeight = input;
                            setInfo.weight = newWeight;
                        } else if (
                            parameter === 'reps' &&
                            method === 'subtract'
                        ) {
                            const newReps = setInfo.reps - 1;
                            setInfo.reps = newReps;
                        } else if (parameter === 'reps' && method === 'add') {
                            const newReps = setInfo.reps + 1;
                            setInfo.reps = newReps;
                        } else if (
                            parameter === 'reps' &&
                            method === 'manual'
                        ) {
                            const newReps = input;
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
                { transform: 'translateX(0%)' }
            ],
            { duration: 7000, iterations: Infinity }
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
    }, [currentExerciseId]); // eslint-disable-line

    useEffect(() => {
        const dayOfWeekWorkout = localStorage.getItem(`${dayOfWeek}Workout`);

        if (dayOfWeekWorkout) {
            setWorkout(JSON.parse(dayOfWeekWorkout));
        } else {
            localStorage.setItem(`${dayOfWeek}Workout`, JSON.stringify([]));
            setWorkout([]);
        }
    }, [dayOfWeek]); // eslint-disable-line

    return (
        <>
            {workout.map((routine, idx) => (
                <Disclosure key={idx} defaultOpen>
                    {(panel) => {
                        const { open, close } = panel;

                        return (
                            <>
                                <Disclosure.Button
                                    className="mb-8 flex w-full items-center justify-between overflow-hidden rounded-lg border-2 border-gray-50 bg-gray-950 p-3 text-left font-medium capitalize text-gray-50"
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
                                            className="h-6 w-6 bg-gray-950 text-red-300 hover:cursor-pointer hover:text-red-400"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setDeleteRoutineId(
                                                    routine.id,
                                                    setIsDeleteRoutineOpen(true)
                                                );
                                            }}
                                        />
                                    </span>
                                    <ChevronUpIcon
                                        className={classNames(
                                            'h-6 w-6 text-gray-50',
                                            open ? 'rotate-180 transform' : ''
                                        )}
                                    />
                                </Disclosure.Button>
                                <DeleteRoutine
                                    isOpen={isDeleteRoutineOpen}
                                    setIsOpen={setIsDeleteRoutineOpen}
                                    workout={workout}
                                    setWorkout={setWorkout}
                                    routineId={deleteRoutineId}
                                />
                                <div className="flex flex-col justify-center gap-2">
                                    {routine.exercises.map(
                                        (exercise, idx, exercises) => {
                                            const isLastExercise =
                                                routine.exercises.findIndex(
                                                    (exrcs) =>
                                                        exrcs.id === exercise.id
                                                ) +
                                                    1 ===
                                                routine.exercises.length;
                                            return (
                                                <Disclosure.Panel
                                                    key={idx}
                                                    className="flex flex-col justify-center gap-2 text-gray-500"
                                                >
                                                    {idx === 0 && open ? (
                                                        <div className="flex justify-center pb-4">
                                                            <button
                                                                type="button"
                                                                className="flex w-52 justify-center rounded-lg bg-green-300 p-2 font-medium capitalize text-gray-950 hover:bg-green-400"
                                                                onClick={(
                                                                    e
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    scrollToExercise(
                                                                        exercise.id,
                                                                        exercise.jpSpeech
                                                                    );
                                                                    if (
                                                                        exercise.sets
                                                                    ) {
                                                                        selectEditSetId(
                                                                            routine,
                                                                            exercise.id,
                                                                            0
                                                                        );
                                                                    } else {
                                                                        setCurrentEditSetId(
                                                                            null
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
                                                            'flex max-w-full items-center justify-center gap-2 px-2 hover:cursor-pointer',
                                                            currentExerciseId ===
                                                                exercise.id &&
                                                                'gap-4 text-5xl font-extrabold text-gray-50',
                                                            exercise.sets &&
                                                                'justify-between',
                                                            !exercise.sets &&
                                                                'flex-col text-center'
                                                        )}
                                                        ref={(node) => {
                                                            const map =
                                                                getMap();
                                                            if (node) {
                                                                map.set(
                                                                    exercise.id,
                                                                    node
                                                                );
                                                            } else {
                                                                map.delete(
                                                                    exercise.id
                                                                );
                                                            }
                                                        }}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            scrollToExercise(
                                                                exercise.id,
                                                                exercise.jpSpeech
                                                            );
                                                            if (exercise.sets) {
                                                                selectEditSetId(
                                                                    routine,
                                                                    exercise.id,
                                                                    0
                                                                );
                                                            } else {
                                                                setCurrentEditSetId(
                                                                    null
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        <div className="max-w-full overflow-x-clip overflow-y-visible">
                                                            <span
                                                                className={classNames(
                                                                    'left-0 inline-block whitespace-nowrap capitalize'
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
                                                                    Date.now() +
                                                                    exercise.timer *
                                                                        1000
                                                                }
                                                                renderer={({
                                                                    minutes,
                                                                    seconds,
                                                                    api
                                                                }) => (
                                                                    <span
                                                                        className="flex items-center gap-1"
                                                                        onClick={(
                                                                            e
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
                                                                        <ClockIcon className="h-10 w-10" />
                                                                        {zeroPad(
                                                                            minutes
                                                                        )}
                                                                        :
                                                                        {zeroPad(
                                                                            seconds
                                                                        )}
                                                                    </span>
                                                                )}
                                                                onTick={(
                                                                    timeObj
                                                                ) => {
                                                                    if (
                                                                        timeObj.minutes ===
                                                                            0 &&
                                                                        timeObj.seconds <=
                                                                            5
                                                                    ) {
                                                                        return textToSpeech(
                                                                            timeObj.seconds
                                                                        );
                                                                    }
                                                                }}
                                                                onComplete={() => {
                                                                    if (
                                                                        exercises[
                                                                            idx +
                                                                                1
                                                                        ]?.sets
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
                                                                                .jpSpeech
                                                                        );
                                                                        selectEditSetId(
                                                                            routine,
                                                                            exercises[
                                                                                idx +
                                                                                    1
                                                                            ]
                                                                                .id,
                                                                            0
                                                                        );
                                                                    } else if (
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
                                                                                .jpSpeech
                                                                        );
                                                                    } else {
                                                                        scrollToExercise(
                                                                            `${routine.id}-end`,
                                                                            'お疲れさまでした'
                                                                        );
                                                                    }
                                                                }}
                                                            />
                                                        ) : exercise.timer ? (
                                                            <span className="flex items-center gap-1">
                                                                <ClockIcon className="h-6 w-6" />
                                                                {secondsToTime(
                                                                    exercise.timer
                                                                )}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    {exercise.sets ? (
                                                        <table className="w-full overflow-hidden rounded-lg text-center text-gray-400">
                                                            <thead className="h-8 bg-gray-700 capitalize text-gray-400">
                                                                <tr>
                                                                    <th className="p-1 pl-2">
                                                                        set
                                                                    </th>
                                                                    <th className="p-1">
                                                                        weight
                                                                    </th>
                                                                    <th className="p-1 pr-2">
                                                                        reps
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-gray-800">
                                                                {exercise.sets.map(
                                                                    (
                                                                        set,
                                                                        idx,
                                                                        sets
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
                                                                                    <td
                                                                                        rowSpan="2"
                                                                                        className="py-5"
                                                                                    >
                                                                                        <span className="flex items-center justify-center text-4xl font-extrabold text-gray-50">
                                                                                            {idx +
                                                                                                1}
                                                                                        </span>
                                                                                    </td>
                                                                                    <td
                                                                                        colSpan="2"
                                                                                        className="p-5"
                                                                                    >
                                                                                        <span className="flex items-center justify-between gap-1 text-5xl font-extrabold text-gray-50">
                                                                                            <MinusIcon
                                                                                                className="h-10 w-20 rounded-lg bg-red-300 text-gray-950 hover:cursor-pointer hover:bg-red-400"
                                                                                                onClick={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    updateWorkoutSet(
                                                                                                        workout,
                                                                                                        set,
                                                                                                        'weight',
                                                                                                        'subtract',
                                                                                                        null
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                            {
                                                                                                set.weight
                                                                                            }
                                                                                            {/* <input
                                                                                                className="flex w-40 items-center bg-gray-800 text-center arrow-hide"
                                                                                                type="number"
                                                                                                value={
                                                                                                    set.weight
                                                                                                }
                                                                                                onChange={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    updateWorkoutSet(
                                                                                                        workout,
                                                                                                        set,
                                                                                                        'weight',
                                                                                                        'manual',
                                                                                                        e
                                                                                                            .target
                                                                                                            .value
                                                                                                            ? e
                                                                                                                  .target
                                                                                                                  .value
                                                                                                            : 0
                                                                                                    );
                                                                                                }}
                                                                                                onWheel={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    e.target.blur()
                                                                                                }
                                                                                            /> */}
                                                                                            <PlusIcon
                                                                                                className="h-10 w-20 rounded-lg bg-blue-300 text-gray-950 hover:cursor-pointer hover:bg-blue-400"
                                                                                                onClick={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    updateWorkoutSet(
                                                                                                        workout,
                                                                                                        set,
                                                                                                        'weight',
                                                                                                        'add',
                                                                                                        null
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td
                                                                                        colSpan="2"
                                                                                        className="p-5"
                                                                                    >
                                                                                        <span className="flex items-center justify-between gap-1 text-5xl font-extrabold text-gray-50">
                                                                                            <MinusIcon
                                                                                                className="h-10 w-20 rounded-lg bg-red-300 text-gray-950 hover:cursor-pointer hover:bg-red-400"
                                                                                                onClick={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    updateWorkoutSet(
                                                                                                        workout,
                                                                                                        set,
                                                                                                        'reps',
                                                                                                        'subtract',
                                                                                                        null
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                            {
                                                                                                set.reps
                                                                                            }
                                                                                            {/* <input
                                                                                                className="flex w-40 items-center bg-gray-800 text-center arrow-hide"
                                                                                                type="number"
                                                                                                value={
                                                                                                    set.reps
                                                                                                }
                                                                                                onChange={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    updateWorkoutSet(
                                                                                                        workout,
                                                                                                        set,
                                                                                                        'weight',
                                                                                                        'manual',
                                                                                                        e
                                                                                                            .target
                                                                                                            .value
                                                                                                            ? e
                                                                                                                  .target
                                                                                                                  .value
                                                                                                            : 0
                                                                                                    );
                                                                                                }}
                                                                                                onWheel={(
                                                                                                    e
                                                                                                ) =>
                                                                                                    e.target.blur()
                                                                                                }
                                                                                            /> */}
                                                                                            <PlusIcon
                                                                                                className="h-10 w-20 rounded-lg bg-blue-300 text-gray-950 hover:cursor-pointer hover:bg-blue-400"
                                                                                                onClick={(
                                                                                                    e
                                                                                                ) => {
                                                                                                    e.stopPropagation();
                                                                                                    updateWorkoutSet(
                                                                                                        workout,
                                                                                                        set,
                                                                                                        'reps',
                                                                                                        'add',
                                                                                                        null
                                                                                                    );
                                                                                                }}
                                                                                            />
                                                                                        </span>
                                                                                    </td>
                                                                                </tr>
                                                                                <tr>
                                                                                    <td colSpan="3">
                                                                                        <span className="flex w-full items-center justify-center border-b border-gray-700 p-5">
                                                                                            {isSetRest ? (
                                                                                                <Countdown
                                                                                                    autoStart
                                                                                                    date={
                                                                                                        Date.now() +
                                                                                                        exercise.setRest *
                                                                                                            1000
                                                                                                    }
                                                                                                    renderer={({
                                                                                                        minutes,
                                                                                                        seconds
                                                                                                    }) => (
                                                                                                        <span className="flex items-center justify-center gap-1 text-5xl font-extrabold capitalize text-gray-50">
                                                                                                            rest
                                                                                                            <HourglassIcon className="h-10 w-10" />
                                                                                                            {zeroPad(
                                                                                                                minutes
                                                                                                            )}

                                                                                                            :
                                                                                                            {zeroPad(
                                                                                                                seconds
                                                                                                            )}
                                                                                                        </span>
                                                                                                    )}
                                                                                                    onTick={(
                                                                                                        timeObj
                                                                                                    ) => {
                                                                                                        if (
                                                                                                            timeObj.seconds ===
                                                                                                            59
                                                                                                        ) {
                                                                                                            textToSpeech(
                                                                                                                `${
                                                                                                                    exercise.setRest /
                                                                                                                    60
                                                                                                                }分休憩`
                                                                                                            );
                                                                                                        }
                                                                                                        if (
                                                                                                            timeObj.minutes ===
                                                                                                                0 &&
                                                                                                            timeObj.seconds <=
                                                                                                                5
                                                                                                        ) {
                                                                                                            textToSpeech(
                                                                                                                timeObj.seconds
                                                                                                            );
                                                                                                        }
                                                                                                    }}
                                                                                                    onComplete={() => {
                                                                                                        setIsSetRest(
                                                                                                            false
                                                                                                        );
                                                                                                        setCurrentEditSetId(
                                                                                                            sets[
                                                                                                                idx +
                                                                                                                    1
                                                                                                            ]
                                                                                                                .id
                                                                                                        );
                                                                                                        scrollToExercise(
                                                                                                            exercise.id,
                                                                                                            exercise.jpSpeech
                                                                                                        );
                                                                                                    }}
                                                                                                />
                                                                                            ) : (
                                                                                                <button
                                                                                                    type="button"
                                                                                                    className="flex w-52 justify-center rounded-lg bg-green-300 p-2 font-medium capitalize text-gray-950 hover:bg-green-400"
                                                                                                    onClick={(
                                                                                                        e
                                                                                                    ) => {
                                                                                                        e.stopPropagation();
                                                                                                        if (
                                                                                                            exercise.superset
                                                                                                        ) {
                                                                                                            setPreviousExercise(
                                                                                                                {
                                                                                                                    exercise,
                                                                                                                    setIdx: idx
                                                                                                                }
                                                                                                            );
                                                                                                            selectSupersetRest(
                                                                                                                routine,
                                                                                                                exercise,
                                                                                                                idx,
                                                                                                                isLastExercise
                                                                                                            );
                                                                                                            setCurrentEditSetId(
                                                                                                                null
                                                                                                            );
                                                                                                        } else if (
                                                                                                            exercise.setRest &&
                                                                                                            sets[
                                                                                                                idx +
                                                                                                                    1
                                                                                                            ]
                                                                                                        ) {
                                                                                                            setIsSetRest(
                                                                                                                true
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
                                                                                                                    .id
                                                                                                            );
                                                                                                        } else {
                                                                                                            if (
                                                                                                                isLastExercise
                                                                                                            ) {
                                                                                                                scrollToExercise(
                                                                                                                    `${routine.id}-end`,
                                                                                                                    'お疲れさまでした'
                                                                                                                );
                                                                                                            } else {
                                                                                                                scrollToExercise(
                                                                                                                    `${exercise.id}-${exercise.rest}`,
                                                                                                                    `${
                                                                                                                        exercise.rest /
                                                                                                                        60
                                                                                                                    }分休憩`
                                                                                                                );
                                                                                                            }
                                                                                                            setCurrentEditSetId(
                                                                                                                null
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
                                                                                    e
                                                                                ) => {
                                                                                    e.stopPropagation();
                                                                                    setCurrentEditSetId(
                                                                                        set.id
                                                                                    );
                                                                                    scrollToExercise(
                                                                                        exercise.id,
                                                                                        exercise.jpSpeech
                                                                                    );
                                                                                }}
                                                                            >
                                                                                <td className="py-2">
                                                                                    <span className="flex items-center justify-center gap-2">
                                                                                        {idx +
                                                                                            1}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="py-2">
                                                                                    <span className="flex items-center justify-center gap-2">
                                                                                        <DumbbellIcon className="h-6 w-6" />
                                                                                        {`${set.weight} lbs`}
                                                                                    </span>
                                                                                </td>
                                                                                <td className="py-2">
                                                                                    <span className="flex items-center justify-center gap-2">
                                                                                        {
                                                                                            set.reps
                                                                                        }
                                                                                    </span>
                                                                                </td>
                                                                            </tr>
                                                                        )
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
                                                            className="flex w-full flex-wrap items-center justify-center gap-2 hover:cursor-pointer"
                                                            ref={(node) => {
                                                                const map =
                                                                    getMap();
                                                                if (node) {
                                                                    map.set(
                                                                        `${routine.id}-superset-${exercise.superset}`,
                                                                        node
                                                                    );
                                                                } else {
                                                                    map.delete(
                                                                        `${routine.id}-superset-${exercise.superset}`
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
                                                                    }分休憩`
                                                                );
                                                                setCurrentEditSetId(
                                                                    null
                                                                );
                                                            }}
                                                        >
                                                            {currentExerciseId ===
                                                            `${routine.id}-superset-${exercise.superset}` ? (
                                                                <Countdown
                                                                    autoStart
                                                                    date={
                                                                        Date.now() +
                                                                        exercise.supersetRest *
                                                                            1000
                                                                    }
                                                                    renderer={({
                                                                        minutes,
                                                                        seconds
                                                                    }) => (
                                                                        <span className="flex items-center justify-center gap-1 text-5xl font-extrabold capitalize text-gray-50">
                                                                            rest
                                                                            <HourglassIcon className="h-10 w-10" />
                                                                            {zeroPad(
                                                                                minutes
                                                                            )}
                                                                            :
                                                                            {zeroPad(
                                                                                seconds
                                                                            )}
                                                                            <ArrowsUpDownIcon className="h-10 w-10" />
                                                                        </span>
                                                                    )}
                                                                    onTick={(
                                                                        timeObj
                                                                    ) => {
                                                                        if (
                                                                            timeObj.minutes ===
                                                                                0 &&
                                                                            timeObj.seconds <=
                                                                                5
                                                                        ) {
                                                                            return textToSpeech(
                                                                                timeObj.seconds
                                                                            );
                                                                        }
                                                                    }}
                                                                    onComplete={() =>
                                                                        previousExercise &&
                                                                        selectNextSuperset(
                                                                            routine,
                                                                            exercise
                                                                        )
                                                                    }
                                                                />
                                                            ) : (
                                                                <>
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
                                                                                        : ''
                                                                        )}
                                                                    >
                                                                        {`Superset ${exercise.superset}`}
                                                                    </span>
                                                                    <span className="flex items-center justify-center gap-1 capitalize">
                                                                        rest
                                                                        <HourglassIcon className="h-6 w-6" />
                                                                        {secondsToTime(
                                                                            exercise.supersetRest
                                                                        )}
                                                                        <ArrowsUpDownIcon className="h-6 w-6" />
                                                                    </span>
                                                                </>
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
                                                                        node
                                                                    );
                                                                } else {
                                                                    map.delete(
                                                                        `${exercise.id}-${exercise.rest}`
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
                                                                    }分休憩`
                                                                );
                                                                setCurrentEditSetId(
                                                                    null
                                                                );
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
                                                                        seconds
                                                                    }) => (
                                                                        <span className="flex items-center justify-center gap-1 text-5xl font-extrabold capitalize text-gray-50">
                                                                            rest
                                                                            <HourglassIcon className="h-10 w-10" />
                                                                            {zeroPad(
                                                                                minutes
                                                                            )}
                                                                            :
                                                                            {zeroPad(
                                                                                seconds
                                                                            )}
                                                                            <ArrowDownIcon className="h-10 w-10" />
                                                                        </span>
                                                                    )}
                                                                    onTick={(
                                                                        timeObj
                                                                    ) => {
                                                                        if (
                                                                            timeObj.minutes ===
                                                                                0 &&
                                                                            timeObj.seconds <=
                                                                                5
                                                                        ) {
                                                                            return textToSpeech(
                                                                                timeObj.seconds
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
                                                                                    .jpSpeech
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
                                                                                0
                                                                            );
                                                                        }
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className="flex items-center justify-center gap-1 capitalize">
                                                                    rest
                                                                    <HourglassIcon className="h-6 w-6" />
                                                                    {secondsToTime(
                                                                        exercise.rest
                                                                    )}
                                                                    <ArrowDownIcon className="h-6 w-6" />
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
                                                                'mb-8 flex w-full justify-center px-4 py-2 capitalize',
                                                                currentExerciseId ===
                                                                    `${routine.id}-end`
                                                                    ? 'text-5xl font-extrabold text-gray-50'
                                                                    : ''
                                                            )}
                                                            ref={(node) => {
                                                                const map =
                                                                    getMap();
                                                                if (node) {
                                                                    map.set(
                                                                        `${routine.id}-end`,
                                                                        node
                                                                    );
                                                                } else {
                                                                    map.delete(
                                                                        `${routine.id}-end`
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            end
                                                        </div>
                                                    ) : null}
                                                </Disclosure.Panel>
                                            );
                                        }
                                    )}
                                </div>
                            </>
                        );
                    }}
                </Disclosure>
            ))}
            <PlusIcon
                className="sticky bottom-0 h-14 w-14 rounded-full border-4 border-gray-950 bg-gray-50 text-gray-950 hover:cursor-pointer hover:text-gray-700"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsAddRoutineOpen(true);
                }}
            >
                add routine
            </PlusIcon>
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
