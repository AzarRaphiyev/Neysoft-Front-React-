import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth.service';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const data = await login(username, password);
            const tokenToSave = data?.access_token || data?.token || data?.accessToken;
            if (tokenToSave) {
                localStorage.setItem('token', tokenToSave);
                if (data.user) {
                    localStorage.setItem('user', JSON.stringify(data.user));
                }
                window.location.href = '/';
            } else {
                alert('Login failed: Token not received');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded shadow-md w-full max-w-sm">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-6 text-center">Giriş</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">İstifadəçi adı</label>
                        <input
                            type="text"
                            name="username"
                            placeholder="İstifadəçi adınızı daxil edin"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-medium">Şifrə</label>
                        <input
                            type="password"
                            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
                    >
                        Daxil ol
                    </button>
                </form>
            </div>
        </div>
    );
}
