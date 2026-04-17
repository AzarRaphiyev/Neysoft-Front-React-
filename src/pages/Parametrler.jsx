import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';
import { formatWord } from '../utils/helpers';

function Parametrler() {
  const {
    data,
    addKateqoriya,
    deleteKateqoriya,
    addReng,
    deleteReng,
    addOlcu,
    deleteOlcu,
    addTechizatci,
    deleteTechizatci,
    updateMagazaMelumat,
    sablonlar,
    addTemplate,
    deleteTemplate,
    clearAll,
  } = useData();
  const { showToast, showConfirm } = useUI();

  const [sablonAd, setSablonAd] = useState('');
  const [sablonKatId, setSablonKatId] = useState('');
  const [sablonRengId, setSablonRengId] = useState('');
  const [sablonOlcuId, setSablonOlcuId] = useState('');

  // Kateqoriya
  const [yeniKateqoriya, setYeniKateqoriya] = useState('');
  const handleKateqoriyaElave = () => {
    if (!yeniKateqoriya) {
      showToast('Kateqoriya adı daxil edin!', 'warning');
      return;
    }
    if (data.kateqoriyalar.find((k) => k.nov_adi.toLowerCase() === yeniKateqoriya.toLowerCase())) {
      showToast('Bu kateqoriya artıq mövcuddur!', 'warning');
      return;
    }
    const yeniId = Math.max(...data.kateqoriyalar.map((k) => k.id), 0) + 1;
    const formattedKateqoriya = formatWord(yeniKateqoriya);
    addKateqoriya({ id: yeniId, nov_adi: formattedKateqoriya });
    setYeniKateqoriya('');
  };

  // Rəng
  const [yeniRngAd, setYeniRngAd] = useState('');
  const [yeniRngKod, setYeniRngKod] = useState('#ff0000');
  const handleRngElave = () => {
    if (!yeniRngAd) {
      showToast('Rəng adı daxil edin!', 'warning');
      return;
    }
    if (data.rengler.find((r) => r.ad.toLowerCase() === yeniRngAd.toLowerCase())) {
      showToast('Bu rəng artıq mövcuddur!', 'warning');
      return;
    }
    const yeniId = Math.max(...data.rengler.map((r) => r.id), 0) + 1;
    const formattedRngAd = formatWord(yeniRngAd);
    addReng({ id: yeniId, ad: formattedRngAd, kod: yeniRngKod });
    setYeniRngAd('');
    setYeniRngKod('#ff0000');
  };

  // Ölçü
  const [yeniOlcuAd, setYeniOlcuAd] = useState('');
  const handleOlcuElave = () => {
    if (!yeniOlcuAd) {
      showToast('Ölçü adı daxil edin!', 'warning');
      return;
    }
    if (data.olculer.find((o) => o.ad.toLowerCase() === yeniOlcuAd.toLowerCase())) {
      showToast('Bu ölçü artıq mövcuddur!', 'warning');
      return;
    }
    const yeniId = Math.max(...data.olculer.map((o) => o.id), 0) + 1;
    const formattedOlcuAd = formatWord(yeniOlcuAd);
    addOlcu({ id: yeniId, ad: formattedOlcuAd });
    setYeniOlcuAd('');
  };

  // Təchizatçı
  const [yeniTechizatciAd, setYeniTechizatciAd] = useState('');
  const [yeniTechizatciTel, setYeniTechizatciTel] = useState('');
  const handleTechizatciElave = () => {
    if (!yeniTechizatciAd) {
      showToast('Təchizatçı adı daxil edin!', 'warning');
      return;
    }
    const yeniId = Math.max(...data.techizatcilar.map((t) => t.id), 0) + 1;
    const formattedTechizatciAd = formatWord(yeniTechizatciAd);
    addTechizatci({ id: yeniId, ad: formattedTechizatciAd, tel: yeniTechizatciTel });
    setYeniTechizatciAd('');
    setYeniTechizatciTel('');
  };

  // Mağaza Məlumat
  const [magazaAd, setMagazaAd] = useState('');
  const [magazaUnvan, setMagazaUnvan] = useState('');
  const [magazaTel, setMagazaTel] = useState('');

  React.useEffect(() => {
    if (data.magazaMelumat) {
      setMagazaAd(data.magazaMelumat.name || data.magazaMelumat.ad || '');
      setMagazaUnvan(data.magazaMelumat.address || data.magazaMelumat.unvan || '');
      setMagazaTel(data.magazaMelumat.phone || data.magazaMelumat.telefon || '');
    }
  }, [data.magazaMelumat]);

  const handleMagazaSaxla = () => {
    updateMagazaMelumat({ ad: magazaAd, unvan: magazaUnvan, telefon: magazaTel });
    showToast('Mağaza məlumatları saxlanıldı!', 'success');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        <i className="fas fa-cog"></i> Parametrlər
      </h2>

      {/* Kateqoriyalar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Məhsul Kateqoriyaları</h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={yeniKateqoriya}
            onChange={(e) => setYeniKateqoriya(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
            placeholder="Yeni kateqoriya"
          />
          <button
            onClick={handleKateqoriyaElave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i> Əlavə Et
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.kateqoriyalar.map((k) => (
            <span
              key={k.id}
              className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
            >
              {k.nov_adi}
              <button
                onClick={async () => {
                  if (data.anbar.some((m) => m.nov_id === k.id)) {
                    showToast('Bu kateqoriyadan məhsullar mövcuddur, silinə bilməz!', 'warning');
                    return;
                  }
                  const confirmed = await showConfirm(
                    'Kateqoriyanı sil',
                    'Bu kateqoriyanı silmək istədiyinizdən əminsiniz?',
                  );
                  if (confirmed) {
                    deleteKateqoriya(k.id);
                  }
                }}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-times"></i>
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Rənglər */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-palette"></i> Rənglər
        </h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={yeniRngAd}
            onChange={(e) => setYeniRngAd(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
            placeholder="Rəngin adı (məs: Qırmızı)"
          />
          <input
            type="color"
            value={yeniRngKod}
            onChange={(e) => setYeniRngKod(e.target.value)}
            className="w-16 h-10 border rounded-lg cursor-pointer"
          />
          <button
            onClick={handleRngElave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i> Əlavə Et
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.rengler.map((r) => (
            <div
              key={r.id}
              className="border rounded-lg p-3 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${r.kod}22 0%, ${r.kod}44 100%)` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded border" style={{ backgroundColor: r.kod }}></div>
                <span className="font-medium">{r.ad}</span>
              </div>
              <button
                onClick={async () => {
                  if (data.anbar.some((m) => m.reng_id === r.id)) {
                    showToast('Bu rəngə mal məhsullar mövcuddur, silinə bilməz!', 'warning');
                    return;
                  }
                  const confirmed = await showConfirm(
                    'Rəngi sil',
                    'Bu rəngi silmək istədiyinizdən əminsiniz?',
                  );
                  if (confirmed) {
                    deleteReng(r.id);
                  }
                }}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Ölçülər */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-ruler-horizontal"></i> Ölçülər
        </h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={yeniOlcuAd}
            onChange={(e) => setYeniOlcuAd(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
            placeholder="Ölçü (məs: S, M, L, XL)"
          />
          <button
            onClick={handleOlcuElave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i> Əlavə Et
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {data.olculer.map((o) => (
            <span
              key={o.id}
              className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm"
            >
              {o.ad}
              <button
                onClick={async () => {
                  const confirmed = await showConfirm(
                    'Ölçünü sil',
                    'Bu ölçünü silmək istədiyinizdən əminsiniz?',
                  );
                  if (confirmed) {
                    deleteOlcu(o.id);
                  }
                }}
                className="text-red-600 hover:text-red-800"
              >
                <i className="fas fa-times"></i>
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Təchizatçılar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Təchizatçılar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={yeniTechizatciAd}
            onChange={(e) => setYeniTechizatciAd(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Təchizatçı adı"
          />
          <input
            type="tel"
            value={yeniTechizatciTel}
            onChange={(e) => setYeniTechizatciTel(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Telefon"
          />
          <button
            onClick={handleTechizatciElave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i> Əlavə Et
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Ad</th>
                <th className="px-4 py-3 text-left">Telefon</th>
                <th className="px-4 py-3 text-center">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {data.techizatcilar.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                    Təchizatçı qeyd edilməyib
                  </td>
                </tr>
              ) : (
                data.techizatcilar.map((t) => (
                  <tr key={t.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{t.ad}</td>
                    <td className="px-4 py-3">{t.tel || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={async () => {
                          const confirmed = await showConfirm(
                            'Təchizatçını sil',
                            'Bu təchizatçını silmək istədiyinizdən əminsiniz?',
                          );
                          if (confirmed) {
                            deleteTechizatci(t.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mağaza Məlumatları */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-store"></i> Mağaza Məlumatları (Qəbzdə Görsənəcək)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mağaza Adı
            </label>
            <input
              type="text"
              value={magazaAd}
              onChange={(e) => setMagazaAd(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Məsələn: Elite Fashion"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ünvan</label>
            <input
              type="text"
              value={magazaUnvan}
              onChange={(e) => setMagazaUnvan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Məsələn: Bakı şəh., Nəsimi ray."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
            <input
              type="tel"
              value={magazaTel}
              onChange={(e) => setMagazaTel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Məsələn: +994 XX XXX XX XX"
            />
          </div>
        </div>
        <button
          onClick={handleMagazaSaxla}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          <i className="fas fa-save"></i> Yadda saxla
        </button>
      </div>

      {/* Məhsul Şablonları */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-layer-group"></i> Məhsul Şablonları
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
          <input
            type="text"
            value={sablonAd}
            onChange={(e) => setSablonAd(e.target.value)}
            className="px-4 py-2 border rounded-lg col-span-1 md:col-span-2"
            placeholder="Şablon Adı (məs: Qış Kolleksiyası)"
          />
          <select
            value={sablonKatId}
            onChange={(e) => setSablonKatId(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Kateqoriya Seç...</option>
            {data.kateqoriyalar.map(k => <option key={k.id} value={k.id}>{k.nov_adi}</option>)}
          </select>
          <select
            value={sablonRengId}
            onChange={(e) => setSablonRengId(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Rəng Seç...</option>
            {data.rengler.map(r => <option key={r.id} value={r.id}>{r.ad}</option>)}
          </select>
          <select
            value={sablonOlcuId}
            onChange={(e) => setSablonOlcuId(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Ölçü Seç...</option>
            {data.olculer.map(o => <option key={o.id} value={o.id}>{o.ad}</option>)}
          </select>
          <button
            onClick={() => {
              if (!sablonAd || !sablonKatId) {
                showToast('Şablon Adı və Kateqoriya daxil edilməlidir!', 'warning');
                return;
              }
              addTemplate({ sablon_adi: sablonAd, kateqoriya_id: Number(sablonKatId), reng_id: sablonRengId ? Number(sablonRengId) : null, olcu_id: sablonOlcuId ? Number(sablonOlcuId) : null });
              setSablonAd('');
              setSablonKatId('');
              setSablonRengId('');
              setSablonOlcuId('');
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 md:col-span-5"
          >
            <i className="fas fa-plus"></i> Şablon Yarat
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-100 uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">Şablon Adı</th>
                <th className="px-4 py-3">Kateqoriya</th>
                <th className="px-4 py-3">Rəng</th>
                <th className="px-4 py-3">Ölçü</th>
                <th className="px-4 py-3 text-center">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {!sablonlar || sablonlar.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Heç bir şablon tapılmadı
                  </td>
                </tr>
              ) : (
                sablonlar.map(s => {
                  const kat = data.kateqoriyalar.find(k => k.id === Number(s.kateqoriya_id))?.nov_adi || '-';
                  const rng = data.rengler.find(r => r.id === Number(s.reng_id))?.ad || '-';
                  const olc = data.olculer.find(o => o.id === Number(s.olcu_id))?.ad || '-';
                  return (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold">{s.sablon_adi}</td>
                      <td className="px-4 py-3">{kat}</td>
                      <td className="px-4 py-3">{rng}</td>
                      <td className="px-4 py-3">{olc}</td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={async () => {
                            const confirmed = await showConfirm('Şablonu sil', 'Bu şablonu silmək istədiyinizdən əminsiniz?');
                            if (confirmed) deleteTemplate(s.id);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Məlumat İdarəetməsi */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-600">
          <i className="fas fa-exclamation-triangle"></i> Məlumat İdarəetməsi
        </h3>
        <button
          onClick={async () => {
            const confirmed = await showConfirm(
              'Bütün məlumatları sil',
              'Diqqət: Bu əməliyyat bütün məlumatları siləcək və geri qaytarıla bilməz! Davam etmək istəyirsiniz?',
            );
            if (confirmed) {
              clearAll();
              showToast('Bütün məlumatlar silindi!', 'success');
            }
          }}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          <i className="fas fa-trash"></i> Bütün Məlumatları Sil
        </button>
        <p className="text-sm text-gray-600 mt-2">
          <i className="fas fa-exclamation-triangle"></i> Diqqət: Bu əməliyyat
          bütün məlumatları siləcək və geri qaytarıla bilməz!
        </p>
      </div>
    </div>
  );
}

export default Parametrler;