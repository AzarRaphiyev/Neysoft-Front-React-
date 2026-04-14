import React from 'react';

function ConfirmDialog({ isOpen, onConfirm, onCancel, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300"
          >
            Ləğv et
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
          >
            Təsdiq et
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
