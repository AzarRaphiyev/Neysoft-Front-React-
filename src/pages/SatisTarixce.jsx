import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
import { formatMebleg } from '../utils/helpers';
import Modal from '../components/common/Modal';
import * as XLSX from 'xlsx';

function SatisTarixce() {
  const { data } = useData();
  const ui = useUI();
  const { openModal } = ui;
  const [baslama, setBaslama] = useState('');
  const [bitme, setBitme] = useState('');
  const [selectedSatis, setSelectedSatis] = useState(null);

  const filtered = useMemo(() => {
    let filteredSatislar = [...data.satislar];
    if (baslama) filteredSatislar = filteredSatislar.filter((s) => s.tarix >= baslama);
    if (bitme) filteredSatislar = filteredSatislar.filter((s) => s.tarix <= bitme + 'T23:59:59');
    return filteredSatislar.sort((a, b) => new Date(b.tarix) - new Date(a.tarix));
  }, [data.satislar, baslama, bitme]);

  const handleExport = () => {
    const ws_data = [
      [
        'Qəbz Kodu',
        'Barkod',
        'Malın Adı',
        'Satılan Miqdar',
        'Alış Məbləği',
        'Satış Məbləği',
        'Məhsul Endirimi',
        'Qəbz Endirimi',
        'Qaytarılan Miqdar',
        'Qaytarılan Məbləğ',
        'Status',
        'Cəm',
        'Net Miqdar',
      ],
    ];

    filtered.forEach((s) => {
      const umumiSatisOrijinal = s.mehsullar.reduce(
        (sum, m) => sum + m.satis_qiymeti * m.miqdar,
        0,
      );

      s.mehsullar.forEach((m) => {
        let qaytarilanMiqdar = 0;
        let qaytarilanMebleg = 0;

        if (s.qaytarmalar && s.qaytarmalar.length > 0) {
          s.qaytarmalar.forEach((q) => {
            const qaytarilanMehsul = q.mehsullar.find((qm) => qm.mal_adi === m.mal_adi);
            if (qaytarilanMehsul) {
              qaytarilanMiqdar += qaytarilanMehsul.miqdar;
              qaytarilanMebleg += qaytarilanMehsul.mebleg || 0;
            }
          });
        }

        let status = 'Aktiv';
        if (qaytarilanMiqdar > 0 && qaytarilanMiqdar < m.miqdar) {
          status = 'Qismən Qaytarma';
        } else if (qaytarilanMiqdar === m.miqdar) {
          status = 'Tam Qaytarma';
        }

        const orijinalSatis = m.satis_qiymeti * m.miqdar;
        const mehsulEndirimi = m.endirim_mebleg || 0;
        let qebzEndirimiHisse = 0;
        if (s.qebz_endirim > 0 && umumiSatisOrijinal > 0) {
          const mehsulPayi = orijinalSatis / umumiSatisOrijinal;
          qebzEndirimiHisse = s.qebz_endirim * mehsulPayi;
        }

        const totalEndirim = mehsulEndirimi + qebzEndirimiHisse;
        const cem = orijinalSatis - totalEndirim;
        const alisMeblegi = m.alis_qiymeti * m.miqdar;
        const netMiqdar = m.miqdar - qaytarilanMiqdar;

        ws_data.push([
          s.qebz_nomre,
          m.mal_kod || '-',
          m.mal_adi,
          m.miqdar,
          parseFloat(alisMeblegi.toFixed(2)),
          parseFloat(cem.toFixed(2)),
          parseFloat(mehsulEndirimi.toFixed(2)),
          parseFloat(qebzEndirimiHisse.toFixed(2)),
          qaytarilanMiqdar,
          parseFloat(qaytarilanMebleg.toFixed(2)),
          status,
          parseFloat(cem.toFixed(2)),
          netMiqdar,
        ]);
      });
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    const wscols = [
      { wch: 15 },
      { wch: 12 },
      { wch: 25 },
      { wch: 12 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 15 },
      { wch: 15 },
      { wch: 18 },
      { wch: 12 },
      { wch: 12 },
    ];
    ws['!cols'] = wscols;
    XLSX.utils.book_append_sheet(wb, ws, 'Satış Tarixçəsi');
    XLSX.writeFile(wb, `satis_tarixcesi_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          <i className="fas fa-history"></i> Satış Tarixçəsi
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
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              <i className="fas fa-search"></i> Axtar...
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
                <th className="px-4 py-3 text-left">Qəbz №</th>
                <th className="px-4 py-3 text-left">Tarix</th>
                <th className="px-4 py-3 text-left">Müştəri</th>
                <th className="px-4 py-3 text-right">Məbləğ</th>
                <th className="px-4 py-3 text-right">Endirim</th>
                <th className="px-4 py-3 text-right">Yekun</th>
                <th className="px-4 py-3 text-left">Ödəniş</th>
                <th className="px-4 py-3 text-center">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">
                    Satış tapılmadı
                  </td>
                </tr>
              ) : (
                filtered.map((s) => {
                  const varQaytarma = s.qaytarmalar && s.qaytarmalar.length > 0;
                  const rowClass = varQaytarma ? 'bg-red-50' : '';
                  return (
                    <tr key={s.id} className={`border-b hover:bg-gray-50 ${rowClass}`}>
                      <td className="px-4 py-3">
                        {varQaytarma && <i className="fas fa-undo mr-1"></i>}
                        {s.qebz_nomre}
                      </td>
                      <td className="px-4 py-3">{new Date(s.tarix).toLocaleDateString('az-AZ')}</td>
                      <td className="px-4 py-3">{s.musteri_ad || '-'}</td>
                      <td className="px-4 py-3 text-right">{formatMebleg(s.umumi_mebleg)}</td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {formatMebleg(s.umumi_endirim)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        {formatMebleg(s.yekun_mebleg)}
                      </td>
                      <td className="px-4 py-3">{s.odenis_nov}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedSatis(s);
                            openModal('satisDetay');
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-2"
                          title="Detallar"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSatis(s);
                            openModal('qebz');
                          }}
                          className="text-green-600 hover:text-green-800"
                          title="Qəbz"
                        >
                          <i className="fas fa-print"></i>
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

      {/* Sales Detail Modal */}
      <Modal
        isOpen={ui.activeModal === 'satisDetay'}
        onClose={() => ui.closeModal()}
        title="Satış Detalları"
      >
        {selectedSatis && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Qəbz №:</strong> {selectedSatis.qebz_nomre}
              </div>
              <div>
                <strong>Tarix:</strong> {new Date(selectedSatis.tarix).toLocaleString('az-AZ')}
              </div>
              <div>
                <strong>Müştəri:</strong> {selectedSatis.musteri_ad || '-'}
              </div>
              <div>
                <strong>Telefon:</strong> {selectedSatis.musteri_tel || '-'}
              </div>
              <div>
                <strong>Ödəniş:</strong> {selectedSatis.odenis_nov}
              </div>
              <div>
                <strong>Mənfəət:</strong> {formatMebleg(selectedSatis.menfeet)}
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Məhsullar:</h4>
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2 text-left">Məhsul</th>
                    <th className="px-3 py-2 text-right">Miqdar</th>
                    <th className="px-3 py-2 text-right">Qiymət</th>
                    <th className="px-3 py-2 text-right">Endirim</th>
                    <th className="px-3 py-2 text-right">Yekun</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSatis.mehsullar.map((m, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">{m.mal_adi}</td>
                      <td className="px-3 py-2 text-right">{m.miqdar}</td>
                      <td className="px-3 py-2 text-right">{formatMebleg(m.satis_qiymeti)}</td>
                      <td className="px-3 py-2 text-right text-red-600">
                        {formatMebleg(m.endirim_mebleg)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {formatMebleg(m.yekun_mebleg)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 font-bold">
                  <tr>
                    <td colSpan="4" className="px-3 py-2 text-right">
                      YEKUN:
                    </td>
                    <td className="px-3 py-2 text-right text-blue-600">
                      {formatMebleg(selectedSatis.yekun_mebleg)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Receipt Modal (reuse) */}
      <Modal
        isOpen={ui.activeModal === 'qebz'}
        onClose={() => ui.closeModal()}
        title="Qəbz"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <i className="fas fa-print"></i> Çap Et
            </button>
            <button
              onClick={() => ui.closeModal()}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              Bağla
            </button>
          </div>
        }
      >
        {selectedSatis && (
          <div className="print-area">
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{data.magazaMelumat.ad}</h2>
              <p className="text-sm text-gray-600">{data.magazaMelumat.unvan}</p>
              <p className="text-sm text-gray-600">Tel: {data.magazaMelumat.telefon}</p>
              <div className="border-t border-b py-3 my-3">
                <p className="text-sm">
                  <strong>Qəbz №:</strong> {selectedSatis.qebz_nomre}
                </p>
                <p className="text-sm">
                  <strong>Tarix:</strong> {new Date(selectedSatis.tarix).toLocaleString('az-AZ')}
                </p>
              </div>
              <table className="w-full text-sm mb-3">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-1">Məhsul</th>
                    <th className="text-right py-1">Qiymət</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSatis.mehsullar.map((m, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">
                        {m.mal_adi}
                        <br />
                        <span className="text-xs text-gray-600">
                          {m.miqdar} x {formatMebleg(m.satis_qiymeti)}
                        </span>
                      </td>
                      <td className="text-right py-2 font-semibold">
                        {formatMebleg(m.yekun_mebleg)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>YEKUN:</span>
                  <span>{formatMebleg(selectedSatis.yekun_mebleg)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Ödəniş:</span>
                  <span>{selectedSatis.odenis_nov}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SatisTarixce;