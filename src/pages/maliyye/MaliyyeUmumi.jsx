import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { formatMebleg, bugunISO, buAyISO } from '../../utils/helpers';
import * as XLSX from 'xlsx';

function MaliyyeUmumi() {
  const { data } = useData();
  const { showToast } = useUI();
  const [baslama, setBaslama] = useState(buAyISO() + '-01');
  const [bitme, setBitme] = useState(bugunISO());

  const stats = useMemo(() => {
    const bugun = bugunISO();
    const buAy = buAyISO();

    const gunlukSatislar = data.satislar.filter((s) => s.tarix.startsWith(bugun));
    const gunlukGelir = gunlukSatislar.reduce((sum, s) => sum + s.yekun_mebleg, 0);
    const gunlukMenfeet = gunlukSatislar.reduce((sum, s) => sum + s.menfeet, 0);
    const gunlukXerc = data.xercler
      .filter((x) => x.tarix === bugun)
      .reduce((sum, x) => sum + x.mebleg, 0);

    const ayliqSatislar = data.satislar.filter((s) => s.tarix.startsWith(buAy));
    const ayliqGelir = ayliqSatislar.reduce((sum, s) => sum + s.yekun_mebleg, 0);
    const ayliqMenfeet = ayliqSatislar.reduce((sum, s) => sum + s.menfeet, 0);
    const ayliqXerc = data.xercler
      .filter((x) => x.tarix.startsWith(buAy))
      .reduce((sum, x) => sum + x.mebleg, 0);

    const gunlukGelirFoiz = ayliqGelir > 0 ? ((gunlukGelir / ayliqGelir) * 100).toFixed(1) : 0;
    const gunlukMenfeetFoiz =
      ayliqMenfeet > 0 ? ((gunlukMenfeet / ayliqMenfeet) * 100).toFixed(1) : 0;

    return {
      gunlukGelir,
      gunlukMenfeet,
      gunlukXerc,
      ayliqGelir,
      ayliqMenfeet,
      ayliqXerc,
      gunlukGelirFoiz,
      gunlukMenfeetFoiz,
    };
  }, [data.satislar, data.xercler]);

  const secilenDovrStats = useMemo(() => {
    if (!baslama || !bitme) return { gelir: 0, menfeet: 0 };

    const satislar = data.satislar.filter(
      (s) => s.tarix >= baslama && s.tarix <= bitme + 'T23:59:59',
    );
    const xercler = data.xercler.filter((x) => x.tarix >= baslama && x.tarix <= bitme);

    const umumiGelir = satislar.reduce((sum, s) => sum + s.yekun_mebleg, 0);
    const umumiMenfeet = satislar.reduce((sum, s) => sum + s.menfeet, 0);
    const umumiXerc = xercler.reduce((sum, x) => sum + x.mebleg, 0);

    return { gelir: umumiGelir, menfeet: umumiMenfeet - umumiXerc, xerc: umumiXerc };
  }, [data.satislar, data.xercler, baslama, bitme]);

  const gunlukAxin = useMemo(() => {
    if (!baslama || !bitme) return {};

    const satislar = data.satislar.filter(
      (s) => s.tarix >= baslama && s.tarix <= bitme + 'T23:59:59',
    );
    const xercler = data.xercler.filter((x) => x.tarix >= baslama && x.tarix <= bitme);

    const gunlukAxinMap = {};

    satislar.forEach((s) => {
      const tarix = s.tarix.split('T')[0];
      if (!gunlukAxinMap[tarix]) {
        gunlukAxinMap[tarix] = { gelir: 0, menfeet: 0, xerc: 0 };
      }
      gunlukAxinMap[tarix].gelir += s.yekun_mebleg;
      gunlukAxinMap[tarix].menfeet += s.menfeet;
    });

    xercler.forEach((x) => {
      if (!gunlukAxinMap[x.tarix]) {
        gunlukAxinMap[x.tarix] = { gelir: 0, menfeet: 0, xerc: 0 };
      }
      gunlukAxinMap[x.tarix].xerc += x.mebleg;
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
        'G\u0259lir',
        'X\u0259rc',
        'M\u0259nf\u0259\u0259t',
        '\u0258m\u0259liyyat Say\u0131',
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
        netMenfeet >= 0 ? 'M\u0259nf\u0259\u0259t' : 'Z\u0259r\u0259r',
      ]);
    });

    const umumiGelir = Object.values(gunlukAxin).reduce((sum, a) => sum + a.gelir, 0);
    const umumiXerc = Object.values(gunlukAxin).reduce((sum, a) => sum + a.xerc, 0);
    const umumiMenfeet =
      Object.values(gunlukAxin).reduce((sum, a) => sum + a.menfeet, 0) - umumiXerc;

    ws_data.push([]);
    ws_data.push([
      '\u00DCMUM\u0130',
      parseFloat(umumiGelir.toFixed(2)),
      parseFloat(umumiXerc.toFixed(2)),
      parseFloat(umumiMenfeet.toFixed(2)),
      '',
      umumiMenfeet >= 0 ? 'M\u0259nf\u0259\u0259t' : 'Z\u0259r\u0259r',
    ]);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Maliyy\u0259 Hesabat\u0131');
    XLSX.writeFile(wb, `maliyye_hesabati_${baslama}_${bitme}.xlsx`);
  };

  return (
    <div>
      {/* Tarix Aral\u0131\u011F\u0131 Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-calendar-alt"></i> Tarix Aral\u0131\u011F\u0131
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ba\u015Flama Tarixi
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
              Bitm\u0259 Tarixi
            </label>
            <input
              type="date"
              value={bitme}
              onChange={(e) => setBitme(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <button className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              <i className="fas fa-search"></i> Axtar...
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={handleExport}
              className="w-full bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              <i className="fas fa-file-excel"></i> Excel Y\u00FCkl\u0259
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-green-100 text-sm mb-1">G\u00FCnl\u00FCk G\u0259lir</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats.gunlukGelir)}</h3>
          <p className="text-green-100 text-xs mt-2">
            Ayl\u0131q h\u0259cmd\u0259: {stats.gunlukGelirFoiz}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-blue-100 text-sm mb-1">G\u00FCnl\u00FCk M\u0259nf\u0259\u0259t</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats.gunlukMenfeet)}</h3>
          <p className="text-blue-100 text-xs mt-2">
            Ayl\u0131q h\u0259cmd\u0259: {stats.gunlukMenfeetFoiz}%
          </p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-emerald-100 text-sm mb-1">Ayl\u0131q G\u0259lir</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats.ayliqGelir)}</h3>
          <p className="text-emerald-100 text-xs mt-2">100%</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-purple-100 text-sm mb-1">Ayl\u0131q M\u0259nf\u0259\u0259t</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats.ayliqMenfeet)}</h3>
          <p className="text-purple-100 text-xs mt-2">100%</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-red-100 text-sm mb-1">G\u00FCnl\u00FCk X\u0259rc</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats.gunlukXerc)}</h3>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-orange-100 text-sm mb-1">Ayl\u0131q X\u0259rc</p>
          <h3 className="text-2xl font-bold">{formatMebleg(stats.ayliqXerc)}</h3>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-indigo-100 text-sm mb-1">
            Se\u00E7il\u0259n D\u00F6vrd\u0259 G\u0259lir
          </p>
          <h3 className="text-2xl font-bold">{formatMebleg(secilenDovrStats.gelir)}</h3>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-xl shadow-lg p-6">
          <p className="text-pink-100 text-sm mb-1">
            Se\u00E7il\u0259n D\u00F6vrd\u0259 M\u0259nf\u0259\u0259t
          </p>
          <h3 className="text-2xl font-bold">{formatMebleg(secilenDovrStats.menfeet)}</h3>
        </div>
      </div>

      {/* G\u00FCnl\u00FCk Pul Ax\u0131n\u0131 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">
          <i className="fas fa-chart-line"></i> G\u00FCnl\u00FCk Pul Ax\u0131n\u0131
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Tarix</th>
                <th className="px-4 py-3 text-right">G\u0259lir</th>
                <th className="px-4 py-3 text-right">X\u0259rc</th>
                <th className="px-4 py-3 text-right">M\u0259nf\u0259\u0259t</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(gunlukAxin).length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    Bu tarix aral\u0131\u011F\u0131nda m\u0259lumat yoxdur
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
                      netMenfeet >= 0 ? 'M\u0259nf\u0259\u0259t' : 'Z\u0259r\u0259r';

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
                        <td className="px-4 py-3 text-right font-bold {statusClass}">
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
