import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Package, Clock, CheckCircle2, Truck, XCircle, MapPin, 
    AlertCircle, Star, ChevronDown, ChevronUp, History, 
    CreditCard, Calendar, ShoppingBag, ArrowRight, MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from './api';
import { getImageUrl, LocalOrderStore } from './utils';

const STATUS_MAPPING = {
    'NEW': 'ORDERED',
    'PENDING': 'ORDERED',
    'ASSIGNED': 'CONFIRMED',
    'DELIVERED': 'DELIVERED',
    'RETURNED': 'RETURNED'
};

const STATUS_CONFIG = {
    'ORDERED':   { icon: Clock,         color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7', label: 'Order Placed',   step: 1 },
    'CONFIRMED': { icon: Package,       color: '#4361ee', bg: '#eef2ff', border: '#e0e7ff', label: 'Confirmed',      step: 2 },
    'DELIVERED': { icon: CheckCircle2,  color: '#10b981', bg: '#ecfdf5', border: '#d1fae5', label: 'Delivered',      step: 3 },
    'RETURNED':  { icon: XCircle,       color: '#ef4444', bg: '#fef2f2', border: '#fee2e2', label: 'Returned',       step: 4 },
};

const TIMELINE_STEPS = [
    { key: 'ORDERED',   label: 'Ordered',   icon: Clock },
    { key: 'CONFIRMED', label: 'Confirmed', icon: Package },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
];

function OrderTimeline({ status }) {
    const activeStep = STATUS_CONFIG[status]?.step || 1;
    const isReturned = status === 'RETURNED';

    if (isReturned) {
        return (
            <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3 my-4">
                <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-200">
                    <XCircle size={20} strokeWidth={3} />
                </div>
                <div>
                    <p className="text-sm font-black text-red-600">Order Returned</p>
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">We have received your return request</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between mt-6 mb-4 px-2">
            {TIMELINE_STEPS.map((s, i) => {
                const step = i + 1;
                const isDone = step <= activeStep;
                const isCurrent = step === activeStep;
                const Icon = s.icon;
                
                return (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-2 relative">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.1 : 1,
                                    backgroundColor: isDone ? STATUS_CONFIG[s.key].color : '#f3f4f6'
                                }}
                                className="w-10 h-10 rounded-2xl flex items-center justify-center relative z-10 shadow-sm"
                            >
                                <Icon size={18} className={isDone ? 'text-white' : 'text-gray-400'} strokeWidth={2.5} />
                                {isCurrent && (
                                    <motion.div 
                                        layoutId="glow"
                                        className="absolute inset-0 rounded-2xl blur-md"
                                        style={{ backgroundColor: STATUS_CONFIG[s.key].color, opacity: 0.3 }}
                                    />
                                )}
                            </motion.div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                            <div className="flex-1 h-0.5 bg-gray-100 mx-2 -mt-6">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: isDone && step < activeStep ? '100%' : '0%' }}
                                    className="h-full bg-gray-900"
                                />
                            </div>
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );
}

function ExpandableOrderCard({ order, isExpanded, onToggle, onReview }) {
    const rawStatus = order.status?.toUpperCase() || 'ORDERED';
    const statusKey = STATUS_MAPPING[rawStatus] || rawStatus;
    const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG['ORDERED'];
    const Icon = cfg.icon;

    return (
        <motion.div 
            layout
            className="bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/50 mb-4"
        >
            {/* Compact Header */}
            <div 
                onClick={onToggle}
                className="p-5 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-4">
                    <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-black text-gray-900">#{order.orderId?.slice(-6).toUpperCase()}</h3>
                            <span 
                                className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest"
                                style={{ backgroundColor: cfg.bg, color: cfg.color }}
                            >
                                {order.status}
                            </span>
                        </div>
                        <p className="text-[11px] font-bold text-gray-400">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} • ₹{order.totalAmount}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {order.feedbackGiven && (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 size={14} />
                        </div>
                    )}
                    {isExpanded ? <ChevronUp size={20} className="text-gray-300" /> : <ChevronDown size={20} className="text-gray-300" />}
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-50 overflow-hidden"
                    >
                        <div className="p-6 pt-2">
                            {/* Timeline */}
                            <OrderTimeline status={statusKey} />

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 mt-8">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                                        <MapPin size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Delivery Address</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-700 leading-relaxed line-clamp-2">
                                        {order.address}
                                    </p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2 text-gray-400">
                                        <CreditCard size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Payment Method</span>
                                    </div>
                                    <p className="text-[11px] font-bold text-gray-700">
                                        {order.paymentMethod || 'Cash on Delivery'}
                                    </p>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="mt-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Order Items</h4>
                                <div className="space-y-3">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-50 shadow-sm shadow-gray-200/20">
                                            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center overflow-hidden">
                                                <img src={getImageUrl(item.image)} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-gray-900 truncate">{item.name}</p>
                                                <p className="text-[10px] font-bold text-gray-400">Qty: {item.quantity} • ₹{item.price}</p>
                                            </div>
                                            <div className="text-[11px] font-black text-gray-900 pr-2">
                                                ₹{item.price * item.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="mt-6 p-4 rounded-2xl border-2 border-dashed border-gray-100 space-y-2">
                                <div className="flex justify-between items-center text-[11px] font-bold text-gray-400">
                                    <span>Subtotal</span>
                                    <span>₹{order.totalAmount - (order.deliveryTotal || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center text-[11px] font-bold text-emerald-500">
                                    <span>Delivery Fee</span>
                                    <span>{order.deliveryTotal > 0 ? `+ ₹${order.deliveryTotal}` : 'FREE'}</span>
                                </div>
                                <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
                                    <span className="text-sm font-black text-gray-900 uppercase tracking-widest">Total Amount</span>
                                    <span className="text-lg font-black text-gray-900">₹{order.totalAmount}</span>
                                </div>
                            </div>

                            {/* Feedback Section */}
                            {(statusKey === 'DELIVERED' || statusKey === 'RETURNED') && (
                                <div className="mt-8">
                                    {!order.feedbackGiven ? (
                                        <button 
                                            onClick={() => onReview(order)}
                                            className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-500/10"
                                            style={{ background: 'linear-gradient(135deg,#4361ee,#7209b7)', color: 'white' }}
                                        >
                                            <Star size={18} /> {statusKey === 'RETURNED' ? 'Submit Return Reason' : 'Rate Your Delivery'}
                                        </button>
                                    ) : (
                                        <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-100">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                                                    <MessageSquare size={20} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-emerald-900">Feedback Submitted</h4>
                                                    <div className="flex gap-0.5 mt-1">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} size={12} fill={i < (order.feedback?.rating || 5) ? '#10b981' : 'none'} className={i < (order.feedback?.rating || 5) ? 'text-emerald-500' : 'text-emerald-200'} />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            {order.feedback?.comment && (
                                                <p className="text-[11px] font-bold text-emerald-700 italic bg-white/50 p-3 rounded-xl border border-emerald-100">
                                                    "{order.feedback.comment}"
                                                </p>
                                            )}
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
}

export default function NativeTrack() {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [reviewOrder, setReviewOrder] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isHovered, setIsHovered] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    // Initial load from LocalStore
    useEffect(() => {
        const local = LocalOrderStore.getOrders();
        setOrders(local);
        
        // If there's a saved phone, auto-sync
        const saved = JSON.parse(localStorage.getItem('apnidukan_user_details') || '{}');
        if (saved.phone) {
            setPhone(saved.phone);
            syncOrders(saved.phone);
        }
    }, []);

    const syncOrders = async (targetPhone) => {
        if (!targetPhone) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/orders/user/${targetPhone}`);
            const apiOrders = res.data;
            
            // Merge & Update Local Store
            const local = LocalOrderStore.getOrders();
            const map = new Map();
            local.forEach(o => map.set(o._id, o));
            apiOrders.forEach(o => {
                const existing = map.get(o._id);
                // Update status and feedback if changed
                if (existing) {
                    LocalOrderStore.updateOrderStatus(o._id, o.status, o.feedbackGiven ? o.feedback : null);
                } else {
                    LocalOrderStore.saveOrder({
                        ...o,
                        totalAmount: o.total, // Normalize field names
                        paymentMethod: 'COD'
                    });
                }
            });
            
            setOrders(LocalOrderStore.getOrders());
        } catch (e) {
            console.error("Sync failed", e);
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = (e) => {
        if (e) e.preventDefault();
        const clean = phone.replace(/\D/g, '');
        if (clean.length !== 10) { setError('Invalid phone number'); return; }
        setError('');
        syncOrders(clean);
    };

    const submitFeedback = async () => {
        const status = reviewOrder.status?.toUpperCase();
        if (status === 'DELIVERED' && rating === 0) { alert("Please select stars ⭐"); return; }
        if (status === 'RETURNED' && !comment.trim()) { alert("Please provide a reason!"); return; }

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/orders/${reviewOrder._id}/feedback`, { rating, comment });
            LocalOrderStore.updateOrderStatus(reviewOrder._id, status, { rating, comment, submittedAt: new Date() });
            setToast("Feedback submitted successfully! ✨");
            setReviewOrder(null);
            setOrders(LocalOrderStore.getOrders());
            setTimeout(() => setToast(null), 3000);
        } catch (e) {
            alert("Failed to submit. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen pb-40" style={{ background: '#f8f9fd' }}>
            {/* Header */}
            <div 
                className="px-6 pt-16 pb-12 rounded-b-[48px] shadow-2xl shadow-blue-900/10"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)' }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <History size={24} className="text-[#f72585]" />
                    <h1 className="text-3xl font-black text-white tracking-tight">Order History</h1>
                </div>
                <p className="text-white/50 text-sm font-medium mb-8">All your orders are stored locally for fast access</p>

                <form onSubmit={handleTrack} className="flex gap-2">
                    <div className="flex-1 h-14 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center px-4">
                        <span className="text-white/40 font-black mr-2">+91</span>
                        <input 
                            type="tel" maxLength="10" placeholder="Sync your orders..."
                            className="bg-transparent border-none outline-none text-white font-bold text-sm w-full placeholder:text-white/20"
                            value={phone} onChange={e => setPhone(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" disabled={loading}
                        className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#240046] shadow-xl active:scale-90 transition-all disabled:opacity-50"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-gray-200 border-t-[#240046] rounded-full animate-spin" /> : <History size={20} />}
                    </button>
                </form>
            </div>

            {/* Orders List */}
            <div className="px-5 -mt-6">
                {orders.length === 0 ? (
                    <div className="py-20 text-center flex flex-col items-center">
                        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl shadow-gray-200/50 mb-6">
                            <ShoppingBag size={32} className="text-gray-200" />
                        </div>
                        <h3 className="text-lg font-black text-gray-900 mb-1">No Orders Yet</h3>
                        <p className="text-gray-400 text-xs font-medium max-w-[200px]">Once you place an order, it will automatically appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        <div className="flex items-center justify-between mb-4 px-2">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Local History</h4>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{orders.length} Orders</span>
                        </div>
                        {orders.map((order) => (
                            <ExpandableOrderCard 
                                key={order._id}
                                order={order}
                                isExpanded={expandedOrder === order._id}
                                onToggle={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                onReview={(o) => { setReviewOrder(o); setRating(0); setComment(''); }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
                        className="fixed bottom-10 left-6 right-6 z-[100] bg-gray-900 text-white p-5 rounded-[24px] shadow-2xl flex items-center justify-between font-black text-xs"
                    >
                        {toast}
                        <CheckCircle2 size={18} className="text-emerald-400" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Sheet */}
            <AnimatePresence>
                {reviewOrder && (
                    <div className="fixed inset-0 z-[150] flex items-end justify-center">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setReviewOrder(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="bg-white w-full max-w-md rounded-t-[40px] relative z-10 p-8 pt-10"
                        >
                            <div className="w-12 h-1.5 bg-gray-100 rounded-full mx-auto mb-8" />
                            
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">
                                    {reviewOrder.status?.toUpperCase() === 'RETURNED' ? 'Return Feedback' : 'Rate Your Delivery'}
                                </h3>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                    {reviewOrder.status?.toUpperCase() === 'RETURNED' 
                                        ? 'Please tell us the reason for returning your order' 
                                        : 'How would you rate your experience with this order?'}
                                </p>
                            </div>

                            {reviewOrder.status?.toUpperCase() === 'DELIVERED' && (
                                <div className="flex justify-center gap-3 mb-10">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button 
                                            key={s} onClick={() => setRating(s)}
                                            onMouseEnter={() => setIsHovered(s)} onMouseLeave={() => setIsHovered(0)}
                                            className="relative transition-all active:scale-90"
                                        >
                                            <Star 
                                                size={42} 
                                                fill={(rating || isHovered) >= s ? '#f59e0b' : 'none'} 
                                                className={(rating || isHovered) >= s ? 'text-[#f59e0b]' : 'text-gray-100'} 
                                                strokeWidth={2.5}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <textarea 
                                className="w-full h-32 bg-gray-50 rounded-[32px] p-6 text-sm font-bold outline-none border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all resize-none mb-8"
                                placeholder={reviewOrder.status?.toUpperCase() === 'RETURNED' ? "Write your reason here (Required)..." : "Anything else you'd like to share? (Optional)"}
                                value={comment} onChange={e => setComment(e.target.value)}
                            />

                            <button 
                                onClick={submitFeedback} disabled={isSubmitting}
                                className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-gray-900/40 active:scale-[0.98] transition-all disabled:opacity-50 mb-4"
                            >
                                {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
