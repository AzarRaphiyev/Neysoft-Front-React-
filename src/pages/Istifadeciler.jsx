import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useUI } from '../contexts/UIContext';
import Modal from '../components/common/Modal';

function Istifadeciler() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const { showToast } = useUI();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: ''
    });

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/auth/users', { params: { username: search } });
            setUsers(res.data?.data || res.data || []);
        } catch (error) {
            showToast('İstifadəçilər yüklənərkən xəta baş verdi', 'error');
        } finally {
            setLoading(false);
        }
    }, [search, showToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]); // Refetch on search change

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            showToast('İstifadəçi uğurla yaradıldı', 'success');
            setIsAddModalOpen(false);
            setFormData({ username: '', email: '', password: '', role: '' });
            fetchUsers();
        } catch (error) {
            showToast('İstifadəçi yaradılarkən xəta baş verdi', 'error');
        }
    };

    const handleForgotPassword = async (user) => {
        if (!user.email) {
            showToast('Bu istifadəçinin e-poçt ünvanı yoxdur!', 'warning');
            return;
        }
        try {
            await api.post('/auth/forgot-password', { email: user.email });
            showToast(`Şifrə sıfırlama linki istifadəçinin (${user.email}) ünvanına göndərildi!`, 'success');
        } catch (error) {
            showToast('Şifrə sıfırlama istəyi göndərilərkən xəta baş verdi', 'error');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                    <i className="fas fa-users"></i> İstifadəçilər
                </h2>
                <div className="flex gap-4 items-center">
                    <input
                        type="text"
                        placeholder="Username ilə axtar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border rounded-lg md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow flex items-center gap-2 transition whitespace-nowrap"
                    >
                        <i className="fas fa-user-plus"></i> Yeni İstifadəçi
                    </button>
                </div>
            </div>

            <div className="mb-2 text-right">
                <span className="text-gray-500 text-sm font-semibold">Ümumi: {users?.length || 0} istifadəçi</span>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {loading ? (
                    <p className="p-6 text-center text-gray-500">Yüklənir...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">#</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Username</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Email</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Rol</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Qeydiyyat Tarixi</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Əməliyyatlar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(!users || (users?.length || 0) === 0) ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">İstifadəçi tapılmadı</td>
                                    </tr>
                                ) : (
                                    (users || []).map((u, index) => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 text-gray-500 font-medium">{index + 1}</td>
                                            <td className="px-6 py-4 font-medium text-gray-800">{u.username}</td>
                                            <td className="px-6 py-4 text-gray-600">{u.email || '-'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('az-AZ') : '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleForgotPassword(u)}
                                                    className="text-orange-500 hover:text-orange-600 transition"
                                                    title="Şifrəni Sıfırla"
                                                >
                                                    <i className="fas fa-key"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isAddModalOpen && (
                <Modal
                    isOpen={isAddModalOpen}
                    onClose={() => setIsAddModalOpen(false)}
                    title="Yeni İstifadəçi"
                >
                    <form onSubmit={handleAddSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">İstifadəçi Adı (Username) *</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-poçt *</label>
                            <input
                                required
                                type="email"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Şifrə *</label>
                            <input
                                required
                                type="password"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Rol *</label>
                            <select
                                required
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="">-- Rol Seçin --</option>
                                <option value="ADMIN">Admin</option>
                                <option value="MANAGER">Menecer</option>
                                <option value="CASHIER">Kassir</option>
                            </select>
                        </div>

                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                            >
                                Ləğv Et
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Təsdiqlə
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default Istifadeciler;
