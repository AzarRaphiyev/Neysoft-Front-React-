import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { formatWord } from '../../utils/helpers';

function YeniMehsul() {
    const { data, createProduct } = useData();
    const { showToast } = useUI();

    // Form state
    const [barkod, setBarkod] = useState('');
    const [malAd, setMalAd] = useState('');
    const [novId, setNovId] = useState('');
    const [rengId, setRengId] = useState('');
    const [olcuId, setOlcuId] = useState('');
    const [satisQiymeti, setSatisQiymeti] = useState('');
    const [alisQiymeti, setAlisQiymeti] = useState('');
    const [miqdar, setMiqdar] = useState('');
    const [techizatciId, setTechizatciId] = useState('');

    const handleYaddaSaxla = async () => {
        const errors = [];
        if (!barkod && !malAd) errors.push('Barkod və ya malın adı');
        if (!malAd) errors.push('Malın adı');
        if (!novId) errors.push('Növ');
        if (!olcuId) errors.push('Ölçü');
        if (!satisQiymeti || parseFloat(satisQiymeti) <= 0) errors.push('Satış qiyməti');

        if (errors.length > 0) {
            showToast('Zəhmət olmasa bu xanaları doldurun:\n' + errors.join(', '), 'warning');
            return;
        }

        if (!rengId) {
            showToast("Zəhmət olmasa məhsulun rəngini seçin!", "error");
            return;
        }

        const payload = {
            barcode: barkod || Date.now().toString(),
            name: formatWord(malAd),
            stockQuantity: Number(miqdar) || 0,
            purchasePrice: Number(alisQiymeti) || 0,
            salePrice: Number(satisQiymeti) || 0,
            categoryId: novId,
            colorId: rengId || null,
            sizeId: olcuId || null,
            supplierId: techizatciId || null
        };

        try {
            await createProduct(payload);
            showToast('Məhsul uğurla yaradıldı!', 'success');
            setBarkod('');
            setMalAd('');
            setNovId('');
            setRengId('');
            setOlcuId('');
            setSatisQiymeti('');
            setAlisQiymeti('');
            setMiqdar('');
            setTechizatciId('');
        } catch (err) {
            showToast('Məhsul yaradılarkən xəta baş verdi', 'error');
        }
    };

    return (
        <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-6">
                <i className="fas fa-box-open"></i> Yeni Məhsul Yarat
            </h2>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">Barkod</label>
                        <input type="text" value={barkod} onChange={(e) => setBarkod(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Barkod (Boş qoyula bilər)" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">Malın Adı *</label>
                        <input type="text" value={malAd} onChange={(e) => setMalAd(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Malın Adı" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Növ *</label>
                        <select value={novId} onChange={(e) => setNovId(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                            <option value="">Seçin...</option>
                            {data.kateqoriyalar.map((k) => <option key={k.id} value={k.id}>{k.nov_adi || k.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Rəng <span className="text-red-500">*</span></label>
                        <select required value={rengId} onChange={(e) => setRengId(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                            <option value="">Seçin...</option>
                            {data.rengler.map((r) => <option key={r.id} value={r.id}>{r.ad}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Ölçü *</label>
                        <select value={olcuId} onChange={(e) => setOlcuId(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                            <option value="">Seçin...</option>
                            {data.olculer.map((o) => <option key={o.id} value={o.id}>{o.ad}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Təchizatçı</label>
                        <select value={techizatciId} onChange={(e) => setTechizatciId(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                            <option value="">Seçin (istəyə bağlı)...</option>
                            {data.techizatcilar.map((t) => <option key={t.id} value={t.id}>{t.ad}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1">İlkin Qalıq (Miqdar)</label>
                        <input type="number" value={miqdar} onChange={(e) => setMiqdar(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Miqdar" min="0" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Alış Qiyməti</label>
                        <input type="number" step="0.01" value={alisQiymeti} onChange={(e) => setAlisQiymeti(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Alış Qiyməti" />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Satış Qiyməti *</label>
                        <input type="number" step="0.01" value={satisQiymeti} onChange={(e) => setSatisQiymeti(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Satış Qiyməti" />
                    </div>
                </div>
                <div className="flex justify-end mt-4">
                    <button onClick={handleYaddaSaxla} className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700">
                        <i className="fas fa-save"></i> Yadda saxla
                    </button>
                </div>
            </div>
        </div>
    );
}

export default YeniMehsul;
