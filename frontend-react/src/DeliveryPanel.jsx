import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, CheckCircle as CheckCircle2, XCircle, LogOut, Truck } from 'lucide-react';
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
        try {
            await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const logout = () => {
        sessionStorage.clear();
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading...</div>;

    const activeOrders = orders.filter(o => o.status === 'assigned');
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'returned');

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            {/* Staff Header */}
            <div className="bg-white border-b border-gray-100 px-6 py-8 shadow-sm">
                <div className="max-w-4xl mx-auto flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <Truck className="text-blue-600" /> Delivery Panel
                        </h1>
                        <p className="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">Welcome, {userName}</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 text-center">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Active</p>
                            <p className="text-xl font-black text-blue-600">{activeOrders.length}</p>
                        </div>
                        <button onClick={logout} className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition shadow-lg shadow-gray-900/10">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-6">
                {activeOrders.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-12 text-center border border-gray-100 shadow-xl shadow-gray-200/50 mt-10">
                        <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={40} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No Active Orders</h2>
                        <p className="text-gray-400 font-medium">Sit back and relax! New orders will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <AnimatePresence>
                            {activeOrders.map(order => (
                                <motion.div 
                                    key={order._id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col hover:shadow-2xl transition-all duration-300"
                                >
                                    <div className="p-6 flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <span className="text-[10px] font-black text-blue-500 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 uppercase tracking-widest">
                                                    Order #{order.orderId || order._id.slice(-6).toUpperCase()}
                                                </span>
                                                <h3 className="text-xl font-black text-gray-900 mt-3 tracking-tight">{order.customerName}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
                                                <p className="text-xl font-black text-gray-900">₹{order.totalAmount || order.total}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                                                <MapPin size={18} className="text-red-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Address</p>
                                                    <p className="text-sm font-bold text-gray-700 leading-relaxed italic">"{order.address}"</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 px-4">
                                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                                <p className="text-xs font-black text-gray-500 uppercase tracking-widest">Phone: {order.phone}</p>
                                            </div>
                                        </div>

                                        {order.items && (
                                            <div className="space-y-2">
                                                {order.items.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between text-xs font-bold text-gray-500 bg-gray-50/50 p-2 rounded-lg">
                                                        <span className="truncate max-w-[180px]">{item.name}</span>
                                                        <span className="text-gray-900 shrink-0">x{item.quantity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                                        <button 
                                            onClick={() => updateStatus(order._id, 'delivered')}
                                            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all shadow-lg shadow-gray-900/10 flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle2 size={18} /> Delivered
                                        </button>
                                        <button 
                                            onClick={() => updateStatus(order._id, 'returned')}
                                            className="px-6 bg-white text-red-500 border border-red-100 py-4 rounded-2xl font-black text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {completedOrders.length > 0 && (
                    <div className="mt-16">
                        <div className="flex items-center gap-4 mb-6">
                            <h3 className="font-black text-2xl text-gray-900 tracking-tight">Recent History</h3>
                            <div className="h-[2px] flex-1 bg-gray-100" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {completedOrders.map(order => (
                                <div key={order._id} className="bg-white/60 backdrop-blur-sm p-5 rounded-3xl border border-gray-100 flex justify-between items-center group hover:bg-white transition-all shadow-sm">
                                    <div className="min-w-0">
                                        <p className="font-black text-gray-900 text-sm truncate">{order.customerName}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">#{order.orderId || order._id.slice(-6).toUpperCase()}</p>
                                    </div>
                                    {order.status === 'delivered' ? (
                                        <span className="shrink-0 text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full border border-emerald-100 uppercase tracking-widest">Delivered</span>
                                    ) : (
                                        <span className="shrink-0 text-[10px] font-black bg-red-50 text-red-600 px-3 py-1.5 rounded-full border border-red-100 uppercase tracking-widest">Returned</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
