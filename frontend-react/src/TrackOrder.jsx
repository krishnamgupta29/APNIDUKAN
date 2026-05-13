import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Package, Clock, CheckCircle2, Truck, XCircle, MapPin, 
    AlertCircle, Star, ChevronDown, ChevronUp, History, 
    CreditCard, ShoppingBag, ArrowRight, MessageSquare, Search
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
            <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center gap-4 my-6">
                <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-200">
                    <XCircle size={24} strokeWidth={3} />
                </div>
                <div>
                    <p className="text-base font-black text-red-600">Order Returned</p>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-widest">Your order has been marked as returned</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between mt-8 mb-6 px-4">
            {TIMELINE_STEPS.map((s, i) => {
                const step = i + 1;
                const isDone = step <= activeStep;
                const isCurrent = step === activeStep;
                const Icon = s.icon;
                
                return (
                    <React.Fragment key={s.key}>
                        <div className="flex flex-col items-center gap-3 relative">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.15 : 1,
                                    backgroundColor: isDone ? STATUS_CONFIG[s.key].color : '#f3f4f6'
                                }}
                                className="w-12 h-12 rounded-2xl flex items-center justify-center relative z-10 shadow-sm"
                            >
                                <Icon size={20} className={isDone ? 'text-white' : 'text-gray-400'} strokeWidth={2.5} />
                                {isCurrent && (
                                    <motion.div 
                                        layoutId="glow-desktop"
                                        className="absolute inset-0 rounded-2xl blur-lg"
                                        style={{ backgroundColor: STATUS_CONFIG[s.key].color, opacity: 0.3 }}
                                    />
                                )}
                            </motion.div>
                            <span className={`text-[11px] font-black uppercase tracking-widest ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                                {s.label}
                            </span>
                        </div>
                        {i < TIMELINE_STEPS.length - 1 && (
                            <div className="flex-1 h-1 bg-gray-100 mx-4 -mt-8">
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
            className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/40 mb-6"
        >
            {/* Header */}
            <div 
                onClick={onToggle}
                className="p-8 flex flex-col md:flex-row md:items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors gap-6"
            >
                <div className="flex items-center gap-6">
                    <div 
                        className="w-16 h-16 rounded-3xl flex items-center justify-center"
                        style={{ backgroundColor: cfg.bg, color: cfg.color }}
                    >
                        <Icon size={32} strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="text-xl font-black text-gray-900">Order #{order.orderId?.toUpperCase()}</h3>
                            <span 
                                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                                style={{ backgroundColor: cfg.bg, color: cfg.color }}
                            >
                                {order.status}
                            </span>
                        </div>
                        <p className="text-sm font-bold text-gray-400">
                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • Total ₹{order.totalAmount}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    {order.feedbackGiven && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                            <CheckCircle2 size={16} /> Feedback Given
                        </div>
                    )}
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300">
                        {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                    </div>
                </div>
            </div>

            {/* Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-50 overflow-hidden"
                    >
                        <div className="p-8 pt-4">
                            <div className="flex flex-col lg:flex-row gap-12">
                                {/* Left Side: Timeline & Details */}
                                <div className="flex-1">
                                    <OrderTimeline status={statusKey} />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                                        <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                            <div className="flex items-center gap-3 mb-4 text-gray-400">
                                                <MapPin size={18} />
                                                <span className="text-xs font-black uppercase tracking-[0.2em]">Delivery Address</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-700 leading-relaxed">
                                                {order.address}
                                            </p>
                                        </div>
                                        <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100">
                                            <div className="flex items-center gap-3 mb-4 text-gray-400">
                                                <CreditCard size={18} />
                                                <span className="text-xs font-black uppercase tracking-[0.2em]">Payment Mode</span>
                                            </div>
                                            <p className="text-sm font-bold text-gray-700">
                                                {order.paymentMethod || 'Cash on Delivery'}
                                            </p>
                                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">Verified & Secure</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Items & Summary */}
                                <div className="w-full lg:w-[380px] space-y-6">
                                    <div className="p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Order Items</h4>
                                        <div className="space-y-4 mb-8">
                                            {order.items.map((item, i) => (
                                                <div key={i} className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center p-2">
                                                        <img src={getImageUrl(item.image)} className="w-full h-full object-contain mix-blend-multiply" alt="" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-gray-900 truncate">{item.name}</p>
                                                        <p className="text-xs font-bold text-gray-400">x{item.quantity} • ₹{item.price}</p>
                                                    </div>
                                                    <div className="text-sm font-black text-gray-900">₹{item.price * item.quantity}</div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="pt-6 border-t border-gray-100 space-y-3">
                                            <div className="flex justify-between text-sm font-bold text-gray-400">
                                                <span>Subtotal</span>
                                                <span>₹{order.totalAmount - (order.deliveryTotal || 0)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm font-bold text-emerald-500">
                                                <span>Delivery</span>
                                                <span>{order.deliveryTotal > 0 ? `+ ₹${order.deliveryTotal}` : 'FREE'}</span>
                                            </div>
                                            <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-50">
                                                <span className="text-base font-black text-gray-900">Total Paid</span>
                                                <span className="text-2xl font-black text-gray-900">₹{order.totalAmount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feedback Block */}
                                    {(statusKey === 'DELIVERED' || statusKey === 'RETURNED') && (
                                        <div>
                                            {!order.feedbackGiven ? (
                                                <button 
                                                    onClick={() => onReview(order)}
                                                    className="w-full py-5 rounded-[24px] font-black text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-blue-500/10"
                                                    style={{ background: 'linear-gradient(135deg,#4361ee,#7209b7)', color: 'white' }}
                                                >
                                                    <Star size={20} /> {statusKey === 'RETURNED' ? 'Submit Return Reason' : 'Rate Experience'}
                                                </button>
                                            ) : (
                                                <div className="p-6 rounded-[32px] bg-emerald-50 border-2 border-emerald-100">
                                                    <div className="flex items-center gap-3 mb-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                                                            <MessageSquare size={24} />
                                                        </div>
                                                        <div>
                                                            <h4 className="text-base font-black text-emerald-900">Feedback Sent</h4>
                                                            <div className="flex gap-1 mt-1">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <Star key={i} size={14} fill={i < (order.feedback?.rating || 5) ? '#10b981' : 'none'} className={i < (order.feedback?.rating || 5) ? 'text-emerald-500' : 'text-emerald-200'} />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {order.feedback?.comment && (
                                                        <p className="text-xs font-bold text-emerald-700 italic bg-white/50 p-4 rounded-2xl border border-emerald-100">
                                                            "{order.feedback.comment}"
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function TrackOrder() {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [reviewOrder, setReviewOrder] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isHovered, setIsHovered] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        const local = LocalOrderStore.getOrders();
        setOrders(local);
        
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
            
            const local = LocalOrderStore.getOrders();
            const map = new Map();
            local.forEach(o => map.set(o._id, o));
            apiOrders.forEach(o => {
                const existing = map.get(o._id);
                if (existing) {
                    LocalOrderStore.updateOrderStatus(o._id, o.status, o.feedbackGiven ? o.feedback : null);
                } else {
                    LocalOrderStore.saveOrder({ ...o, totalAmount: o.total, paymentMethod: 'COD' });
                }
            });
            setOrders(LocalOrderStore.getOrders());
        } catch (e) {
            setToast("Could not sync latest updates.");
            setTimeout(() => setToast(null), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        if (phone.length < 10) return;
        syncOrders(phone);
    };

    const submitFeedback = async () => {
        const status = reviewOrder.status?.toUpperCase();
        if (status === 'DELIVERED' && rating === 0) return;
        if (status === 'RETURNED' && !comment.trim()) return;

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/orders/${reviewOrder._id}/feedback`, { rating, comment });
            LocalOrderStore.updateOrderStatus(reviewOrder._id, status, { rating, comment, submittedAt: new Date() });
            setToast("Feedback submitted! ✨");
            setReviewOrder(null);
            setOrders(LocalOrderStore.getOrders());
            setTimeout(() => setToast(null), 3000);
        } catch (e) {
            alert("Failed to submit.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fd] pb-32">
            {/* Desktop Header */}
            <div 
                className="pt-24 pb-32 px-6 text-center text-white"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)' }}
            >
                <div className="max-w-4xl mx-auto">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-6"
                    >
                        <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-[32px] flex items-center justify-center border border-white/10 shadow-2xl">
                            <History size={40} className="text-[#f72585]" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight">Track Your Orders</h1>
                            <p className="text-white/60 text-lg font-medium">Your complete order history is stored safely on this device.</p>
                        </div>

                        <form onSubmit={handleSearch} className="w-full max-w-lg flex gap-3 mt-4">
                            <div className="flex-1 h-16 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 flex items-center px-6">
                                <span className="text-white/40 font-black mr-4">+91</span>
                                <input 
                                    type="tel" maxLength="10" placeholder="Enter phone to sync updates..."
                                    className="bg-transparent border-none outline-none text-white font-bold text-base w-full placeholder:text-white/20"
                                    value={phone} onChange={e => setPhone(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit" disabled={loading}
                                className="px-10 h-16 bg-white rounded-2xl text-[#240046] font-black text-base shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                            >
                                {loading ? <div className="w-6 h-6 border-2 border-gray-200 border-t-[#240046] rounded-full animate-spin" /> : <><Search size={20}/> Sync</>}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* List */}
            <div className="max-w-4xl mx-auto px-6 -mt-16">
                {orders.length === 0 ? (
                    <div className="bg-white p-20 rounded-[48px] text-center shadow-xl shadow-gray-200/50 border border-gray-50 flex flex-col items-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center mb-8">
                            <ShoppingBag size={48} className="text-gray-200" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">No orders yet</h2>
                        <p className="text-gray-400 font-medium max-w-sm">When you place orders, they will appear here automatically for you to track.</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-6 px-4">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.4em]">Personal Order History</h3>
                            <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">
                                <History size={14} /> {orders.length} Orders
                            </div>
                        </div>
                        {orders.map(order => (
                            <ExpandableOrderCard 
                                key={order._id}
                                order={order}
                                isExpanded={expandedOrder === order._id}
                                onToggle={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                                onReview={setReviewOrder}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-8 py-5 rounded-[24px] shadow-2xl flex items-center gap-4 font-black text-sm"
                    >
                        <CheckCircle2 size={24} className="text-emerald-400" />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Modal */}
            <AnimatePresence>
                {reviewOrder && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setReviewOrder(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white w-full max-w-lg rounded-[48px] relative z-10 p-12 text-center"
                        >
                            <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-8">
                                <Star size={40} className="text-[#f59e0b]" fill="#f59e0b" />
                            </div>

                            <h3 className="text-3xl font-black text-gray-900 mb-2">
                                {reviewOrder.status?.toUpperCase() === 'RETURNED' ? 'Return Reason' : 'Rate Your Order'}
                            </h3>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs mb-10">
                                {reviewOrder.status?.toUpperCase() === 'RETURNED' 
                                    ? 'Tell us why you returned this order' 
                                    : 'How was your experience with this delivery?'}
                            </p>

                            {reviewOrder.status?.toUpperCase() === 'DELIVERED' && (
                                <div className="flex justify-center gap-4 mb-10">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <button 
                                            key={s} onClick={() => setRating(s)}
                                            onMouseEnter={() => setIsHovered(s)} onMouseLeave={() => setIsHovered(0)}
                                            className="transition-transform active:scale-90"
                                        >
                                            <Star 
                                                size={48} 
                                                fill={(rating || isHovered) >= s ? '#f59e0b' : 'none'} 
                                                className={(rating || isHovered) >= s ? 'text-[#f59e0b]' : 'text-gray-100'} 
                                                strokeWidth={2.5}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}

                            <textarea 
                                className="w-full h-40 bg-gray-50 rounded-[32px] p-8 text-base font-bold outline-none border-2 border-transparent focus:border-blue-100 focus:bg-white transition-all resize-none mb-10"
                                placeholder={reviewOrder.status?.toUpperCase() === 'RETURNED' ? "Explain the reason (Required)..." : "Write your experience (Optional)..."}
                                value={comment} onChange={e => setComment(e.target.value)}
                            />

                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setReviewOrder(null)}
                                    className="flex-1 py-5 bg-gray-50 text-gray-400 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={submitFeedback} disabled={isSubmitting}
                                    className="flex-[2] py-5 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-gray-900/30 active:scale-[0.98] transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Sending...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
