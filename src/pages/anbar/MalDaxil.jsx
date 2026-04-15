import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { formatMebleg } from '../../utils/helpers';

function MalDaxil() {
  const { data, addQaime } = useData();
  const { showToast } = useUI();
  const [qaimeKod, setQaimeKod] = useState('');
  const [qaimeTechizatci, setQaimeTechizatci] = useState('');
  const [qaimeTarix, setQaimeTarix] = useState(new Date().toISOString().split('T')[0]);
  const [yeniMehsullar, setYeniMehsullar] = useState([]);

  // Form state
  const [barkod, setBarkod] = useState('');
  const [malAd, setMalAd] = useState('');
  const [novId, setNovId] = useState('');
  const [rengId, setRengId] = useState('');
  const [olcuId, setOlcuId] = useState('');
  const [miqdar, setMiqdar] = useState('');
  const [alisQiymeti, setAlisQiymeti] = useState('');
  const [satisQiymeti, setSatisQiymeti] = useState('');

  const handleMehsulElave = () => {
    const errors = [];
    if (!barkod && !malAd) errors.push('Barkod və ya malın adı');
    if (!malAd) errors.push('Malın adı');
    if (!novId) errors.push('Növ');
    if (!olcuId) errors.push('Ölçü');
    if (!miqdar || parseInt(miqdar) <= 0) errors.push('Miqdar');
    if (!alisQiymeti || parseFloat(alisQiymeti) <= 0) errors.push('Alış qiyməti');
    if (!satisQiymeti || parseFloat(satisQiymeti) <= 0) errors.push('Satış qiyməti');

    if (errors.length > 0) {
      showToast('Zəhmət olmasa bu xanaları doldurun:\n' + errors.join(', '), 'warning');
      return;
    }

    const nov = data.kateqoriyalar.find((k) => k.id === parseInt(novId));
    const reng = rengId ? data.rengler.find((r) => r.id === parseInt(rengId)) : null;
    const olcu = data.olculer.find((o) => o.id === parseInt(olcuId));

    if (!nov || !olcu) {
      showToast('Seçimlər düzgün deyil!', 'warning');
      return;
    }

    const mehsul = {
      mal_kod: barkod || 'ML-' + Date.now(),
      mal_adi: malAd,
      nov_id: nov.id,
      nov_adi: nov.nov_adi,
      reng_id: reng ? reng.id : null,
      reng_adi: reng ? reng.ad : '',
      reng_kod: reng ? reng.kod : '',
      olcu_id: olcu.id,
      olcu_adi: olcu.ad,
      miqdar: parseInt(miqdar),
      alis_qiymeti: parseFloat(alisQiymeti),
      satis_qiymeti: parseFloat(satisQiymeti),
    };

    setYeniMehsullar((prev) => [...prev, mehsul]);
    // Reset form
    setBarkod('');
    setMalAd('');
    setNovId('');
    setRengId('');
    setOlcuId('');
    setMiqdar('');
    setAlisQiymeti('');
    setSatisQiymeti('');
  };

  const handleMehsulSil = (index) => {
    setYeniMehsullar((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQaimeSaxla = () => {
    if (!qaimeKod || yeniMehsullar.length === 0) {
      showToast('Qaimə kodu və ən azı bir məhsul tələb olunur!', 'warning');
      return;
    }

    const qaime = {
      id: Date.now(),
      qaime_kod: qaimeKod,
      techizatci_id: qaimeTechizatci,
      tarix: qaimeTarix,
      mehsullar: [...yeniMehsullar],
    };

    addQaime(qaime);
    showToast('Qaimə uğurla saxlanıldı!', 'success');
    setQaimeKod('');
    setQaimeTechizatci('');
    setYeniMehsullar([]);
  };

  const umumiMebleg = yeniMehsullar.reduce((sum, m) => sum + m.miqdar * m.alis_qiymeti, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        <i className="fas fa-plus"></i> Mal Daxil Et
      </h2>

      {/* Qaimə Məlumatları */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Qaimə Məlumatları</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Qaimə Kodu *
            </label>
            <input
              type="text"
              value={qaimeKod}
              onChange={(e) => setQaimeKod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="QM-001"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Təchizatçı
            </label>
            <select
              value={qaimeTechizatci}
              onChange={(e) => setQaimeTechizatci(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Seçin</option>
              {data.techizatcilar.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.ad}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daxil Olma Tarixi
            </label>
            <input
              type="date"
              value={qaimeTarix}
              onChange={(e) => setQaimeTarix(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Məhsul Əlavə Et */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Məhsul Əlavə Et</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            type="text"
            value={barkod}
            onChange={(e) => setBarkod(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Barkod *"
          />
          <input
            type="text"
            value={malAd}
            onChange={(e) => setMalAd(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Malın Adı *"
          />
          <select
            value={novId}
            onChange={(e) => setNovId(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Növü seçin...</option>
            {data.kateqoriyalar.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nov_adi}
              </option>
            ))}
          </select>
          <select
            value={rengId}
            onChange={(e) => setRengId(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Rəng seçin (istəyə bağlı)</option>
            {data.rengler.map((r) => (
              <option key={r.id} value={r.id}>
                {r.ad}
              </option>
            ))}
          </select>
          <select
            value={olcuId}
            onChange={(e) => setOlcuId(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Ölçü seçin...</option>
            {data.olculer.map((o) => (
              <option key={o.id} value={o.id}>
                {o.ad}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={miqdar}
            onChange={(e) => setMiqdar(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Miqdar *"
            min="1"
          />
          <input
            type="number"
            value={alisQiymeti}
            onChange={(e) => setAlisQiymeti(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Alış Qiyməti *"
            step="0.01"
          />
          <input
            type="number"
            value={satisQiymeti}
            onChange={(e) => setSatisQiymeti(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Satış Qiyməti *"
            step="0.01"
          />
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <i className="fas fa-lightbulb"></i> <strong>İpucu:</strong> Barkod oxuyucu ile
            barkodu oxudun və Enter basın.
          </p>
        </div>
        <button
          onClick={handleMehsulElave}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          <i className="fas fa-plus"></i> Məhsul Əlavə Et
        </button>
      </div>

      {/* Məhsul Cədvəli */}
      {yeniMehsullar.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">
            Əlavə Edilmiş Məhsullar
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Barkod</th>
                  <th className="px-4 py-3 text-left">Malın Adı</th>
                  <th className="px-4 py-3 text-left">Növ</th>
                  <th className="px-4 py-3 text-left">Rəng</th>
                  <th className="px-4 py-3 text-left">Ölçü</th>
                  <th className="px-4 py-3 text-right">Miqdar</th>
                  <th className="px-4 py-3 text-right">Alış Qiyməti</th>
                  <th className="px-4 py-3 text-right">Satış Qiyməti</th>
                  <th className="px-4 py-3 text-right">Cəmi</th>
                  <th className="px-4 py-3 text-center">Əməliyyat</th>
                </tr>
              </thead>
              <tbody>
                {yeniMehsullar.map((m, index) => {
                  const cemi = m.miqdar * m.alis_qiymeti;
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{m.mal_kod}</td>
                      <td className="px-4 py-3">{m.mal_adi}</td>
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
                      <td className="px-4 py-3">{m.olcu_adi}</td>
                      <td className="px-4 py-3 text-right">{m.miqdar}</td>
                      <td className="px-4 py-3 text-right">{formatMebleg(m.alis_qiymeti)}</td>
                      <td className="px-4 py-3 text-right">{formatMebleg(m.satis_qiymeti)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatMebleg(cemi)}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleMehsulSil(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-bold">
                <tr>
                  <td colSpan="6" className="px-4 py-3 text-right text-lg">
                    Ümumi Məbləğ:
                  </td>
                  <td colSpan="3" className="px-4 py-3 text-right text-lg text-blue-600">
                    {formatMebleg(umumiMebleg)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleQaimeSaxla}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
            >
              <i className="fas fa-save"></i> Qaiməni Yadda saxla
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MalDaxil;