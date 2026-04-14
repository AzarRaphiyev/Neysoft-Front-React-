import React, { useState } from 'react';
import MalDaxil from './MalDaxil';
import DaxilolmaTarixce from './DaxilolmaTarixce';
import AnbarSiyahisi from './AnbarSiyahisi';

function UmumiAnbar() {
  const [activeTab, setActiveTab] = useState('malDaxil');

  const tabs = [
    { id: 'malDaxil', icon: 'fas fa-plus', label: 'Mal Daxil Et' },
    { id: 'daxilolmaTarixce', icon: 'fas fa-clipboard-list', label: 'Daxil Olma Tarix\u00E7\u0259si' },
    { id: 'anbar', icon: 'fas fa-boxes', label: 'Anbar Siyah\u0131s\u0131' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        <i className="fas fa-warehouse"></i> \u00DCmumi Anbar
      </h2>

      {/* Sub Navigation */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sub-tab-button px-4 py-2 rounded-lg transition text-sm ${
                activeTab === tab.id ? 'sub-tab-active' : ''
              }`}
            >
              <i className={tab.icon}></i> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'malDaxil' && <MalDaxil />}
      {activeTab === 'daxilolmaTarixce' && <DaxilolmaTarixce />}
      {activeTab === 'anbar' && <AnbarSiyahisi />}
    </div>
  );
}

export default UmumiAnbar;
