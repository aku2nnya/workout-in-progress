import { useEffect, useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

import DumbbellIcon from './icons/Dumbbell';
import Workout from './Workout';
import { classNames } from './helpers';

const App = () => {
    const today = new Date()
        .toLocaleString('en', {
            weekday: 'long',
            timeZone: 'America/Los_Angeles',
        })
        .toLowerCase();
    const [dayOfWeek, setDayOfWeek] = useState(today);

    const getTime = () =>
        new Date().toLocaleString('en', {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'America/Los_Angeles',
        });
    const [time, setTime] = useState(getTime());

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

    useEffect(() => {
        setInterval(() => {
            setTime(getTime());
        }, 1000);
    }, []);

    return (
        <div className="w-full bg-black text-4xl">
            <header className="sticky top-0 h-fit w-full bg-black" id="header">
                <div className="mx-auto flex w-full items-center justify-center gap-8 p-8 pt-16 font-medium uppercase leading-5 text-gray-50 focus:outline-none">
                    <DumbbellIcon className="h-20 w-20" />
                    <span>workout</span>
                    <DumbbellIcon className="h-20 w-20" />
                </div>
                <div className="flex w-full items-center justify-between whitespace-nowrap p-8 pb-16 font-medium capitalize text-gray-50">
                    <span
                        className="flex w-full cursor-pointer justify-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            previousDayOfWeek(dayOfWeek);
                        }}
                    >
                        <ChevronLeftIcon className="h-10 w-10" />
                    </span>
                    <span className="flex justify-center gap-4">
                        <span>{dayOfWeek}</span>
                        {(dayOfWeek === today || dayOfWeek === 'vacation') && (
                            <span>{time}</span>
                        )}
                    </span>
                    <span
                        className="flex w-full cursor-pointer justify-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            nextDayOfWeek(dayOfWeek);
                        }}
                    >
                        <ChevronRightIcon className="h-10 w-10" />
                    </span>
                </div>
            </header>
            <main
                className={classNames(
                    `mx-auto h-[calc(100vh-312px)] w-full overflow-y-auto px-8 pb-8 scrollbar-hide`,
                )}
            >
                <Workout dayOfWeek={dayOfWeek} />
            </main>
        </div>
    );
};

export default App;
