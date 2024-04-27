import { useState } from 'react';

export const classNames = (...classes) => {
    return classes.filter(Boolean).join(' ');
};

export const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log(error);
            return initialValue;
        }
    });

    const setValue = (value) => {
        try {
            setStoredValue(value);

            if (typeof window !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.log(error);
        }
    };
    return [storedValue, setValue];
};

export const findNestedObjArr = (entireObj, keyToFind, valToFind) => {
    let foundObj = [];
    JSON.stringify(entireObj, (_, nestedValue) => {
        if (nestedValue && nestedValue[keyToFind] === valToFind) {
            foundObj.push(nestedValue);
        }
        return nestedValue;
    });
    return foundObj;
};

export const secondsToTime = (seconds) => {
    const m = Math.floor((seconds % 3600) / 60)
        .toString()
        .padStart(2, '0');
    const s = Math.floor(seconds % 60)
        .toString()
        .padStart(2, '0');

    return `${m}:${s}`;
};
