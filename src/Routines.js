import { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import {
    ArrowSmallDownIcon,
    ArrowsUpDownIcon,
    ChevronUpIcon,
    ClockIcon,
    MoonIcon,
} from '@heroicons/react/20/solid';

import data from './data.json';
import { classNames } from './helpers';
import DumbbellIcon from './icons/Dumbbell';
import HourglassIcon from './icons/Hourglass';

const Routines = () => {
    const routinesData = data.routines;
    const [activeDisclosurePanel, setActiveDisclosurePanel] = useState(null);

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

    return (
        <>
            {routinesData
                .sort((a, b) => {
                    if (a.name < b.name) {
                        return -1;
                    }
                    if (a.name > b.name) {
                        return 1;
                    }
                    return 0;
                })
                .map((routineData, idx) => (
                    <Disclosure key={idx}>
                        {(panel) => {
                            const { open, close } = panel;

                            return (
                                <>
                                    <Disclosure.Button
                                        className="my-2 flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
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
                                        <span>{routineData.name}</span>
                                        <ChevronUpIcon
                                            className={classNames(
                                                'h-5 w-5 text-purple-500',
                                                open
                                                    ? 'rotate-180 transform'
                                                    : '',
                                            )}
                                        />
                                    </Disclosure.Button>
                                    {routineData.exercises.map(
                                        (exercise, idx) => (
                                            <Disclosure.Panel
                                                key={idx}
                                                className="flex flex-col gap-2 px-2 text-sm text-gray-500"
                                            >
                                                <div className="flex justify-between">
                                                    <span className="capitalize">
                                                        {exercise.name}
                                                    </span>
                                                    {exercise.timer ? (
                                                        <span className="flex gap-1">
                                                            <ClockIcon className="h-5 w-5" />
                                                            {`${exercise.timer}s`}
                                                        </span>
                                                    ) : null}
                                                    {exercise.superset ? (
                                                        <span
                                                            className={classNames(
                                                                'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ring-red-600/10',
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
                                                    <table className="w-full overflow-hidden rounded-lg text-center text-sm text-gray-400">
                                                        <thead className="bg-gray-700 capitalize text-gray-400">
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
                                                                        key={
                                                                            idx
                                                                        }
                                                                        className="border-b border-gray-700 bg-gray-800"
                                                                    >
                                                                        <td>
                                                                            {idx +
                                                                                1}
                                                                        </td>
                                                                        <td>
                                                                            <span className="flex justify-center gap-1">
                                                                                <DumbbellIcon className="h-5 w-5 p-0.5" />
                                                                                {`${set.weight} lbs`}
                                                                            </span>
                                                                        </td>
                                                                        <td>
                                                                            {
                                                                                set.reps
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                ),
                                                            )}
                                                        </tbody>
                                                    </table>
                                                ) : null}
                                                {exercise.superset &&
                                                exercise.superset ===
                                                    routineData.exercises[
                                                        idx + 1
                                                    ]?.superset ? (
                                                    <div className="flex justify-center gap-1">
                                                        <ArrowsUpDownIcon className="h-5 w-5 p-0.5" />
                                                        <HourglassIcon className="h-5 w-5 p-0.5" />
                                                        {`${exercise.supersetRest}s`}
                                                    </div>
                                                ) : idx + 1 <
                                                  routineData.exercises
                                                      .length ? (
                                                    <div
                                                        className={classNames(
                                                            'flex justify-center gap-1',
                                                            exercise.rest
                                                                ? ' py-2'
                                                                : '',
                                                        )}
                                                    >
                                                        <ArrowSmallDownIcon className="h-5 w-5" />
                                                        {exercise.rest ? (
                                                            <span className="flex justify-center gap-1">
                                                                <HourglassIcon className="h-5 w-5 p-0.5" />
                                                                {`${exercise.rest}s`}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                ) : null}
                                            </Disclosure.Panel>
                                        ),
                                    )}
                                </>
                            );
                        }}
                    </Disclosure>
                ))}
        </>
    );
};

export default Routines;
