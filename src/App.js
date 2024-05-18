import { useState, useEffect, memo } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

import DumbbellIcon from './icons/Dumbbell';
import Workout from './Workout';
import { classNames } from './helpers';

// To avoid Countdown reset on re-render
const MemoWorkout = memo(({ dayOfWeek }) => <Workout dayOfWeek={dayOfWeek} />);

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
        <div className="w-full bg-gray-950 text-2xl">
            <header
                className="sticky top-0 z-10 flex h-fit w-full flex-col gap-6 bg-gray-950 p-6"
                id="header"
            >
                <div className="mx-auto flex w-full items-center justify-center gap-6 font-semibold capitalize leading-5 text-gray-50 focus:outline-none">
                    <DumbbellIcon className="h-12 w-12 -rotate-45" />
                    <span className="text-center">workout in progress</span>
                    <DumbbellIcon className="h-12 w-12 rotate-45" />
                </div>
                <div className="flex w-full items-center justify-between gap-2 whitespace-nowrap font-medium capitalize text-gray-50">
                    <span
                        className="flex w-full cursor-pointer justify-center"
                        onClick={(e) => {
                            e.stopPropagation();
                            previousDayOfWeek(dayOfWeek);
                        }}
                    >
                        <ChevronLeftIcon className="h-10 w-10" />
                    </span>
                    <span
                        className="flex justify-center gap-4"
                        onClick={(e) => {
                            e.stopPropagation();
                            setDayOfWeek(today);
                        }}
                    >
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
                    `mx-auto h-[calc(100vh-160px)] w-full overflow-y-auto px-6 pb-6 scrollbar-hide`,
                )}
            >
                <MemoWorkout dayOfWeek={dayOfWeek} />
            </main>
        </div>
    );
};

export default App;
