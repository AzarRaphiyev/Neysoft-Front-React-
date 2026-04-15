import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useUI } from '../contexts/UIContext';

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
    clearAll,
  } = useData();
  const { showToast, showConfirm } = useUI();

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
    addKateqoriya({ id: yeniId, nov_adi: yeniKateqoriya });
    setYeniKateqoriya('');
  };

  // R\u0259ng
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
    addReng({ id: yeniId, ad: yeniRngAd, kod: yeniRngKod });
    setYeniRngAd('');
    setYeniRngKod('#ff0000');
  };

  // \u00D6l\u00E7\u00FC
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
    addOlcu({ id: yeniId, ad: yeniOlcuAd });
    setYeniOlcuAd('');
  };

  // T\u0259chizat\u00E7\u0131
  const [yeniTechizatciAd, setYeniTechizatciAd] = useState('');
  const [yeniTechizatciTel, setYeniTechizatciTel] = useState('');
  const handleTechizatciElave = () => {
    if (!yeniTechizatciAd) {
      showToast('Təchizatçı adı daxil edin!', 'warning');
      return;
    }
    const yeniId = Math.max(...data.techizatcilar.map((t) => t.id), 0) + 1;
    addTechizatci({ id: yeniId, ad: yeniTechizatciAd, tel: yeniTechizatciTel });
    setYeniTechizatciAd('');
    setYeniTechizatciTel('');
  };

  // Ma\u011Faza M\u0259lumat
  const [magazaAd, setMagazaAd] = useState(data.magazaMelumat.ad);
  const [magazaUnvan, setMagazaUnvan] = useState(data.magazaMelumat.unvan);
  const [magazaTel, setMagazaTel] = useState(data.magazaMelumat.telefon);
  const handleMagazaSaxla = () => {
    updateMagazaMelumat({ ad: magazaAd, unvan: magazaUnvan, telefon: magazaTel });
    showToast('Mağaza məlumatları saxlanıldı!', 'success');
  };

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        <i className="fas fa-cog"></i> Parametrl\u0259r
      </h2>

      {/* Kateqoriyalar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">M\u0259hsul Kateqoriyalar\u0131</h3>
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
            <i className="fas fa-plus"></i> \u0258lav\u0259 Et
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

      {/* R\u0259ngl\u0259r */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-palette"></i> R\u0259ngl\u0259r
        </h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={yeniRngAd}
            onChange={(e) => setYeniRngAd(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
            placeholder="R\u0259ngin ad\u0131 (m\u0259s: Q\u0131rm\u0131z\u0131)"
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
            <i className="fas fa-plus"></i> \u0258lav\u0259 Et
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

      {/* \u00D6l\u00E7\u00FCl\u0259r */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-ruler-horizontal"></i> \u00D6l\u00E7\u00FCl\u0259r
        </h3>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={yeniOlcuAd}
            onChange={(e) => setYeniOlcuAd(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
            placeholder="\u00D6l\u00E7\u00FC (m\u0259s: S, M, L, XL)"
          />
          <button
            onClick={handleOlcuElave}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            <i className="fas fa-plus"></i> \u0258lav\u0259 Et
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

      {/* T\u0259chizat\u00E7\u0131lar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">T\u0259chizat\u00E7\u0131lar</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            value={yeniTechizatciAd}
            onChange={(e) => setYeniTechizatciAd(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="T\u0259chizat\u00E7\u0131 ad\u0131"
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
            <i className="fas fa-plus"></i> \u0258lav\u0259 Et
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Ad</th>
                <th className="px-4 py-3 text-left">Telefon</th>
                <th className="px-4 py-3 text-center">\u0258m\u0259liyyat</th>
              </tr>
            </thead>
            <tbody>
              {data.techizatcilar.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                    T\u0259chizat\u00E7\u0131 qeyd edilm\u0259yib
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

      {/* Ma\u011Faza M\u0259lumatlar\u0131 */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-store"></i> Ma\u011Faza M\u0259lumatlar\u0131 (Q\u0259bzd\u0259
          G\u00F6rs\u0259n\u0259c\u0259k)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ma\u011Faza Ad\u0131
            </label>
            <input
              type="text"
              value={magazaAd}
              onChange={(e) => setMagazaAd(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="M\u0259s\u0259l\u0259n: Elite Fashion"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">\u00DCnvan</label>
            <input
              type="text"
              value={magazaUnvan}
              onChange={(e) => setMagazaUnvan(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="M\u0259s\u0259l\u0259n: Bak\u0131 \u015F\u0259h., N\u0259simi ray."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
            <input
              type="tel"
              value={magazaTel}
              onChange={(e) => setMagazaTel(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="M\u0259s\u0259l\u0259n: +994 XX XXX XX XX"
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

      {/* M\u0259lumat \u0130dar\u0259etm\u0259si */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-600">
          <i className="fas fa-exclamation-triangle"></i> M\u0259lumat \u0130dar\u0259etm\u0259si
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
          <i className="fas fa-trash"></i> B\u00FCt\u00FCn M\u0259lumatlar\u0131 Sil
        </button>
        <p className="text-sm text-gray-600 mt-2">
          <i className="fas fa-exclamation-triangle"></i> Diqq\u0259t: Bu \u0259m\u0259liyyat
          b\u00FCt\u00FCn m\u0259lumatlar\u0131 sil\u0259c\u0259k v\u0259 geri qaytar\u0131la
          bilm\u0259z!
        </p>
      </div>
    </div>
  );
}

export default Parametrler;
