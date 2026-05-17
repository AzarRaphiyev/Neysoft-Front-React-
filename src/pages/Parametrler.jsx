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
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
        <i className="fas fa-cog"></i> Parametrlər
      </h2>

      {/* Kateqoriyalar */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Məhsul Kateqoriyaları</h3>
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-4">
          <input
            type="text"
            value={yeniKateqoriya}
            onChange={(e) => setYeniKateqoriya(e.target.value)}
            className="flex-1 w-full px-3 py-2 text-sm md:px-4 md:py-2 md:text-base border rounded-lg"
            placeholder="Yeni kateqoriya"
          />
          <button
            onClick={handleKateqoriyaElave}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 text-sm md:px-6 md:py-2 md:text-base rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 md:gap-2"
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
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-4">
          <input
            type="text"
            value={yeniRngAd}
            onChange={(e) => setYeniRngAd(e.target.value)}
            className="flex-1 w-full px-3 py-2 text-sm md:px-4 md:py-2 md:text-base border rounded-lg"
            placeholder="Rəngin adı (məs: Qırmızı)"
          />
        
          <button
            onClick={handleRngElave}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 text-sm md:px-6 md:py-2 md:text-base rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 md:gap-2"
          >
            <i className="fas fa-plus"></i> Əlavə Et
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 lg:grid-cols-6 gap-3">
          {data.rengler.map((r) => (
            <div
              key={r.id}
              className="border rounded-lg p-3 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${r.kod}22 0%, ${r.kod}44 100%)` }}
            >
              <div className="flex items-center gap-3">
                
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
        <div className="flex flex-col sm:flex-row gap-2 md:gap-4 mb-4">
          <input
            type="text"
            value={yeniOlcuAd}
            onChange={(e) => setYeniOlcuAd(e.target.value)}
            className="flex-1 w-full px-3 py-2 text-sm md:px-4 md:py-2 md:text-base border rounded-lg"
            placeholder="Ölçü (məs: S, M, L, XL)"
          />
          <button
            onClick={handleOlcuElave}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 text-sm md:px-6 md:py-2 md:text-base rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 md:gap-2"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
          <input
            type="text"
            value={yeniTechizatciAd}
            onChange={(e) => setYeniTechizatciAd(e.target.value)}
            className="w-full px-3 py-2 text-sm md:px-4 md:py-2 md:text-base border rounded-lg"
            placeholder="Təchizatçı adı"
          />
          <input
            type="tel"
            value={yeniTechizatciTel}
            onChange={(e) => setYeniTechizatciTel(e.target.value)}
            className="w-full px-3 py-2 text-sm md:px-4 md:py-2 md:text-base border rounded-lg"
            placeholder="Telefon"
          />
          <button
            onClick={handleTechizatciElave}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 text-sm md:px-6 md:py-2 md:text-base rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 md:gap-2"
          >
            <i className="fas fa-plus"></i> Əlavə Et
          </button>
        </div>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-max whitespace-nowrap">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">
              Mağaza Adı
            </label>
            <input
              type="text"
              value={magazaAd}
              onChange={(e) => setMagazaAd(e.target.value)}
              className="w-full px-3 py-2 text-sm md:px-4 md:py-2 md:text-base border border-gray-300 rounded-lg"
              placeholder="Məsələn: Elite Fashion"
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Ünvan</label>
            <input
              type="text"
              value={magazaUnvan}
              onChange={(e) => setMagazaUnvan(e.target.value)}
              className="w-full px-3 py-2 text-sm md:px-4 md:py-2 md:text-base border border-gray-300 rounded-lg"
              placeholder="Məsələn: Bakı şəh., Nəsimi ray."
            />
          </div>
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1 md:mb-2">Telefon</label>
            <input
              type="tel"
              value={magazaTel}
              onChange={(e) => setMagazaTel(e.target.value)}
              className="w-full px-3 py-2 text-sm md:px-4 md:py-2 md:text-base border border-gray-300 rounded-lg"
              placeholder="Məsələn: +994 XX XXX XX XX"
            />
          </div>
        </div>
        <button
          onClick={handleMagazaSaxla}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 text-sm md:px-6 md:py-2 md:text-base rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 md:gap-2 mt-2 md:mt-0"
        >
          <i className="fas fa-save"></i> Yadda saxla
        </button>
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
          className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 text-sm md:px-6 md:py-2 md:text-base rounded-lg hover:bg-red-700 flex items-center justify-center gap-1 md:gap-2"
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