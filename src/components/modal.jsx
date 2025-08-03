"use client";

import React from "react";

export const DeleteModal = ({isOpen, onClose, onConfirm, chatToDelete}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-2xl bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-600 p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center mr-3">
            <svg
              className="w-5 h-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white">Delete Chat</h3>
        </div>
        <p className="text-gray-300 mb-2">
          Are you sure you want to delete this chat?
        </p>
        <p className="text-yellow-400 text-sm font-medium mb-6">
          "{chatToDelete?.topic || "Untitled Chat"}"
        </p>
        <p className="text-gray-400 text-xs mb-6">
          This action cannot be undone. All messages in this chat will be
          permanently deleted.
        </p>
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export const GeneralInfoModal = ({isOpen, onClose, info}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-2xl bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-600 p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold text-white mb-4">{info.title}</h3>
        <p className="text-gray-300 mb-4">{info.message}</p>
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};
