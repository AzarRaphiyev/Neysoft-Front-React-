import React from 'react';

function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div>{children}</div>
          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export default Modal;
