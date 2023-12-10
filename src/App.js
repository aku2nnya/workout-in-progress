import { useState } from 'react';
import { Tab } from '@headlessui/react';

import Exercises from './Exercises';
import { classNames } from './helpers';

const App = () => {
    const tabs = ['workout', 'routines', 'exercises'];

    return (
        <div className="w-full">
            <Tab.Group defaultIndex={0}>
                <div className="bg-blue-900/20">
                    <Tab.List className="mx-auto flex max-w-md space-x-2 p-2">
                        {tabs.map((tab) => (
                            <Tab
                                key={tab}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full rounded-lg py-2.5 text-sm font-medium capitalize leading-5',
                                        'ring-white/60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                        selected
                                            ? 'bg-white text-blue-700 shadow'
                                            : 'text-blue-100 hover:bg-white/[0.12] hover:text-white',
                                    )
                                }
                            >
                                {tab}
                            </Tab>
                        ))}
                    </Tab.List>
                </div>
                <Tab.Panels className="mt-2">
                    {tabs.map((tab, idx) => (
                        <Tab.Panel
                            key={idx}
                            className="mx-auto w-full max-w-md rounded-2xl bg-white p-2"
                        >
                            {tab === 'workout' && tab}
                            {tab === 'routines' && tab}
                            {tab === 'exercises' && <Exercises />}
                        </Tab.Panel>
                    ))}
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default App;
