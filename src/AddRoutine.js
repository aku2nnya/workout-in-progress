import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

import data from './data.json';

const AddRoutine = ({ isOpen, setIsOpen, workout, setWorkout }) => {
    const routinesData = data.routines;

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
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                {routinesData
                                    .sort((a, b) => {
                                        if (a.name < b.name) {
                                            return -1;
                                        }
                                        if (a.name > b.name) {
                                            return 1;
                                        }
                                        return 0;
                                    })
                                    .map((routineData, idx) => {
                                        return (
                                            <button
                                                key={idx}
                                                className="my-2 flex w-full justify-center rounded-lg bg-purple-100 px-4 py-2 text-left text-sm font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                                                onClick={() => {
                                                    workout.push(routineData);
                                                    setWorkout(
                                                        workout,
                                                        setIsOpen(false),
                                                    );
                                                }}
                                            >
                                                <span>{routineData.name}</span>
                                            </button>
                                        );
                                    })}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default AddRoutine;
