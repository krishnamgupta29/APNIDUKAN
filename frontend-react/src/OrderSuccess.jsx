import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, Home, MapPin, Package } from 'lucide-react';

export default function OrderSuccess({ orderPayload, setOrderPayload }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!orderPayload || !orderPayload.placedId) {
            navigate('/');
        }
        window.scrollTo(0, 0);
    }, [orderPayload, navigate]);

    if (!orderPayload || !orderPayload.placedId) return null;

    return (
        <div className="flex flex-col min-h-screen pb-20" style={{ background: '#f8f9fd' }}>
            {/* Celebration Header */}
            <div 
                className="px-4 pt-20 pb-12 text-center"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
                <motion.div 
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200 }}
                    className="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/40 border-4 border-white/20"
                >
                    <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
                </motion.div>
                
                <h1 className="text-3xl font-black text-white mb-2">Order Success!</h1>
                <p className="text-white/60 text-sm font-medium px-8">
                    Your order has been placed and is being prepared for delivery.
                </p>

                {/* Progress Step 3 */}
                <div className="flex items-center justify-center mt-10 gap-2 opacity-30">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    <div className="w-8 h-1.5 rounded-full bg-white" />
                </div>
            </div>

            <div className="px-4 -mt-8 space-y-6">
                {/* ID Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-[32px] p-6 shadow-xl shadow-blue-900/5 border border-white"
                >
                    <div className="text-center">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Tracking ID</p>
                        <h2 className="text-2xl font-black text-gray-900 tracking-wider mb-6">#{orderPayload.placedId.slice(-8).toUpperCase()}</h2>
                        
                        <div className="flex items-center justify-center gap-8 py-4 border-t border-gray-50">
                            <div className="text-center">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Items</p>
                                <p className="text-sm font-black text-gray-800">{orderPayload.items.length}</p>
                            </div>
                            <div className="w-px h-8 bg-gray-100" />
                            <div className="text-center">
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Amount</p>
                                <p className="text-sm font-black text-emerald-600">₹{orderPayload.total}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50 space-y-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <MapPin size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery To</p>
                            <p className="text-sm font-bold text-gray-800 truncate">{orderPayload.address}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-pink-600">
                            <Package size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Est. Delivery</p>
                            <p className="text-sm font-bold text-gray-800">Within 24 Hours</p>
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <div className="space-y-4 pt-4">
                    <button 
                        onClick={() => { navigate('/track'); setOrderPayload({}); }}
                        className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-base flex justify-center items-center gap-2 shadow-2xl shadow-gray-900/30 active:scale-95 transition-transform"
                    >
                        Track My Order <ChevronRight size={20}/>
                    </button>
                    <button 
                        onClick={() => { navigate('/'); setOrderPayload({}); }}
                        className="w-full py-5 bg-white text-gray-900 border border-gray-100 rounded-[24px] font-black text-base flex justify-center items-center gap-2 active:scale-95 transition-transform"
                    >
                        <Home size={20}/> Back to Home
                    </button>
                </div>
            </div>

            {/* Support Message */}
            <div className="px-8 mt-10 text-center">
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    Need help? Call us or chat with support anytime in the Settings menu.
                </p>
            </div>
        </div>
    );
}
