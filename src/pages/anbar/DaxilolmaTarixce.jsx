import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatMebleg } from '../../utils/helpers';
import * as XLSX from 'xlsx';

function DaxilolmaTarixce() {
  const { data, fetchQaimeler } = useData();
  const [baslama, setBaslama] = useState('');
  const [bitme, setBitme] = useState('');
  const [qaimeKodu, setQaimeKodu] = useState('');

  React.useEffect(() => {
    fetchQaimeler(baslama, bitme, qaimeKodu);
  }, [baslama, bitme, qaimeKodu, fetchQaimeler]);

  const filtered = useMemo(() => {
    const list = [...(data.qaimeler || [])];
    return list.sort((a, b) => new Date(b.createdAt || b.tarix) - new Date(a.createdAt || a.tarix));
  }, [data.qaimeler]);

  const handleExport = () => {
    const ws_data = [
      ['Qaimə Kodu', 'Tarix', 'Təchizatçı', 'Məhsul Sayı', 'Ümumi Məbləğ'],
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
          <i className="fas fa-clipboard-list"></i> Mal Daxil Olma Tarixçəsi
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
            <label className="block text-sm mb-2">Başlama Tarixi</label>
            <input
              type="date"
              value={baslama}
              onChange={(e) => setBaslama(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Bitmə Tarixi</label>
            <input
              type="date"
              value={bitme}
              onChange={(e) => setBitme(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Qaimə Kodu</label>
            <input
              type="text"
              value={qaimeKodu}
              onChange={(e) => setQaimeKodu(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Qaimə kodu..."
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Qaimə Kodu</th>
                <th className="px-4 py-3 text-left">Tarix</th>
                <th className="px-4 py-3 text-left">Təchizatçı</th>
                <th className="px-4 py-3 text-right">Məhsul Sayı</th>
                <th className="px-4 py-3 text-right">Ümumi Məbləğ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Qaimə tapılmadı
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
                  const varQaytarma = q.qaytarmalar?.length > 0 || parseFloat(q.qaytarilan_mebleg) > 0;
                  const rowClass = varQaytarma ? 'bg-red-50' : '';
                  return (
                    <tr key={q.id} className={`border-b hover:bg-gray-50 ${rowClass}`}>
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