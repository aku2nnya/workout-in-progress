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
                        {tabs.map((tab) => (
                            <Tab
                                key={tab}
                                className={({ selected }) =>
                                    classNames(
                                        'w-full py-8 font-medium capitalize leading-5 focus:outline-none',
                                        selected
                                            ? 'bg-black text-gray-50'
                                            : 'text-black hover:cursor-pointer hover:text-gray-700',
                                        tab === 'workout' && 'rounded-tr-lg',
                                        tab === 'routines' && 'rounded-t-lg',
                                        tab === 'exercises' && 'rounded-tl-lg',
                                    )
                                }
                            >
                                {tab}
                            </Tab>
                        ))}
                    </Tab.List>
                </header>
                <div className="h-8 bg-black"></div>
                <main className="h-[calc(100vh-116px)] overflow-y-auto scrollbar-hide">
                    <Tab.Panels>
                        {tabs.map((tab, idx) => (
                            <Tab.Panel
                                key={idx}
                                className="mx-auto w-full px-8 pb-8"
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
