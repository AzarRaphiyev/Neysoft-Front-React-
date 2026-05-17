import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
import { formatMebleg } from '../utils/helpers';
import Modal from '../components/common/Modal';
import api from '../utils/api';
import * as XLSX from 'xlsx';

function SatisTarixce() {
  const { data, returnCustomerSale, fetchSatislar } = useData();
  const ui = useUI();
  const { openModal, showToast } = ui;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterQebz, setFilterQebz] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedSatis, setSelectedSatis] = useState(null);

  React.useEffect(() => {
    if (fetchSatislar) fetchSatislar();
  }, [fetchSatislar]);

  const [iadeSatis, setIadeSatis] = useState(null);
  const [iadeMehsullar, setIadeMehsullar] = useState([]);
  const [iadeSebep, setIadeSebep] = useState('');

  const handleIadeAc = (satis) => {
    setIadeSatis(satis);
    const mehsullarIcin = (satis.mehsullar || satis.items || []).map(m => ({
      ...m,
      iadeMiqdar: 0,
      iadeMebleg: 0
    }));
    setIadeMehsullar(mehsullarIcin);
    setIadeSebep('');
    openModal('iade');
  };

  const handleIadeTesdiq = async () => {
    const secilenUrunler = iadeMehsullar.filter(m => m.iadeMiqdar > 0);

    if (secilenUrunler.length === 0) {
      showToast('Heç bir məhsul seçilməyib', 'warning');
      return;
    }

    try {
      const payload = {
        saleId: iadeSatis.id || iadeSatis.qebz_nomre,
        reason: iadeSebep || 'Səbəb qeyd edilməyib',
        items: secilenUrunler.map(item => ({
          productId: item.productId || item.product?.id || item.mal_id,
          quantity: item.iadeMiqdar,
          refundAmount: Number(item.iadeMebleg)
        }))
      };

      await api.post('/returns/customer', payload);
      ui.closeModal();
      showToast('Müştəri iadəsi uğurla tamamlandı', 'success');
      if (fetchSatislar) fetchSatislar();
    } catch (err) {
      showToast('İadə zamanı xəta baş verdi', 'error');
    }
  };

  const filtered = useMemo(() => {
    let filteredSatislar = [...(data.satislar || [])];

    if (filterQebz) {
      filteredSatislar = filteredSatislar.filter((s) => (s.receiptNo || s.qebz_nomre || '').toLowerCase().includes(filterQebz.toLowerCase()));
    }

    if (filterStatus !== 'ALL') {
      if (filterStatus === 'RETURNED') {
        filteredSatislar = filteredSatislar.filter((s) => s.status === 'RETURNED' || s.status?.includes('Qaytarıldı') || s.status?.includes('Qaytarma') || (s.qaytarmalar && s.qaytarmalar.length > 0));
      } else if (filterStatus === 'COMPLETED') {
        filteredSatislar = filteredSatislar.filter((s) => s.status === 'COMPLETED' || (!s.status?.includes('Qaytar') && (!s.qaytarmalar || s.qaytarmalar.length === 0)));
      }
    }

    return filteredSatislar.sort((a, b) => new Date(b.createdAt || b.tarix || 0) - new Date(a.createdAt || a.tarix || 0));
  }, [data.satislar, filterQebz, filterStatus]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
          <i className="fas fa-history"></i> Satış Tarixçəsi
        </h2>
        <button
          onClick={handleExport}
          className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 text-center"
        >
          <i className="fas fa-file-export mr-2"></i> Excel Export
        </button>
      </div>

      {/* API Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-2 text-gray-600 font-medium">Başlanğıc Tarix</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm mb-2 text-gray-600 font-medium">Bitiş Tarix</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={() => { if (fetchSatislar) fetchSatislar(startDate, endDate); }}
            className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center font-medium h-[42px]"
          >
            <i className="fas fa-search mr-2"></i>Axtar
          </button>
        </div>
        {(startDate || endDate) && (
          <p className="text-sm text-gray-600 mb-4">Göstərilən aralıq: {startDate} - {endDate}</p>
        )}
      </div>

      {/* Local Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Qəbz №</label>
            <input
              type="text"
              value={filterQebz}
              onChange={(e) => setFilterQebz(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Qəbz nömrəsi..."
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="ALL">Hamısı</option>
              <option value="COMPLETED">Satıldı</option>
              <option value="RETURNED">Qaytarıldı</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-max whitespace-nowrap">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Qəbz №</th>
                <th className="px-4 py-3 text-left">Tarix</th>
                <th className="px-4 py-3 text-left">Kassir</th>
                <th className="px-4 py-3 text-left">Müştəri</th>
                <th className="px-4 py-3 text-right">Məbləğ</th>
                <th className="px-4 py-3 text-right">Endirim</th>
                <th className="px-4 py-3 text-right">Yekun</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Ödəniş</th>
                <th className="px-4 py-3 text-center">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    Satış tapılmadı
                  </td>
                </tr>
              ) : (
                filtered.map((s, index) => {
                  const isReturned = s.status === 'RETURNED' || s.status?.includes('Qaytar') || (s.qaytarmalar && s.qaytarmalar.length > 0);
                  const rowClass = isReturned ? 'bg-red-50 text-gray-900' : '';
                  return (
                    <tr key={s.id || index} className={`border-b hover:bg-gray-50 ${rowClass}`}>
                      <td className="px-4 py-3">
                        {isReturned && <i className="fas fa-undo mr-1 text-red-500"></i>}
                        {s.receiptNo || s.qebz_nomre || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {s.createdAt || s.date || s.tarix ? new Date(s.createdAt || s.date || s.tarix).toLocaleString('az-AZ') : '-'}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700">
                        {s.user?.username || s.kassir || 'Bilinmir'}
                      </td>
                      <td className="px-4 py-3">
                        {s.customerName || s.musteri_ad || 'Standart Müştəri'}
                      </td>
                      <td className="px-4 py-3 text-right">{formatMebleg(s.totalAmount || s.umumi_mebleg || 0)}</td>
                      <td className="px-4 py-3 text-right text-red-600">
                        {formatMebleg(s.discount || s.umumi_endirim || 0)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-blue-600">
                        {s.finalAmount !== undefined ? `${s.finalAmount} AZN` : formatMebleg(s.yekun_mebleg || 0)}
                      </td>
                      <td className="px-4 py-3">
                        {isReturned ? (
                          <span className="text-red-600 font-bold">Qaytarılmış</span>
                        ) : (
                          <span className="text-gray-600 font-semibold">Satıldı</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {s.paymentMethod === 'CARD' ? 'Kart' : (s.paymentMethod === 'CASH' ? 'Nağd' : (s.paymentMethod || s.odenis_nov || '-'))}
                      </td>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Qəbz №:</strong> {selectedSatis?.receiptNo || selectedSatis?.qebz_nomre || '-'}
              </div>
              <div>
                <strong>Tarix:</strong> {selectedSatis?.date ? new Date(selectedSatis.date).toLocaleString('az-AZ') : (selectedSatis?.tarix ? new Date(selectedSatis.tarix).toLocaleString('az-AZ') : '-')}
              </div>
              <div>
                <strong>Kassir:</strong> {selectedSatis?.user?.username || selectedSatis?.kassir || 'Bilinmir'}
              </div>
              <div>
                <strong>Müştəri:</strong> {selectedSatis?.customerName || selectedSatis?.musteri_ad || 'Standart Müştəri'}
              </div>
              <div>
                <strong>Telefon:</strong> {selectedSatis?.customerPhone || selectedSatis?.musteri_tel || '-'}
              </div>
              <div>
                <strong>Ödəniş:</strong> {selectedSatis?.paymentMethod === 'CARD' ? 'Kart' : (selectedSatis?.paymentMethod === 'CASH' ? 'Nağd' : (selectedSatis?.odenis_nov || '-'))}
              </div>
              <div>
                <strong>Mənfəət:</strong> {formatMebleg(selectedSatis?.menfeet || 0)}
              </div>
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-3">Məhsullar:</h4>
              <table className="w-full text-sm min-w-max whitespace-nowrap">
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
                  {(selectedSatis?.mehsullar || selectedSatis?.items || []).map((m, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="px-3 py-2">{m?.product?.name || m?.mal_adi || '-'}</td>
                      <td className="px-3 py-2 text-right">{m?.quantity || m?.miqdar || 0}</td>
                      <td className="px-3 py-2 text-right">
                        {(m?.price < m?.product?.price) ? (
                          <>
                            <span className="line-through text-gray-400 text-xs mr-2">{m.product.price} AZN</span>
                            <span className="text-red-600 font-bold">{m.price} AZN</span>
                          </>
                        ) : (
                          `${m?.price || m?.satis_qiymeti || 0} AZN`
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-red-600">
                        {formatMebleg(m?.discount || m?.endirim_mebleg || 0)}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {formatMebleg((m?.quantity * m?.price) || m?.totalPrice || m?.yekun_mebleg || 0)}
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
                      {formatMebleg(selectedSatis?.finalAmount || selectedSatis?.yekun_mebleg || 0)}
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
                <div className="flex justify-between"><span>Tarix:</span> <span>{selectedSatis?.date ? new Date(selectedSatis.date).toLocaleString('az-AZ') : (selectedSatis?.tarix ? new Date(selectedSatis.tarix).toLocaleString('az-AZ') : '-')}</span></div>
                <div className="flex justify-between"><span>Qəbz №:</span> <span>{selectedSatis?.receiptNo || selectedSatis?.qebz_nomre || '-'}</span></div>
                <div className="flex justify-between"><span>Kassir:</span> <span className="uppercase">{selectedSatis?.user?.username || selectedSatis?.kassir || '-'}</span></div>
              </div>

              {(selectedSatis?.customerName || selectedSatis?.customerPhone || selectedSatis?.musteri_ad || selectedSatis?.musteri_tel) && (
                <div className="mb-4 text-xs border-y border-dashed border-gray-400 py-3 space-y-1.5 font-semibold bg-gray-50 px-2">
                  {(selectedSatis?.customerName || selectedSatis?.musteri_ad) && <div className="flex justify-between"><span>Müştəri:</span> <span>{selectedSatis?.customerName || selectedSatis?.musteri_ad}</span></div>}
                  {(selectedSatis?.customerPhone || selectedSatis?.musteri_tel) && <div className="flex justify-between"><span>Əlaqə:</span> <span>{selectedSatis?.customerPhone || selectedSatis?.musteri_tel}</span></div>}
                </div>
              )}

              <table className="w-full text-xs mb-4 min-w-max whitespace-nowrap">
                <thead className="border-b border-gray-800">
                  <tr>
                    <th className="text-left py-1.5 w-1/2 uppercase">Məhsul</th>
                    <th className="text-center py-1.5 uppercase">Miq</th>
                    <th className="text-right py-1.5 uppercase">Məbləğ</th>
                  </tr>
                </thead>
                <tbody className="font-semibold">
                  {(selectedSatis?.items || selectedSatis?.mehsullar || []).map((m, idx) => (
                    <tr key={idx} className="border-b border-gray-200 last:border-0">
                      <td className="py-2 pr-1 break-words">
                        {m?.product?.name || m?.mal_adi || '-'}
                        {m?.price < m?.product?.price && (
                          <div className="text-[10px] mt-0.5">
                            <span className="line-through text-gray-500 mr-1">{m.product.price} ₼</span>
                            <span className="text-gray-900 font-bold">{m.price} ₼</span>
                          </div>
                        )}
                        {(m?.discount > 0 || m?.endirim > 0) && <div className="text-[10px] text-gray-500 font-normal">(-{m?.discount || m?.endirim}₼ endirim)</div>}
                      </td>
                      <td className="text-center py-2 align-top">{m?.quantity || m?.miqdar || 0}</td>
                      <td className="text-right py-2 align-top">{formatMebleg((m?.quantity * m?.price) || m?.totalPrice || m?.yekun_mebleg || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-gray-400 pt-3 space-y-1.5 text-xs font-bold">
                <div className="flex justify-between text-gray-600"><span>Ara Cəmi:</span> <span>{formatMebleg(selectedSatis?.totalAmount || selectedSatis?.umumi_mebleg || 0)}</span></div>
                {(selectedSatis?.discount || selectedSatis?.umumi_endirim || 0) > 0 && (
                  <div className="flex justify-between text-red-600"><span>Endirim:</span> <span>-{formatMebleg(selectedSatis?.discount || selectedSatis?.umumi_endirim || 0)}</span></div>
                )}
                <div className="flex justify-between text-lg mt-2 pt-2 border-t border-gray-800">
                  <span>YEKUN:</span> <span>{formatMebleg(selectedSatis?.finalAmount || selectedSatis?.yekun_mebleg || 0)}</span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-800 pt-3 text-xs space-y-1.5 font-bold">
                <div className="flex justify-between"><span>Ödəniş növü:</span> <span className="uppercase">{selectedSatis.paymentMethod === 'CARD' || selectedSatis.odenis_nov === 'kart' || selectedSatis.odenis_nov === 'Kart' ? 'Kart' : 'Nağd'}</span></div>
                {(selectedSatis.paidAmount || selectedSatis.odenisMebleg || 0) > 0 && (
                  <>
                    <div className="flex justify-between text-gray-600"><span>Ödənilib:</span> <span>{formatMebleg(selectedSatis.paidAmount || selectedSatis.odenisMebleg || 0)}</span></div>
                    <div className="flex justify-between"><span>Qalıq:</span> <span>{formatMebleg(selectedSatis.changeAmount || selectedSatis.qaliqMebleg || 0)}</span></div>
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
            <table className="w-full text-sm min-w-max whitespace-nowrap">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-3 py-2 text-left">Məhsul</th>
                  <th className="px-3 py-2 text-center">Satılan</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">İadə Miqdar</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">Qaytarılacaq ₼</th>
                </tr>
              </thead>
              <tbody>
                {(iadeMehsullar || []).map((m, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-2 align-middle">
                      <div className="font-medium text-gray-800">{m?.product?.name || m.mal_adi || 'Bilinməyən Məhsul'}</div>
                      <div className="text-xs text-gray-500">{Number(m.price || (Number(m.yekun_mebleg) / Number(m.miqdar)) || 0).toFixed(2)} ₼ (ədəd)</div>
                    </td>
                    <td className="px-3 py-2 text-center align-middle font-bold text-gray-700">{m.quantity || m.miqdar || 0}</td>
                    <td className="px-3 py-2 align-middle max-w-[100px]">
                      <input
                        type="number"
                        min="0"
                        max={m.quantity || m.miqdar || 0}
                        value={m.iadeMiqdar === 0 ? '' : m.iadeMiqdar}
                        onChange={(e) => {
                          let val = parseInt(e.target.value) || 0;
                          const maxQty = m.quantity || m.miqdar || 0;
                          const unitPrice = m.price || (Number(m.yekun_mebleg) / Number(m.miqdar)) || 0;
                          if (val > maxQty) val = maxQty;
                          if (val < 0) val = 0;
                          const yeniListe = [...iadeMehsullar];
                          yeniListe[idx].iadeMiqdar = val;
                          yeniListe[idx].iadeMebleg = val * unitPrice;
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