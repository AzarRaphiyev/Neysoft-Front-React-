import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { formatMebleg, bugunISO, buAyISO } from '../../utils/helpers';
import api from '../../utils/api';
import * as XLSX from 'xlsx';

function MaliyyeUmumi() {
  const { data } = useData();
  const { showToast } = useUI();
  const [baslama, setBaslama] = useState(buAyISO() + '-01');
  const [bitme, setBitme] = useState(bugunISO());

  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchStats = (startDate = null, endDate = null) => {
    const params = {};
    if (startDate && endDate) {
      params.startDate = startDate;
      params.endDate = endDate + 'T23:59:59';
    }
    
    api.get('/reports/dashboard', { params })
      .then(res => setStats(res.data?.data || res.data))
      .catch(() => showToast('Məlumatlar yüklənərkən xəta baş verdi', 'error'));
  };

  const fetchCustomStats = () => {
    if (!baslama || !bitme) {
      showToast('Zəhmət olmasa tarix aralığını seçin!', 'warning');
      return;
    }
    fetchStats(baslama, bitme);
  };

  // Ümumi mənfəət hesablamaları
  const dailyProfit = (stats?.dailySales || 0) - (stats?.dailyExpenses || 0);
  const monthlyProfit = (stats?.monthlySales || 0) - (stats?.monthlyExpenses || 0);
  const customProfit = stats?.netProfit || 0;

  // Faiz hesablamaları
  const gunlukGelirFoiz = ((stats?.dailySales || 0) > 0 && (stats?.monthlySales || 0) > 0)
    ? (((stats?.dailySales || 0) / (stats?.monthlySales || 0)) * 100).toFixed(1) : 0;
  const gunlukMenfeetFoiz = (dailyProfit > 0 && monthlyProfit > 0)
    ? ((dailyProfit / monthlyProfit) * 100).toFixed(1) : 0;

  // Cədvəl üçün Günlük Pul Axını Məntiqi
  const gunlukAxin = useMemo(() => {
    if (!baslama || !bitme) return {};
    const gunlukAxinMap = {};

    // 1. Satışları filterləyib toplayırıq
    const satislar = (data.satislar || []).filter((s) => {
      const t = String(s.date || s.createdAt || s.tarix || '').split('T')[0];
      return t >= baslama && t <= bitme;
    });

    satislar.forEach((s) => {
      const t = String(s.date || s.createdAt || s.tarix || '').split('T')[0];
      if (!t) return;
      
      if (!gunlukAxinMap[t]) {
        gunlukAxinMap[t] = { gelir: 0, menfeet: 0, xerc: 0, satisSay: 0 };
      }
      
      const mebleg = Number(s.finalAmount || s.totalAmount || s.odenisMebleg || s.yekun_mebleg || 0);
      
      gunlukAxinMap[t].gelir += mebleg;
      // Əgər satışın xüsusi mənfəəti varsa onu, yoxdursa ümumi məbləği mənfəət kimi qeyd edirik (xərclər onsuz da çıxılacaq)
      gunlukAxinMap[t].menfeet += Number(s.netProfit || s.menfeet || mebleg); 
      gunlukAxinMap[t].satisSay += 1;
    });

    // 2. Xərcləri filterləyib toplayırıq
    const xercler = (data.xercler || []).filter((x) => {
      const t = String(x.date || x.createdAt || x.tarix || '').split('T')[0];
      return t >= baslama && t <= bitme;
    });

    xercler.forEach((x) => {
      const t = String(x.date || x.createdAt || x.tarix || '').split('T')[0];
      if (!t) return;
      
      if (!gunlukAxinMap[t]) {
        gunlukAxinMap[t] = { gelir: 0, menfeet: 0, xerc: 0, satisSay: 0 };
      }
      
      gunlukAxinMap[t].xerc += Number(x.amount || x.mebleg || 0);
    });

    return gunlukAxinMap;
  }, [data.satislar, data.xercler, baslama, bitme]);

  // Excel yükləmə məntiqi
  const handleExport = () => {
    if (!baslama || !bitme) {
      showToast('Zəhmət olmasa tarix aralığını seçin!', 'warning');
      return;
    }

    const ws_data = [
      ['Tarix', 'Gəlir', 'Xərc', 'Mənfəət', 'Əməliyyat Sayı', 'Qeyd'],
    ];

    const tarixler = Object.keys(gunlukAxin).sort();
    tarixler.forEach((tarix) => {
      const axin = gunlukAxin[tarix];
      const netMenfeet = axin.menfeet - axin.xerc;
      ws_data.push([
        tarix,
        parseFloat(axin.gelir.toFixed(2)),
        parseFloat(axin.xerc.toFixed(2)),
        parseFloat(netMenfeet.toFixed(2)),
        axin.satisSay || 0,
        netMenfeet >= 0 ? 'Mənfəət' : 'Zərər',
      ]);
    });

    const umumiGelir = Object.values(gunlukAxin).reduce((sum, a) => sum + a.gelir, 0);
    const umumiXerc = Object.values(gunlukAxin).reduce((sum, a) => sum + a.xerc, 0);
    const umumiMenfeet = Object.values(gunlukAxin).reduce((sum, a) => sum + a.menfeet, 0) - umumiXerc;

    ws_data.push([]);
    ws_data.push([
      'ÜMUMİ',
      parseFloat(umumiGelir.toFixed(2)),
      parseFloat(umumiXerc.toFixed(2)),
      parseFloat(umumiMenfeet.toFixed(2)),
      '',
      umumiMenfeet >= 0 ? 'Mənfəət' : 'Zərər',
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Maliyyə Hesabatı');
    XLSX.writeFile(wb, `maliyye_hesabati_${baslama}_${bitme}.xlsx`);
  };

  return (
    <div>
      {/* Tarix Aralığı Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-calendar-alt mr-2"></i> Tarix Aralığı
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Başlama Tarixi</label>
            <input
              type="date"
              value={baslama}
              onChange={(e) => setBaslama(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bitmə Tarixi</label>
            <input
              type="date"
              value={bitme}
              onChange={(e) => setBitme(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchCustomStats}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <i className="fas fa-search mr-2"></i> Axtar
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <i className="fas fa-file-excel mr-2"></i> Excel Yüklə
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-green-100 text-sm mb-1">Günlük Gəlir</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats?.dailySales || 0)}</h3>
          <p className="text-green-100 text-xs mt-2">Aylıq həcmdə: {gunlukGelirFoiz}%</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-blue-100 text-sm mb-1">Günlük Mənfəət</p>
          <h3 className="text-2xl font-bold">{formatMebleg(dailyProfit)}</h3>
          <p className="text-blue-100 text-xs mt-2">Aylıq həcmdə: {gunlukMenfeetFoiz}%</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-emerald-100 text-sm mb-1">Aylıq Gəlir</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats?.monthlySales || 0)}</h3>
          <p className="text-emerald-100 text-xs mt-2">100%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-purple-100 text-sm mb-1">Aylıq Mənfəət</p>
          <h3 className="text-2xl font-bold">{formatMebleg(monthlyProfit)}</h3>
          <p className="text-purple-100 text-xs mt-2">100%</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-red-100 text-sm mb-1">Günlük Xərc</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats?.dailyExpenses || 0)}</h3>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-orange-100 text-sm mb-1">Aylıq Xərc</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats?.monthlyExpenses || 0)}</h3>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-indigo-100 text-sm mb-1">Seçilən Dövrdə Gəlir</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats?.totalSales || 0)}</h3>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-pink-100 text-sm mb-1">Seçilən Dövrdə Mənfəət</p>
          <h3 className="text-2xl font-bold">{formatMebleg(customProfit)}</h3>
        </div>
      </div>

      {/* Günlük Pul Axını */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-chart-line mr-2"></i> Günlük Pul Axını
        </h3>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-max whitespace-nowrap">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Tarix</th>
                <th className="px-4 py-3 text-right">Gəlir</th>
                <th className="px-4 py-3 text-right">Xərc</th>
                <th className="px-4 py-3 text-right">Mənfəət</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(gunlukAxin).length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Bu tarix aralığında məlumat yoxdur
                  </td>
                </tr>
              ) : (
                Object.keys(gunlukAxin)
                  .sort()
                  .reverse() // Ən yeni tarixlər üstə olsun deyə tərsinə sıralanır
                  .map((tarix) => {
                    const axin = gunlukAxin[tarix];
                    const netMenfeet = axin.menfeet - axin.xerc;
                    const statusClass = netMenfeet >= 0 ? 'text-green-600' : 'text-red-600';
                    const statusIcon = netMenfeet >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                    const statusText = netMenfeet >= 0 ? 'Mənfəət' : 'Zərər';

                    return (
                      <tr key={tarix} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          {new Date(tarix).toLocaleDateString('az-AZ')}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600 font-semibold">
                          {formatMebleg(axin.gelir)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600 font-semibold">
                          {formatMebleg(axin.xerc)}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${statusClass}`}>
                          {formatMebleg(netMenfeet)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`${statusClass} flex items-center gap-2`}>
                            <i className={`fas ${statusIcon}`}></i> {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MaliyyeUmumi;