import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { formatMebleg } from '../../utils/helpers';

function MaliyyeXercler() {
  const { data, addXerc, deleteXerc } = useData();
  const { showToast, showConfirm } = useUI();
  const [ad, setAd] = useState('');
  const [mebleg, setMebleg] = useState('');
  const [tarix, setTarix] = useState(new Date().toISOString().split('T')[0]);

  const handleElave = () => {
    if (!ad || !mebleg || !tarix) {
      showToast('Bütün xanaları doldurun!', 'warning');
      return;
    }
    addXerc({ id: Date.now(), ad: ad, mebleg: parseFloat(mebleg), tarix: tarix });
    setAd('');
    setMebleg('');
  };

  const handleSil = async (id) => {
    const confirmed = await showConfirm('Xərci sil', 'Bu xərci silmək istədiyinizdən əminsiniz?');
    if (confirmed) {
      deleteXerc(id);
    }
  };

  const sorted = [...data.xercler].sort((a, b) => new Date(b.tarix) - new Date(a.tarix));

  return (
    <div>
      {/* X\u0259rc \u0258lav\u0259 Et */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">X\u0259rc \u0258lav\u0259 Et</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="X\u0259rcin ad\u0131"
          />
          <input
            type="number"
            value={mebleg}
            onChange={(e) => setMebleg(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="M\u0259bl\u0259\u011F"
            step="0.01"
          />
          <input
            type="date"
            value={tarix}
            onChange={(e) => setTarix(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleElave}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            <i className="fas fa-plus"></i> \u0258lav\u0259 Et
          </button>
        </div>
      </div>

      {/* X\u0259rc Tarix\u00E7\u0259si */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">X\u0259rc Tarix\u00E7\u0259si</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Tarix</th>
                <th className="px-4 py-3 text-left">X\u0259rcin Ad\u0131</th>
                <th className="px-4 py-3 text-right">M\u0259bl\u0259\u011F</th>
                <th className="px-4 py-3 text-center">\u0258m\u0259liyyat</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    X\u0259rc qeyd edilm\u0259yib
                  </td>
                </tr>
              ) : (
                sorted.map((x) => (
                  <tr key={x.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{new Date(x.tarix).toLocaleDateString('az-AZ')}</td>
                    <td className="px-4 py-3">{x.ad}</td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {formatMebleg(x.mebleg)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSil(x.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MaliyyeXercler;
