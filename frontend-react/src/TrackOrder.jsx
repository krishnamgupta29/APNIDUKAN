import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, CheckCircle2, ShoppingBag, Star, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API_URL from './api';
import { getImageUrl } from './utils';

export default function TrackOrder() {
    const navigate = useNavigate();
    const [localOrders, setLocalOrders] = useState([]);
    const [ordersData, setOrdersData] = useState({});

    // ─── Helpers ────────────────────────────────────────────────────────────
    const formatId = (id) => {
        if (!id) return '';
        const clean = String(id).replace(/[#]/g, '').replace(/ORD/gi, '').trim();
        return `#ORD${clean}`;
    };

    const getPrice = (remote, local) => {
        const amt = remote?.totalAmount || local?.totalAmount || remote?.total || local?.total || 0;
        if (amt > 0) return amt;
        const items = remote?.items || local?.items || [];
        return items.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    };

    const getStatusInfo = (orderId, localStatus) => {
        const remote = ordersData[orderId];
        const status = (remote?.status || localStatus || 'ordered').toLowerCase();
        switch (status) {
            case 'pending':
            case 'ordered':   return { step: 1, label: 'ORDERED',   text: 'text-blue-600',    dot: 'bg-blue-500' };
            case 'assigned':
            case 'confirmed': return { step: 2, label: 'CONFIRMED', text: 'text-yellow-600',  dot: 'bg-yellow-500' };
            case 'delivered': return { step: 3, label: 'DELIVERED', text: 'text-emerald-600', dot: 'bg-emerald-500' };
            case 'returned':
            case 'rejected':
            case 'return':    return { step: 3, label: 'RETURNED',  text: 'text-red-600',     dot: 'bg-red-500' };
            default:          return { step: 1, label: 'ORDERED',   text: 'text-blue-600',    dot: 'bg-blue-500' };
        }
    };

    // ─── Sync ────────────────────────────────────────────────────────────────
    const syncOrders = async (orders) => {
        try {
            const orderIds = orders.map(o => o.orderId || o._id);
            const { data } = await axios.post(`${API_URL}/api/orders/sync`, { orderIds });
            const dataMap = { ...ordersData };
            const updatedLocal = [...orders];
            let changed = false;

            data.forEach(remote => {
                dataMap[remote._id] = remote;
                const idx = updatedLocal.findIndex(lo => lo._id === remote._id);
                if (idx !== -1) {
                    const local = updatedLocal[idx];
                    const update = { ...local };
                    let dirty = false;
                    if (remote.status && local.status !== remote.status)      { update.status = remote.status; dirty = true; }
                    if (remote.feedbackGiven && !local.feedbackGiven)          { update.feedbackGiven = true;   dirty = true; }
                    if (remote.totalAmount && !local.totalAmount)              { update.totalAmount = remote.totalAmount; dirty = true; }
                    if (remote.items?.length && !local.items?.length)          { update.items = remote.items;   dirty = true; }
                    if (dirty) { updatedLocal[idx] = update; changed = true; }
                }
            });

            if (changed) {
                setLocalOrders(updatedLocal);
                localStorage.setItem('apni_order_history', JSON.stringify(updatedLocal));
            }
            setOrdersData(dataMap);
        } catch (err) {
            console.error('Sync failed', err);
        }
    };

    // ─── Load & Migration ─────────────────────────────────────────────────────
    useEffect(() => {
        try {
            const oldOrders  = JSON.parse(localStorage.getItem('my_orders') || '[]');
            const newOrders  = JSON.parse(localStorage.getItem('apni_order_history') || '[]');
            const mergedMap  = {};
            [...newOrders, ...oldOrders].forEach(o => {
                const key = o._id || o.orderId;
                if (key) mergedMap[key] = { ...(mergedMap[key] || {}), ...o };
            });

            // Repair corrupt ₹0 orders by calculating from items
            const finalOrders = Object.values(mergedMap).map(o => {
                if ((!o.totalAmount || o.totalAmount === 0) && o.items?.length) {
                    return { ...o, totalAmount: o.items.reduce((s, i) => s + ((i.price || 0) * (i.quantity || 1)), 0) };
                }
                return o;
            });

            if (oldOrders.length > 0) localStorage.removeItem('my_orders');
            localStorage.setItem('apni_order_history', JSON.stringify(finalOrders));
            setLocalOrders(finalOrders);

            if (finalOrders.length > 0) {
                syncOrders(finalOrders);
                const iv = setInterval(() => syncOrders(finalOrders), 10000);
                return () => clearInterval(iv);
            }
        } catch (e) {
            console.error('Load failed', e);
            setLocalOrders([]);
        }
    }, []);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f8fafc] pb-16">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-6 pt-10 pb-6 sticky top-0 z-40 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My Orders</h1>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Local Purchase History</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-2">
                        <ShoppingBag size={16} className="text-emerald-500" />
                        <span className="text-sm font-black text-gray-900">{localOrders.length} Orders</span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 pt-6">
                {localOrders.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[2.5rem] p-16 text-center border border-gray-100 shadow-xl mt-4 max-w-2xl mx-auto"
                    >
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Package size={48} className="text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-400 font-medium text-sm max-w-xs mx-auto">
                            Your purchase history is saved locally on this device.
                        </p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-6">
                        {localOrders
                            .slice()
                            .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
                            .map((order, i) => {
                                const statusInfo  = getStatusInfo(order._id, order.status);
                                const remote      = ordersData[order._id];
                                const items       = remote?.items || order.items || [];
                                const mainItem    = items[0];
                                const hasFeedback = remote?.feedbackGiven || order.feedbackGiven;
                                const price       = getPrice(remote, order);
                                const dateStr     = new Date(order.createdAt || order.date || Date.now())
                                    .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

                                return (
                                    <motion.div
                                        key={order._id}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        whileHover={{ scale: 1.005 }}
                                        whileTap={{ scale: 0.99 }}
                                        onClick={() => navigate(`/order/${order._id}`)}
                                        className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer p-4 flex items-center gap-4"
                                    >
                                        {/* Thumbnail */}
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shrink-0">
                                            <img
                                                src={getImageUrl(mainItem?.image)}
                                                className="w-full h-full object-cover"
                                                alt={mainItem?.name}
                                            />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            {/* Status + ID row */}
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-2 h-2 rounded-full ${statusInfo.dot} ${statusInfo.label !== 'DELIVERED' && statusInfo.label !== 'RETURNED' ? 'animate-pulse' : ''}`} />
                                                <p className={`text-[11px] font-black uppercase ${statusInfo.text}`}>{statusInfo.label}</p>
                                                <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200 uppercase">
                                                    {formatId(remote?.orderId || order.orderId || order._id?.slice(-6))}
                                                </span>
                                            </div>

                                            {/* Product name */}
                                            <h3 className="text-[15px] font-black text-gray-900 truncate mb-2 leading-none">
                                                {mainItem?.name || 'Order Items'}
                                            </h3>

                                            {/* Price + date + badge */}
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="text-emerald-700 font-black text-sm bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                                                    ₹{price}
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-bold">{dateStr}</span>

                                                {(statusInfo.label === 'DELIVERED' || statusInfo.label === 'RETURNED') && !hasFeedback && (
                                                    <span className="px-3 py-1 bg-gray-900 text-white text-[10px] font-black rounded-xl flex items-center gap-1">
                                                        <Star size={10} fill="currentColor" /> Rate Order
                                                    </span>
                                                )}

                                                {hasFeedback && (
                                                    <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 text-[10px] font-black">
                                                        <CheckCircle2 size={11} /> Reviewed
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="shrink-0 text-gray-300">
                                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path d="M9 18l6-6-6-6" />
                                            </svg>
                                        </div>
                                    </motion.div>
                                );
                            })}
                    </div>
                )}
            </div>
        </div>
    );
}
