import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

import Workout from './Workout';
// import Routines from './Routines';
// import Exercises from './Exercises';
import { classNames } from './helpers';

const App = () => {
    const today = new Date()
        .toLocaleString('en', {
            weekday: 'long',
            timeZone: 'America/Los_Angeles',
        })
        .toLowerCase();
    const [dayOfWeek, setDayOfWeek] = useState(today);
    const clock = new Date().toLocaleString('en', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Los_Angeles',
    });
    const [time, setTime] = useState(clock);
    setInterval(() => {
        setTime(clock);
    }, 1000);

    const daysOfWeekArr = [
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
        'sunday',
        'vacation',
    ];
    // const tabs = ['workout', 'routines', 'exercises'];
    const tabs = ['workout'];

    const nextDayOfWeek = (dayOfWeek) => {
        const todayIndex = daysOfWeekArr.findIndex((day) => day === dayOfWeek);

        if (daysOfWeekArr[todayIndex + 1]) {
            const nextDay = daysOfWeekArr[todayIndex + 1];
            setDayOfWeek(nextDay);
        } else {
            const nextDay = daysOfWeekArr[0];
            setDayOfWeek(nextDay);
        }
        document.getElementsByTagName('main')[0].scrollTop = 0;
    };

    const previousDayOfWeek = (dayOfWeek) => {
        const todayIndex = daysOfWeekArr.findIndex((day) => day === dayOfWeek);

        if (todayIndex === 0) {
            setDayOfWeek(daysOfWeekArr[daysOfWeekArr.length - 1]);
        } else {
            setDayOfWeek(daysOfWeekArr[todayIndex - 1]);
        }
        document.getElementsByTagName('main')[0].scrollTop = 0;
    };

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
                                        'w-full p-8 pt-16 font-medium uppercase leading-5 focus:outline-none',
                                        selected
                                            ? 'bg-black text-gray-50'
                                            : 'text-black hover:cursor-pointer hover:text-gray-700',
                                        // tab === 'workout' && 'rounded-tr-lg',
                                        // tab === 'routines' && 'rounded-t-lg',
                                        // tab === 'exercises' && 'rounded-tl-lg',
                                    )
                                }
                            >
                                {tab}
                            </Tab>
                        ))}
                    </Tab.List>
                </header>
                <div className="flex w-full items-center justify-between whitespace-nowrap p-8 pb-16 font-medium capitalize text-gray-50">
                    <ChevronLeftIcon
                        className="h-10 cursor-pointer px-16"
                        onClick={(e) => {
                            e.stopPropagation();
                            previousDayOfWeek(dayOfWeek);
                        }}
                    />
                    <span className="flex gap-4">
                        <span>{dayOfWeek}</span>
                        {(dayOfWeek === today || dayOfWeek === 'vacation') && (
                            <span>{time}</span>
                        )}
                    </span>
                    <ChevronRightIcon
                        className="h-10 cursor-pointer px-16"
                        onClick={(e) => {
                            e.stopPropagation();
                            nextDayOfWeek(dayOfWeek);
                        }}
                    />
                </div>
                <main className="h-[calc(100vh-252px)] overflow-y-auto scrollbar-hide">
                    <Tab.Panels>
                        {tabs.map((tab, idx) => (
                            <Tab.Panel
                                key={idx}
                                className="mx-auto w-full px-8 pb-8"
                            >
                                {tab === 'workout' && (
                                    <Workout dayOfWeek={dayOfWeek} />
                                )}
                                {/* {tab === 'routines' && <Routines />}
                                {tab === 'exercises' && <Exercises />} */}
                            </Tab.Panel>
                        ))}
                    </Tab.Panels>
                </main>
            </Tab.Group>
        </div>
    );
};

export default App;
