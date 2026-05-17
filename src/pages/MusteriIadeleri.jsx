import React, { useState, useEffect } from 'react';
import { useUI } from '../contexts/UIContext';
import api from '../utils/api';
import { formatMebleg } from '../utils/helpers';
import Modal from '../components/common/Modal';

function MusteriIadeleri() {
    const [iadeler, setIadeler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIade, setSelectedIade] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [receiptNo, setReceiptNo] = useState('');
    const { openModal, closeModal, activeModal, showToast } = useUI();

    useEffect(() => {
        fetchIadeler();
    }, []);

    const fetchIadeler = async () => {
        try {
            setLoading(true);
            const res = await api.get('/returns/customer', { params: { startDate, endDate, receiptNo } });
            setIadeler(res.data?.data || res.data || []);
        } catch (err) {
            showToast('İadələr yüklənərkən xəta baş verdi', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800">
                    <i className="fas fa-undo"></i> Müştəri İadələri
                </h2>
                <button
                    onClick={fetchIadeler}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <i className="fas fa-sync-alt"></i>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm mb-2 text-gray-600 font-medium">Başlanğıc Tarix</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label className="block text-sm mb-2 text-gray-600 font-medium">Bitiş Tarix</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-sm mb-2 text-gray-600 font-medium">Qəbz Nömrəsi</label>
                        <input
                            type="text"
                            value={receiptNo}
                            onChange={(e) => setReceiptNo(e.target.value)}
                            placeholder="Qəbz nömrəsi..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <button
                        onClick={fetchIadeler}
                        className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center font-medium h-[42px]"
                    >
                        <i className="fas fa-search mr-2"></i>Axtar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-sm min-w-max whitespace-nowrap">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-4 py-3 text-left">İadə Tarixi</th>
                                <th className="px-4 py-3 text-left">Qəbz №</th>
                                <th className="px-4 py-3 text-left">Kassir</th>
                                <th className="px-4 py-3 text-left">Müştəri</th>
                                <th className="px-4 py-3 text-left">İadə Səbəbi</th>
                                <th className="px-4 py-3 text-right">Qaytarılan Məbləğ</th>
                                <th className="px-4 py-3 text-center">Əməliyyat</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        Yüklənir...
                                    </td>
                                </tr>
                            ) : iadeler.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                        İadə tapılmadı.
                                    </td>
                                </tr>
                            ) : (
                                iadeler.map((qaytarma, idx) => (
                                    <tr key={qaytarma.id || idx} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            {qaytarma.date || qaytarma.createdAt ? new Date(qaytarma.date || qaytarma.createdAt).toLocaleString('az-AZ') : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {qaytarma.sale?.receiptNo || '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {qaytarma.user ? `${qaytarma.user.username || qaytarma.user.firstName || 'Kassir'}` : '-'}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-700">
                                            {qaytarma.sale?.customerName || 'Standart Müştəri'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {qaytarma.reason || 'Səbəb yoxdur'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-red-600">
                                            {formatMebleg(qaytarma.totalAmount || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => {
                                                    setSelectedIade(qaytarma);
                                                    openModal('iadeDetay');
                                                }}
                                                className="text-blue-600 hover:text-blue-800 border bg-blue-50 border-blue-200 px-3 py-1 rounded"
                                                title="Detallar"
                                            >
                                                <i className="fas fa-eye"></i> Baxış
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* İade Detay Modalı */}
            <Modal
                isOpen={activeModal === 'iadeDetay'}
                onClose={closeModal}
                title="İadə Edilmiş Məhsullar"
            >
                {selectedIade && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg flex justify-between text-sm">
                            <div>
                                <span className="font-semibold block text-gray-500 text-xs">Qəbz №</span>
                                <span className="font-bold">{selectedIade.sale?.receiptNo || '-'}</span>
                            </div>
                            <div>
                                <span className="font-semibold block text-gray-500 text-xs">Kassir</span>
                                <span className="font-bold uppercase">{selectedIade.user?.username || selectedIade.user?.firstName || '-'}</span>
                            </div>
                            <div>
                                <span className="font-semibold block text-gray-500 text-xs">Müştəri</span>
                                <span className="font-bold block">{selectedIade?.sale?.customerName || 'Standart Müştəri'}</span>
                                <span className="text-xs text-gray-500">{selectedIade?.sale?.customerPhone || '-'}</span>
                            </div>
                            <div className="text-right">
                                <span className="font-semibold block text-gray-500 text-xs">Yekun İadə</span>
                                <span className="font-bold text-red-600 text-lg">{formatMebleg(selectedIade.totalAmount || 0)}</span>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg overflow-x-auto">
                            <table className="w-full text-sm min-w-max whitespace-nowrap">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-3 py-2 text-left">Məhsul</th>
                                        <th className="px-3 py-2 text-center">İadə Miqdar</th>
                                        <th className="px-3 py-2 text-right">Qaytarılan Məbləğ</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(selectedIade.items || []).map((item, idx) => (
                                        <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                                <div className="font-medium">{item.product?.name || 'Bilinməyən Məhsul'}</div>
                                            </td>
                                            <td className="px-3 py-2 text-center font-bold">
                                                {item.quantity || 0}
                                            </td>
                                            <td className="px-3 py-2 text-right text-red-600 font-semibold">
                                                {formatMebleg(item.refundAmount || 0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                onClick={closeModal}
                                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
                            >
                                Bağla
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default MusteriIadeleri;
