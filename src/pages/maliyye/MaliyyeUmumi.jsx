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

  const [dailyStats, setDailyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [customStats, setCustomStats] = useState(null);

  React.useEffect(() => {
    const bugun = bugunISO();
    const buAy = buAyISO();

    // Günlük API İstəyi
    api.get('/reports/dashboard', { params: { startDate: bugun, endDate: bugun + 'T23:59:59' } })
      .then(res => setDailyStats(res.data?.data || res.data))
      .catch(() => { });

    // Aylıq API İstəyi
    api.get('/reports/dashboard', { params: { startDate: buAy, endDate: bugun + 'T23:59:59' } })
      .then(res => setMonthlyStats(res.data?.data || res.data))
      .catch(() => { });

    fetchCustomStats();
  }, []);

  const fetchCustomStats = () => {
    if (!baslama || !bitme) return;
    api.get('/reports/dashboard', { params: { startDate: baslama, endDate: bitme + 'T23:59:59' } })
      .then(res => setCustomStats(res.data?.data || res.data))
      .catch(() => showToast('Məlumatlar yüklənərkən xəta baş verdi', 'error'));
  };

  const gunlukGelirFoiz = (dailyStats && monthlyStats && monthlyStats.totalSales > 0)
    ? ((dailyStats.totalSales / monthlyStats.totalSales) * 100).toFixed(1) : 0;
  const gunlukMenfeetFoiz = (dailyStats && monthlyStats && monthlyStats.netProfit > 0)
    ? ((dailyStats.netProfit / monthlyStats.netProfit) * 100).toFixed(1) : 0;

  const gunlukAxin = useMemo(() => {
    if (!baslama || !bitme) return {};

    const satislar = (data.satislar || []).filter(
      (s) => (s.createdAt || s.tarix || '') >= baslama && (s.createdAt || s.tarix || '') <= bitme + 'T23:59:59',
    );
    const xercler = (data.xercler || []).filter((x) => (x.createdAt || x.tarix || '') >= baslama && (x.createdAt || x.tarix || '') <= bitme + 'T23:59:59');

    const gunlukAxinMap = {};

    satislar.forEach((s) => {
      const tarix = (s.createdAt || s.tarix || '').split('T')[0];
      if (!tarix) return;
      if (!gunlukAxinMap[tarix]) {
        gunlukAxinMap[tarix] = { gelir: 0, menfeet: 0, xerc: 0, satisSay: 0 };
      }
      gunlukAxinMap[tarix].gelir += (s.finalAmount || s.yekun_mebleg || 0);
      gunlukAxinMap[tarix].menfeet += (s.discount || s.menfeet || 0);
      gunlukAxinMap[tarix].satisSay += 1;
    });

    xercler.forEach((x) => {
      const xTarix = (x.createdAt || x.tarix || '').split('T')[0];
      if (!xTarix) return;
      if (!gunlukAxinMap[xTarix]) {
        gunlukAxinMap[xTarix] = { gelir: 0, menfeet: 0, xerc: 0, satisSay: 0 };
      }
      gunlukAxinMap[xTarix].xerc += (x.amount || x.mebleg || 0);
    });

    return gunlukAxinMap;
  }, [data.satislar, data.xercler, baslama, bitme]);

  const handleExport = () => {
    if (!baslama || !bitme) {
      showToast('Zəhmət olmasa tarix aralığını seçin!', 'warning');
      return;
    }

    const ws_data = [
      [
        'Tarix',
        'Gəlir',
        'Xərc',
        'Mənfəət',
        'Əməliyyat Sayı',
        'Qeyd',
      ],
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
    const umumiMenfeet =
      Object.values(gunlukAxin).reduce((sum, a) => sum + a.menfeet, 0) - umumiXerc;

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
          <i className="fas fa-calendar-alt"></i> Tarix Aralığı
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlama Tarixi
            </label>
            <input
              type="date"
              value={baslama}
              onChange={(e) => setBaslama(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchCustomStats}
              className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              <i className="fas fa-search"></i> Axtar...
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              <i className="fas fa-file-excel"></i> Excel Yüklə
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-green-100 text-sm mb-1">Günlük Gəlir</p>
          <h3 className="text-2xl font-bold">{formatMebleg(dailyStats?.totalSales || 0)}</h3>
          <p className="text-green-100 text-xs mt-2">
            Aylıq həcmdə: {gunlukGelirFoiz}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-blue-100 text-sm mb-1">Günlük Mənfəət</p>
          <h3 className="text-2xl font-bold">{formatMebleg(dailyStats?.netProfit || 0)}</h3>
          <p className="text-blue-100 text-xs mt-2">
            Aylıq həcmdə: {gunlukMenfeetFoiz}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-emerald-100 text-sm mb-1">Aylıq Gəlir</p>
          <h3 className="text-2xl font-bold">{formatMebleg(monthlyStats?.totalSales || 0)}</h3>
          <p className="text-emerald-100 text-xs mt-2">100%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-purple-100 text-sm mb-1">Aylıq Mənfəət</p>
          <h3 className="text-2xl font-bold">{formatMebleg(monthlyStats?.netProfit || 0)}</h3>
          <p className="text-purple-100 text-xs mt-2">100%</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-red-100 text-sm mb-1">Günlük Xərc</p>
          <h3 className="text-2xl font-bold">{formatMebleg(dailyStats?.totalExpenses || 0)}</h3>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-orange-100 text-sm mb-1">Aylıq Xərc</p>
          <h3 className="text-2xl font-bold">{formatMebleg(monthlyStats?.totalExpenses || 0)}</h3>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-indigo-100 text-sm mb-1">
            Seçilən Dövrdə Gəlir
          </p>
          <h3 className="text-2xl font-bold">{formatMebleg(customStats?.totalSales || 0)}</h3>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-pink-100 text-sm mb-1">
            Seçilən Dövrdə Mənfəət
          </p>
          <h3 className="text-2xl font-bold">{formatMebleg(customStats?.netProfit || 0)}</h3>
        </div>
      </div>

      {/* Günlük Pul Axını */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-chart-line"></i> Günlük Pul Axını
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
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
                  .map((tarix) => {
                    const axin = gunlukAxin[tarix];
                    const netMenfeet = axin.menfeet - axin.xerc;
                    const statusClass = netMenfeet >= 0 ? 'text-green-600' : 'text-red-600';
                    const statusIcon = netMenfeet >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
                    const statusText =
                      netMenfeet >= 0 ? 'Mənfəət' : 'Zərər';

                    return (
                      <tr key={tarix} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium">
                          {new Date(tarix).toLocaleDateString('az-AZ')}
                        </td>
                        <td className="px-4 py-3 text-right text-green-600">
                          {formatMebleg(axin.gelir)}
                        </td>
                        <td className="px-4 py-3 text-right text-red-600">
                          {formatMebleg(axin.xerc)}
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${statusClass}`}>
                          {formatMebleg(netMenfeet)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={statusClass}>
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