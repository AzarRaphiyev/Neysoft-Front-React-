import React, { useState, useRef, useEffect } from 'react';
import { useUI } from '../../contexts/UIContext';
import { useNavigate } from 'react-router-dom';

function Header() {
  const { toggleSidebar } = useUI();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 1. KULLANICI BİLGİLERİNİ OKUMA
  let currentUser = { username: 'İstifadəçi', role: 'GUEST' };
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      currentUser = JSON.parse(userStr) || currentUser;
    }
  } catch (e) {
    console.error('User data parse error', e);
  }

  // 4. LOGOUT (ÇIXIŞ) İŞLEMİ
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="header-bar sticky top-0 z-50 bg-white w-full border-b shadow-sm h-16 flex-shrink-0 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-gray-800 transition">
          <i className="fas fa-bars text-xl"></i>
        </button>
        <h1 className="text-lg font-bold text-gray-800">
          <i className="fas fa-store text-blue-600"></i> Geyim Mağazası
        </h1>
      </div>

      {/* Profil alanı */}
      <div className="relative" ref={dropdownRef}>
        <div
          className="flex items-center gap-3 cursor-pointer bg-white p-1.5 px-3 rounded shadow hover:bg-gray-50 transition"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {/* Default avatar */}
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <i className="fas fa-user text-sm"></i>
          </div>

          <div className="flex flex-col">
            {/* 2. ARAYÜZ (UI) GÜNCELLEMESİ */}
            <span className="text-sm font-bold text-gray-800">{currentUser.username}</span>
            <span className="text-xs text-gray-500 uppercase">{currentUser.role}</span>
          </div>

          <i className={`fas fa-chevron-down text-gray-500 text-xs transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
        </div>

        {/* 3. DROPDOWN MENÜ */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 text-gray-800">
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 transition"
            >
              <i className="fas fa-sign-out-alt mr-2 mt-1"></i> Çıxış
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;
