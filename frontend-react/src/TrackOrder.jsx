import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { Search, CheckCircle2, ChevronRight, Check, X } from 'lucide-react';
import API_URL from './api';

export default function TrackOrder() {
    const [phone, setPhone] = useState('');
    const [orders, setOrders] = useState([]);
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const [reviewOrder, setReviewOrder] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isHovered, setIsHovered] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [toast, setToast] = useState(null);

    const handleSearch = async () => {
        if(!phone) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/orders/user/${phone}`);
            setOrders(res.data); setSearched(true);
        } catch(e) { setToast('Error fetching orders'); setTimeout(()=>setToast(null), 3000); }
        setLoading(false);
    };

    const submitFeedback = async () => {
        if(rating === 0) return setToast("Please select stars ⭐");
        const orderStatus = orders.find(o => o._id === reviewOrder)?.status?.toUpperCase();
        if(orderStatus === 'RETURNED' && !comment.trim()) return setToast("Please provide a reason for return!");

        setIsSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/orders/${reviewOrder}/feedback`, { rating, comment });
            setToast(orderStatus === 'RETURNED' ? "Reason submitted successfully!" : "Thanks! Feedback submitted.");
            setReviewOrder(null);
            setTimeout(()=>setToast(null), 3000);
            handleSearch(); // refresh
        } catch(e) { 
            setToast("Failed to submit. Try again."); 
            setTimeout(()=>setToast(null), 3000); 
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
            <AnimatePresence>
                {toast && (
                    <motion.div key="toast-msg" initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="fixed top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl z-[100] flex items-center gap-3">
                        <CheckCircle2 size={20} className="text-emerald-400" />
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="text-center mb-10">
                <h1 className="text-4xl font-black mb-4 tracking-tight">Track Your Order</h1>
                <p className="text-gray-500 font-medium">Enter your phone number to get real-time tracking.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-16">
                <input type="tel" className="w-full sm:flex-1 px-6 py-4 rounded-2xl border-2 border-gray-100 outline-none focus:border-gray-900 transition bg-white text-base font-bold shadow-sm" placeholder="+91 Phone Number" value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} />
                <button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gray-900 text-white font-black hover:bg-black transition flex items-center justify-center gap-2 shrink-0 shadow-lg active:scale-95">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Search size={18}/> Track</>}
                </button>
            </div>

            {searched && orders.length === 0 && (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-bold">No active orders found for this number.</p>
                </div>
            )}

            <div className="space-y-8">
                {orders.map(o => (
                    <motion.div key={o._id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 transition-all hover:shadow-md">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-black text-2xl">Order #{o.orderId}</h3>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${o.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {o.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-400 font-bold mb-6">{new Date(o.createdAt).toLocaleDateString()} • Total Price: ₹{o.total}</p>
                            <div className="space-y-3 mb-4 bg-gray-50 p-6 rounded-2xl">
                                {o.items.map((i, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                        <span className="font-bold text-gray-700">{i.name}</span>
                                        <span className="font-black text-gray-400">x{i.quantity}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="relative flex justify-between">
                                <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-gray-100 z-0"/>
                                {['NEW', 'ASSIGNED', (o.status?.toUpperCase() === 'RETURNED') ? 'RETURNED' : 'DELIVERED'].map((state, idx, statesMap) => {
                                    let normalizedStatus = o.status?.toUpperCase() || 'NEW';
                                    if (normalizedStatus === 'PENDING') normalizedStatus = 'NEW';
                                    if (normalizedStatus === 'CONFIRMED') normalizedStatus = 'ASSIGNED';

                                    const curIdx = (normalizedStatus === 'RETURNED' && state === 'RETURNED') ? 2 : statesMap.indexOf(normalizedStatus);
                                    let isActive = false;
                                    if(normalizedStatus === 'RETURNED') isActive = idx <= 2;
                                    else isActive = idx <= curIdx;
                                    if(normalizedStatus === 'DELIVERED') isActive = true;

                                    const isReturnedNode = state === 'RETURNED';
                                    
                                    return (
                                        <div key={state} className={`relative z-10 flex flex-col items-center gap-2 ${isActive ? (isReturnedNode ? 'text-yellow-600' : 'text-gray-900') : 'text-gray-300'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white transition-all duration-500 shadow-sm ${isActive ? (isReturnedNode ? 'bg-yellow-400 text-white' : 'bg-emerald-500 text-white') : 'bg-gray-200'}`}>
                                                {isActive && (isReturnedNode ? <X size={18} strokeWidth={3}/> : <Check size={18} strokeWidth={3}/>)}
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">{state}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {(o.status?.toUpperCase() === 'DELIVERED' || o.status?.toUpperCase() === 'RETURNED') && !o.feedbackGiven && (
                                <button onClick={()=>{setReviewOrder(o._id); setRating(0); setComment(''); setIsHovered(0);}} className={`mt-10 w-full py-4 font-black rounded-2xl transition text-sm shadow-sm active:scale-95 ${(o.status?.toUpperCase() === 'RETURNED') ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                                    {(o.status?.toUpperCase() === 'RETURNED') ? 'Submit Return Reason 📝' : 'Rate Your Order ⭐'}
                                </button>
                            )}
                            {o.feedbackGiven && (
                                <div className="mt-10 p-4 bg-gray-50 rounded-2xl text-center text-sm font-black text-gray-400 uppercase tracking-widest">
                                    {(o.status?.toUpperCase() === 'RETURNED') ? 'Reason submitted ✓' : `Rated ${o.feedback?.rating || o.rating || 5} Stars ✓`}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Rating Modal */}
            <AnimatePresence>
                {reviewOrder && (
                    <motion.div key="rating-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
                        <motion.div initial={{scale:0.9, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0}} className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm text-center shadow-2xl relative border border-gray-100">
                            <button type="button" onClick={()=>setReviewOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition"><X size={20}/></button>
                            
                            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <Star size={40} className="text-[#FFD700] fill-[#FFD700]" />
                            </div>

                            <h3 className="text-2xl font-black mb-2">
                                {(orders.find(o => o._id === reviewOrder)?.status?.toUpperCase() === 'RETURNED') ? 'Return Feedback' : 'Rate Your Order'}
                            </h3>
                            <p className="text-gray-500 font-medium text-sm mb-8">
                                {(orders.find(o => o._id === reviewOrder)?.status?.toUpperCase() === 'RETURNED') ? 'Please tell us why you returned this order.' : 'How was your experience with us?'}
                            </p>
                            
                            {/* Star Selection */}
                            <div className="flex justify-center gap-2 mb-8">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setIsHovered(star)}
                                        onMouseLeave={() => setIsHovered(0)}
                                        onClick={() => setRating(star)}
                                        className={`w-12 h-12 flex items-center justify-center transition-all duration-300 transform active:scale-90
                                            ${(rating > 0 ? star <= rating : star <= isHovered) 
                                                ? 'text-[#FFD700] scale-110 drop-shadow-[0_0_12px_rgba(255,215,0,0.5)]' 
                                                : 'text-gray-200 scale-100'}
                                        `}
                                    >
                                        <Star size={40} fill={(rating > 0 ? star <= rating : star <= isHovered) ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                    </button>
                                ))}
                            </div>
                            
                            <div className="mb-8">
                                <textarea 
                                    value={comment} onChange={e=>setComment(e.target.value)} 
                                    placeholder={(orders.find(o => o._id === reviewOrder)?.status?.toUpperCase() === 'RETURNED') ? "Explain return reason (required)..." : "Write your feedback here (optional)..."} 
                                    className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl p-5 text-sm font-bold outline-none focus:bg-white focus:border-gray-200 transition-all resize-none" 
                                    rows="4"
                                ></textarea>
                            </div>

                            <button 
                                type="button" 
                                onClick={submitFeedback} 
                                disabled={isSubmitting}
                                className="w-full py-5 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition shadow-2xl shadow-gray-900/20 active:scale-95 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
