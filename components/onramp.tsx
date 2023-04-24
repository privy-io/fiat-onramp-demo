import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

type OnRampModalProps = {
  onRampUrl: string | null;
  onClose: () => void;
};

export default function OnRampModal({ onRampUrl, onClose }: OnRampModalProps) {
  return (
    <Transition.Root show={!!onRampUrl} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative my-8 min-w-fit transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-2 text-left shadow-xl transition-all sm:p-6">
                <div>
                  <div className="text-center">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900"
                    ></Dialog.Title>
                  </div>
                </div>
                <div className="my-2">
                  <iframe
                    src={onRampUrl as string}
                    className="overflow:hidden mb-1 h-[620px] w-[400px] rounded-md"
                  />
                  <div className="flex w-full items-center text-center text-xs text-gray-500">
                    <InformationCircleIcon className="mr-1 h-4 w-4" />
                    <p>
                      Privy partners with Sardine to help you purchase
                      crypto.&nbsp;
                    </p>
                    <a
                      className="underline hover:text-blue-600"
                      href="https://www.sardine.ai/"
                    >
                      Learn more
                    </a>
                    <p>.</p>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
