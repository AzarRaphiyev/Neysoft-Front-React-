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

    const satis = {
      id: Date.now(),
      qebz_nomre: qebzNomre,
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
        <i className="fas fa-shopping-cart"></i> Yeni Sat\u0131\u015F
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2">
          {/* M\u00FC\u015Ft\u0259ri M\u0259lumatlar\u0131 */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">
              M\u00FC\u015Ft\u0259ri M\u0259lumatlar\u0131
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={musteriAd}
                onChange={(e) => setMusteriAd(e.target.value)}
                className="px-4 py-2 border rounded-lg"
                placeholder="M\u00FC\u015Ft\u0259ri ad\u0131"
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

          {/* M\u0259hsul Axtar */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4">M\u0259hsul Se\u00E7</h3>
            <input
              type="text"
              value={axtar}
              onChange={(e) => setAxtar(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg mb-4"
              placeholder="Barkod v\u0259 ya mal ad\u0131 ilə axtar..."
            />
            <div className="grid gap-2 max-h-96 overflow-y-auto">
              {filteredMehsullar.length === 0 ? (
                <p className="text-gray-500 text-center py-4">M\u0259hsul tap\u0131lmad\u0131</p>
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
                          {m.mal_kod} \u2022 {m.nov_adi}
                          {m.reng_kod && (
                            <span
                              className="inline-block w-4 h-4 rounded border align-middle ml-1"
                              style={{ backgroundColor: m.reng_kod }}
                            ></span>
                          )}
                          {m.reng_adi && ` ${m.reng_adi}`}
                          {m.olcu_adi && ` \u2022 ${m.olcu_adi}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">{formatMebleg(m.satis_qiymeti)}</p>
                        <p className="text-xs text-gray-600">Qal\u0131q: {m.qaliq}</p>
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
              <i className="fas fa-shopping-cart"></i> S\u0259b\u0259t
            </h3>

            {sebet.length === 0 ? (
              <p className="text-gray-500 text-center py-8">S\u0259b\u0259t bo\u015Fdur</p>
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
                              {item.olcu_adi && ` \u2022 ${item.olcu_adi}`}
                            </p>
                            <p className="text-xs text-blue-600 font-semibold">
                              {formatMebleg(item.satis_qiymeti)}
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
                            <option value="mebleg">\u20BC Endirim</option>
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
                    <span>Ara C\u0259mi:</span>
                    <span>{formatMebleg(hesaplamalar.araCemi)}</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>Endirim:</span>
                    <span>{formatMebleg(hesaplamalar.toplamEndirim)}</span>
                  </div>

                  {/* \u00DCmumi Q\u0259bz Endirimi */}
                  <div className="border-t pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      \u00DCmumi Q\u0259bz Endirimi
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
                        <option value="mebleg">\u20BC Endirim</option>
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
                </div>

                <select
                  value={odenisNov}
                  onChange={(e) => setOdenisNov(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg my-4"
                >
                  <option value="Na\u011Fd">Na\u011Fd</option>
                  <option value="Kart">Kart</option>
                  <option value="K\u00F6\u00E7\u00FCrm\u0259">K\u00F6\u00E7\u00FCrm\u0259</option>
                </select>

                <button
                  onClick={satisiTamamla}
                  disabled={sebet.length === 0}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="fas fa-check"></i> Sat\u0131\u015F\u0131 Tamamla
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
        title="Q\u0259bz"
        footer={
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              <i className="fas fa-print"></i> \u00C7ap Et
            </button>
            <button
              onClick={() => ui.closeModal()}
              className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
            >
              Ba\u011Fla
            </button>
          </div>
        }
      >
        <div id="qebz-content" className="print-area">
          {ui.modalData && (
            <div className="text-center mb-4">
              <h2 className="text-xl font-bold">{data.magazaMelumat.ad}</h2>
              <p className="text-sm text-gray-600">{data.magazaMelumat.unvan}</p>
              <p className="text-sm text-gray-600">Tel: {data.magazaMelumat.telefon}</p>
              <div className="border-t border-b py-3 my-3">
                <p className="text-sm">
                  <strong>Q\u0259bz \u2116:</strong> {ui.modalData.qebz_nomre}
                </p>
                <p className="text-sm">
                  <strong>Tarix:</strong> {new Date(ui.modalData.tarix).toLocaleString('az-AZ')}
                </p>
                {ui.modalData.musteri_ad && (
                  <p className="text-sm">
                    <strong>M\u00FC\u015Ft\u0259ri:</strong> {ui.modalData.musteri_ad}
                  </p>
                )}
              </div>
              <table className="w-full text-sm mb-3">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-1">M\u0259hsul</th>
                    <th className="text-right py-1">Qiym\u0259t</th>
                  </tr>
                </thead>
                <tbody>
                  {ui.modalData.mehsullar.map((m, idx) => (
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
              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Ara C\u0259mi:</span>
                  <span>{formatMebleg(ui.modalData.umumi_mebleg)}</span>
                </div>
                {ui.modalData.umumi_endirim > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span>Endirim:</span>
                    <span>-{formatMebleg(ui.modalData.umumi_endirim)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>YEKUN:</span>
                  <span>{formatMebleg(ui.modalData.yekun_mebleg)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>\u00D6d\u0259ni\u015F:</span>
                  <span>{ui.modalData.odenis_nov}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

export default Satis;
