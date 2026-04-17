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
  const [axtaris, setAxtaris] = useState('');
  const [secilenMehsul, setSecilenMehsul] = useState(null);
  const [miqdar, setMiqdar] = useState('');
  const [alisQiymeti, setAlisQiymeti] = useState('');

  const axtarisSonuclari = axtaris.length > 1
    ? data.anbar.filter(m => m.mal_kod.includes(axtaris) || m.mal_adi.toLowerCase().includes(axtaris.toLowerCase()))
    : [];

  const handleMehsulSec = (m) => {
    setSecilenMehsul(m);
    setAxtaris('');
  };

  const handleMehsulElave = () => {
    const errors = [];
    if (!secilenMehsul) errors.push('Məhsul seçimi');
    if (!miqdar || parseInt(miqdar) <= 0) errors.push('Miqdar');
    if (!alisQiymeti || parseFloat(alisQiymeti) <= 0) errors.push('Alış qiyməti');

    if (errors.length > 0) {
      showToast('Zəhmət olmasa bu xanaları doldurun:\n' + errors.join(', '), 'warning');
      return;
    }

    const mehsul = {
      productId: secilenMehsul.id,
      mal_kod: secilenMehsul.mal_kod,
      mal_adi: secilenMehsul.mal_adi,
      nov_adi: secilenMehsul.nov_adi,
      reng_adi: secilenMehsul.reng_adi,
      olcu_adi: secilenMehsul.olcu_adi,
      miqdar: parseInt(miqdar),
      alis_qiymeti: parseFloat(alisQiymeti),
      satis_qiymeti: secilenMehsul.satis_qiymeti,
    };

    setYeniMehsullar((prev) => [...prev, mehsul]);
    // Reset form
    setSecilenMehsul(null);
    setMiqdar('');
    setAlisQiymeti('');
  };

  const handleMehsulSil = (index) => {
    setYeniMehsullar((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQaimeSaxla = async () => {
    if (!qaimeTechizatci || yeniMehsullar.length === 0) {
      showToast('Təchizatçı və ən azı bir məhsul tələb olunur!', 'warning');
      return;
    }

    try {
      await addQaime({ techizatci_id: qaimeTechizatci, mehsullar: yeniMehsullar });
      showToast('Qaimə uğurla saxlanıldı!', 'success');
      setQaimeKod('');
      setQaimeTechizatci('');
      setYeniMehsullar([]);
    } catch (err) {
      showToast('Qaimə saxlanılarkən xəta baş verdi!', 'error');
    }
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

      {/* Siyahıya Əlavə Et */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Siyahıya Əlavə Et</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 relative">
          <div className="col-span-1 md:col-span-2 relative">
            <input
              type="text"
              value={secilenMehsul ? secilenMehsul.mal_adi + ' (' + secilenMehsul.mal_kod + ')' : axtaris}
              onChange={(e) => {
                setAxtaris(e.target.value);
                if (secilenMehsul) setSecilenMehsul(null);
              }}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Barkod və ya Ad ilə məhsul axtar..."
            />
            {axtaris && !secilenMehsul && axtarisSonuclari.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {axtarisSonuclari.map(m => (
                  <div
                    key={m.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b last:border-b-0"
                    onClick={() => handleMehsulSec(m)}
                  >
                    <strong>{m.mal_kod}</strong> - {m.mal_adi} ({m.nov_adi})
                  </div>
                ))}
              </div>
            )}
          </div>
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
        </div>
        <button
          onClick={handleMehsulElave}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          <i className="fas fa-plus"></i> Siyahıya Əlavə Et
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