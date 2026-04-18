import React, { useState } from 'react';
import MalDaxil from './MalDaxil';
import DaxilolmaTarixce from './DaxilolmaTarixce';
import AnbarSiyahisi from './AnbarSiyahisi';
import YeniMehsul from './YeniMehsul';
import Mehsullar from './Mehsullar';

function UmumiAnbar() {
  const [activeTab, setActiveTab] = useState('malDaxil');

  const tabs = [
    { id: 'mehsullar', icon: 'fas fa-box', label: 'Məhsullar' },
    { id: 'yeniMehsul', icon: 'fas fa-box-open', label: 'Yeni Məhsul' },
    { id: 'malDaxil', icon: 'fas fa-plus', label: 'Mal Daxil Et' },
    { id: 'daxilolmaTarixce', icon: 'fas fa-clipboard-list', label: 'Daxil Olma Tarixçəsi' },
    { id: 'anbar', icon: 'fas fa-boxes', label: 'Anbar Siyahısı' },
  ];

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        <i className="fas fa-warehouse"></i> Ümumi Anbar
      </h2>

      {/* Sub Navigation */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`sub-tab-button px-4 py-2 rounded-lg transition text-sm ${activeTab === tab.id ? 'sub-tab-active' : ''
                }`}
            >
              <i className={tab.icon}></i> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'mehsullar' && <Mehsullar />}
      {activeTab === 'yeniMehsul' && <YeniMehsul />}
      {activeTab === 'malDaxil' && <MalDaxil />}
      {activeTab === 'daxilolmaTarixce' && <DaxilolmaTarixce />}
      {activeTab === 'anbar' && <AnbarSiyahisi />}
    </div>
  );
}

export default UmumiAnbar;