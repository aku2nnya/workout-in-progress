import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';

import data from './data.json';
import { classNames } from './helpers';

const Exercises = () => {
    const exercisesData = data.exercises;

    return (
        <>
            {exercisesData
                .sort((a, b) => {
                    if (a.category < b.category) {
                        return -1;
                    }
                    if (a.category > b.category) {
                        return 1;
                    }
                    return 0;
                })
                .map((exerciseData, idx) => (
                    <Disclosure key={idx}>
                        {({ open }) => (
                            <>
                                <Disclosure.Button className="my-2 flex w-full justify-between rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75">
                                    <span>{exerciseData.category}</span>
                                    <ChevronUpIcon
                                        className={classNames(
                                            'h-5 w-5 text-purple-500',
                                            open ? 'rotate-180 transform' : '',
                                        )}
                                    />
                                </Disclosure.Button>
                                {exerciseData.exercise
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
                                            className="px-4 pb-2 pt-4 text-sm capitalize text-gray-500"
                                        >
                                            {exercise.name}
                                        </Disclosure.Panel>
                                    ))}
                            </>
                        )}
                    </Disclosure>
                ))}
        </>
    );
};

export default Exercises;
