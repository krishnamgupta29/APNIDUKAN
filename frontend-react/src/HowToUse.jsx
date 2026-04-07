import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ShoppingBag, CreditCard, CheckCircle2 } from 'lucide-react';

export default function HowToUse({ isOpen, onClose }) {
    const steps = [
        {
            icon: <Search className="text-blue-500" size={32} />,
            title: "1. Select Products",
            desc: "Browse our curated local catalog and click on any product to see its details. Add the items you need to your bag.",
            bg: "bg-blue-50"
        },
        {
            icon: <ShoppingBag className="text-purple-500" size={32} />,
            title: "2. Secure Checkout",
            desc: "Open your cart from the top right and click 'Secure Checkout'. Verify the total amount for your selected items.",
            bg: "bg-purple-50"
        },
        {
            icon: <CreditCard className="text-orange-500" size={32} />,
            title: "3. Address & Delivery",
            desc: "Click 'Use Current Location' to auto-detect your Shahjahanpur address, or type it manually. Fill in your Name and Phone Number.",
            bg: "bg-orange-50"
        },
        {
            icon: <CheckCircle2 className="text-emerald-500" size={32} />,
            title: "4. Place Order & Track",
            desc: "Click 'Review Order' and confirm! Your order will be placed via COD (Cash on Delivery). Use your Order ID to track it.",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="how-to-use-modal"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">How ApniDukaan Works</h2>
                            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
                        </div>
                        
                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {steps.map((step, idx) => (
                                    <div key={idx} className={`${step.bg} p-6 rounded-2xl border border-white shadow-sm flex flex-col items-start`}>
                                        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                            {step.icon}
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                                        <p className="text-gray-600 font-medium text-sm leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="mt-8 bg-gray-900 text-white rounded-2xl p-6 text-center">
                                <h3 className="text-xl font-bold mb-3">Ready to order?</h3>
                                <p className="text-gray-400 font-medium text-sm mb-6 max-w-md mx-auto">Get your daily needs and curated products delivered to your doorstep at lightning speed.</p>
                                <div className="text-center group">
                                    <button type="button" onClick={onClose} className="px-8 py-3 bg-white text-gray-900 font-extrabold rounded-xl hover:scale-105 transition-transform">Start Shopping Now</button>
                                    <p className="text-white/60 text-xs mt-3">Shahjahanpur's fastest delivery network</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
