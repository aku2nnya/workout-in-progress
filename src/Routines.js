import { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import {
    ArrowSmallDownIcon,
    ArrowsUpDownIcon,
    ChevronUpIcon,
    ClockIcon,
} from '@heroicons/react/20/solid';

import data from './data.json';
import { classNames } from './helpers';

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
                                                            {exercise.timer}{' '}
                                                            seconds
                                                        </span>
                                                    ) : null}
                                                    {exercise.superset ? (
                                                        <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                                            Superset{' '}
                                                            {exercise.superset}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                {exercise.sets ? (
                                                    <table className="w-full overflow-hidden rounded-lg text-center text-sm text-gray-400">
                                                        <thead className="bg-gray-700 text-gray-400">
                                                            <tr>
                                                                <th>Set</th>
                                                                <th>Weight</th>
                                                                <th>Reps</th>
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
                                                                            {
                                                                                set.weight
                                                                            }
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
                                                    <div className="flex justify-center">
                                                        <ArrowsUpDownIcon className="h-5 w-5 p-0.5" />
                                                    </div>
                                                ) : idx + 1 <
                                                  routineData.exercises
                                                      .length ? (
                                                    <div className="flex justify-center">
                                                        <ArrowSmallDownIcon className="h-5 w-5" />
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
