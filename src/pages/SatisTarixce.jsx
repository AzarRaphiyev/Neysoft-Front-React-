import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
import { formatMebleg } from '../utils/helpers';
import Modal from '../components/common/Modal';
import * as XLSX from 'xlsx';

function SatisTarixce() {
  const { data, returnCustomerSale } = useData();
  const ui = useUI();
  const { openModal, showToast } = ui;
  const [baslama, setBaslama] = useState('');
  const [bitme, setBitme] = useState('');
  const [qebzNo, setQebzNo] = useState('');
  const [yalnizQaytarilanlar, setYalnizQaytarilanlar] = useState(false);
  const [selectedSatis, setSelectedSatis] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  const [iadeSatis, setIadeSatis] = useState(null);
  const [iadeMehsullar, setIadeMehsullar] = useState([]);
  const [iadeSebep, setIadeSebep] = useState('');

  const handleIadeAc = (satis) => {
    setIadeSatis(satis);
    const mehsullarIcin = satis.mehsullar.map(m => ({
      ...m,
      iadeMiqdar: 0,
      iadeMebleg: 0
    }));
    setIadeMehsullar(mehsullarIcin);
    setIadeSebep('');
    openModal('iade');
  };

  const handleIadeTesdiq = async () => {
    const secilenUrunler = iadeMehsullar
      .filter(m => m.iadeMiqdar > 0)
      .map(m => ({
        productId: m.mal_id,
        quantity: Number(m.iadeMiqdar),
        refundAmount: Number(m.iadeMebleg)
      }));

    if (secilenUrunler.length === 0) {
      showToast('Heç bir məhsul seçilməyib', 'warning');
      return;
    }

    try {
      await returnCustomerSale(iadeSatis.id || iadeSatis.qebz_nomre, iadeSebep, secilenUrunler);
      ui.closeModal();
      showToast('Müştəri iadəsi uğurla tamamlandı', 'success');
    } catch (err) {
      showToast('İadə zamanı xəta baş verdi', 'error');
    }
  };

  const filtered = useMemo(() => {
    let filteredSatislar = [...data.satislar];
    if (baslama) filteredSatislar = filteredSatislar.filter((s) => s.tarix >= baslama);
    if (bitme) filteredSatislar = filteredSatislar.filter((s) => s.tarix <= bitme + 'T23:59:59');
    if (qebzNo) filteredSatislar = filteredSatislar.filter((s) => s.qebz_nomre?.toLowerCase().includes(qebzNo.toLowerCase()));
    if (yalnizQaytarilanlar) filteredSatislar = filteredSatislar.filter((s) => s.qaytarmalar && s.qaytarmalar.length > 0);
    return filteredSatislar.sort((a, b) => new Date(b.tarix) - new Date(a.tarix));
  }, [data.satislar, baslama, bitme, qebzNo, yalnizQaytarilanlar]);

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-sm mb-2">Qəbz №</label>
            <input
              type="text"
              value={qebzNo}
              onChange={(e) => setQebzNo(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Qəbz nömrəsi..."
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setYalnizQaytarilanlar(!yalnizQaytarilanlar)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${yalnizQaytarilanlar ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              <i className="fas fa-undo mr-2"></i> Yalnız Qaytarılanlar
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
                          className="text-green-600 hover:text-green-800 mr-2"
                          title="Qəbz"
                        >
                          <i className="fas fa-print"></i>
                        </button>
                        <button
                          onClick={() => handleIadeAc(s)}
                          className="text-red-500 hover:text-red-700"
                          title="İadə Et"
                        >
                          <i className="fas fa-undo"></i>
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
        <div id="qebz-content" className="print-area font-mono text-gray-800 bg-white p-4 max-w-[320px] mx-auto border border-dashed border-gray-400 shadow-sm">
          {selectedSatis && (
            <>
              <div className="text-center mb-4 border-b border-dashed border-gray-400 pb-4">
                <h2 className="text-2xl font-black uppercase tracking-wider mb-1">
                  {data.magazaMelumat?.ad || "NEYSOFT POS"}
                </h2>
                {data.magazaMelumat?.unvan && <p className="text-xs font-semibold">{data.magazaMelumat.unvan}</p>}
                {data.magazaMelumat?.telefon && <p className="text-xs font-semibold mt-1">Tel: {data.magazaMelumat.telefon}</p>}
                {/* Təkrar Çap Bildirişi */}
                <p className="text-[10px] font-bold mt-2 bg-gray-100 py-1 uppercase tracking-widest text-gray-500">** Təkrar Çap **</p>
              </div>

              <div className="mb-4 text-xs space-y-1.5 font-semibold">
                <div className="flex justify-between"><span>Tarix:</span> <span>{new Date(selectedSatis.tarix).toLocaleString('az-AZ')}</span></div>
                <div className="flex justify-between"><span>Qəbz №:</span> <span>{selectedSatis.qebz_nomre}</span></div>
                <div className="flex justify-between"><span>Kassir:</span> <span className="uppercase">{currentUser.username || currentUser.name || 'Admin'}</span></div>
              </div>

              {(selectedSatis.musteri_ad || selectedSatis.musteri_tel) && (
                <div className="mb-4 text-xs border-y border-dashed border-gray-400 py-3 space-y-1.5 font-semibold bg-gray-50 px-2">
                  {selectedSatis.musteri_ad && <div className="flex justify-between"><span>Müştəri:</span> <span>{selectedSatis.musteri_ad}</span></div>}
                  {selectedSatis.musteri_tel && <div className="flex justify-between"><span>Əlaqə:</span> <span>{selectedSatis.musteri_tel}</span></div>}
                </div>
              )}

              <table className="w-full text-xs mb-4">
                <thead className="border-b border-gray-800">
                  <tr>
                    <th className="text-left py-1.5 w-1/2 uppercase">Məhsul</th>
                    <th className="text-center py-1.5 uppercase">Miq</th>
                    <th className="text-right py-1.5 uppercase">Məbləğ</th>
                  </tr>
                </thead>
                <tbody className="font-semibold">
                  {selectedSatis.mehsullar.map((m, idx) => (
                    <tr key={idx} className="border-b border-gray-200 last:border-0">
                      <td className="py-2 pr-1 break-words">
                        {m.mal_adi}
                        {m.endirim > 0 && <div className="text-[10px] text-gray-500 font-normal">(-{m.endirim}₼ endirim)</div>}
                      </td>
                      <td className="text-center py-2 align-top">{m.miqdar}</td>
                      <td className="text-right py-2 align-top">{formatMebleg(m.yekun_mebleg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-gray-400 pt-3 space-y-1.5 text-xs font-bold">
                <div className="flex justify-between text-gray-600"><span>Ara Cəmi:</span> <span>{formatMebleg(selectedSatis.umumi_mebleg)}</span></div>
                {selectedSatis.umumi_endirim > 0 && (
                  <div className="flex justify-between text-red-600"><span>Endirim:</span> <span>-{formatMebleg(selectedSatis.umumi_endirim)}</span></div>
                )}
                <div className="flex justify-between text-lg mt-2 pt-2 border-t border-gray-800">
                  <span>YEKUN:</span> <span>{formatMebleg(selectedSatis.yekun_mebleg)}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-800 pt-3 text-xs space-y-1.5 font-bold">
                <div className="flex justify-between"><span>Ödəniş növü:</span> <span className="uppercase">{selectedSatis.odenis_nov === 'kart' ? 'Kart' : 'Nağd'}</span></div>
                {selectedSatis.odenisMebleg > 0 && (
                  <>
                    <div className="flex justify-between text-gray-600"><span>Ödənilib:</span> <span>{formatMebleg(selectedSatis.odenisMebleg)}</span></div>
                    <div className="flex justify-between"><span>Qalıq:</span> <span>{formatMebleg(selectedSatis.qaliqMebleg)}</span></div>
                  </>
                )}
              </div>

              <div className="mt-6 text-center text-xs font-bold italic uppercase border-t border-dashed border-gray-400 pt-4">
                Bizi seçdiyiniz üçün <br /> təşəkkür edirik!
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* İadə Modalı */}
      <Modal
        isOpen={ui.activeModal === 'iade'}
        onClose={() => ui.closeModal()}
        title="Müştəri İadəsi"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => ui.closeModal()}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 font-medium"
            >
              Ləğv Et
            </button>
            <button
              onClick={handleIadeTesdiq}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium whitespace-nowrap"
            >
              <i className="fas fa-check mr-2"></i>Təsdiqlə
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">İadə Səbəbi</label>
            <input
              type="text"
              value={iadeSebep}
              onChange={(e) => setIadeSebep(e.target.value)}
              placeholder="Məsələn: Zədəli məhsul"
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div className="border border-gray-200 rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Məhsul</th>
                  <th className="px-3 py-2 text-center">Satılan</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">İadə Miqdar</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Qaytarılacaq ₼</th>
                </tr>
              </thead>
              <tbody>
                {iadeMehsullar.map((m, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-2 align-middle">
                      <div className="font-medium text-gray-800">{m.mal_adi}</div>
                      <div className="text-xs text-gray-500">{(Number(m.yekun_mebleg) / Number(m.miqdar)).toFixed(2)} ₼ (ədəd)</div>
                    </td>
                    <td className="px-3 py-2 text-center align-middle font-bold text-gray-700">{m.miqdar}</td>
                    <td className="px-3 py-2 align-middle max-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        max={m.miqdar}
                        value={m.iadeMiqdar === 0 ? '' : m.iadeMiqdar}
                        onChange={(e) => {
                          let val = parseInt(e.target.value) || 0;
                          if (val > m.miqdar) val = m.miqdar;
                          if (val < 0) val = 0;
                          const yeniListe = [...iadeMehsullar];
                          yeniListe[idx].iadeMiqdar = val;
                          yeniListe[idx].iadeMebleg = val * (Number(m.yekun_mebleg) / Number(m.miqdar));
                          setIadeMehsullar(yeniListe);
                        }}
                        placeholder="0"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-red-500 focus:border-red-500"
                      />
                    </td>
                    <td className="px-3 py-2 align-middle max-w-[120px]">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={m.iadeMebleg === 0 ? '' : m.iadeMebleg}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          const yeniListe = [...iadeMehsullar];
                          yeniListe[idx].iadeMebleg = val;
                          setIadeMehsullar(yeniListe);
                        }}
                        placeholder="0.00"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-red-500 focus:border-red-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SatisTarixce;