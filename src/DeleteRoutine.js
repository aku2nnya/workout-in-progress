import { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const DeleteRoutine = ({
    isOpen,
    setIsOpen,
    workout,
    setWorkout,
    routineId
}) => {
    let deleteButtonRef = useRef(null);

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog
                as="div"
                initialFocus={deleteButtonRef}
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
                            <Dialog.Panel className="flex w-full max-w-md transform flex-col gap-5 overflow-hidden rounded-2xl bg-gray-50 p-4 text-left align-middle text-2xl text-gray-950 shadow-xl transition-all">
                                <Dialog.Description className="text-center">
                                    Are you sure you would like to delete the
                                    routine?
                                </Dialog.Description>

                                <div className="flex justify-end">
                                    <button
                                        ref={deleteButtonRef}
                                        className="flex justify-center rounded-lg bg-red-300 px-5 py-2 text-left font-medium capitalize text-gray-950 hover:bg-red-400"
                                        onClick={() => {
                                            setWorkout(
                                                workout.filter(
                                                    (workout) =>
                                                        workout.id !== routineId
                                                ),
                                                setIsOpen(false)
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
