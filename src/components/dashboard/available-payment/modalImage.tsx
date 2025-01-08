import {
  Dialog,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { HiOutlineX } from "react-icons/hi";

const ModalImage = ({ isOpen, setIsOpen, data }: any) => {
  return (
    <Transition as={Dialog} show={isOpen} onClose={() => setIsOpen(false)}>
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <div className="my-8 inline-block w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-slate-800">
            <DialogTitle
              as="h3"
              className="flex justify-between py-2 text-lg font-medium leading-6 text-gray-900 dark:text-white"
            >
              Image
              <button
                type="button"
                className="rounded-full bg-rose-50 p-1 text-sm font-semibold"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
              >
                <HiOutlineX className="h-5 w-5 text-rose-600" />
              </button>
            </DialogTitle>
            <div className="my-1 border border-red-800"></div>
            <div className="flex items-center justify-center">
              {data && <img src={data} alt="image" />}
            </div>
          </div>
        </TransitionChild>
      </div>
    </Transition>
  );
};

export default ModalImage;
