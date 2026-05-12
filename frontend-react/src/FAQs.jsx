import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronLeft, HelpCircle, ShieldCheck, Truck, CreditCard, MessageCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const faqs = [
    {
        category: 'Delivery',
        question: "What is the delivery time?",
        answer: "We strive to deliver all orders within 24 hours across Shahjahanpur. In most cases, orders placed before noon are delivered the same day.",
        icon: Truck,
        color: '#4361ee'
    },
    {
        category: 'Payment',
        question: "Are there any delivery charges?",
        answer: "Delivery charges depend on the product and your location. Many items qualify for free delivery! The exact delivery fee will be calculated at checkout.",
        icon: CreditCard,
        color: '#f72585'
    },
    {
        category: 'Support',
        question: "How can I track my order?",
        answer: "Once your order is confirmed, you will receive an Order Tracking ID. You can enter this ID on the 'Track Orders' page to see the real-time status of your delivery.",
        icon: MessageCircle,
        color: '#7209b7'
    },
    {
        category: 'Returns',
        question: "How do I return an item?",
        answer: "Please inspect your product while the delivery executive is still at your doorstep. If you wish to return it, inform them immediately. Once the executive leaves, no returns are accepted.",
        icon: AlertCircle,
        color: '#ef4444'
    }
];

export default function FAQs() {
    const navigate = useNavigate();
    const [openIdx, setOpenIdx] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="flex flex-col min-h-screen pb-20" style={{ background: '#f8f9fd' }}>
            {/* Header */}
            <div 
                className="sticky top-0 z-40 px-4 pt-12 pb-6"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <h1 className="text-2xl font-black text-white">Help Center</h1>
                </div>
            </div>

            {/* Search Placeholder / Title */}
            <div className="px-4 mt-8 mb-6 text-center">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 border border-blue-50">
                    <HelpCircle size={32} className="text-blue-600" strokeWidth={2.5} />
                </div>
                <h2 className="text-xl font-black text-gray-900">How can we help?</h2>
                <p className="text-sm text-gray-400 font-medium mt-1">Find answers to your common questions</p>
            </div>

            {/* FAQ List */}
            <div className="px-4 space-y-3">
                {faqs.map((faq, i) => {
                    const Icon = faq.icon;
                    const isOpen = openIdx === i;
                    return (
                        <div 
                            key={i}
                            className={`bg-white rounded-[24px] border transition-all duration-300 ${isOpen ? 'border-blue-100 shadow-xl shadow-blue-900/5' : 'border-gray-50 shadow-sm'}`}
                        >
                            <button 
                                onClick={() => setOpenIdx(isOpen ? -1 : i)}
                                className="w-full flex items-center gap-4 p-4 text-left"
                            >
                                <div 
                                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${faq.color}15` }}
                                >
                                    <Icon size={18} style={{ color: faq.color }} strokeWidth={2.5} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase tracking-widest mb-0.5" style={{ color: faq.color }}>{faq.category}</p>
                                    <h3 className="text-sm font-bold text-gray-800 leading-tight">{faq.question}</h3>
                                </div>
                                <motion.div 
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    className="text-gray-300"
                                >
                                    <ChevronDown size={18} />
                                </motion.div>
                            </button>

                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-18 pb-5 pr-5 text-sm text-gray-500 font-medium leading-relaxed border-t border-gray-50 pt-4 mx-4">
                                            {faq.answer}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>

            {/* Support CTA */}
            <div className="px-4 mt-8">
                <div 
                    className="bg-white rounded-[28px] p-6 text-center border border-gray-100 shadow-lg shadow-gray-200/50"
                >
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={24} className="text-emerald-500" />
                    </div>
                    <h3 className="text-base font-black text-gray-900 mb-2">Still need help?</h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
                        Our support team is available from 10 AM to 8 PM to assist you with any issues.
                    </p>
                    <button 
                        onClick={() => navigate('/support')}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm active:scale-95 transition-transform shadow-xl shadow-gray-900/20"
                    >
                        Chat with Support
                    </button>
                </div>
            </div>

            {/* Footer space */}
            <div className="py-10 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300">ApniDukan Help Center v1.0</p>
            </div>
        </div>
    );
}
