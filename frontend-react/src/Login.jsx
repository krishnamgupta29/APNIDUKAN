import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Lock, User } from 'lucide-react';
import API_URL from './api';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post(`${API_URL}/api/auth/login`, { username, password });
            
            sessionStorage.setItem('auth_token', data.token);
            sessionStorage.setItem('user_role', data.role);
            sessionStorage.setItem('user_name', data.name);

            if (data.role === 'admin') {
                navigate('/admin');
            } else if (data.role === 'delivery') {
                navigate('/delivery');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please check credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md border border-gray-100">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Staff Portal</h2>
                    <p className="text-gray-500 text-sm mt-1">Sign in to manage orders</p>
                </div>

                {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center">{error}</div>}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Username</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><User size={18} /></span>
                            <input 
                                type="text" required 
                                value={username} onChange={e=>setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" 
                                placeholder="Enter username" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Password</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"><Lock size={18} /></span>
                            <input 
                                type="password" required 
                                value={password} onChange={e=>setPassword(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium" 
                                placeholder="••••••••" 
                            />
                        </div>
                    </div>
                </div>

                <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full mt-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all disabled:opacity-50"
                >
                    {loading ? 'Authenticating...' : 'Sign In'}
                </button>
            </form>
        </div>
    );
}
