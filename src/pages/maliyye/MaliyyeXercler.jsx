import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useUI } from '../../contexts/UIContext';
import { formatMebleg } from '../../utils/helpers';

function MaliyyeXercler() {
  const { data, addXerc, deleteXerc } = useData();
  const { showToast, showConfirm } = useUI();
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleElave = async () => {
    if (!title.trim() || !amount || !date) {
      showToast('Bütün xanaları doldurun!', 'warning');
      return;
    }

    try {
      // 1. Sisteme daxil olmuş user-i tapırıq ki, xətanın biri də oradan idi
      const userStr = localStorage.getItem('user') || localStorage.getItem('authUser');
      const currentUser = userStr ? JSON.parse(userStr) : null;

      // 2. Bütün ehtimalları sığortalayan Super Payload yaradırıq
      const payload = {
        title: title.trim(),          // Əsas gözlənilən
        name: title.trim(),           // Bəzi DTO-lar bunu istəyə bilir
        description: title.trim(),    // Bəzi DTO-lar bunu istəyə bilir
        amount: Number(amount),       // Rəqəmə çevrilmiş məbləğ
        date: new Date(date).toISOString(), // Backend üçün düzgün ISO tarix
        userId: currentUser?.id       // Kassirin (User) ID-si
      };

      // API isteyini atırıq
      await addXerc(payload);
      
      // Hər şey qaydasındadırsa formu təmizlə
      setTitle('');
      setAmount('');
      showToast('Xərc uğurla əlavə edildi!', 'success');
      
    } catch (err) {
      // 3. NestJS-in verdiyi array xətalarını tam oxunaqlı ekrana çıxarmaq
      const errorData = err.response?.data?.message;
      let finalErrorMsg = 'Xərc əlavə edilərkən xəta baş verdi';
      
      if (Array.isArray(errorData)) {
        finalErrorMsg = errorData.join(' | '); // Əgər birdən çox xəta varsa yan-yana yaz
      } else if (typeof errorData === 'string') {
        finalErrorMsg = errorData;
      } else if (err.message) {
        finalErrorMsg = err.message;
      }
      
      showToast(finalErrorMsg, 'error');
    }
  };

  const handleSil = async (id) => {
    const confirmed = await showConfirm('Xərci sil', 'Bu xərci silmək istədiyinizdən əminsiniz?');
    if (confirmed) {
      deleteXerc(id);
    }
  };

  // Tarixə görə ən yenidən köhnəyə doğru sıralama
  const sorted = [...(data.xercler || [])].sort((a, b) => {
    const dateA = new Date(a.date || a.tarix);
    const dateB = new Date(b.date || b.tarix);
    return dateB - dateA;
  });

  return (
    <div>
      {/* Xərc Əlavə Et */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Xərc Əlavə Et</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Xərcin adı"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="px-4 py-2 border rounded-lg"
            placeholder="Məbləğ"
            step="0.01"
            min="0"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-4 py-2 border rounded-lg"
          />
          <button
            onClick={handleElave}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
          >
            <i className="fas fa-plus mr-2"></i> Əlavə Et
          </button>
        </div>
      </div>

      {/* Xərc Tarixçəsi */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-xl font-semibold mb-4">Xərc Tarixçəsi</h3>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-max whitespace-nowrap">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left">Tarix</th>
                <th className="px-4 py-3 text-left">Xərcin Adı</th>
                <th className="px-4 py-3 text-right">Məbləğ</th>
                <th className="px-4 py-3 text-center">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                    Xərc qeyd edilməyib
                  </td>
                </tr>
              ) : (
                sorted.map((x) => (
                  <tr key={x.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {new Date(x.date || x.tarix).toLocaleDateString('az-AZ')}
                    </td>
                    <td className="px-4 py-3">
                      {x.title || x.name || x.description || x.ad || 'Adsız Xərc'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-red-600">
                      {formatMebleg(x.amount || x.mebleg)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleSil(x.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Sil"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default MaliyyeXercler;