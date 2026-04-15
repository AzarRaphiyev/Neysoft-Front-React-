import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { formatMebleg } from '../../utils/helpers';
import * as XLSX from 'xlsx';

function AnbarSiyahisi() {
  const { data, deleteAnbarItem } = useData();
  const { showConfirm } = useUI();
  const [axtar, setAxtar] = useState('');
  const [novFilter, setNovFilter] = useState('');
  const [sifirGoster, setSifirGoster] = useState(false);

  const filtered = useMemo(() => {
    return data.anbar.filter((m) => {
      const axtarMatch =
        m.mal_adi.toLowerCase().includes(axtar.toLowerCase()) ||
        m.mal_kod.toLowerCase().includes(axtar.toLowerCase());
      const novMatch = !novFilter || m.nov_id === parseInt(novFilter);
      const sifirMatch = sifirGoster || m.qaliq > 0;
      return axtarMatch && novMatch && sifirMatch;
    });
  }, [data.anbar, axtar, novFilter, sifirGoster]);

  const handleExport = () => {
    const ws_data = [
      [
        'Mal Kodu',
        'Mal\u0131n Ad\u0131',
        'Kateqoriya',
        'R\u0259ng',
        '\u00D6l\u00E7\u00FC',
        'Qal\u0131q Miqdar\u0131',
        'Al\u0131\u015F Qiym\u0259ti',
        'Sat\u0131\u015F Qiym\u0259ti',
        '\u00DCmumi D\u0259y\u0259r',
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
        <h2 className="text-2xl font-bold text-gray-800">
          <i className="fas fa-boxes"></i> Anbar Siyah\u0131s\u0131
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
          <input
            type="text"
            value={axtar}
            onChange={(e) => setAxtar(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Barkod v\u0259 ya mal ad\u0131 ilə axtar..."
          />
          <select
            value={novFilter}
            onChange={(e) => setNovFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">B\u00FCt\u00FCn kateqoriyalar</option>
            {data.kateqoriyalar.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nov_adi}
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
            <span className="text-sm">Qal\u0131\u011F\u0131 0 olanlar\u0131 g\u00F6st\u0259r</span>
          </label>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Barkod</th>
                <th className="px-4 py-3 text-left">Mal\u0131n Ad\u0131</th>
                <th className="px-4 py-3 text-left">N\u00F6v</th>
                <th className="px-4 py-3 text-left">R\u0259ng</th>
                <th className="px-4 py-3 text-left">\u00D6l\u00E7\u00FC</th>
                <th className="px-4 py-3 text-right">Qal\u0131q</th>
                <th className="px-4 py-3 text-right">Al\u0131\u015F Qiym\u0259ti</th>
                <th className="px-4 py-3 text-right">Sat\u0131\u015F Qiym\u0259ti</th>
                <th className="px-4 py-3 text-right">\u00DCmumi D\u0259y\u0259r</th>
                <th className="px-4 py-3 text-center">\u0258m\u0259liyyat</th>
                <th className="px-4 py-3 text-left">Malın Adı</th>
                <th className="px-4 py-3 text-left">Növ</th>
                <th className="px-4 py-3 text-left">Rəng</th>
                <th className="px-4 py-3 text-left">Ölçü</th>
                <th className="px-4 py-3 text-right">Qalıq</th>
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
                  const rowClass = m.qaliq === 0 ? 'stok-sifir' : m.qaliq <= 5 ? 'stok-az' : '';
                  const eId = `exp-${m.id}`;
                  return (
                    <React.Fragment key={m.id}>
                      <tr
                        className={`border-b hover:bg-gray-50 cursor-pointer ${rowClass}`}
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
                              <span
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: m.reng_kod }}
                              ></span>
                              {m.reng_adi}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">{m.olcu_adi || '-'}</td>
                        <td className="px-4 py-3 text-right font-semibold">{m.qaliq}</td>
                        <td className="px-4 py-3 text-right">{formatMebleg(m.alis_qiymeti)}</td>
                        <td className="px-4 py-3 text-right">{formatMebleg(m.satis_qiymeti)}</td>
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
    </div>
  );
}

export default AnbarSiyahisi;
