import React, { useState } from 'react';
import axios from 'axios';
import { Package, Search, Clock, CheckCircle2, Truck, XCircle, MapPin, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import API_URL from './api';
import { getImageUrl } from './utils';

const STATUS_CONFIG = {
    'Pending':          { icon: Clock,         color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  label: 'Order Placed',       step: 1 },
    'Processing':       { icon: Package,        color: '#4361ee', bg: 'rgba(67,97,238,0.1)',   label: 'Processing',         step: 2 },
    'Out for Delivery': { icon: Truck,          color: '#f72585', bg: 'rgba(247,37,133,0.1)',  label: 'Out for Delivery',   step: 3 },
    'Delivered':        { icon: CheckCircle2,   color: '#10b981', bg: 'rgba(16,185,129,0.1)',  label: 'Delivered',          step: 4 },
    'Cancelled':        { icon: XCircle,        color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Cancelled',          step: 0 },
    'Returned':         { icon: XCircle,        color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   label: 'Returned',           step: 0 },
};

const TIMELINE_STEPS = [
    { key: 'Pending',          label: 'Order Placed',     icon: Package },
    { key: 'Processing',       label: 'Processing',       icon: Clock },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'Delivered',        label: 'Delivered',        icon: CheckCircle2 },
];

function OrderTimeline({ status }) {
    const cfg = STATUS_CONFIG[status];
    if (!cfg || cfg.step === 0) return null;
    const activeStep = cfg.step;

    return (
        <div className="flex items-center justify-between mt-4 mb-2 px-1">
            {TIMELINE_STEPS.map((s, i) => {
                const step = i + 1;
                const done = step <= activeStep;
                const Icon = s.icon;
                return (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-1">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                                style={{
                                    background: done ? 'linear-gradient(135deg,#f72585,#4361ee)' : '#f0f1f7',
                                    boxShadow: done ? '0 3px 10px rgba(247,37,133,0.35)' : 'none',
                                }}
                            >
                                <Icon size={14} className={done ? 'text-white' : 'text-gray-400'} strokeWidth={2.5} />
                            </div>
                            <span className={`text-[8px] font-bold text-center leading-tight max-w-[48px] ${done ? 'text-gray-700' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                            <div
                                className="flex-1 h-0.5 mx-1 rounded-full transition-all duration-300"
                                style={{ background: step < activeStep ? 'linear-gradient(90deg,#f72585,#4361ee)' : '#e5e7eb' }}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function OrderCard({ order, idx }) {
    const cfg = STATUS_CONFIG[order.status] || STATUS_CONFIG['Pending'];
    const Icon = cfg.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white rounded-[20px] overflow-hidden"
            style={{ boxShadow: '0 2px 16px rgba(67,97,238,0.1)' }}
        >
            {/* Order header */}
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: cfg.bg }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <Icon size={16} style={{ color: cfg.color }} strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Status</p>
                        <p className="text-sm font-extrabold text-gray-900">{order.status}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total</p>
                    <p className="text-sm font-extrabold" style={{ color: '#4361ee' }}>₹{order.totalAmount}</p>
                </div>
            </div>

            <div className="px-4 py-4">
                {/* Order meta */}
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Order ID</p>
                        <p className="text-xs font-mono font-bold text-gray-700">#{order._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
                        <p className="text-xs font-semibold text-gray-700">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </p>
                    </div>
                </div>

                {/* Timeline */}
                <OrderTimeline status={order.status} />

                {/* Items */}
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-[10px] flex-shrink-0 flex items-center justify-center p-1" style={{ background: '#f6f7fb' }}>
                                <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-contain mix-blend-multiply" loading="lazy" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-semibold text-gray-800 truncate">{item.name}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5 font-medium">Qty: {item.quantity} • ₹{item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment method */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-medium">Payment:</span>
                    <span className="text-[10px] font-bold text-gray-700">{order.paymentMethod || 'COD'}</span>
                </div>
            </div>
        </motion.div>
    );
}

export default function NativeTrack() {
    const [phone, setPhone]         = useState('');
    const [orders, setOrders]       = useState([]);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        const clean = phone.replace(/\D/g, '');
        if (clean.length !== 10) { setError('Please enter a valid 10-digit mobile number'); return; }
        setLoading(true);
        setError('');
        setOrders([]);
        try {
            const res = await axios.get(`${API_URL}/api/orders/track/${clean}`);
            setOrders(Array.isArray(res.data) ? res.data : []);
            setHasSearched(true);
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Could not fetch orders. Please try again.';
            setError(msg);
            setHasSearched(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-28" style={{ background: '#f0f1f7' }}>

            {/* Header */}
            <div
                className="px-4 pt-12 pb-6"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <MapPin size={18} style={{ color: '#f72585' }} />
                    <h1 className="text-2xl font-black text-white">Track Order</h1>
                </div>
                <p className="text-white/50 text-xs font-medium mb-5">Enter your phone number to see live updates</p>

                <form onSubmit={handleTrack} className="flex gap-2">
                    <div
                        className="flex items-center flex-1 rounded-[14px] overflow-hidden"
                        style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)' }}
                    >
                        <span className="pl-3.5 pr-2 text-white/60 font-bold text-sm">+91</span>
                        <div className="w-px h-5 bg-white/20" />
                        <input
                            type="tel"
                            maxLength="10"
                            inputMode="numeric"
                            placeholder="Mobile Number"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            className="flex-1 h-12 px-3 bg-transparent text-white text-sm font-semibold outline-none placeholder-white/30"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="h-12 px-5 rounded-[14px] font-bold text-white flex items-center justify-center gap-1.5 active:scale-95 transition-transform disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg,#f72585,#4361ee)', boxShadow: '0 4px 16px rgba(247,37,133,0.4)' }}
                    >
                        {loading
                            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            : <><Search size={16} /> <span className="text-sm">Track</span></>
                        }
                    </button>
                </form>

                {error && (
                    <div className="mt-3 flex items-center gap-2 bg-red-500/15 border border-red-500/25 rounded-[10px] px-3 py-2.5">
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-red-300 text-xs font-semibold">{error}</p>
                    </div>
                )}
            </div>

            {/* Results */}
            <div className="px-3 py-4 space-y-3">
                {hasSearched && !loading && orders.length === 0 && !error && (
                    <div className="flex flex-col items-center py-14 text-center">
                        <div className="text-5xl mb-4">📦</div>
                        <h3 className="font-extrabold text-gray-700 text-base mb-1">No Orders Found</h3>
                        <p className="text-gray-400 text-sm max-w-xs">No active orders linked to this number. Double-check and try again.</p>
                    </div>
                )}

                {!hasSearched && !loading && (
                    <div className="flex flex-col items-center py-14 text-center">
                        <div className="text-5xl mb-4">🔍</div>
                        <h3 className="font-bold text-gray-600 text-sm">Enter your phone number above to track your orders</h3>
                    </div>
                )}

                {orders.map((order, idx) => (
                    <OrderCard key={order._id} order={order} idx={idx} />
                ))}
            </div>
        </div>
    );
}
