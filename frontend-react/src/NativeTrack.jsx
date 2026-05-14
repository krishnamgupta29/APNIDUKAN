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
        navigate(`/order/${orderId}`);
    };

    useEffect(() => {
        try {
            // Migration: Move orders from 'my_orders' to 'apni_order_history' for persistence
            const oldOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
            const newOrders = JSON.parse(localStorage.getItem('apni_order_history') || '[]');
            
            // Merge unique orders
            const mergedMap = {};
            [...newOrders, ...oldOrders].forEach(o => {
                if (o._id) mergedMap[o._id] = { ...mergedMap[o._id], ...o };
            });
            const finalOrders = Object.values(mergedMap);
            
            if (oldOrders.length > 0) {
                localStorage.setItem('apni_order_history', JSON.stringify(finalOrders));
                localStorage.removeItem('my_orders'); // Clean up old key
            }

            setLocalOrders(finalOrders);
            if (finalOrders.length > 0) {
                syncOrders(finalOrders);
                const interval = setInterval(() => syncOrders(finalOrders), 10000);
                return () => clearInterval(interval);
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
