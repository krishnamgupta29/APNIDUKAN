import React, { useState } from 'react';
import axios from 'axios';
import { Package, Search, Clock, CheckCircle2, Truck, XCircle, MapPin, AlertCircle, Star } from 'lucide-react';
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
    const [reviewOrder, setReviewOrder] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isHovered, setIsHovered] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [localHistory, setLocalHistory] = useState([]);

    // Load local history on mount
    React.useEffect(() => {
        try {
            const h = JSON.parse(localStorage.getItem('apni_order_history') || '[]');
            setLocalHistory(Array.isArray(h) ? h : []);
        } catch(e) {
            console.error("Failed to load history", e);
        }
    }, []);

    const handleTrack = async (e) => {
        if (e) e.preventDefault();
        const clean = phone.replace(/\D/g, '');
        if (clean.length !== 10) { setError('Please enter a valid 10-digit mobile number'); return; }
        
        setLoading(true);
        setError('');
        
        // Start with local matches
        const localMatches = localHistory.filter(o => o.phone === clean);
        setOrders(localMatches);
        setHasSearched(true);

        try {
            const res = await axios.get(`${API_URL}/api/orders/track/${clean}`);
            const apiOrders = Array.isArray(res.data) ? res.data : [];
            
            // Merge & Deduplicate (API orders take precedence for status updates)
            setOrders(prev => {
                const map = new Map();
                // Add local ones first
                prev.forEach(o => map.set(o._id, o));
                // API ones overwrite if exists
                apiOrders.forEach(o => map.set(o._id, o));
                return Array.from(map.values()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            });
        } catch (err) {
            // If local matches exist, don't show error as "Could not fetch"
            if (localMatches.length === 0) {
                const msg = err.response?.data?.message || err.response?.data?.error || 'Could not fetch orders. Please try again.';
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const submitFeedback = async () => {
        if(rating === 0) { alert("Please select stars ⭐"); return; }
        const order = orders.find(o => o._id === reviewOrder);
        const orderStatus = order?.status?.toUpperCase();
        if(orderStatus === 'RETURNED' && !comment.trim()) { alert("Please provide a reason for return!"); return; }

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/orders/${reviewOrder}/feedback`, { rating, comment });
            setToast(orderStatus === 'RETURNED' ? "Reason submitted!" : "Thanks for your feedback!");
            setReviewOrder(null);
            setTimeout(()=>setToast(null), 3000);
            handleTrack(); // refresh
        } catch(e) { 
            alert("Failed to submit. Try again."); 
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-40" style={{ background: '#f0f1f7' }}>
            
            {/* Toast Notifications */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0}} 
                        className="fixed bottom-24 left-4 right-4 z-[100] bg-gray-900 text-white px-6 py-4 rounded-2xl font-bold shadow-2xl flex items-center justify-between"
                    >
                        <span>{toast}</span>
                        <CheckCircle2 size={18} className="text-emerald-400" />
                    </motion.div>
                )}
            </AnimatePresence>

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
            <div className="px-3 py-4 space-y-4">
                {/* Recent Orders (Quick Track) */}
                {!hasSearched && localHistory.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Recent Orders</h3>
                            <button onClick={() => { if(window.confirm("Clear all recent orders?")) { localStorage.removeItem('apni_order_history'); setLocalHistory([]); } }} className="text-[10px] font-black text-red-400 uppercase tracking-widest opacity-50">Clear All</button>
                        </div>
                        <div className="space-y-3">
                            {localHistory.map((o) => (
                                <button 
                                    key={o._id}
                                    onClick={() => { setPhone(o.phone); handleTrack(); }}
                                    className="w-full bg-white p-4 rounded-[22px] border border-gray-100 shadow-sm flex items-center justify-between active:bg-gray-50 transition-all"
                                >
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                            <Package size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-black text-gray-900 truncate">Order #{o._id?.slice(-6).toUpperCase()}</p>
                                            <p className="text-[10px] font-bold text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase">Track Now</span>
                                        <ChevronRight size={14} className="text-gray-300" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {hasSearched && !loading && orders.length === 0 && !error && (
                    <div className="flex flex-col items-center py-14 text-center">
                        <div className="text-5xl mb-4">📦</div>
                        <h3 className="font-extrabold text-gray-700 text-base mb-1">No Orders Found</h3>
                        <p className="text-gray-400 text-sm max-w-xs">No active orders linked to this number.</p>
                    </div>
                )}

                {!hasSearched && !loading && localHistory.length === 0 && (
                    <div className="flex flex-col items-center py-20 text-center opacity-50">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
                            <Search size={24} className="text-gray-300" />
                        </div>
                        <h3 className="font-black text-gray-400 text-[10px] uppercase tracking-widest">Enter Phone to Track</h3>
                        <p className="text-gray-300 text-[11px] font-bold mt-2">Check live updates of your orders</p>
                    </div>
                )}

                {orders.map((order, idx) => (
                    <div key={order._id}>
                        <OrderCard order={order} idx={idx} />
                        {(order.status?.toUpperCase() === 'DELIVERED' || order.status?.toUpperCase() === 'RETURNED') && !order.feedbackGiven && (
                            <button 
                                onClick={() => { setReviewOrder(order._id); setRating(0); setComment(''); setIsHovered(0); }}
                                className="w-full mt-3 py-3.5 rounded-[18px] font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-sm"
                                style={order.status?.toUpperCase() === 'RETURNED' 
                                    ? { background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1.5px dashed rgba(245,158,11,0.3)' } 
                                    : { background: 'rgba(67,97,238,0.1)', color: '#4361ee', border: '1.5px dashed rgba(67,97,238,0.3)' }
                                }
                            >
                                {order.status?.toUpperCase() === 'RETURNED' ? 'Submit Return Feedback 📝' : 'Rate Your Delivery ⭐'}
                            </button>
                        )}
                        {order.feedbackGiven && (
                            <div className="w-full mt-3 py-3 rounded-[18px] bg-white border border-gray-100 text-center flex items-center justify-center gap-2">
                                <CheckCircle2 size={14} className="text-emerald-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Feedback Submitted</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Feedback Modal */}
            <AnimatePresence>
                {reviewOrder && (
                    <motion.div 
                        initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                        className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{y:100, opacity:0}} animate={{y:0, opacity:1}} exit={{y:100, opacity:0}}
                            className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl relative"
                        >
                            <div className="p-6 pt-8 text-center">
                                <button 
                                    onClick={() => setReviewOrder(null)}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-gray-50 text-gray-400 active:bg-gray-100"
                                >
                                    <XCircle size={20} />
                                </button>

                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Clock size={32} className="text-blue-500" />
                                </div>

                                <h3 className="text-xl font-black text-gray-900 mb-1">
                                    {orders.find(o => o._id === reviewOrder)?.status?.toUpperCase() === 'RETURNED' ? 'Return Reason' : 'Rate Experience'}
                                </h3>
                                <p className="text-gray-400 text-xs font-medium mb-6 px-8">
                                    How was your experience with this order? Your feedback helps us improve.
                                </p>

                                {/* Stars */}
                                <div className="flex justify-center gap-2 mb-6">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setIsHovered(star)}
                                            onMouseLeave={() => setIsHovered(0)}
                                            className={`w-12 h-12 flex items-center justify-center transition-all duration-200 active:scale-90
                                                ${(rating > 0 ? star <= rating : star <= isHovered) ? 'text-[#f59e0b] scale-110' : 'text-gray-200'}
                                            `}
                                        >
                                            <div className="relative">
                                                <StarIcon size={36} fill={(rating > 0 ? star <= rating : star <= isHovered) ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                                {(rating > 0 ? star <= rating : star <= isHovered) && (
                                                    <motion.div 
                                                        layoutId="star-glow"
                                                        className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full"
                                                    />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <textarea 
                                    value={comment} onChange={e => setComment(e.target.value)}
                                    placeholder={orders.find(o => o._id === reviewOrder)?.status?.toUpperCase() === 'RETURNED' ? "Why did you return this? (Required)" : "Anything else you'd like to share? (Optional)"}
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-4 text-sm font-bold outline-none focus:bg-white focus:border-gray-200 transition-all resize-none mb-6"
                                    rows="3"
                                />

                                <button 
                                    onClick={submitFeedback}
                                    disabled={isSubmitting}
                                    className="w-full py-4 rounded-[18px] font-black text-white shadow-xl active:scale-95 disabled:opacity-50 transition-all"
                                    style={{ background: 'linear-gradient(135deg,#f72585,#4361ee)', boxShadow: '0 8px 24px rgba(247,37,133,0.3)' }}
                                >
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

// Internal icons helper
function StarIcon({ size, fill, strokeWidth, ...props }) {
    return (
        <svg 
            width={size} height={size} viewBox="0 0 24 24" fill={fill} 
            stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" 
            {...props}
        >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
    );
}
