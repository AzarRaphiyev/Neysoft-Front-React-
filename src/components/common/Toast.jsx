import React, { useEffect } from 'react';

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const icons = {
    success: 'fa-check-circle',
    error: 'fa-times-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[9999] ${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}
    >
      <i className={`fas ${icons[type]}`}></i>
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-75">
        <i className="fas fa-times"></i>
      </button>
    </div>
  );
}

export default Toast;
