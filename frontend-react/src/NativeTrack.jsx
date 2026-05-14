import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, MapPin, CheckCircle as CheckCircle2, X, ShoppingBag, Star, Clock, ChevronRight, MessageSquare, AlertOctagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API_URL from './api';
import { getImageUrl } from './utils';

export default function NativeTrack() {
    const navigate = useNavigate();
    const [localOrders, setLocalOrders] = useState([]);
    const [ordersData, setOrdersData] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');

    const handleSelectOrder = (orderId) => {
        setSelectedOrder(orderId);
        setRating(0); // Start with 0 stars
        setComment(''); // Clear text
    };

    useEffect(() => {
        try {
            const storedRaw = localStorage.getItem('apni_order_history') || localStorage.getItem('my_orders') || '[]';
            const stored = JSON.parse(storedRaw);
            if (Array.isArray(stored)) {
                setLocalOrders(stored);
                if (stored.length > 0) {
                    syncOrders(stored);
                    const interval = setInterval(() => syncOrders(stored), 10000); // Sync every 10s
                    return () => clearInterval(interval);
                }
            }
        } catch (e) {
            console.error('Initial load failed', e);
            setLocalOrders([]);
        }
    }, []);

    const syncOrders = async (orders) => {
        try {
            const orderIds = orders.map(o => o.orderId || o._id);
            const { data } = await axios.post(`${API_URL}/api/orders/sync`, { orderIds });
            
            const dataMap = { ...ordersData };
            const updatedLocalOrders = [...localOrders];
            let changed = false;

            data.forEach(remoteOrder => {
                dataMap[remoteOrder._id] = remoteOrder;
                
                // Update local storage if status changed or feedback flag changed
                const idx = updatedLocalOrders.findIndex(lo => lo._id === remoteOrder._id);
                if (idx !== -1) {
                    const local = updatedLocalOrders[idx];
                    if (local.status !== remoteOrder.status || !!local.feedbackGiven !== !!remoteOrder.feedbackGiven) {
                        updatedLocalOrders[idx] = { 
                            ...local, 
                            status: remoteOrder.status,
                            feedbackGiven: remoteOrder.feedbackGiven,
                            // Preserve remote data in local for persistence
                            totalAmount: remoteOrder.totalAmount,
                            items: remoteOrder.items
                        };
                        changed = true;
                    }
                }
            });

            if (changed) {
                setLocalOrders(updatedLocalOrders);
                localStorage.setItem('apni_order_history', JSON.stringify(updatedLocalOrders));
            }
            setOrdersData(dataMap);
        } catch (err) {
            console.error('Sync failed', err);
        }
    };

    const submitFeedback = async (orderId) => {
        if (!orderId) return;
        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/orders/${orderId}/feedback`, { rating, comment });
            setToast('Feedback submitted! Thank you.');
            
            // Update both state and local storage immediately
            const updatedLocal = localOrders.map(lo => 
                lo._id === orderId ? { ...lo, feedbackGiven: true } : lo
            );
            setLocalOrders(updatedLocal);
            localStorage.setItem('apni_order_history', JSON.stringify(updatedLocal));
            
            setOrdersData(prev => ({
                ...prev,
                [orderId]: { ...prev[orderId], feedbackGiven: true }
            }));
            
            setTimeout(() => {
                setToast(null);
                setSelectedOrder(null); // Close sheet
            }, 2000);
        } catch (err) {
            setToast('Failed to submit feedback');
            setTimeout(() => setToast(null), 3000);
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusInfo = (orderId, localStatus) => {
        const remote = ordersData[orderId];
        const status = (remote?.status || localStatus || 'ordered').toLowerCase();
        
        switch(status) {
            case 'pending':
            case 'ordered': return { step: 1, label: 'ORDERED', text: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' };
            case 'assigned':
            case 'confirmed': return { step: 2, label: 'CONFIRMED', text: 'text-yellow-600', bg: 'bg-yellow-50', dot: 'bg-yellow-500' };
            case 'delivered': return { step: 3, label: 'DELIVERED', text: 'text-emerald-600', bg: 'bg-emerald-50', dot: 'bg-emerald-500' };
            case 'returned':
            case 'rejected':
            case 'return': return { step: 3, label: 'RETURNED', text: 'text-red-600', bg: 'bg-red-50', dot: 'bg-red-500' };
            default: return { step: 1, label: 'ORDERED', text: 'text-blue-600', bg: 'bg-blue-50', dot: 'bg-blue-500' };
        }
    };



    return (
        <div className="min-h-screen bg-[#f8fafc] pb-32">
             <div className="bg-white px-6 pt-12 pb-6 sticky top-0 z-50 border-b border-gray-100">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Local History</p>
                    </div>
                </div>
            </div>

            <div className="bg-white">
                {localOrders.length === 0 ? (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={40} className="text-gray-200" />
                        </div>
                        <h2 className="text-xl font-black text-gray-900">No orders yet</h2>
                        <p className="text-gray-400 font-medium text-sm mt-2 px-10">Your locally placed orders will appear here for tracking.</p>
                    </div>
                ) : (
                    localOrders.slice().sort((a,b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).map(order => {
                        const statusInfo = getStatusInfo(order._id, order.status);
                        const remote = ordersData[order._id];
                        const items = remote?.items || order.items || [];
                        const mainItem = items[0];

                        return (
                            <motion.div 
                                key={order._id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectOrder(order._id)}
                                className="bg-white p-4 border-b border-gray-100 flex items-center gap-3 relative group"
                            >
                                <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                    <img src={getImageUrl(mainItem?.image)} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} ${statusInfo.label !== 'DELIVERED' && statusInfo.label !== 'RETURNED' ? 'animate-pulse' : ''}`} />
                                        <p className={`text-[8px] font-black uppercase tracking-tight ${statusInfo.text}`}>{statusInfo.label}</p>
                                        <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50 uppercase">
                                            #ORD{remote?.orderId || order.orderId || order._id.slice(-4).toUpperCase()}
                                        </span>
                                    </div>
                                    <h3 className="text-[13px] font-black text-gray-900 truncate pr-2 leading-none">{mainItem?.name || 'Order Items'}</h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-[11px] font-bold">
                                            <span className="text-emerald-600 font-black text-base bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">₹{remote?.totalAmount || order.totalAmount}</span>
                                            <span className="text-gray-300 mx-2">•</span>
                                            <span className="text-gray-400 font-bold">{new Date(order.createdAt || order.date || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                                        </p>
                                        
                                        {(statusInfo.label === 'DELIVERED' || statusInfo.label === 'RETURNED') && !remote?.feedbackGiven && (
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleSelectOrder(order._id); }}
                                                className="px-4 py-2 bg-gray-900 text-white text-[10px] font-black rounded-xl active:scale-95 transition-all shadow-lg shadow-gray-900/20 flex items-center gap-1.5"
                                            >
                                                <Star size={10} fill="currentColor" /> Rate Order
                                            </button>
                                        )}
                                        {remote?.feedbackGiven && (
                                            <div className="flex items-center gap-1.5 text-emerald-500 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                                <CheckCircle2 size={10} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Reviewed</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Bottom Sheet Details */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelectedOrder(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 w-full bg-white rounded-t-[3.5rem] z-[70] h-[92vh] overflow-hidden flex flex-col shadow-2xl"
                        >
                             <div className="bg-white/80 backdrop-blur-xl px-8 pt-6 pb-4 z-10 border-b border-gray-100/50 flex-shrink-0">
                                <div className="w-12 h-1.5 bg-gray-200/50 rounded-full mx-auto mb-6" />
                                {(() => {
                                    const activeOrder = localOrders.find(o => o._id === selectedOrder);
                                    const remoteOrder = ordersData[selectedOrder];
                                    const statusInfo = getStatusInfo(selectedOrder, activeOrder?.status);
                                    
                                    if (!activeOrder && !remoteOrder) return (
                                        <div className="flex items-center justify-center py-10">
                                            <p className="text-gray-400 font-bold">Loading order details...</p>
                                        </div>
                                    );

                                    return (
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Order Details</h2>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot} animate-pulse`} />
                                                    <p className={`text-[9px] font-black uppercase tracking-tight ${statusInfo.text}`}>{statusInfo.label}</p>
                                                    <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100/50 uppercase">
                                                        ID: #ORD{remoteOrder?.orderId || activeOrder?.orderId || selectedOrder?.slice(-6).toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <button onClick={() => setSelectedOrder(null)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 active:scale-90 transition-all"><X size={20}/></button>
                                        </div>
                                    );
                                })()}
                            </div>

                            <div className="flex-1 overflow-y-auto px-4 pb-32">
                                {(() => {
                                    const activeOrder = localOrders.find(o => o._id === selectedOrder);
                                    const remoteOrder = ordersData[selectedOrder];
                                    const statusInfo = getStatusInfo(selectedOrder, activeOrder?.status);
                                    const hasFeedback = remoteOrder?.feedbackGiven;
                                    
                                    if (!activeOrder && !remoteOrder) return null;

                                return (
                                    <div className="px-2 pb-20 space-y-6">
                                        {/* Cinematic Mobile Progress Timeline */}
                                        <div className="relative px-2 py-4">
                                            {/* Background Track */}
                                            <div className="absolute top-[36px] left-8 right-8 h-[3px] bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${((statusInfo.step - 1) / 2) * 100}%` }}
                                                    transition={{ duration: 1, delay: 0.3 }}
                                                    className={`h-full ${statusInfo.label === 'RETURNED' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'}`}
                                                />
                                            </div>

                                            {/* Nodes */}
                                            <div className="flex justify-between relative z-10">
                                                {[
                                                    { label: 'Ordered', step: 1, icon: Package },
                                                    { label: 'Confirmed', step: 2, icon: CheckCircle2 },
                                                    { label: statusInfo.label === 'RETURNED' ? 'Returned' : 'Delivered', step: 3, icon: statusInfo.label === 'RETURNED' ? AlertOctagon : CheckCircle2 }
                                                ].map((s, idx) => {
                                                    const isDone = statusInfo.step >= s.step;
                                                    const isCurrent = statusInfo.step === s.step;
                                                    
                                                    return (
                                                        <div key={idx} className="flex flex-col items-center">
                                                            <div className="relative">
                                                                {isCurrent && (
                                                                    <motion.div 
                                                                        initial={{ scale: 0.8, opacity: 0.6 }}
                                                                        animate={{ scale: 1.6, opacity: 0 }}
                                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                                        className={`absolute inset-0 rounded-full ${statusInfo.label === 'RETURNED' ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                                    />
                                                                )}
                                                                <motion.div 
                                                                    initial={{ scale: 0 }}
                                                                    animate={{ scale: 1 }}
                                                                    className={`w-9 h-9 rounded-full flex items-center justify-center border-[3px] border-white shadow-lg transition-colors duration-500 ${isDone ? (statusInfo.label === 'RETURNED' && s.step === 3 ? 'bg-red-500' : 'bg-emerald-500') : 'bg-gray-200'}`}
                                                                >
                                                                    <s.icon size={14} className="text-white" />
                                                                </motion.div>
                                                            </div>
                                                            <span className={`mt-3 text-[9px] font-black uppercase tracking-widest ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                {s.label}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-10">
                                             {/* Items Section - Cleaner Full Width Style */}
                                             <div className="pt-4">
                                                 <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                     Ordered Items
                                                 </h3>
                                                 <div className="space-y-8">
                                                    {(remoteOrder?.items || activeOrder?.items || []).map((item, idx) => (
                                                        <div 
                                                            key={idx} 
                                                            onClick={() => { setSelectedOrder(null); navigate(`/product/${item.productId || item._id}`); }}
                                                            className="flex items-center gap-4 p-2 hover:bg-white rounded-2xl transition-all cursor-pointer group active:scale-95"
                                                        >
                                                            <img src={getImageUrl(item.image)} className="w-14 h-14 rounded-2xl object-cover bg-white border border-gray-100 shadow-sm group-hover:scale-105 transition-transform" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-black text-gray-900 truncate group-hover:text-blue-600 transition-colors">{item.name}</p>
                                                                <p className="text-[11px] font-bold text-gray-400">Qty: {item.quantity || 1} • ₹{item.price || 0}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                             </div>
 
                                             {/* Delivery Info - Simplified Full Width */}
                                             <div className="pt-4 pb-12">
                                                 <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                     Delivery Details
                                                 </h3>
                                                 <div className="space-y-4">
                                                     <p className="text-xl font-black text-gray-900 leading-tight">{remoteOrder?.customerName || activeOrder.customerName}</p>
                                                     <div className="flex items-start gap-3">
                                                        <MapPin size={18} className="text-gray-300 shrink-0 mt-1" />
                                                        <p className="text-sm text-gray-500 font-bold leading-relaxed">{remoteOrder?.address || activeOrder.address}</p>
                                                     </div>
                                                 </div>
                                                 <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center">
                                                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-tight">Total Bill</span>
                                                     <span className="text-xl font-black text-gray-900">₹{remoteOrder?.totalAmount || activeOrder.totalAmount}</span>
                                                 </div>
                                                                                        {/* Feedback Section */}
                                            {(statusInfo.label === 'DELIVERED' || statusInfo.label === 'RETURNED') && (
                                                <div className={`p-6 rounded-[2.5rem] border shadow-xl transition-all ${statusInfo.label === 'RETURNED' ? 'bg-red-50 border-red-100 shadow-red-100/20' : 'bg-white border-gray-100 shadow-gray-200/40'}`}>
                                                    {hasFeedback ? (
                                                        <div className="text-center py-2">
                                                            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                                <CheckCircle2 size={24} />
                                                            </div>
                                                            <h4 className="text-base font-black text-gray-900 mb-0.5">Feedback Submitted!</h4>
                                                            <p className="text-[10px] text-emerald-600/70 font-bold">Thank you for your response.</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="mb-4">
                                                                <h4 className="text-lg font-black text-gray-900 tracking-tight">{statusInfo.label === 'RETURNED' ? 'Why was it returned?' : 'How was your delivery?'}</h4>
                                                            </div>
                                                            
                                                            {statusInfo.label === 'DELIVERED' && (
                                                                <div className="flex justify-center gap-2 mb-6">
                                                                    {[1, 2, 3, 4, 5].map(star => (
                                                                        <button 
                                                                            key={star} 
                                                                            onClick={() => setRating(star)} 
                                                                            className={`p-1 transition-all ${rating >= star ? 'text-yellow-400 scale-110' : 'text-gray-200'}`}
                                                                        >
                                                                            <Star size={28} fill={rating >= star ? "currentColor" : "none"} strokeWidth={2} />
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            
                                                            <textarea 
                                                                value={comment}
                                                                onChange={(e) => setComment(e.target.value)}
                                                                placeholder={statusInfo.label === 'RETURNED' ? "Reason for return..." : "Write a short review..."}
                                                                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl min-h-[100px] outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm text-gray-800 mb-4"
                                                            />
                                                            
                                                            <button 
                                                                onClick={() => submitFeedback(selectedOrder)}
                                                                disabled={submitting || (statusInfo.label === 'RETURNED' && !comment.trim())}
                                                                className="w-full py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-black active:scale-95 transition-all shadow-lg shadow-gray-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                                            >
                                                                {submitting ? 'Submitting...' : <><CheckCircle2 size={16} /> Send Feedback</>}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            )}        )}
                                        </div>
                                    </div>
                                );
                            })()}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Toast Overlay */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-24 left-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl z-[100] text-center"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
