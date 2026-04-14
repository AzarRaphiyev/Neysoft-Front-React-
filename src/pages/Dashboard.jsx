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
      <h2 className="text-3xl font-bold text-gray-800 mb-6">\u0130dar\u0259 Paneli</h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-blue-100 text-sm">G\u00FCnl\u00FCk Sat\u0131\u015F</p>
          <h3 className="text-3xl font-bold">{formatMebleg(stats.gunlukMebleg)}</h3>
          <p className="text-blue-100 text-xs mt-2">{stats.gunlukSay} \u0259m\u0259liyyat</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-green-100 text-sm">Ayl\u0131q Sat\u0131\u015F</p>
          <h3 className="text-3xl font-bold">{formatMebleg(stats.ayliqMebleg)}</h3>
          <p className="text-green-100 text-xs mt-2">{stats.ayliqSay} \u0259m\u0259liyyat</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-purple-100 text-sm">Ayl\u0131q M\u0259nf\u0259\u0259t</p>
          <h3 className="text-3xl font-bold">{formatMebleg(stats.ayliqMenfeet)}</h3>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-orange-100 text-sm">Anbar D\u0259y\u0259ri</p>
          <h3 className="text-3xl font-bold">{formatMebleg(stats.anbarDeyer)}</h3>
          <p className="text-orange-100 text-xs mt-2">{stats.anbarSay} m\u0259hsul</p>
        </div>
      </div>

      {/* Stock Warnings */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4 text-red-600">
          <i className="fas fa-exclamation-triangle"></i> Stok X\u0259b\u0259rdarl\u0131qlar\u0131
        </h3>
        {stokXeberdarlar.stokSifir.length === 0 && stokXeberdarlar.stokAz.length === 0 ? (
          <p className="text-green-600">
            <i className="fas fa-check-circle"></i> Stok v\u0259ziyy\u0259ti normal\u0131d\u0131r
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Barkod</th>
                  <th className="px-3 py-2 text-left">Mal Ad\u0131</th>
                  <th className="px-3 py-2 text-left">Kateqoriya</th>
                  <th className="px-3 py-2 text-right">Qal\u0131q</th>
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
                      <i className="fas fa-times-circle text-red-600"></i> Qurtar\u0131b
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
                      <i className="fas fa-exclamation-circle text-yellow-600"></i> Az qal\u0131b
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
          <i className="fas fa-list"></i> Son Sat\u0131\u015Flar
        </h3>
        {sonSatislar.length === 0 ? (
          <p className="text-gray-500">H\u0259l\u0259 sat\u0131\u015F edilm\u0259yib</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Q\u0259bz \u2116</th>
                  <th className="px-3 py-2 text-left">Tarix</th>
                  <th className="px-3 py-2 text-left">M\u00FC\u015Ft\u0259ri</th>
                  <th className="px-3 py-2 text-right">M\u0259bl\u0259\u011F</th>
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
