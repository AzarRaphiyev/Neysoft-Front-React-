import React, { useState } from 'react';
import MaliyyeUmumi from './MaliyyeUmumi';
import MaliyyeXercler from './MaliyyeXercler';
import MaliyyeZHesabat from './MaliyyeZHesabat';

function Maliyye() {
  const [activeTab, setActiveTab] = useState('umumi');

  const tabs = [
    { id: 'umumi', icon: 'fas fa-chart-pie', label: 'Ümumi' },
    { id: 'xercler', icon: 'fas fa-money-bill-wave', label: 'Xərclər' },
    { id: 'zHesabat', icon: 'fas fa-file-invoice', label: 'Z Hesabat' },
  ];

  return (
    <div>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
        <i className="fas fa-wallet"></i> Maliyyə
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
      {activeTab === 'umumi' && <MaliyyeUmumi />}
      {activeTab === 'xercler' && <MaliyyeXercler />}
      {activeTab === 'zHesabat' && <MaliyyeZHesabat />}
    </div>
  );
}

export default Maliyye;