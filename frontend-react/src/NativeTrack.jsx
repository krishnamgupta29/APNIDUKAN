import React, { useState } from 'react';
import axios from 'axios';
import { Package, Search, Clock, CheckCircle2, Truck, XCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from './api';
import { getImageUrl } from './utils';

export default function NativeTrack() {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        const cleanPhone = phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
            setError('Please enter a valid 10-digit number');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_URL}/api/orders/track/${cleanPhone}`);
            setOrders(res.data);
            setHasSearched(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Error fetching orders');
        } finally {
            setLoading(false);
        }
    };

    const StatusIcon = ({ status }) => {
        switch (status) {
            case 'Pending': return <Clock size={20} className="text-orange-500" />;
            case 'Processing': return <Package size={20} className="text-blue-500" />;
            case 'Out for Delivery': return <Truck size={20} className="text-[var(--color-pink-orchid)]" />;
            case 'Delivered': return <CheckCircle2 size={20} className="text-emerald-500" />;
            case 'Cancelled': case 'Returned': return <XCircle size={20} className="text-red-500" />;
            default: return <Package size={20} className="text-gray-400" />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-24">
            <div className="bg-white/70 backdrop-blur-xl border-b border-[var(--color-pink-orchid)]/10 px-4 pt-12 pb-6 shadow-sm rounded-b-[30px]">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Order</h1>
                <p className="text-sm text-gray-500 mb-6">Enter your phone number to see live updates</p>
                
                <form onSubmit={handleTrack} className="flex gap-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">+91</span>
                        <input
                            type="tel"
                            maxLength="10"
                            placeholder="Mobile Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-[#f8f9fa] border border-gray-200 rounded-[16px] text-sm font-semibold outline-none focus:border-[var(--color-pink-orchid)] focus:ring-2 focus:ring-[var(--color-pink-orchid)]/20 transition-all"
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="h-12 px-6 rounded-[16px] bg-gradient-to-r from-[var(--color-pink-orchid)] to-[var(--color-sky-blue)] text-white font-bold shadow-md active:scale-95 transition-transform disabled:opacity-70 flex items-center justify-center"
                    >
                        {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"/> : <Search size={20} />}
                    </button>
                </form>
                {error && <p className="text-red-500 text-xs font-semibold mt-3 ml-1">{error}</p>}
            </div>

            <div className="px-4 py-6">
                {hasSearched && orders.length === 0 && !loading && (
                    <div className="text-center py-10">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={24} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No active orders found for this number.</p>
                    </div>
                )}

                <div className="space-y-4">
                    {orders.map((order, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            key={order._id} 
                            className="bg-white rounded-[20px] p-5 shadow-sm border border-[var(--color-pink-orchid)]/10"
                        >
                            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-50">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Order ID</p>
                                    <p className="text-xs font-mono font-semibold text-gray-800">{order._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total</p>
                                    <p className="text-sm font-black text-gray-900">₹{order.totalAmount}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-5 bg-[#f8f9fa] p-3 rounded-[12px] border border-gray-100">
                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <StatusIcon status={order.status} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{order.status}</h4>
                                    <p className="text-xs text-gray-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • {order.paymentMethod}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gray-50 rounded-[8px] p-1 flex-shrink-0">
                                            <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                                            <p className="text-[10px] text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
