import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatMebleg } from '../../utils/helpers';
import * as XLSX from 'xlsx';

function DaxilolmaTarixce() {
  const { data } = useData();
  const [baslama, setBaslama] = useState('');
  const [bitme, setBitme] = useState('');

  const filtered = useMemo(() => {
    let filteredQaimeler = [...data.qaimeler];
    if (baslama) filteredQaimeler = filteredQaimeler.filter((q) => q.tarix >= baslama);
    if (bitme) filteredQaimeler = filteredQaimeler.filter((q) => q.tarix <= bitme);
    return filteredQaimeler.sort((a, b) => new Date(b.tarix) - new Date(a.tarix));
  }, [data.qaimeler, baslama, bitme]);

  const handleExport = () => {
    const ws_data = [
      ['Qaim\u0259 Kodu', 'Tarix', 'T\u0259chizat\u00E7\u0131', 'M\u0259hsul Say\u0131', '\u00DCmumi M\u0259bl\u0259\u011F'],
    ];
    filtered.forEach((q) => {
      const techizatci = data.techizatcilar.find((t) => t.id === parseInt(q.techizatci_id));
      const umumi = q.mehsullar.reduce((sum, m) => sum + m.miqdar * m.alis_qiymeti, 0);
      ws_data.push([
        q.qaime_kod,
        q.tarix,
        techizatci ? techizatci.ad : '-',
        q.mehsullar.length,
        umumi,
      ]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Daxil Olma');
    XLSX.writeFile(wb, `daxil_olma_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          <i className="fas fa-clipboard-list"></i> Mal Daxil Olma Tarix\u00E7\u0259si
        </h2>
        <button
          onClick={handleExport}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          <i className="fas fa-file-export"></i> Excel Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm mb-2">Ba\u015Flama Tarixi</label>
            <input
              type="date"
              value={baslama}
              onChange={(e) => setBaslama(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Bitm\u0259 Tarixi</label>
            <input
              type="date"
              value={bitme}
              onChange={(e) => setBitme(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              <i className="fas fa-search"></i> Axtar
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Qaim\u0259 Kodu</th>
                <th className="px-4 py-3 text-left">Tarix</th>
                <th className="px-4 py-3 text-left">T\u0259chizat\u00E7\u0131</th>
                <th className="px-4 py-3 text-right">M\u0259hsul Say\u0131</th>
                <th className="px-4 py-3 text-right">\u00DCmumi M\u0259bl\u0259\u011F</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Qaim\u0259 tap\u0131lmad\u0131
                  </td>
                </tr>
              ) : (
                filtered.map((q) => {
                  const techizatci = data.techizatcilar.find(
                    (t) => t.id === parseInt(q.techizatci_id)
                  );
                  const umumi = q.mehsullar.reduce(
                    (sum, m) => sum + m.miqdar * m.alis_qiymeti,
                    0
                  );
                  return (
                    <tr key={q.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{q.qaime_kod}</td>
                      <td className="px-4 py-3">{new Date(q.tarix).toLocaleDateString('az-AZ')}</td>
                      <td className="px-4 py-3">{techizatci ? techizatci.ad : '-'}</td>
                      <td className="px-4 py-3 text-right">{q.mehsullar.length}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatMebleg(umumi)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DaxilolmaTarixce;
