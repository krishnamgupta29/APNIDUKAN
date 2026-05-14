import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Package, MapPin, CheckCircle2, ChevronLeft, ShoppingBag, Star, Clock, MessageSquare, AlertOctagon, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from './api';
import { getImageUrl } from './utils';

export default function NativeOrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [remoteOrder, setRemoteOrder] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                // Get from local storage first
                const stored = JSON.parse(localStorage.getItem('apni_order_history') || localStorage.getItem('my_orders') || '[]');
                const localOrder = stored.find(o => o._id === id);
                if (localOrder) {
                    setOrder(localOrder);
                    setRating(0);
                }

                // Sync with server
                const { data } = await axios.post(`${API_URL}/api/orders/sync`, { orderIds: [id] });
                if (data && data.length > 0) {
                    const remote = data[0];
                    setRemoteOrder(remote);
                    
                    // Persistence: Update local storage if status or feedback flag changed
                    if (localOrder && (localOrder.status !== remote.status || !!localOrder.feedbackGiven !== !!remote.feedbackGiven)) {
                        const updated = stored.map(o => o._id === id ? { 
                            ...o, 
                            status: remote.status, 
                            feedbackGiven: remote.feedbackGiven,
                            totalAmount: remote.totalAmount,
                            items: remote.items 
                        } : o);
                        localStorage.setItem('apni_order_history', JSON.stringify(updated));
                    }
                }
            } catch (err) {
                console.error('Failed to fetch order', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const formatId = (id) => {
        if (!id) return '';
        let clean = String(id).toUpperCase();
        while (clean.includes('ORD') || clean.includes('#')) {
            clean = clean.replace('#', '').replace('ORD', '');
        }
        return `#ORD${clean}`;
    };

    const getStatusInfo = () => {
        const status = (remoteOrder?.status || order?.status || 'ordered').toLowerCase();
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

    const submitFeedback = async () => {
        if (!id) return;
        setSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/orders/${id}/feedback`, { rating, comment });
            setToast('Feedback submitted! Thank you.');
            
            // Update local storage
            const stored = JSON.parse(localStorage.getItem('apni_order_history') || '[]');
            const updated = stored.map(o => o._id === id ? { ...o, feedbackGiven: true } : o);
            localStorage.setItem('apni_order_history', JSON.stringify(updated));
            
            setRemoteOrder(prev => prev ? { ...prev, feedbackGiven: true } : null);
            setTimeout(() => setToast(null), 3000);
        } catch (err) {
            setToast('Failed to submit feedback');
            setTimeout(() => setToast(null), 3000);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !order) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!order && !remoteOrder) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center">
            <AlertOctagon size={64} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-black text-gray-900">Order Not Found</h2>
            <button onClick={() => navigate(-1)} className="mt-6 px-8 py-3 bg-gray-900 text-white font-black rounded-2xl">Go Back</button>
        </div>
    );

    const statusInfo = getStatusInfo();
    const items = remoteOrder?.items || order?.items || [];
    const hasFeedback = remoteOrder?.feedbackGiven || order?.feedbackGiven;

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-10">
            {/* Premium Header */}
            <div className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 border-b border-gray-100 px-6 pt-12 pb-6">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-3 bg-gray-50 rounded-2xl text-gray-900 active:scale-90 transition-all">
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Order Details</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${statusInfo.dot} animate-pulse`} />
                            <p className={`text-[13px] font-black uppercase tracking-tight ${statusInfo.text}`}>{statusInfo.label}</p>
                            <span className="text-[18px] font-black text-blue-700 bg-blue-50 px-4 py-1.5 rounded-2xl border-2 border-blue-100 shadow-md uppercase tracking-wider">
                                {formatId(remoteOrder?.orderId || order?.orderId || id.slice(-6))}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 pt-6 space-y-6">
                {/* Cinematic Progress Timeline */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                    <div className="relative px-2 py-4">
                        <div className="absolute top-[36px] left-8 right-8 h-[3px] bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${((statusInfo.step - 1) / 2) * 100}%` }}
                                transition={{ duration: 1 }}
                                className={`h-full ${statusInfo.label === 'RETURNED' ? 'bg-red-500' : 'bg-gradient-to-r from-blue-500 to-emerald-500'}`}
                            />
                        </div>

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
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] border-white shadow-md transition-colors duration-500 ${isDone ? (statusInfo.label === 'RETURNED' && s.step === 3 ? 'bg-red-500' : 'bg-emerald-500') : 'bg-gray-200'}`}>
                                                <s.icon size={18} className="text-white" />
                                            </div>
                                        </div>
                                        <p className={`text-[9px] font-black uppercase tracking-tight mt-3 ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Items Section */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <ShoppingBag size={14} className="text-blue-500" /> Ordered Items
                    </h3>
                    <div className="space-y-6">
                        {items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 group">
                                <img src={getImageUrl(item.image)} className="w-16 h-16 rounded-2xl object-cover bg-gray-50 border border-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-black text-gray-900 truncate leading-tight mb-1">{item.name}</p>
                                    <p className="text-xs font-bold text-gray-400">Qty: {item.quantity || 1} • ₹{item.price || 0}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Amount</span>
                        <span className="text-3xl font-black text-emerald-600">₹{remoteOrder?.totalAmount || order?.totalAmount || remoteOrder?.total || order?.total || remoteOrder?.subtotal || order?.subtotal || 0}</span>
                    </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <MapPin size={14} className="text-emerald-500" /> Delivery Details
                    </h3>
                    <div className="space-y-4">
                        <p className="text-xl font-black text-gray-900 leading-tight">{remoteOrder?.customerName || order?.customerName}</p>
                        <div className="flex items-start gap-3">
                            <MapPin size={18} className="text-gray-300 shrink-0 mt-1" />
                            <p className="text-sm text-gray-500 font-bold leading-relaxed">{remoteOrder?.address || order?.address}</p>
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <Phone size={18} className="text-gray-300" />
                            <p className="text-sm text-gray-900 font-black">{remoteOrder?.phone || order?.phone}</p>
                        </div>
                    </div>
                </div>

                {/* Feedback Section */}
                {(statusInfo.label === 'DELIVERED' || statusInfo.label === 'RETURNED') && (
                    <div className={`p-6 rounded-[2.5rem] border shadow-xl transition-all ${statusInfo.label === 'RETURNED' ? 'bg-red-50 border-red-100 shadow-red-100/20' : 'bg-white border-gray-100 shadow-gray-200/40'}`}>
                        {hasFeedback ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 size={32} />
                                </div>
                                <h4 className="text-xl font-black text-gray-900 mb-1">Feedback Submitted!</h4>
                                <p className="text-xs text-emerald-600/70 font-bold">Thank you for your response.</p>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h4 className="text-xl font-black text-gray-900 tracking-tight">{statusInfo.label === 'RETURNED' ? 'What went wrong?' : 'Rate your experience'}</h4>
                                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Your feedback helps us improve</p>
                                </div>
                                
                                {statusInfo.label === 'DELIVERED' && (
                                    <div className="flex justify-center gap-3 mb-8">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button 
                                                key={star} 
                                                onClick={() => setRating(star)} 
                                                className={`p-1 transition-all ${rating >= star ? 'text-yellow-400 scale-125' : 'text-gray-200'}`}
                                            >
                                                <Star size={32} fill={rating >= star ? "currentColor" : "none"} strokeWidth={2} />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder={statusInfo.label === 'RETURNED' ? "Reason for return..." : "Write a short review..."}
                                    className="w-full p-5 bg-gray-50 border border-gray-100 rounded-3xl min-h-[120px] outline-none focus:bg-white focus:border-blue-500 transition-all font-bold text-sm text-gray-800 mb-6"
                                />
                                
                                <button 
                                    onClick={submitFeedback}
                                    disabled={submitting || (statusInfo.label === 'RETURNED' && !comment.trim())}
                                    className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black active:scale-95 transition-all shadow-xl shadow-gray-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? 'Submitting...' : <><CheckCircle2 size={20} /> Send Feedback</>}
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Toast Overlay */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-10 left-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl z-[100] text-center"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
