import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { formatMebleg } from '../../utils/helpers';
// DİQQƏT: api import yolunu öz layihənizə uyğunlaşdırın (Məsələn: '../../utils/api' və ya '../../services/api')
import api from '../../utils/api';

function MaliyyeZHesabat() {
  const { data } = useData();
  const { showToast } = useUI();
  const [baslama, setBaslama] = useState('');
  const [bitme, setBitme] = useState('');
  const [hesabat, setHesabat] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleHesabatYarat = async () => {
    if (!baslama || !bitme) {
      showToast('Zəhmət olmasa tarix aralığını seçin!', 'warning');
      return;
    }

    setLoading(true);
    try {
      // 1. Dataları birbaşa Backend-dən (Prisma-dan) çəkirik
      const response = await api.get('/reports/dashboard', {
        params: {
          startDate: baslama,
          endDate: bitme + 'T23:59:59', // Günün sonuna qədər əhatə etməsi üçün
        },
      });

      const stats = response.data?.data || response.data;

      // 2. Satış sayını lokal datadan tapırıq (Çünki backend DTO-sunda satış sayı yox idi, ancaq məbləğlər var)
      const satislar = (data.satislar || []).filter((s) => {
        const sDate = s.createdAt || s.date || s.tarix || '';
        return sDate >= baslama && sDate <= bitme + 'T23:59:59';
      });

      // 3. Backend-dən gələn dəqiq hesablamaları state-ə yazırıq
      setHesabat({
        baslama,
        bitme,
        satisSay: satislar.length,
        umumiGelir: stats.totalSales || 0,
        umumiXerc: stats.totalExpenses || 0,
        umumiIade: stats.totalReturns || 0, // Backend iadələri də qaytarır!
        netMenfeet: stats.netProfit || 0,
      });

      showToast('Z Hesabat məlumatları uğurla gətirildi!', 'success');
    } catch (err) {
      console.error("Hesabat gətirilərkən xəta:", err);
      showToast('Hesabat yaradılarkən xəta baş verdi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 md:mb-6 no-print">
        <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
          <i className="fas fa-file-invoice"></i> Z Hesabat
        </h2>
        <button
          onClick={() => window.print()}
          disabled={!hesabat}
          className={`w-full sm:w-auto px-6 py-2 rounded-lg text-white ${hesabat ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
            }`}
        >
          <i className="fas fa-print"></i> Çap Et
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 no-print">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlama Tarixi
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
              Bitmə Tarixi
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
            disabled={loading}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 text-lg font-semibold flex justify-center items-center gap-2"
          >
            {loading ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-chart-bar"></i>
            )}
            {loading ? 'Hesablanır...' : 'Hesabat Yarat'}
          </button>
        </div>
      </div>

      {/* Report Content */}
      {hesabat && (
        <div className="bg-white rounded-xl shadow-md p-6 print-area">
          <div className="text-center mb-6">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold">{data.magazaMelumat?.ad || 'Mağaza Adı'}</h2>
            <p className="text-sm text-gray-600">{data.magazaMelumat?.unvan || 'Ünvan'}</p>
            <p className="text-sm text-gray-600">Tel: {data.magazaMelumat?.telefon || '-'}</p>
            <h3 className="text-xl font-bold mt-4">Z Hesabat</h3>
            <p className="text-sm text-gray-600">
              {new Date(hesabat.baslama).toLocaleDateString('az-AZ')} -{' '}
              {new Date(hesabat.bitme).toLocaleDateString('az-AZ')}
            </p>
          </div>

          <div className="border-t border-b py-4 my-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ümumi Satış Sayı:</span>
                <span className="font-semibold">{hesabat.satisSay}</span>
              </div>
              <div className="flex justify-between">
                <span>Ümumi Gəlir (Satış):</span>
                <span className="font-semibold text-green-600">
                  {formatMebleg(hesabat.umumiGelir)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ümumi İadə:</span>
                <span className="font-semibold text-orange-500">
                  {formatMebleg(hesabat.umumiIade)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Ümumi Xərc:</span>
                <span className="font-semibold text-red-600">
                  {formatMebleg(hesabat.umumiXerc)}
                </span>
              </div>

              <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Net Mənfəət:</span>
                <span className={hesabat.netMenfeet >= 0 ? 'text-green-600' : 'text-red-600'}>
                  {formatMebleg(hesabat.netMenfeet)}
                </span>
              </div>
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            Çap tarixi: {new Date().toLocaleString('az-AZ')}
          </p>
        </div>
      )}
    </div>
  );
}

export default MaliyyeZHesabat;