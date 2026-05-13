import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export default function OrderSuccess({ orderPayload, setOrderPayload }) {
    const navigate = useNavigate();

    useEffect(() => {
        if (!orderPayload || !orderPayload.placedId) {
            navigate('/');
        }
    }, [orderPayload, navigate]);

    if (!orderPayload || !orderPayload.placedId) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.4 }}
            className="max-w-md mx-auto w-full px-4 py-12 mb-16"
        >
            <div className="bg-gradient-to-b from-emerald-50 to-white rounded-3xl p-8 shadow-sm border border-emerald-100 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
                
                <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring", delay: 0.1}} className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <CheckCircle2 size={40} strokeWidth={2.5}/>
                </motion.div>
                
                <h3 className="text-3xl font-extrabold text-gray-900 mb-2">Order Confirmed!</h3>
                <p className="text-gray-500 font-medium text-sm mb-6">Your order has been successfully placed to {orderPayload.customerName?.split(' ')[0]}.</p>
                
                <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-sm mb-8">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Tracking ID</p>
                    <p className="font-mono text-lg font-bold tracking-wider text-gray-900">{orderPayload.placedId}</p>
                </div>

                <button onClick={() => { setOrderPayload({}); navigate('/track'); }} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 active:scale-[0.98]">
                    Track Order
                </button>
            </div>
        </motion.div>
    );
}
