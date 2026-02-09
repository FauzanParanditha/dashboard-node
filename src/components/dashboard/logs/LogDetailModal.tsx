import React from "react";

type LogDetailModalProps = {
  isOpen: boolean;
  title: string;
  content: string;
  onClose: () => void;
};

const LogDetailModal = ({
  isOpen,
  title,
  content,
  onClose,
}: LogDetailModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg dark:bg-black">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-white">
            {title}
          </h3>
          <button
            className="rounded bg-slate-200 px-3 py-1 text-sm text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto rounded border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          <pre className="whitespace-pre-wrap break-words">{content}</pre>
        </div>
      </div>
    </div>
  );
};

export default LogDetailModal;
