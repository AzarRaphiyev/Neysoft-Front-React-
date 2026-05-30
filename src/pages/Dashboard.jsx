import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatMebleg, bugunISO, buAyISO } from '../utils/helpers';
import api from '../utils/api';

function Dashboard() {
  const { data } = useData();

  const [dailyStats, setDailyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bugun = bugunISO();
    const buAy = buAyISO();
    
    setLoading(true);
    Promise.all([
      api.get('/reports/dashboard', { params: { startDate: bugun, endDate: bugun + 'T23:59:59' } })
        .then(res => setDailyStats(res.data?.data || res.data)).catch(() => { }),
      api.get('/reports/dashboard', { params: { startDate: buAy, endDate: bugun + 'T23:59:59' } })
        .then(res => setMonthlyStats(res.data?.data || res.data)).catch(() => { })
    ]).finally(() => {
      setLoading(false);
    });
  }, []);

  const anbarStats = useMemo(() => {
    const anbarDeyer = (data.anbar || []).reduce((sum, m) => sum + (m.qaliq || 0) * (m.alis_qiymeti || 0), 0);
    return { anbarDeyer, anbarSay: (data.anbar || []).length };
  }, [data.anbar]);

  const stokXeberdarlar = useMemo(() => {
    const stokSifir = (data.anbar || []).filter((m) => m.qaliq === 0);
    const stokAz = (data.anbar || []).filter((m) => m.qaliq > 0 && m.qaliq <= 5);
    return { stokSifir, stokAz };
  }, [data.anbar]);

  const sonSatislar = useMemo(() => {
    return [...(data.satislar || [])].sort((a, b) => new Date(b.createdAt || b.tarix || 0) - new Date(a.createdAt || a.tarix || 0)).slice(0, 10);
  }, [data.satislar]);

  return (
    <div>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 md:mb-6">İdarə Paneli</h2>

      {loading ? (
        <div className="flex justify-center items-center p-10 text-gray-500 font-medium">
          <i className="fas fa-spinner fa-spin mr-2"></i> Məlumatlar yüklənir...
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
              <p className="text-blue-100 text-sm">Günlük Satış</p>
              <h3 className="text-3xl font-bold">{formatMebleg(dailyStats?.totalSales || 0)}</h3>
              <p className="text-blue-100 text-xs mt-2">Bu gün üzrə (Aktiv Sifarişlər)</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
              <p className="text-green-100 text-sm">Aylıq Satış</p>
              <h3 className="text-3xl font-bold">{formatMebleg(monthlyStats?.totalSales || 0)}</h3>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
              <p className="text-purple-100 text-sm">Aylıq Xalis Qazanc</p>
              <h3 className="text-3xl font-bold">{formatMebleg(monthlyStats?.netProfit || 0)}</h3>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
              <p className="text-orange-100 text-sm">Anbar Dəyəri</p>
              <h3 className="text-3xl font-bold">{formatMebleg(anbarStats.anbarDeyer)}</h3>
              <p className="text-orange-100 text-xs mt-2">{anbarStats.anbarSay} məhsul qalıb</p>
            </div>
          </div>

          {/* Stock Warnings */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4 text-red-600">
              <i className="fas fa-exclamation-triangle"></i> Stok Xəbərdarlıqları
            </h3>
            {stokXeberdarlar.stokSifir.length === 0 && stokXeberdarlar.stokAz.length === 0 ? (
              <p className="text-green-600">
                <i className="fas fa-check-circle"></i> Stok vəziyyəti normaldır
              </p>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm min-w-max whitespace-nowrap">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Barkod</th>
                      <th className="px-3 py-2 text-left">Mal Adı</th>
                      <th className="px-3 py-2 text-left">Kateqoriya</th>
                      <th className="px-3 py-2 text-right">Qalıq</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stokXeberdarlar.stokSifir.map((m) => (
                      <tr key={m.id} className="border-b stok-sifir">
                        <td className="px-3 py-2 font-mono text-xs">{m.mal_kod}</td>
                        <td className="px-3 py-2">{m.mal_adi}</td>
                        <td className="px-3 py-2 text-gray-600">{m.nov_adi || '-'}</td>
                        <td className="px-3 py-2 text-right">{m.qaliq}</td>
                        <td className="px-3 py-2">
                          <i className="fas fa-times-circle text-red-600"></i> Qurtarıb
                        </td>
                      </tr>
                    ))}
                    {stokXeberdarlar.stokAz.map((m) => (
                      <tr key={m.id} className="border-b stok-az">
                        <td className="px-3 py-2 font-mono text-xs">{m.mal_kod}</td>
                        <td className="px-3 py-2">{m.mal_adi}</td>
                        <td className="px-3 py-2 text-gray-600">{m.nov_adi || '-'}</td>
                        <td className="px-3 py-2 text-right">{m.qaliq}</td>
                        <td className="px-3 py-2">
                          <i className="fas fa-exclamation-circle text-yellow-600"></i> Az qalıb
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">
              <i className="fas fa-list"></i> Son Satışlar
            </h3>
            {sonSatislar.length === 0 ? (
              <p className="text-gray-500">Hələ satış edilməyib</p>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-sm min-w-max whitespace-nowrap">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left">Qəbz №</th>
                      <th className="px-3 py-2 text-left">Tarix</th>
                      <th className="px-3 py-2 text-left">Kassir</th>
                      <th className="px-3 py-2 text-right">Məbləğ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sonSatislar.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="px-3 py-2">{s.receiptNo || s.qebz_nomre || '-'}</td>
                        <td className="px-3 py-2">{s.date || s.tarix ? new Date(s.date || s.tarix).toLocaleDateString('az-AZ') : '-'}</td>
                        <td className="px-3 py-2">{s.user ? `${s.user.username || ''} ${s.user.lastName || ''}`.trim() : (s.userId || s.musteri_ad || '-')}</td>
                        <td className="px-3 py-2 text-right font-semibold">
                          {formatMebleg(s.finalAmount || s.yekun_mebleg || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;