import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { formatMebleg } from '../../utils/helpers';
import * as XLSX from 'xlsx';

function AnbarSiyahisi() {
  const { data, deleteAnbarItem, fetchAnbar, updateSatisQiymeti } = useData();
  const { showConfirm } = useUI();
  const [axtar, setAxtar] = useState('');
  const [kateqoriya, setKateqoriya] = useState('');
  const [sifirGoster, setSifirGoster] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await fetchAnbar(axtar, sifirGoster, kateqoriya);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [axtar, sifirGoster, kateqoriya, fetchAnbar]);

  const filtered = useMemo(() => {
    return data.anbar || [];
  }, [data.anbar]);

  const handleEditPrice = async (e, m) => {
    e.stopPropagation();
    const yeniFiyat = prompt('Yeni satış qiymətini daxil edin:', m.satis_qiymeti);
    if (yeniFiyat !== null && !isNaN(yeniFiyat) && yeniFiyat.trim() !== '') {
      try {
        await updateSatisQiymeti(m.mal_kod, yeniFiyat);
      } catch (err) {
        alert('Qiymət yenilənərkən xəta baş verdi');
      }
    }
  };

  const handleExport = () => {
    const ws_data = [
      [
        'Mal Kodu',
        'Malın Adı',
        'Kateqoriya',
        'Rəng',
        'Ölçü',
        'Qalıq Miqdarı',
        'Alış Qiyməti',
        'Satış Qiyməti',
        'Ümumi Dəyər',
      ],
    ];
    data.anbar.forEach((m) => {
      ws_data.push([
        m.mal_kod,
        m.mal_adi,
        m.nov_adi,
        m.reng_adi || '-',
        m.olcu_adi || '-',
        m.qaliq,
        m.alis_qiymeti,
        m.satis_qiymeti,
        m.qaliq * m.alis_qiymeti,
      ]);
    });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, 'Anbar');
    XLSX.writeFile(wb, `anbar_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
          <i className="fas fa-boxes"></i> Anbar Siyahısı
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
          <input
            type="text"
            value={axtar}
            onChange={(e) => setAxtar(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Barkod v\u0259 ya mal ad\u0131 ilə axtar..."
          />
          <select
            value={kateqoriya}
            onChange={(e) => setKateqoriya(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Bütün Kateqoriyalar</option>
            {data.kateqoriyalar.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nov_adi || k.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 px-4 py-2">
            <input
              type="checkbox"
              checked={sifirGoster}
              onChange={(e) => setSifirGoster(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-sm">Qalığı 0 olanları göstər</span>          </label>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center p-10 text-gray-500 font-medium">
          <i className="fas fa-spinner fa-spin mr-2"></i> Məlumatlar yüklənir...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-max whitespace-nowrap">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Barkod</th>
                  <th className="px-4 py-3 text-left">Malın Adı</th>
                  <th className="px-4 py-3 text-left">Növ</th>
                  <th className="px-4 py-3 text-left">Rəng</th>
                  <th className="px-4 py-3 text-left">Ölçü</th>
                  <th className="px-4 py-3 text-center">Qalıq</th>
                  <th className="px-4 py-3 text-right">Alış Qiyməti</th>
                  <th className="px-4 py-3 text-right">Satış Qiyməti</th>
                  <th className="px-4 py-3 text-right">Ümumi Dəyər</th>
                  <th className="px-4 py-3 text-center">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-4 py-8 text-center text-gray-500">
                      Məhsul tapılmadı
                    </td>
                  </tr>
                ) : (
                  filtered.map((m) => {
                    const rowClass = m.qaliq === 0 ? 'bg-red-50' : m.qaliq <= 5 ? 'bg-yellow-50' : 'hover:bg-gray-50';
                    const eId = `exp-${m.id}`;
                    return (
                      <React.Fragment key={m.id}>
                        <tr
                          className={`border-b cursor-pointer ${rowClass}`}
                          onClick={(e) => {
                            const el = document.getElementById(eId);
                            if (el) el.classList.toggle('hidden');
                          }}
                        >
                          <td className="px-4 py-3">{m.mal_kod}</td>
                          <td className="px-4 py-3 font-medium">{m.mal_adi}</td>
                          <td className="px-4 py-3">{m.nov_adi}</td>
                          <td className="px-4 py-3">
                            {m.reng_kod ? (
                              <span className="inline-flex items-center gap-1">
                                <span className="w-4 h-4 rounded border" style={{ backgroundColor: m.reng_kod }}></span>
                                {m.reng_adi}
                              </span>
                            ) : m.reng_adi && m.reng_adi !== '-' ? (
                              <span>{m.reng_adi}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">{m.olcu_adi || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            {m.qaliq === 0 ? (
                              <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full">{m.qaliq} (Bitib)</span>
                            ) : m.qaliq <= 5 ? (
                              <span className="bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded-full">{m.qaliq} (Az)</span>
                            ) : (
                              <span className="bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">{m.qaliq}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">{formatMebleg(m.alis_qiymeti)}</td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span>{formatMebleg(m.satis_qiymeti)}</span>
                              <button onClick={(e) => handleEditPrice(e, m)} className="text-blue-500 hover:text-blue-700">
                                <i className="fas fa-edit"></i>
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-bold">
                            {formatMebleg(m.qaliq * m.alis_qiymeti)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {m.qaliq === 0 && (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const confirmed = await showConfirm(
                                    'Məhsulu sil',
                                    'Bu məhsulu silmək istədiyinizdən əminsiniz?',
                                  );
                                  if (confirmed) {
                                    deleteAnbarItem(m.id);
                                  }
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                        {/* Ətraflı məlumat (Expandable Row) */}
                        <tr id={eId} className="hidden bg-gray-50">
                          <td colSpan="10" className="px-4 py-4">
                            <div className="text-sm text-gray-700 p-4 border border-gray-200 rounded-lg">
                              <h4 className="font-semibold text-lg mb-3 border-b pb-2"><i className="fas fa-info-circle mr-2 text-blue-500"></i>Ətraflı məlumat:</h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="mb-2"><span className="font-medium text-gray-500 mr-2">Barkod:</span> {m.mal_kod}</p>
                                  <p className="mb-2"><span className="font-medium text-gray-500 mr-2">Təchizatçı:</span> {m.techizatci?.ad || 'Texniki Məlumat Yoxdur'}</p>
                                </div>
                                <div>
                                  <p className="mb-2 font-medium text-gray-500">Açıqlama:</p>
                                  <p className="italic bg-white p-3 rounded border border-gray-100 shadow-sm">{m.description || 'Bu məhsul üçün əlavə məlumat qeyd olunmayıb.'}</p>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AnbarSiyahisi;
