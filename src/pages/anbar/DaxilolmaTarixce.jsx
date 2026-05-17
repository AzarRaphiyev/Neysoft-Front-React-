import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { formatMebleg } from '../../utils/helpers';
import * as XLSX from 'xlsx';

function DaxilolmaTarixce() {
  const { data, fetchQaimeler } = useData();
  const [baslama, setBaslama] = useState('');
  const [bitme, setBitme] = useState('');
  const [qaimeKodu, setQaimeKodu] = useState('');
  const [selectedQaime, setSelectedQaime] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      const umumi = q.totalAmount || (q.mehsullar || q.items || []).reduce((sum, m) => sum + (m.quantity || m.miqdar || 0) * (m.purchasePrice || m.alis_qiymeti || 0), 0);
      ws_data.push([
        q.receiptCode || q.qaime_kod || '-',
        q.date || q.tarix || '-',
        q.supplier?.name || techizatci?.ad || '-',
        (q.mehsullar || q.items || []).length,
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
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-max whitespace-nowrap">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Qaimə Kodu</th>
                <th className="px-4 py-3 text-left">Tarix</th>
                <th className="px-4 py-3 text-left">Təchizatçı</th>
                <th className="px-4 py-3 text-right">Məhsul Sayı</th>
                <th className="px-4 py-3 text-right">Ümumi Məbləğ</th>
                <th className="px-4 py-3 text-center">Əməliyyat</th>
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
                  const umumi = q.totalAmount || (q.mehsullar || q.items || []).reduce(
                    (sum, m) => sum + (m.quantity || m.miqdar || 0) * (m.purchasePrice || m.alis_qiymeti || 0),
                    0
                  );
                  const varQaytarma = q.qaytarmalar?.length > 0 || parseFloat(q.qaytarilan_mebleg) > 0;
                  const rowClass = varQaytarma ? 'bg-red-50' : '';
                  return (
                    <tr key={q.id} className={`border-b hover:bg-gray-50 ${rowClass}`}>
                      <td className="px-4 py-3">{q.receiptCode || q.qaime_kod || '-'}</td>
                      <td className="px-4 py-3">{new Date(q.date || q.tarix || new Date()).toLocaleDateString('az-AZ')}</td>
                      <td className="px-4 py-3">{q.supplier?.name || techizatci?.ad || '-'}</td>
                      <td className="px-4 py-3 text-right">{(q.mehsullar || q.items || []).length}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatMebleg(umumi)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => { setSelectedQaime(q); setIsModalOpen(true); }}
                          className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition"
                          title="Detallara Bax"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedQaime && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800">Qaimə Detalları</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-500 p-2 transition"
              >
                <i className="fas fa-times text-xl"></i>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div><span className="block text-gray-500 text-xs uppercase mb-1">Qaimə Kodu</span><span className="font-semibold">{selectedQaime.receiptCode || selectedQaime.qaime_kod || '-'}</span></div>
                <div><span className="block text-gray-500 text-xs uppercase mb-1">Tarix</span><span className="font-semibold">{new Date(selectedQaime.date || selectedQaime.tarix || new Date()).toLocaleDateString('az-AZ')}</span></div>
                <div><span className="block text-gray-500 text-xs uppercase mb-1">Təchizatçı</span><span className="font-semibold">{selectedQaime.supplier?.name || data.techizatcilar.find((t) => t.id === parseInt(selectedQaime.techizatci_id))?.ad || '-'}</span></div>
                <div><span className="block text-gray-500 text-xs uppercase mb-1">Status</span><span className="font-semibold">{selectedQaime.status || '-'}</span></div>
              </div>
              <table className="w-full text-left bg-white min-w-max whitespace-nowrap">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="py-2 px-3 text-sm font-semibold">Ad</th>
                    <th className="py-2 px-3 text-center text-sm font-semibold">Miqdar</th>
                    <th className="py-2 px-3 text-right text-sm font-semibold">Alış Qiyməti</th>
                    <th className="py-2 px-3 text-right text-sm font-semibold">Yekun</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {(selectedQaime.items || selectedQaime.mehsullar || []).map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-3">{item.product?.name || item.mal_adi || '-'}</td>
                      <td className="py-2 px-3 text-center">{item.quantity || item.miqdar || 0}</td>
                      <td className="py-2 px-3 text-right">{formatMebleg(item.purchasePrice || item.alis_qiymeti || 0)}</td>
                      <td className="py-2 px-3 text-right font-medium">{formatMebleg((item.quantity || item.miqdar || 0) * (item.purchasePrice || item.alis_qiymeti || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t bg-gray-50 flex justify-between items-center text-lg">
              <span className="text-gray-600 font-semibold text-sm">Ümumi Məbləğ:</span>
              <span className="text-blue-600 font-bold">
                {formatMebleg(
                  selectedQaime.totalAmount ||
                  (selectedQaime.items || selectedQaime.mehsullar || []).reduce((sum, m) => sum + (m.quantity || m.miqdar || 0) * (m.purchasePrice || m.alis_qiymeti || 0), 0)
                )}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DaxilolmaTarixce;