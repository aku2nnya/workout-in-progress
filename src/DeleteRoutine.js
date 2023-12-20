import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const DeleteRoutine = ({
    isOpen,
    setIsOpen,
    workout,
    setWorkout,
    routineName,
}) => {
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
                            <Dialog.Panel className="flex w-full max-w-md transform flex-col gap-5 overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Description className="text-center">
                                    Are you sure you would like to delete the
                                    routine?
                                </Dialog.Description>

                                <div className="flex justify-between">
                                    <button
                                        className="my-2 flex justify-center rounded-lg bg-purple-100 px-5 py-2 text-left text-sm font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="my-2 flex justify-center rounded-lg bg-purple-100 px-5 py-2 text-left text-sm font-medium capitalize text-purple-900 hover:bg-purple-200 focus:outline-none focus-visible:ring focus-visible:ring-purple-500/75"
                                        onClick={() => {
                                            setWorkout(
                                                workout.filter(
                                                    (workout) =>
                                                        workout.name !==
                                                        routineName,
                                                ),
                                                setIsOpen(false),
                                            );
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default DeleteRoutine;
