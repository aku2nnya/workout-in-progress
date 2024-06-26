import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import data from './data';

const AddRoutine = ({ isOpen, setIsOpen, workout, setWorkout }) => {
    const routines = data.routines;
    const workoutNames = workout.map((workout) => workout.name);
    const remainingRoutines = routines
        .filter((routine) => !workoutNames.includes(routine.name))
        .sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-10"
                onClose={() => setIsOpen(false)}
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-6 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="flex w-full max-w-md transform flex-col gap-4 overflow-hidden rounded-2xl bg-gray-50 p-4 text-left align-middle text-2xl shadow-xl transition-all">
                                {remainingRoutines.length ? (
                                    remainingRoutines.map((routine, idx) => {
                                        return (
                                            <button
                                                key={idx}
                                                className="flex w-full justify-center rounded-lg bg-gray-950 px-4 py-2 text-left font-medium capitalize text-gray-50 hover:bg-gray-700"
                                                onClick={() => {
                                                    setWorkout(
                                                        [...workout, routine],
                                                        setIsOpen(false),
                                                    );
                                                }}
                                            >
                                                <span>{routine.name}</span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <span className="flex justify-center">
                                        Your working out WAY too much!
                                    </span>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddRoutine;
