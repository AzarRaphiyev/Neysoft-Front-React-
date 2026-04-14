import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { formatMebleg } from '../../utils/helpers';

function MaliyyeZHesabat() {
  const { data } = useData();
  const { showToast } = useUI();
  const [baslama, setBaslama] = useState('');
  const [bitme, setBitme] = useState('');
  const [hesabat, setHesabat] = useState(null);

  const handleHesabatYarat = () => {
    if (!baslama || !bitme) {
      showToast('Zəhmət olmasa tarix aralığını seçin!', 'warning');
      return;
    }

    const satislar = data.satislar.filter(
      (s) => s.tarix >= baslama && s.tarix <= bitme + 'T23:59:59',
    );
    const xercler = data.xercler.filter((x) => x.tarix >= baslama && x.tarix <= bitme);

    const umumiGelir = satislar.reduce((sum, s) => sum + s.yekun_mebleg, 0);
    const umumiMenfeet = satislar.reduce((sum, s) => sum + s.menfeet, 0);
    const umumiXerc = xercler.reduce((sum, x) => sum + x.mebleg, 0);
    const netMenfeet = umumiMenfeet - umumiXerc;

    setHesabat({
      baslama,
      bitme,
      satisSay: satislar.length,
      umumiGelir,
      umumiMenfeet,
      umumiXerc,
      netMenfeet,
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6 no-print">
        <h2 className="text-2xl font-bold text-gray-800">
          <i className="fas fa-file-invoice"></i> Z Hesabat
        </h2>
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          <i className="fas fa-print"></i> \u00C7ap Et
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ba\u015Flama Tarixi
            </label>
            <input
              type="date"
              value={baslama}
              onChange={(e) => setBaslama(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bitm\u0259 Tarixi
            </label>
            <input
              type="date"
              value={bitme}
              onChange={(e) => setBitme(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleHesabatYarat}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-lg font-semibold"
          >
            <i className="fas fa-chart-bar"></i> Hesabat Yarat
          </button>
        </div>
      </div>

      {/* Report Content */}
      {hesabat && (
        <div className="bg-white rounded-xl shadow-md p-6 print-area">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{data.magazaMelumat.ad}</h2>
            <p className="text-sm text-gray-600">{data.magazaMelumat.unvan}</p>
            <p className="text-sm text-gray-600">Tel: {data.magazaMelumat.telefon}</p>
            <h3 className="text-xl font-bold mt-4">Z Hesabat</h3>
            <p className="text-sm text-gray-600">
              {new Date(hesabat.baslama).toLocaleDateString('az-AZ')} -{' '}
              {new Date(hesabat.bitme).toLocaleDateString('az-AZ')}
            </p>
          </div>

          <div className="border-t border-b py-4 my-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>\u00DCmumi Sat\u0131\u015F Say\u0131:</span>
                <span className="font-semibold">{hesabat.satisSay}</span>
              </div>
              <div className="flex justify-between">
                <span>\u00DCmumi G\u0259lir:</span>
                <span className="font-semibold text-green-600">
                  {formatMebleg(hesabat.umumiGelir)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>\u00DCmumi M\u0259nf\u0259\u0259t:</span>
                <span className="font-semibold text-blue-600">
                  {formatMebleg(hesabat.umumiMenfeet)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>\u00DCmumi X\u0259rc:</span>
                <span className="font-semibold text-red-600">
                  {formatMebleg(hesabat.umumiXerc)}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Net M\u0259nf\u0259\u0259t:</span>
                <span className={hesabat.netMenfeet >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatMebleg(hesabat.netMenfeet)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            \u00C7ap tarixi: {new Date().toLocaleString('az-AZ')}
          </p>
        </div>
      )}
    </div>
  );
}

export default MaliyyeZHesabat;
