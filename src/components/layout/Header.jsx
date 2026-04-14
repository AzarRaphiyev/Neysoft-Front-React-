import React from 'react';
import { useUI } from '../../contexts/UIContext';

function Header() {
  const { toggleSidebar } = useUI();

  return (
    <div className="header-bar hidden fixed top-0 left-0 right-0 bg-blue-600 text-white z-50 px-4 py-3 items-center justify-between shadow-md">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="text-white hover:text-gray-200 transition">
          <i className="fas fa-bars text-xl"></i>
        </button>
        <h1 className="text-lg font-bold">
          <i className="fas fa-store"></i> Geyim Ma\u011Fazas\u0131
        </h1>
      </div>
    </div>
  );
}

export default Header;
