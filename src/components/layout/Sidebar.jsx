import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../../contexts/UIContext';

const menuItems = [
  { path: '/', icon: 'fas fa-chart-line', label: '\u0130dar\u0259 Paneli' },
  { path: '/anbar', icon: 'fas fa-warehouse', label: '\u00DCmumi Anbar' },
  { path: '/satis', icon: 'fas fa-shopping-cart', label: 'Sat\u0131\u015F' },
  { path: '/satis-tarixce', icon: 'fas fa-history', label: 'Sat\u0131\u015F Tarix\u00E7\u0259si' },
  { path: '/maliyye', icon: 'fas fa-wallet', label: 'Maliyy\u0259' },
  { path: '/parametrler', icon: 'fas fa-cog', label: 'Parametrl\u0259r' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUI();

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
      ></div>

      {/* Sidebar */}
      <aside className={`w-64 bg-blue-600 text-white shadow-xl flex-shrink-0 ${sidebarOpen ? 'active' : ''}`}>
        <div className="p-4 relative">
          <button
            onClick={toggleSidebar}
            className="md:hidden absolute -top-2 -right-2 text-white hover:text-gray-200 p-2 bg-red-500 rounded-full w-9 h-9 flex items-center justify-center shadow-lg z-50"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
          <h1 className="text-xl font-bold mb-6">
            <i className="fas fa-store"></i> Geyim Ma\u011Fazas\u0131
          </h1>
          <div className="space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavigate(item.path)}
                  className={`tab-button w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${isActive ? 'tab-active' : ''}`}
                >
                  <i className={item.icon}></i> {item.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t border-blue-500 mt-auto">
          <p className="text-xs text-blue-200 text-center">
            {new Date().toLocaleDateString('az-AZ', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
