import React, { useState, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
import { formatMebleg } from '../utils/helpers';
import Modal from '../components/common/Modal';

function Satis() {
  const { data, sebet, setSebet, addSatis, umumiEndirim, setUmumiEndirim } = useData();
  const ui = useUI();
  const { showToast, openModal } = ui;
  const [musteriAd, setMusteriAd] = useState('');
  const [musteriTel, setMusteriTel] = useState('');
  const [axtar, setAxtar] = useState('');
  const [odenisNov, setOdenisNov] = useState('Nağd');
  const [odenisMebleg, setOdenisMebleg] = useState('');
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};

  const filteredMehsullar = useMemo(() => {
    const search = axtar.toLowerCase();
    return data.anbar.filter(
      (m) =>
        m.qaliq > 0 &&
        (m.mal_adi.toLowerCase().includes(search) || m.mal_kod.toLowerCase().includes(search)),
    );
  }, [data.anbar, axtar]);

  const sebeteElave = (malId) => {
    const mal = data.anbar.find((m) => m.id === malId);
    if (!mal) return;

    const sebetdeMal = sebet.find(
      (s) =>
        s.mal_id === malId &&
        s.reng_id === mal.reng_id &&
        s.olcu_id === mal.olcu_id &&
        s.satis_qiymeti === mal.satis_qiymeti,
    );

    if (sebetdeMal) {
      if (sebetdeMal.miqdar >= mal.qaliq) {
        showToast('Anbarda kifayət qədər mal yoxdur!', 'warning');
        return;
      }
      setSebet((prev) =>
        prev.map((s, i) =>
          i ===
            sebet.findIndex(
              (x) =>
                x.mal_id === malId &&
                x.reng_id === mal.reng_id &&
                x.olcu_id === mal.olcu_id &&
                x.satis_qiymeti === mal.satis_qiymeti,
            )
            ? { ...s, miqdar: s.miqdar + 1 }
            : s,
        ),
      );
    } else {
      setSebet((prev) => [
        ...prev,
        {
          mal_id: malId,
          mal_adi: mal.mal_adi,
          mal_kod: mal.mal_kod,
          nov_id: mal.nov_id,
          nov_adi: mal.nov_adi,
          reng_id: mal.reng_id || null,
          reng_adi: mal.reng_adi || '',
          reng_kod: mal.reng_kod || '',
          olcu_id: mal.olcu_id,
          olcu_adi: mal.olcu_adi,
          miqdar: 1,
          alis_qiymeti: mal.alis_qiymeti,
          satis_qiymeti: mal.satis_qiymeti,
          max_qaliq: mal.qaliq,
          endirim_tipi: null,
          endirim_deyer: 0,
        },
      ]);
    }
  };

  const sebetdenCixar = (index) => {
    setSebet((prev) => prev.filter((_, i) => i !== index));
  };

  const miqdarDeyis = (index, value) => {
    const val = parseInt(value);
    if (val > 0 && val <= sebet[index].max_qaliq) {
      setSebet((prev) => prev.map((s, i) => (i === index ? { ...s, miqdar: val } : s)));
    }
  };

  const endirimTipiDeyis = (index, tipi) => {
    setSebet((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, endirim_tipi: tipi || null, endirim_deyer: 0 } : s,
      ),
    );
  };

  const endirimDeyerDeyis = (index, deyer) => {
    setSebet((prev) =>
      prev.map((s, i) => (i === index ? { ...s, endirim_deyer: parseFloat(deyer) || 0 } : s)),
    );
  };

  const hesaplamalar = useMemo(() => {
    let araCemi = 0,
      mehsulEndirim = 0;

    sebet.forEach((item) => {
      const itemCemi = item.miqdar * item.satis_qiymeti;
      araCemi += itemCemi;
      let endirimMebleg = 0;
      if (item.endirim_tipi === 'faiz') {
        endirimMebleg = itemCemi * (item.endirim_deyer / 100);
      } else if (item.endirim_tipi === 'mebleg') {
        endirimMebleg = item.endirim_deyer;
      }
      mehsulEndirim += endirimMebleg;
    });

    let umumiQebzEndirim = 0;
    if (umumiEndirim.tipi === 'faiz') {
      umumiQebzEndirim = araCemi * (umumiEndirim.deyer / 100);
    } else if (umumiEndirim.tipi === 'mebleg') {
      umumiQebzEndirim = umumiEndirim.deyer;
    }

    return {
      araCemi,
      mehsulEndirim,
      umumiQebzEndirim,
      toplamEndirim: mehsulEndirim + umumiQebzEndirim,
      yekun: araCemi - (mehsulEndirim + umumiQebzEndirim),
    };
  }, [sebet, umumiEndirim]);

  const satisiTamamla = () => {
    if (sebet.length === 0) {
      showToast('Səbət boşdur!', 'warning');
      return;
    }

    const qebzNomre = 'QBZ-' + String(data.satislar.length + 1).padStart(6, '0');
    let umumiMebleg = 0,
      mehsulEndirimToplam = 0;

    const mehsullar = sebet.map((item) => {
      const araCemi = item.miqdar * item.satis_qiymeti;
      let endirimMebleg = 0;
      if (item.endirim_tipi === 'faiz') {
        endirimMebleg = araCemi * (item.endirim_deyer / 100);
      } else if (item.endirim_tipi === 'mebleg') {
        endirimMebleg = item.endirim_deyer;
      }
      umumiMebleg += araCemi;
      mehsulEndirimToplam += endirimMebleg;

      return {
        mal_id: item.mal_id,
        mal_adi: item.mal_adi,
        mal_kod: item.mal_kod,
        nov_id: item.nov_id,
        nov_adi: item.nov_adi,
        reng_id: item.reng_id || null,
        reng_adi: item.reng_adi || '',
        reng_kod: item.reng_kod || '',
        olcu_id: item.olcu_id,
        olcu_adi: item.olcu_adi,
        miqdar: item.miqdar,
        alis_qiymeti: item.alis_qiymeti,
        satis_qiymeti: item.satis_qiymeti,
        endirim_tipi: item.endirim_tipi,
        endirim_deyer: item.endirim_deyer,
        endirim_mebleg: endirimMebleg,
        ara_cemi: araCemi,
        yekun_mebleg: araCemi - endirimMebleg,
      };
    });

    let umumiQebzEndirim = 0;
    if (umumiEndirim.tipi === 'faiz') {
      umumiQebzEndirim = umumiMebleg * (umumiEndirim.deyer / 100);
    } else if (umumiEndirim.tipi === 'mebleg') {
      umumiQebzEndirim = umumiEndirim.deyer;
    }

    const toplamEndirim = mehsulEndirimToplam + umumiQebzEndirim;
    const yekunMebleg = umumiMebleg - toplamEndirim;

    let umumiMenfeet = 0;
    mehsullar.forEach((m) => {
      const mHisse = m.yekun_mebleg / (umumiMebleg - mehsulEndirimToplam) || 0;
      const mQebzEndirim = umumiQebzEndirim * mHisse;
      m.yekun_mebleg_son = m.yekun_mebleg - mQebzEndirim;
      m.menfeet = m.yekun_mebleg_son - m.miqdar * m.alis_qiymeti;
      umumiMenfeet += m.menfeet;
    });

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? user.id : null;
    const odenisFloat = parseFloat(odenisMebleg) || 0;

    const satis = {
      id: Date.now(),
      qebz_nomre: qebzNomre,
      userId: userId,
      odenisMebleg: odenisFloat,
      qaliqMebleg: odenisFloat - yekunMebleg,
      tarix: new Date().toISOString(),
      musteri_ad: musteriAd,
      musteri_tel: musteriTel,
      odenis_nov: odenisNov,
      umumi_mebleg: umumiMebleg,
      mehsul_endirim: mehsulEndirimToplam,
      qebz_endirim: umumiQebzEndirim,
      qebz_endirim_tipi: umumiEndirim.tipi,
      qebz_endirim_deyer: umumiEndirim.deyer,
      umumi_endirim: toplamEndirim,
      yekun_mebleg: yekunMebleg,
      menfeet: umumiMenfeet,
      mehsullar: mehsullar,
    };

    addSatis(satis);
    showToast('Satış uğurla tamamlandı!', 'success');
    openModal('qebz', satis);
    setMusteriAd('');
    setMusteriTel('');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        <i className="fas fa-shopping-cart"></i> Yeni Satış
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* Müştəri Məlumatları */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              Müştəri Məlumatları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={musteriAd}
                onChange={(e) => setMusteriAd(e.target.value)}
                className="px-4 py-2 border rounded-lg"
                placeholder="Müştəri adı"
              />
              <input
                type="tel"
                value={musteriTel}
                onChange={(e) => setMusteriTel(e.target.value)}
                className="px-4 py-2 border rounded-lg"
                placeholder="Telefon"
              />
            </div>
          </div>

          {/* Məhsul Axtar */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">Məhsul Seç</h3>
            <input
              type="text"
              value={axtar}
              onChange={(e) => setAxtar(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
              placeholder="Barkod və ya mal adı ilə axtar..."
            />
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {filteredMehsullar.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Məhsul tapılmadı</p>
              ) : (
                filteredMehsullar.map((m) => (
                  <div
                    key={m.id}
                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => sebeteElave(m.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold">{m.mal_adi}</h4>
                        <p className="text-sm text-gray-600">
                          {m.mal_kod} • {m.nov_adi}
                          {m.reng_kod && (
                            <span
                              className="inline-block w-4 h-4 rounded border align-middle ml-1"
                              style={{ backgroundColor: m.reng_kod }}
                            ></span>
                          )}
                          {m.reng_adi && ` ${m.reng_adi}`}
                          {m.olcu_adi && ` • ${m.olcu_adi}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{formatMebleg(m.satis_qiymeti)}</p>
                        <p className="text-xs text-gray-600">Qalıq: {m.qaliq}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Cart */}
        <div>
          <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
            <h3 className="text-lg font-semibold mb-4">
              <i className="fas fa-shopping-cart"></i> Səbət
            </h3>

            {sebet.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Səbət boşdur</p>
            ) : (
              <>
                <div className="mb-4 max-h-96 overflow-y-auto">
                  {sebet.map((item, index) => {
                    const araCemi = item.miqdar * item.satis_qiymeti;
                    let endirimMebleg = 0;
                    if (item.endirim_tipi === 'faiz') {
                      endirimMebleg = araCemi * (item.endirim_deyer / 100);
                    } else if (item.endirim_tipi === 'mebleg') {
                      endirimMebleg = item.endirim_deyer;
                    }
                    const yekun = araCemi - endirimMebleg;

                    return (
                      <div key={index} className="border rounded-lg p-3 mb-2 bg-gray-50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h5 className="font-semibold text-sm">{item.mal_adi}</h5>
                            <p className="text-xs text-gray-600">
                              {item.mal_kod}
                              {item.nov_adi && ` | ${item.nov_adi}`}
                              {item.reng_kod && (
                                <span
                                  className="inline-block w-3 h-3 rounded border align-middle ml-1"
                                  style={{ backgroundColor: item.reng_kod }}
                                ></span>
                              )}
                              {item.reng_adi && ` ${item.reng_adi}`}
                              {item.olcu_adi && ` • ${item.olcu_adi}`}
                            </p>
                            <p className="text-xs text-blue-600 font-semibold mt-1">
                              <input
                                type="number"
                                value={item.satis_qiymeti}
                                onChange={(e) => setSebet(prev => prev.map((s, i) => i === index ? { ...s, satis_qiymeti: parseFloat(e.target.value) || 0 } : s))}
                                className="w-16 border rounded px-1"
                                min="0"
                                step="0.01"
                              /> ₼
                            </p>
                          </div>
                          <button
                            onClick={() => sebetdenCixar(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <button
                            onClick={() => miqdarDeyis(index, Math.max(1, item.miqdar - 1))}
                            className="bg-gray-300 w-6 h-6 rounded text-sm"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={item.miqdar}
                            onChange={(e) => miqdarDeyis(index, e.target.value)}
                            className="w-12 text-center border rounded py-1"
                            min="1"
                            max={item.max_qaliq}
                          />
                          <button
                            onClick={() =>
                              miqdarDeyis(index, Math.min(item.max_qaliq, item.miqdar + 1))
                            }
                            className="bg-gray-300 w-6 h-6 rounded text-sm"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex gap-2 mb-2">
                          <select
                            value={item.endirim_tipi || ''}
                            onChange={(e) => endirimTipiDeyis(index, e.target.value)}
                            className="text-xs border rounded px-2 py-1"
                          >
                            <option value="">Endirim yoxdur</option>
                            <option value="faiz">% Endirim</option>
                            <option value="mebleg">₼ Endirim</option>
                          </select>
                          {item.endirim_tipi && (
                            <input
                              type="number"
                              value={item.endirim_deyer}
                              onChange={(e) => endirimDeyerDeyis(index, e.target.value)}
                              className="text-xs border rounded px-2 py-1 w-20"
                              min="0"
                              step="0.01"
                            />
                          )}
                        </div>
                        {endirimMebleg > 0 && (
                          <p className="text-xs text-red-600">
                            Endirim: -{formatMebleg(endirimMebleg)}
                          </p>
                        )}
                        <p className="text-sm font-bold mt-1">Yekun: {formatMebleg(yekun)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Ara Cəmi:</span>
                    <span>{formatMebleg(hesaplamalar.araCemi)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Endirim:</span>
                    <span>{formatMebleg(hesaplamalar.toplamEndirim)}</span>
                  </div>

                  {/* Ümumi Qəbz Endirimi */}
                  <div className="border-t pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ümumi Qəbz Endirimi
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={umumiEndirim.tipi || ''}
                        onChange={(e) =>
                          setUmumiEndirim((prev) => ({
                            ...prev,
                            tipi: e.target.value || null,
                            deyer: e.target.value ? prev.deyer : 0,
                          }))
                        }
                        className="flex-1 px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Yoxdur</option>
                        <option value="faiz">% Endirim</option>
                        <option value="mebleg">₼ Endirim</option>
                      </select>
                      <input
                        type="number"
                        value={umumiEndirim.deyer || ''}
                        onChange={(e) =>
                          setUmumiEndirim((prev) => ({
                            ...prev,
                            deyer: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-24 px-3 py-2 border rounded-lg text-sm"
                        placeholder="0"
                        min="0"
                        step="0.01"
                        disabled={!umumiEndirim.tipi}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>YEKUN:</span>
                    <span className="text-blue-600">{formatMebleg(hesaplamalar.yekun)}</span>
                  </div>

                  <div className="flex justify-between items-center border-t pt-2 mt-2">
                    <span className="font-semibold text-gray-700">Ödənən Məbləğ:</span>
                    <input
                      type="number"
                      value={odenisMebleg}
                      onChange={(e) => setOdenisMebleg(e.target.value)}
                      className="w-24 px-2 py-1 border rounded"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold text-green-600 border-t pt-2">
                    <span>Qalıq (Para üstü):</span>
                    <span>{formatMebleg((parseFloat(odenisMebleg) || 0) - hesaplamalar.yekun)}</span>
                  </div>
                </div>

                <select
                  value={odenisNov}
                  onChange={(e) => setOdenisNov(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg my-4"
                >
                  <option value="Nağd">Nağd</option>
                  <option value="Kart">Kart</option>
                  <option value="Köçürmə">Köçürmə</option>
                </select>

                <button
                  onClick={satisiTamamla}
                  disabled={sebet.length === 0}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-check"></i> Satışı Tamamla
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
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
          {ui.modalData && (
            <>
              {/* Mağaza Məlumatları */}
              <div className="text-center mb-4 border-b border-dashed border-gray-400 pb-4">
                <h2 className="text-2xl font-black uppercase tracking-wider mb-1">
                  {data.magazaMelumat?.ad || "NEYSOFT POS"}
                </h2>
                {data.magazaMelumat?.unvan && <p className="text-xs font-semibold">{data.magazaMelumat.unvan}</p>}
                {data.magazaMelumat?.telefon && <p className="text-xs font-semibold mt-1">Tel: {data.magazaMelumat.telefon}</p>}
              </div>

              {/* Meta Məlumatlar (Qəbz, Tarix, Kassir) */}
              <div className="mb-4 text-xs space-y-1.5 font-semibold">
                <div className="flex justify-between"><span>Tarix:</span> <span>{new Date(ui.modalData.tarix).toLocaleString('az-AZ')}</span></div>
                <div className="flex justify-between"><span>Qəbz №:</span> <span>{ui.modalData.qebz_nomre}</span></div>
                <div className="flex justify-between"><span>Kassir:</span> <span className="uppercase">{currentUser.username || currentUser.name || 'Admin'}</span></div>
              </div>

              {/* Müştəri Məlumatları */}
              {(ui.modalData.musteri_ad || ui.modalData.musteri_tel) && (
                <div className="mb-4 text-xs border-y border-dashed border-gray-400 py-3 space-y-1.5 font-semibold bg-gray-50 px-2">
                  {ui.modalData.musteri_ad && <div className="flex justify-between"><span>Müştəri:</span> <span>{ui.modalData.musteri_ad}</span></div>}
                  {ui.modalData.musteri_tel && <div className="flex justify-between"><span>Əlaqə:</span> <span>{ui.modalData.musteri_tel}</span></div>}
                </div>
              )}

              {/* Məhsullar Cədvəli */}
              <table className="w-full text-xs mb-4">
                <thead className="border-b border-gray-800">
                  <tr>
                    <th className="text-left py-1.5 w-1/2 uppercase">Məhsul</th>
                    <th className="text-center py-1.5 uppercase">Miq</th>
                    <th className="text-right py-1.5 uppercase">Məbləğ</th>
                  </tr>
                </thead>
                <tbody className="font-semibold">
                  {ui.modalData.mehsullar.map((m, idx) => (
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

              {/* Yekun və Hesablamalar */}
              <div className="border-t border-dashed border-gray-400 pt-3 space-y-1.5 text-xs font-bold">
                <div className="flex justify-between text-gray-600"><span>Ara Cəmi:</span> <span>{formatMebleg(ui.modalData.umumi_mebleg)}</span></div>
                {ui.modalData.umumi_endirim > 0 && (
                  <div className="flex justify-between text-red-600"><span>Endirim:</span> <span>-{formatMebleg(ui.modalData.umumi_endirim)}</span></div>
                )}
                <div className="flex justify-between text-lg mt-2 pt-2 border-t border-gray-800">
                  <span>YEKUN:</span> <span>{formatMebleg(ui.modalData.yekun_mebleg)}</span>
                </div>
              </div>

              {/* Ödəniş və Qalıq */}
              <div className="mt-4 border-t border-gray-800 pt-3 text-xs space-y-1.5 font-bold">
                <div className="flex justify-between"><span>Ödəniş növü:</span> <span className="uppercase">{ui.modalData.odenis_nov === 'kart' ? 'Kart' : 'Nağd'}</span></div>
                {ui.modalData.odenisMebleg > 0 && (
                  <>
                    <div className="flex justify-between text-gray-600"><span>Ödənilib:</span> <span>{formatMebleg(ui.modalData.odenisMebleg)}</span></div>
                    <div className="flex justify-between"><span>Qalıq:</span> <span>{formatMebleg(ui.modalData.qaliqMebleg)}</span></div>
                  </>
                )}
              </div>

              {/* Təşəkkür mətni */}
              <div className="mt-6 text-center text-xs font-bold italic uppercase border-t border-dashed border-gray-400 pt-4">
                Bizi seçdiyiniz üçün <br /> təşəkkür edirik!
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Satis;