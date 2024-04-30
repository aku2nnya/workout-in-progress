import { Tab } from '@headlessui/react';

import Workout from './Workout';
import Routines from './Routines';
import Exercises from './Exercises';
import { classNames } from './helpers';

const App = () => {
    const tabs = ['workout', 'routines', 'exercises'];

    return (
        <div className="w-full bg-black text-4xl">
            <Tab.Group defaultIndex={0}>
                <header className="sticky top-0 h-fit bg-gray-50">
                    <Tab.List className="mx-auto flex space-x-2">
                        {/* <Tab.List className="mx-auto flex max-w-4xl space-x-2"> */}
                        {tabs.map((tab) => (
                            <Tab
                                key={tab}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full py-8 font-medium capitalize leading-5 focus:outline-none',
                                        // 'w-full rounded-t-md py-2.5 text-lg font-medium capitalize leading-5 focus:outline-none focus:ring-2 focus:ring-red-600',
                                        selected
                                            ? 'bg-black text-gray-50'
                                            : 'text-black hover:text-gray-500',
                                        tab === 'workout' && 'rounded-tr',
                                        tab === 'routines' && 'rounded-t',
                                        tab === 'exercises' && 'rounded-tl',
                                    )
                                }
                            >
                                {tab}
                            </Tab>
                        ))}
                    </Tab.List>
                </header>
                <main className="h-[calc(100vh-84px)] overflow-y-auto scrollbar-hide">
                    <Tab.Panels>
                        {tabs.map((tab, idx) => (
                            <Tab.Panel
                                key={idx}
                                className="mx-auto w-full p-8"
                                // className="mx-auto w-full max-w-4xl p-2"
                            >
                                {tab === 'workout' && <Workout />}
                                {tab === 'routines' && <Routines />}
                                {tab === 'exercises' && <Exercises />}
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </main>
            </Tab.Group>
        </div>
    );
};

export default App;
