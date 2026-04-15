import React, { useMemo } from 'react';
import { useData } from '../contexts/DataContext';
import { formatMebleg, bugunISO, buAyISO } from '../utils/helpers';

function Dashboard() {
  const { data } = useData();

  const stats = useMemo(() => {
    const bugun = bugunISO();
    const buAy = buAyISO();

    const gunlukSatis = data.satislar.filter((s) => s.tarix.startsWith(bugun));
    const gunlukMebleg = gunlukSatis.reduce((sum, s) => sum + s.yekun_mebleg, 0);

    const ayliqSatis = data.satislar.filter((s) => s.tarix.startsWith(buAy));
    const ayliqMebleg = ayliqSatis.reduce((sum, s) => sum + s.yekun_mebleg, 0);
    const ayliqMenfeet = ayliqSatis.reduce((sum, s) => sum + s.menfeet, 0);
    const ayliqXerc = data.xercler
      .filter((x) => x.tarix.startsWith(buAy))
      .reduce((sum, x) => sum + x.mebleg, 0);

    const anbarDeyer = data.anbar.reduce((sum, m) => sum + m.qaliq * m.alis_qiymeti, 0);

    return {
      gunlukMebleg,
      gunlukSay: gunlukSatis.length,
      ayliqMebleg,
      ayliqSay: ayliqSatis.length,
      ayliqMenfeet: ayliqMenfeet - ayliqXerc,
      anbarDeyer,
      anbarSay: data.anbar.length,
    };
  }, [data.satislar, data.xercler, data.anbar]);

  const stokXeberdarlar = useMemo(() => {
    const stokSifir = data.anbar.filter((m) => m.qaliq === 0);
    const stokAz = data.anbar.filter((m) => m.qaliq > 0 && m.qaliq <= 5);
    return { stokSifir, stokAz };
  }, [data.anbar]);

  const sonSatislar = useMemo(() => {
    return [...data.satislar].sort((a, b) => new Date(b.tarix) - new Date(a.tarix)).slice(0, 10);
  }, [data.satislar]);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">İdarə Paneli</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-blue-100 text-sm">Günlük Satış</p>
          <h3 className="text-3xl font-bold">{formatMebleg(stats.gunlukMebleg)}</h3>
          <p className="text-blue-100 text-xs mt-2">{stats.gunlukSay} əməliyyat</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-green-100 text-sm">Aylıq Satış</p>
          <h3 className="text-3xl font-bold">{formatMebleg(stats.ayliqMebleg)}</h3>
          <p className="text-green-100 text-xs mt-2">{stats.ayliqSay} əməliyyat</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-purple-100 text-sm">Aylıq Mənfəət</p>
          <h3 className="text-3xl font-bold">{formatMebleg(stats.ayliqMenfeet)}</h3>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-orange-100 text-sm">Anbar Dəyəri</p>
          <h3 className="text-3xl font-bold">{formatMebleg(stats.anbarDeyer)}</h3>
          <p className="text-orange-100 text-xs mt-2">{stats.anbarSay} məhsul</p>
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Qəbz №</th>
                  <th className="px-3 py-2 text-left">Tarix</th>
                  <th className="px-3 py-2 text-left">Müştəri</th>
                  <th className="px-3 py-2 text-right">Məbləğ</th>
                </tr>
              </thead>
              <tbody>
                {sonSatislar.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2">{s.qebz_nomre}</td>
                    <td className="px-3 py-2">{new Date(s.tarix).toLocaleDateString('az-AZ')}</td>
                    <td className="px-3 py-2">{s.musteri_ad || '-'}</td>
                    <td className="px-3 py-2 text-right font-semibold">
                      {formatMebleg(s.yekun_mebleg)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;