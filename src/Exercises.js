import { useState } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

import data from './data';
import { classNames } from './helpers';

const Exercises = () => {
    const exercises = data.exercises;
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
            {exercises
                .sort((a, b) => {
                    if (a.category < b.category) {
                        return -1;
                    }
                    if (a.category > b.category) {
                        return 1;
                    }
                    return 0;
                })
                .map((exerciseInfo, idx) => (
                    <Disclosure key={idx}>
                        {(panel) => {
                            const { open, close } = panel;

                            return (
                                <>
                                    <Disclosure.Button
                                        className="my-2 flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-lg font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
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
                                        <span>{exerciseInfo.category}</span>
                                        <ChevronUpIcon
                                            className={classNames(
                                                'h-5 w-5 text-purple-500',
                                                open
                                                    ? 'rotate-180 transform'
                                                    : '',
                                            )}
                                        />
                                    </Disclosure.Button>
                                    {exerciseInfo.exercise
                                        .sort((a, b) => {
                                            if (a.name < b.name) {
                                                return -1;
                                            }
                                            if (a.name > b.name) {
                                                return 1;
                                            }
                                            return 0;
                                        })
                                        .map((exercise, idx) => (
                                            <Disclosure.Panel
                                                key={idx}
                                                className="px-4 py-2 text-lg capitalize text-gray-500"
                                            >
                                                {exercise.name}
                                            </Disclosure.Panel>
                                        ))}
                                </>
                            );
                        }}
                    </Disclosure>
                ))}
        </>
    );
};

export default Exercises;
