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
    const [ratingLocked, setRatingLocked] = useState(false);
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
        if(!rating) return setToast("Please select a star rating!");
        try {
            await axios.post(`${API_URL}/api/orders/${reviewOrder}/feedback`, { rating, comment });
            setToast("Thanks! Feedback submitted successfully.");
            setReviewOrder(null);
            setTimeout(()=>setToast(null), 3000);
            handleSearch(); // refresh
        } catch(e) { setToast("Failed to submit feedback."); setTimeout(()=>setToast(null), 3000); }
    };

    return (
        <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12">
            <AnimatePresence>
                {toast && (
                    <motion.div key="toast-msg" initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl z-[100]">
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4">Track Your Order</h1>
                <p className="text-gray-500">Enter your phone number to get real-time tracking.</p>
            </div>

            <div className="flex gap-4 max-w-md mx-auto mb-16">
                <input type="tel" className="flex-1 px-5 py-3 rounded-full border border-gray-200 outline-none focus:border-gray-900 transition bg-white" placeholder="+91 Phone Number" value={phone} onChange={e=>setPhone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSearch()} />
                <button onClick={handleSearch} disabled={loading} className="px-6 py-3 rounded-full bg-gray-900 text-white font-bold hover:bg-black transition flex items-center gap-2">
                    {loading ? '...' : <><Search size={18}/> Track</>}
                </button>
            </div>

            {searched && orders.length === 0 && <p className="text-center text-gray-400">No active orders found for this number.</p>}

            <div className="space-y-8">
                {orders.map(o => (
                    <motion.div key={o._id} initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
                        <div className="flex-1">
                            <h3 className="font-bold text-xl mb-1">Order #{o.orderId}</h3>
                            <p className="text-sm text-gray-400 mb-4">{new Date(o.createdAt).toLocaleDateString()} • Total: ₹{o.total}</p>
                            <div className="space-y-2 mb-4 bg-gray-50 p-4 rounded-xl text-sm">
                                {o.items.map((i, idx) => <div key={idx} className="font-medium text-gray-700">{i.quantity}x {i.name}</div>)}
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="relative flex justify-between">
                                <div className="absolute top-4 left-[10%] right-[10%] h-1 bg-gray-100 z-0"/>
                                {['NEW', 'CONFIRMED', 'DELIVERED'].map((state, idx, statesMap) => {
                                    const curIdx = statesMap.indexOf(o.status);
                                    const isActive = idx <= curIdx;
                                    return (
                                        <div key={state} className={`relative z-10 flex flex-col items-center gap-2 ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-500 ${isActive ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                                                {isActive && <Check size={16} strokeWidth={3}/>}
                                            </div>
                                            <span className="text-xs font-bold">{state}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {o.status === 'DELIVERED' && !o.feedbackGiven && (
                                <button onClick={()=>{setReviewOrder(o._id); setRating(0); setComment(''); setRatingLocked(false); setIsHovered(0);}} className="mt-8 w-full py-2.5 bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition text-sm">Rate Your Experience ⭐</button>
                            )}
                            {o.feedbackGiven && (
                                <div className="mt-8 text-center text-sm font-bold text-gray-400">Thanks for rating {o.feedback?.rating || o.rating || 5} Stars!</div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Rating Modal */}
            <AnimatePresence>
                {reviewOrder && (
                    <motion.div key="rating-modal" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="fixed inset-0 bg-black/40 backdrop-blur flex items-center justify-center z-50 p-4">
                        <motion.div initial={{scale:0.9, opacity:0, y:20}} animate={{scale:1, opacity:1, y:0}} exit={{scale:0.95, opacity:0}} className="bg-white p-8 rounded-[2rem] w-full max-w-sm text-center shadow-2xl relative border border-gray-100">
                            <button type="button" onClick={()=>setReviewOrder(null)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition"><X size={20}/></button>
                            <h3 className="text-2xl font-bold mb-2">Rate Order</h3>
                            <p className="text-gray-500 text-sm mb-6">How was your delivery experience?</p>
                            
                            <div className="flex justify-center gap-1 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <svg key={star} viewBox="0 0 24 24" fill="none" strokeWidth="2"
                                        onMouseEnter={() => !ratingLocked && setIsHovered(star)}
                                        onMouseLeave={() => !ratingLocked && setIsHovered(0)}
                                        onClick={() => { if(!ratingLocked) { setRating(star); setRatingLocked(true); } }}
                                        className={`w-12 h-12 cursor-pointer transition-all duration-300 ease-in-out
                                            ${(ratingLocked ? star <= rating : star <= isHovered) 
                                                ? 'stroke-[#FFD700] fill-[#FFD700] scale-110 drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]' 
                                                : 'stroke-gray-300 fill-transparent scale-100'}
                                        `}
                                    >
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                    </svg>
                                ))}
                            </div>
                            
                            <AnimatePresence>
                                {rating > 0 && (
                                    <motion.div key="rating-comment" initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}} exit={{opacity:0, height:0}} className="mb-6">
                                        <textarea value={comment} onChange={e=>setComment(e.target.value)} placeholder="Leave a comment (optional)..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-300 resize-none transition-all" rows="3"></textarea>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button type="button" onClick={submitFeedback} className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition shadow-xl shadow-gray-200">Submit Feedback</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
