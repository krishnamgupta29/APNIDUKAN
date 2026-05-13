import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MapPin, CheckCircle2, ChevronDown, ChevronUp, ShoppingBag, Star, Truck, AlertOctagon, MessageSquare, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API_URL from './api';

export default function TrackOrder() {
    const navigate = useNavigate();
    const [localOrders, setLocalOrders] = useState([]);
    const [ordersData, setOrdersData] = useState({});
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [feedbackText, setFeedbackText] = useState('');
    const [rating, setRating] = useState(5);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('apni_order_history') || localStorage.getItem('my_orders') || '[]');
        setLocalOrders(stored);
        if (stored.length > 0) syncOrders(stored);
    }, []);

    const syncOrders = async (orders) => {
        try {
            const orderIds = orders.map(o => o.orderId || o._id);
            const { data } = await axios.post(`${API_URL}/api/orders/sync`, { orderIds });
            const dataMap = {};
            data.forEach(o => { dataMap[o._id] = o; });
            setOrdersData(dataMap);
        } catch (err) {
            console.error('Sync failed', err);
        }
    };

    const submitFeedback = async (orderId) => {
        if (!orderId) return;
        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/orders/${orderId}/feedback`, { 
                rating, 
                comment: feedbackText 
            });
            // Update local data to reflect feedback submitted
            setOrdersData(prev => ({
                ...prev,
                [orderId]: { ...prev[orderId], feedbackGiven: true }
            }));
            setFeedbackText('');
        } catch (err) {
            alert('Failed to submit feedback');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusInfo = (orderId, localStatus) => {
        const remote = ordersData[orderId];
        const status = remote?.status || localStatus || 'ordered';
        
        switch(status.toLowerCase()) {
            case 'ordered': return { step: 1, label: 'ORDERED', color: 'blue' };
            case 'confirmed': return { step: 2, label: 'CONFIRMED', color: 'indigo' };
            case 'delivered': return { step: 3, label: 'DELIVERED', color: 'emerald' };
            case 'returned': return { step: 3, label: 'RETURNED', color: 'red' };
            default: return { step: 1, label: 'ORDERED', color: 'blue' };
        }
    };

    const getImageUrl = (img) => {
        if (!img) return 'https://via.placeholder.com/150';
        return img.startsWith('http') ? img : `${API_URL}${img}`;
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 px-6">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-black text-gray-900 tracking-tight"
                        >
                            My Orders
                        </motion.h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">Local Purchase History</p>
                    </div>
                    <div className="hidden md:flex items-center gap-2.5 p-1.5 bg-white rounded-xl border border-gray-100 shadow-sm">
                        <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-lg flex items-center justify-center">
                            <ShoppingBag size={16} />
                        </div>
                        <div className="pr-2">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-0.5">Total Orders</p>
                            <p className="text-base font-black text-gray-900 leading-tight">{localOrders.length}</p>
                        </div>
                    </div>
                </div>

                {localOrders.length === 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-2xl shadow-gray-200/50"
                    >
                        <div className="w-24 h-24 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Package size={48} />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No orders found on this device</h2>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto">Your purchase history is saved locally. If you recently placed an order, it will appear here.</p>
                        <button className="mt-10 px-8 py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200">Start Shopping</button>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {localOrders.slice().reverse().map((order) => {
                            const statusInfo = getStatusInfo(order._id, order.status);
                            const remoteOrder = ordersData[order._id];
                            const items = remoteOrder?.items || order.items || [];
                            const isExpanded = expandedOrder === order._id;
                            const hasFeedback = remoteOrder?.feedbackGiven;

                            return (
                                <motion.div 
                                    key={order._id}
                                    layout
                                    className={`bg-white rounded-[1.5rem] border transition-all duration-500 overflow-hidden ${isExpanded ? 'shadow-xl border-gray-200 ring-2 ring-gray-50' : 'shadow-lg shadow-gray-100 border-gray-100 hover:border-gray-200'}`}
                                >
                                    {/* Main Card Header */}
                                    <div 
                                        className="p-3 md:p-6 cursor-pointer flex items-center gap-3 md:gap-5"
                                        onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                    >
                                        <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0 group relative">
                                            <img src={getImageUrl(items[0]?.image)} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                            {items.length > 1 && (
                                                <div className="absolute bottom-0.5 right-0.5 bg-gray-900/80 backdrop-blur text-white text-[7px] font-black px-1 py-0.5 rounded-md border border-white/10">
                                                    +{items.length - 1}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className={`text-[7px] md:text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest border ${statusInfo.label === 'RETURNED' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-emerald-50 text-emerald-500 border-emerald-100'}`}>
                                                    {statusInfo.label}
                                                </span>
                                                <span className="text-[8px] md:text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100/50 uppercase tracking-widest">
                                                    #{remoteOrder?.orderId || order.orderId || order._id.slice(-4).toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="text-sm md:text-xl font-black text-gray-900 truncate tracking-tight">{items[0]?.name || 'Multiple Items'}</h3>
                                            <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">{new Date(order.date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                                        </div>

                                        <div className="flex flex-col items-end gap-1 shrink-0">
                                            <div className="text-right">
                                                <p className="text-lg md:text-3xl font-black text-gray-900 tracking-tighter">₹{remoteOrder?.totalAmount || order.totalAmount}</p>
                                            </div>
                                            <div className={`p-1.5 rounded-full transition-colors ${isExpanded ? 'bg-gray-100 text-gray-900' : 'bg-gray-50 text-gray-400'}`}>
                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="border-t border-gray-100 bg-[#fcfdfe]"
                                            >
                                                <div className="p-5 md:p-8">
                                                    {/* Cinematic Progress Timeline */}
                                                    <div className="max-w-2xl mx-auto mb-12 relative px-4">
                                                        <div className="absolute top-[18px] left-6 right-6 h-[2px] bg-gray-100 rounded-full overflow-hidden">
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${((statusInfo.step - 1) / 2) * 100}%` }}
                                                                transition={{ duration: 1.2, ease: "circOut" }}
                                                                className={`h-full ${statusInfo.label === 'RETURNED' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'}`}
                                                            />
                                                        </div>

                                                        <div className="flex justify-between relative z-10">
                                                            {[
                                                                { label: 'ORDERED', icon: Package, step: 1, color: 'blue' },
                                                                { label: 'CONFIRMED', icon: CheckCircle2, step: 2, color: 'indigo' },
                                                                { label: statusInfo.label === 'RETURNED' ? 'RETURNED' : 'DELIVERED', icon: statusInfo.label === 'RETURNED' ? AlertOctagon : Truck, step: 3, color: statusInfo.label === 'RETURNED' ? 'red' : 'emerald' }
                                                            ].map((s, idx) => {
                                                                const isDone = statusInfo.step >= s.step;
                                                                const isCurrent = statusInfo.step === s.step;
                                                                const colors = {
                                                                    blue: 'bg-blue-500 shadow-blue-100',
                                                                    indigo: 'bg-indigo-500 shadow-indigo-100',
                                                                    emerald: 'bg-emerald-500 shadow-emerald-100',
                                                                    red: 'bg-red-500 shadow-red-100'
                                                                };

                                                                return (
                                                                    <div key={idx} className="flex flex-col items-center">
                                                                        <div className="relative">
                                                                            {isCurrent && (
                                                                                <motion.div 
                                                                                    animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                                                                                    transition={{ repeat: Infinity, duration: 2 }}
                                                                                    className={`absolute inset-0 rounded-full ${s.color === 'red' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                                />
                                                                            )}
                                                                            <motion.div 
                                                                                className={`w-9 h-9 rounded-full flex items-center justify-center border-[3px] border-white shadow-lg z-20 relative ${isDone ? colors[s.color] : 'bg-white text-gray-300'}`}
                                                                            >
                                                                                <s.icon size={16} className={isDone ? 'text-white' : 'text-gray-300'} />
                                                                            </motion.div>
                                                                        </div>
                                                                        <span className={`mt-2.5 text-[8px] font-black tracking-widest ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-lg shadow-gray-100/50">
                                                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5"><ShoppingBag size={12}/> Items</h4>
                                                            <div className="space-y-3">
                                                                {items.map((item, idx) => (
                                                                    <div 
                                                                        key={idx} 
                                                                        onClick={() => navigate(`/product/${item.productId || item._id}`)}
                                                                        className="flex items-center gap-3 p-1.5 hover:bg-gray-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-gray-100 group"
                                                                    >
                                                                        <img src={getImageUrl(item.image)} className="w-10 h-10 rounded-lg object-cover border group-hover:scale-105 transition-transform" />
                                                                        <div className="min-w-0">
                                                                            <p className="text-xs font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">{item.name}</p>
                                                                            <p className="text-[9px] font-bold text-gray-400">Qty: {item.quantity} • ₹{item.price}</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-lg shadow-gray-100/50">
                                                            <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5"><MapPin size={12}/> Shipping</h4>
                                                            <p className="text-base font-black text-gray-900 tracking-tight">{remoteOrder?.customerName || order.customerName}</p>
                                                            <p className="text-xs font-bold text-gray-500 italic mt-1.5 leading-relaxed truncate">"{remoteOrder?.address || order.address}"</p>
                                                            <div className="mt-4 p-2.5 bg-gray-50 rounded-xl border border-gray-100/50 text-[9px] font-black text-gray-400 flex items-center gap-1.5 uppercase tracking-widest">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> {remoteOrder?.phone || order.phone}
                                                            </div>
                                                        </div>

                                                        <div className="bg-gray-900 text-white p-6 rounded-[1.5rem] shadow-xl relative overflow-hidden">
                                                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl" />
                                                            <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">Final Summary</h4>
                                                            <div className="space-y-3 relative z-10">
                                                                <div className="flex justify-between text-[11px]">
                                                                    <span className="text-white/50 font-bold uppercase tracking-widest text-[8px]">Method</span>
                                                                    <span className="font-black text-emerald-400">COD</span>
                                                                </div>
                                                                <div className="pt-4 border-t border-white/10 mt-4 flex justify-between items-end">
                                                                    <span className="text-[8px] font-black text-white/30 uppercase tracking-widest mb-1">Total</span>
                                                                    <span className="text-2xl font-black text-emerald-400">₹{remoteOrder?.totalAmount || order.totalAmount}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Feedback Section */}
                                                    {(statusInfo.label === 'DELIVERED' || statusInfo.label === 'RETURNED') && (
                                                        <div className="mt-12">
                                                            {hasFeedback ? (
                                                                <div className="bg-emerald-50 border border-emerald-100 p-10 rounded-[3rem] text-center">
                                                                    <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
                                                                    <h5 className="text-2xl font-black text-gray-900 tracking-tight">Feedback Received!</h5>
                                                                    <p className="text-emerald-600/70 font-bold text-sm mt-1">Thank you for helping us improve our service.</p>
                                                                </div>
                                                            ) : (
                                                                <div className={`p-10 rounded-[3rem] border-2 shadow-2xl transition-all ${statusInfo.label === 'RETURNED' ? 'bg-red-50 border-red-100 shadow-red-100/30' : 'bg-white border-gray-100 shadow-gray-200/50'}`}>
                                                                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-8">
                                                                        <div>
                                                                            <h5 className="text-3xl font-black text-gray-900 tracking-tight">{statusInfo.label === 'RETURNED' ? 'Reason for Return?' : 'How was your delivery?'}</h5>
                                                                            <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">Share your thoughts with our team</p>
                                                                        </div>
                                                                        {statusInfo.label === 'DELIVERED' && (
                                                                            <div className="flex gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-100 shrink-0 self-start">
                                                                                {[1,2,3,4,5].map(s => (
                                                                                    <button key={s} onClick={() => setRating(s)} className={`p-1.5 transition-all ${rating >= s ? 'text-yellow-400 scale-125' : 'text-gray-200'}`}>
                                                                                        <Star size={30} fill={rating >= s ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <textarea 
                                                                        value={feedbackText}
                                                                        onChange={(e) => setFeedbackText(e.target.value)}
                                                                        placeholder={statusInfo.label === 'RETURNED' ? "Please explain why the order was returned (Required)..." : "Write a short review about our service..."}
                                                                        className="w-full p-6 bg-gray-50 border border-gray-100 rounded-[2rem] min-h-[140px] outline-none focus:ring-8 focus:ring-blue-50/50 focus:bg-white focus:border-blue-400 transition-all font-bold text-gray-700 shadow-inner"
                                                                    />
                                                                    <div className="flex justify-end mt-6">
                                                                        <button 
                                                                            onClick={() => submitFeedback(order._id)}
                                                                            disabled={submitting || (statusInfo.label === 'RETURNED' && !feedbackText.trim())}
                                                                            className="px-12 py-5 bg-gray-900 text-white font-black rounded-2xl shadow-2xl shadow-gray-900/20 hover:bg-black hover:-translate-y-1 active:translate-y-0 transition-all flex items-center gap-2 disabled:opacity-50"
                                                                        >
                                                                            {submitting ? 'Submitting...' : <><MessageSquare size={18} /> Send Feedback</>}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
