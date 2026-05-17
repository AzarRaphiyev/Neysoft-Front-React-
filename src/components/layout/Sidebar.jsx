import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUI } from '../../contexts/UIContext';

const allMenuItems = [
  { path: '/', icon: 'fas fa-chart-line', label: 'İdarə Paneli' },
  { path: '/anbar', icon: 'fas fa-warehouse', label: 'Ümumi Anbar' },
  { path: '/satis', icon: 'fas fa-shopping-cart', label: 'Satış' },
  { path: '/satis-tarixce', icon: 'fas fa-history', label: 'Satış Tarixçəsi' },
  { path: '/musteri-iadeleri', icon: 'fas fa-undo', label: 'Müştəri İadələri' },
  { path: '/maliyye', icon: 'fas fa-wallet', label: 'Maliyyə' },
  { path: '/parametrler', icon: 'fas fa-cog', label: 'Parametrlər' },
];

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen, toggleSidebar, closeSidebar } = useUI();

  let currentUser = { username: 'İstifadəçi', role: 'GUEST' };
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      currentUser = JSON.parse(userStr) || currentUser;
    }
  } catch (e) { }

  const currentRole = currentUser.role;
  const username = currentUser.username;

  let items = [];
  if (currentRole === 'ADMIN') {
    items = [...allMenuItems, { path: '/users', icon: 'fas fa-users', label: 'İstifadəçilər' }];
  } else if (currentRole === 'MANAGER') {
    items = [...allMenuItems, { path: '/users', icon: 'fas fa-users', label: 'İstifadəçilər' }];
  } else if (currentRole === 'CASHIER') {
    items = [
      { path: '/satis', icon: 'fas fa-shopping-cart', label: 'Satış' },
      { path: '/satis-tarixce', icon: 'fas fa-history', label: 'Satış Tarixçəsi' },
      { path: '/musteri-iadeleri', icon: 'fas fa-undo', label: 'Müştəri İadələri' },
      { path: '/anbar', icon: 'fas fa-warehouse', label: 'Ümumi Anbar' },
    ];
  } else {
    items = [...allMenuItems];
  }

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  return (
    <>
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden bg-black/50 fixed inset-0 z-[55]"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-blue-600 text-white shadow-xl flex-shrink-0 fixed md:static inset-y-0 left-0 z-[60] md:z-auto transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-4 relative">
          <button
            onClick={toggleSidebar}
            className="md:hidden absolute -top-[-9px] -right-0 text-white hover:text-red-500 text-red-400 font-xl    rounded-full w-10 h-10 flex items-center justify-center  z-50"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
          <h1 className="text-xl font-bold mb-6">
            <i className="fas fa-store"></i> Geyim Mağazası
          </h1>
          <div className="space-y-2">
            {items.map((item) => {
              if (currentRole === 'CASHIER' && (item.path === '/users' || item.label === 'İstifadəçilər')) return null;
              if (currentRole === 'CASHIER' && (item.path === '/musteri-iadeleri' || item.label === 'Müştəri İadələri')) return null;

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
        <div className="p-4 border-t border-blue-500 mt-auto flex flex-col gap-4">
          <div className="flex items-center justify-between bg-blue-700/50 p-3 rounded-xl border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold uppercase">
                {(currentUser.firstName?.[0] || currentUser.username?.[0] || 'U')}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm leading-tight">
                  {currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : username}
                </span>
                <span className="text-xs text-blue-200 font-medium">{currentRole}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-10 h-10 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              title="Çıxış"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>

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
