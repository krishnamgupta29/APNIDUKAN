import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    Package, MapPin, CheckCircle, XCircle, LogOut, 
    Phone, CheckCircle2, LayoutDashboard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from './api';

export default function DeliveryPanel() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const token = sessionStorage.getItem('auth_token');
    const userName = sessionStorage.getItem('user_name');

    useEffect(() => {
        if (!token || sessionStorage.getItem('user_role') !== 'delivery') {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [navigate, token]);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/orders/my-deliveries`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        const confirmed = window.confirm(`Mark this order as ${newStatus.toUpperCase()}?`);
        if (!confirmed) return;

        try {
            await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus.toUpperCase() }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Refresh local state
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus.toUpperCase() } : o));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const logout = () => {
        sessionStorage.clear();
        localStorage.removeItem('apnidukan_user_details');
        navigate('/login');
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f9fd]">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
        </div>
    );

    const activeOrders = orders.filter(o => o.status?.toUpperCase() === 'ASSIGNED');
    const completedOrders = orders.filter(o => {
        const st = o.status?.toUpperCase();
        return st === 'DELIVERED' || st === 'RETURNED';
    });

    return (
        <div className="min-h-screen bg-[#f8f9fd] pb-24">
            {/* Premium Header */}
            <div 
                className="pt-12 pb-24 px-6 text-white sticky top-0 z-20 shadow-xl"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)' }}
            >
                <div className="max-w-lg mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/10 shadow-lg">
                            <LayoutDashboard size={24} className="text-[#f72585]" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight leading-none mb-1">Delivery Hub</h1>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{userName}</p>
                        </div>
                    </div>
                    <button 
                        onClick={logout}
                        className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/5 active:scale-90 transition-all"
                    >
                        <LogOut size={20} className="text-white/60" />
                    </button>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-6 -mt-12 relative z-30">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-[32px] shadow-lg shadow-gray-200/50 border border-white">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Tasks</p>
                        <p className="text-3xl font-black text-gray-900">{activeOrders.length}</p>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] shadow-lg shadow-gray-200/50 border border-white">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Done</p>
                        <p className="text-3xl font-black text-gray-900">{completedOrders.length}</p>
                    </div>
                </div>

                {/* Active Section */}
                <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 px-2">Assigned Deliveries</h2>
                
                <div className="space-y-6">
                    {activeOrders.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-12 rounded-[40px] text-center border border-gray-100 shadow-sm"
                        >
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Package size={40} className="text-gray-200" />
                            </div>
                            <h3 className="text-lg font-black text-gray-900">All caught up!</h3>
                            <p className="text-sm font-bold text-gray-400">Wait for the admin to assign new orders.</p>
                        </motion.div>
                    ) : (
                        activeOrders.map((order, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={order._id}
                                className="bg-white rounded-[40px] border border-gray-50 shadow-xl shadow-gray-200/40 overflow-hidden"
                            >
                                <div className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">#{order.orderId?.toUpperCase()}</span>
                                            <h3 className="text-xl font-black text-gray-900 mt-3">{order.customerName}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black text-emerald-500 leading-none">₹{order.total}</p>
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mt-1">Cash on delivery</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                                                <Phone size={18} />
                                            </div>
                                            <a href={`tel:${order.phone}`} className="text-sm font-black text-gray-700 decoration-none">{order.phone}</a>
                                        </div>
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 shrink-0">
                                                <MapPin size={18} />
                                            </div>
                                            <p className="text-sm font-bold text-gray-500 leading-relaxed">{order.address}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-6 border-t border-gray-50">
                                        <button 
                                            onClick={() => updateStatus(order._id, 'DELIVERED')}
                                            className="flex-1 h-16 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
                                        >
                                            <CheckCircle2 size={18} /> Delivered
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(order._id, 'RETURNED')}
                                            className="flex-1 h-16 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 border border-red-100 active:scale-95 transition-all"
                                        >
                                            <XCircle size={18} /> Returned
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {/* History Section */}
                {completedOrders.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 px-2">Recent Success</h2>
                        <div className="space-y-3">
                            {completedOrders.map((order, idx) => {
                                const isDelivered = order.status?.toUpperCase() === 'DELIVERED';
                                return (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        key={order._id}
                                        className="bg-white p-6 rounded-[32px] border border-gray-50 shadow-sm flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDelivered ? 'bg-emerald-50 text-emerald-500' : 'bg-red-50 text-red-500'}`}>
                                                {isDelivered ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">#{order.orderId?.toUpperCase()}</p>
                                                <p className="text-xs font-bold text-gray-400">{order.customerName}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900">₹{order.total}</p>
                                            <p className={`text-[9px] font-black uppercase tracking-widest ${isDelivered ? 'text-emerald-500' : 'text-red-500'}`}>
                                                {isDelivered ? 'Delivered' : 'Returned'}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
