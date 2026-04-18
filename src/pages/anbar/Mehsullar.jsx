import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import api from '../../utils/api';

function Mehsullar() {
    const { data, fetchAnbar } = useData();
    const [axtaris, setAxtaris] = useState('');
    const [kateqoriya, setKateqoriya] = useState('');
    const [barkodModal, setBarkodModal] = useState(false);
    const [barkodImg, setBarkodImg] = useState('');
    const [loadingBarkod, setLoadingBarkod] = useState(false);
    const [secilenBarkod, setSecilenBarkod] = useState('');

    useEffect(() => {
        fetchAnbar(axtaris, false, kateqoriya);
    }, [axtaris, kateqoriya, fetchAnbar]);

    const handleBarkodGoster = async (kod) => {
        if (!kod) return;
        setSecilenBarkod(kod);
        setBarkodModal(true);
        setLoadingBarkod(true);
        setBarkodImg('');
        try {
            const res = await api.get('/products/barcode/' + kod, { responseType: 'blob' });
            setBarkodImg(URL.createObjectURL(res.data));
        } catch (err) {
            console.error('Barkod yükləmə xətası:', err);
        } finally {
            setLoadingBarkod(false);
        }
    };

    const closeBarkodModal = () => {
        setBarkodModal(false);
        if (barkodImg) {
            URL.revokeObjectURL(barkodImg);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                    <i className="fas fa-boxes"></i> Məhsullar
                </h2>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={axtaris}
                        onChange={(e) => setAxtaris(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                        placeholder="Barkod və ya Ad ilə axtar..."
                    />
                    <select
                        value={kateqoriya}
                        onChange={(e) => setKateqoriya(e.target.value)}
                        className="px-4 py-2 border rounded-lg"
                    >
                        <option value="">Bütün Kateqoriyalar</option>
                        {data.kateqoriyalar.map((k) => (
                            <option key={k.id} value={k.id}>
                                {k.nov_adi || k.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left">Barkod</th>
                                <th className="px-4 py-3 text-left">Malın Adı</th>
                                <th className="px-4 py-3 text-left">Kateqoriya</th>
                                <th className="px-4 py-3 text-left">Rəng</th>
                                <th className="px-4 py-3 text-left">Ölçü</th>
                                <th className="px-4 py-3 text-center">Qalıq</th>
                                <th className="px-4 py-3 text-right">Satış Qiyməti</th>
                                <th className="px-4 py-3 text-center">Əməliyyatlar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!data.anbar || data.anbar.length === 0) ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        Məhsul tapılmadı
                                    </td>
                                </tr>
                            ) : (
                                data.anbar.map((m) => (
                                    <tr key={m.id} className={`border-b ${m.qaliq === 0 ? 'bg-red-50' : m.qaliq <= 5 ? 'bg-yellow-50' : 'hover:bg-gray-50'}`}>
                                        <td className="px-4 py-3">{m.mal_kod}</td>
                                        <td className="px-4 py-3 font-medium">{m.mal_adi}</td>
                                        <td className="px-4 py-3">{m.nov_adi}</td>
                                        <td className="px-4 py-3">
                                            {m.reng_kod ? (
                                                <span className="inline-flex items-center gap-1">
                                                    <span className="w-4 h-4 rounded border" style={{ backgroundColor: m.reng_kod }}></span>
                                                    {m.reng_adi}
                                                </span>
                                            ) : m.reng_adi && m.reng_adi !== '-' ? (
                                                <span>{m.reng_adi}</span>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">{m.olcu_adi || '-'}</td>
                                        <td className="px-4 py-3 text-center">
                                            {m.qaliq === 0 ? (
                                                <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded-full">{m.qaliq} (Bitib)</span>
                                            ) : m.qaliq <= 5 ? (
                                                <span className="bg-yellow-100 text-yellow-700 font-bold px-2 py-1 rounded-full">{m.qaliq} (Az)</span>
                                            ) : (
                                                <span className="bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">{m.qaliq}</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right">{m.satis_qiymeti}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleBarkodGoster(m.mal_kod)}
                                                className="text-gray-600 hover:text-black px-3 py-1 rounded border border-gray-300 hover:bg-gray-100 transition-colors"
                                                title="Barkodu Göstər"
                                            >
                                                <i className="fas fa-barcode"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {barkodModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full relative">
                        <button
                            onClick={closeBarkodModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-black focus:outline-none"
                        >
                            <i className="fas fa-times text-xl"></i>
                        </button>
                        <h3 className="text-lg font-semibold mb-4 border-b pb-2">Barkod: {secilenBarkod}</h3>
                        <div className="flex justify-center items-center py-6 min-h-[150px]">
                            {loadingBarkod ? (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <i className="fas fa-spinner fa-spin text-3xl mb-2"></i>
                                    <span className="mt-2 text-sm">Yüklənir...</span>
                                </div>
                            ) : (
                                barkodImg ? (
                                    <img src={barkodImg} alt="barkod" className="max-w-full h-auto border border-gray-200 p-2 rounded" />
                                ) : (
                                    <span className="text-red-500 text-sm">Xəta baş verdi və ya barkod tapılmadı</span>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Mehsullar;
