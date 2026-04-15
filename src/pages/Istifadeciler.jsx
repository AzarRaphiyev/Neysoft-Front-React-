import React, { useState, useEffect } from 'react';
import { getUsers, registerUser, changeUserPassword } from '../services/user.service';
import { useUI } from '../contexts/UIContext';
import Modal from '../components/common/Modal';

function Istifadeciler() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showToast } = useUI();

    // Modals state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Add User Form
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: '' });

    // Password Change
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    // Current User Role
    const currentUserStr = localStorage.getItem('user');
    let currentUser = {};
    try {
        if (currentUserStr) currentUser = JSON.parse(currentUserStr);
    } catch (e) { }
    const currentRole = currentUser.role || localStorage.getItem('role') || 'CASHIER';

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getUsers();
            setUsers(data);
        } catch (error) {
            showToast('İstifadəçilər yüklənərkən xəta baş verdi', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [/* eslint-disable-line react-hooks/exhaustive-deps */]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await registerUser(formData);
            showToast('İstifadəçi uğurla yaradıldı', 'success');
            setIsAddModalOpen(false);
            setFormData({ username: '', email: '', password: '', role: '' });
            fetchUsers();
        } catch (error) {
            showToast('İstifadəçi yaradılarkən xəta baş verdi', 'error');
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!selectedUser) return;
        try {
            await changeUserPassword(selectedUser.id, newPassword);
            showToast('Şifrə uğurla yeniləndi', 'success');
            setIsPasswordModalOpen(false);
            setNewPassword('');
        } catch (error) {
            showToast('Şifrə yenilənərkən xəta baş verdi', 'error');
        }
    };

    const availableRoles = currentRole === 'ADMIN'
        ? [{ value: 'MANAGER', label: 'Menecer' }, { value: 'CASHIER', label: 'Kassir' }]
        : [{ value: 'CASHIER', label: 'Kassir' }];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">
                    <i className="fas fa-users"></i> İstifadəçilər
                </h2>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow flex items-center gap-2 transition"
                >
                    <i className="fas fa-user-plus"></i> Yeni İstifadəçi
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {loading ? (
                    <p className="p-6 text-center text-gray-500">Yüklənir...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">İstifadəçi Adı</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">E-poçt</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Rol</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700 text-center">Əməliyyat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {(!users || users.length === 0) ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">İstifadəçi tapılmadı</td>
                                    </tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4">{u.username}</td>
                                            <td className="px-6 py-4">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : u.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => { setSelectedUser(u); setIsPasswordModalOpen(true); }}
                                                    className="text-gray-500 hover:text-orange-500 transition"
                                                    title="Şifrəni Yenilə"
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">İstifadəçi Adı *</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-poçt</label>
                            <input
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
                                {availableRoles.map(r => (
                                    <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
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
                                Yarat
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {isPasswordModalOpen && (
                <Modal
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    title="Şifrəni Yenilə"
                >
                    <div className="mb-4 text-sm text-gray-600">
                        <strong>{selectedUser?.username}</strong> üçün yeni şifrə təyin edirsiniz.
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifrə *</label>
                            <input
                                required
                                type="password"
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
                            >
                                Ləğv Et
                            </button>
                            <button
                                type="submit"
                                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
                            >
                                Yenilə
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

export default Istifadeciler;
