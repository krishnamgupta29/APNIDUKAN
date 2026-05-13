import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowLeft, HelpCircle, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const faqs = [
    {
        question: "What is the delivery time?",
        answer: "We strive to deliver all orders within 24 hours across Shahjahanpur. In most cases, orders placed before noon are delivered the same day.",
        icon: <Truck size={18} className="text-blue-500" />
    },
    {
        question: "Are there any delivery charges?",
        answer: "Delivery charges depend on the product and your location. Many items qualify for free delivery! The exact delivery fee will be calculated at checkout.",
        icon: <CreditCard size={18} className="text-emerald-500" />
    },
    {
        question: "How can I track my order?",
        answer: "Once your order is confirmed, you will receive an Order Tracking ID. You can enter this ID on the 'Track Orders' page to see the real-time status of your delivery.",
        icon: <HelpCircle size={18} className="text-purple-500" />
    },
    {
        question: "What payment methods do you accept?",
        answer: "Currently, we only support Cash on Delivery (COD) to ensure you can inspect your items before paying. We are working on integrating online payment methods soon.",
        icon: <CreditCard size={18} className="text-orange-500" />
    },
    {
        question: "How do I return an item?",
        answer: "Please inspect your product while the delivery executive is still at your doorstep. If you wish to return it, inform them immediately and hand it back. Once the delivery executive leaves and the order status is marked as 'Delivered', no returns will be accepted.",
        icon: <ShieldCheck size={18} className="text-red-500" />
    }
];

const guidelines = [
    {
        title: "1. Accurate Location",
        desc: "Please use the 'Detect via GPS' feature during checkout to fetch your exact location. It helps our delivery partners reach you faster."
    },
    {
        title: "2. Keep Your Phone Handy",
        desc: "Our delivery executives may call you for directions. Please ensure the phone number provided during checkout is active."
    },
    {
        title: "3. Order ID is Important",
        desc: "Always save your Order ID (e.g., ORD-XXXX) shown on the success screen. You'll need it to track your order or contact support."
    }
];

export default function FAQs() {
    const navigate = useNavigate();
    const [openIdx, setOpenIdx] = useState(0);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <main className="w-full min-h-[80vh] flex flex-col items-center bg-[#fdfbf7] py-10 px-4 sm:px-6">
            <div className="w-full max-w-3xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition"
                >
                    <ArrowLeft size={16} /> Back to Support
                </button>

                <div className="flex flex-col items-center text-center mb-12">
                    <motion.div 
                        initial={{ scale: 0 }} 
                        animate={{ scale: 1 }} 
                        className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner"
                    >
                        <HelpCircle size={32} strokeWidth={2.5} />
                    </motion.div>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                        App Guidelines & FAQs
                    </h1>
                    <p className="text-gray-500 font-medium max-w-xl mx-auto">
                        Everything you need to know about using Apni Dukan effectively. Find answers to common questions below.
                    </p>
                </div>

                {/* App Guidelines Section */}
                <div className="mb-12">
                    <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-1 bg-emerald-400 rounded-full" /> App Guidelines
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {guidelines.map((g, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2"
                            >
                                <h3 className="font-bold text-gray-900 text-sm">{g.title}</h3>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">{g.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* FAQs Section */}
                <div>
                    <h2 className="text-xl font-extrabold text-gray-800 mb-6 flex items-center gap-2">
                        <span className="w-8 h-1 bg-blue-400 rounded-full" /> Frequently Asked Questions
                    </h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (i * 0.05) }}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <button 
                                    onClick={() => setOpenIdx(openIdx === i ? -1 : i)}
                                    className="w-full flex items-center justify-between p-5 text-left focus:outline-none focus-visible:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shrink-0">
                                            {faq.icon}
                                        </div>
                                        <span className={`font-bold text-sm sm:text-base ${openIdx === i ? 'text-blue-600' : 'text-gray-800'}`}>
                                            {faq.question}
                                        </span>
                                    </div>
                                    <motion.div animate={{ rotate: openIdx === i ? 180 : 0 }} className="text-gray-400 shrink-0">
                                        <ChevronDown size={20} />
                                    </motion.div>
                                </button>
                                
                                <AnimatePresence>
                                    {openIdx === i && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-5 pt-0 pl-[68px] text-sm text-gray-500 font-medium leading-relaxed">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 bg-blue-50/50 rounded-3xl p-6 md:p-8 text-center border border-blue-100/50 flex flex-col items-center">
                    <h3 className="font-bold text-gray-900 mb-2">Still have questions?</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-sm">If you couldn't find the answer to your question, feel free to reach out to our support team.</p>
                    <button onClick={() => navigate('/support')} className="px-6 py-3 bg-white border border-gray-200 text-gray-800 font-bold rounded-xl shadow-sm hover:shadow hover:border-gray-300 transition-all active:scale-95 text-sm">
                        Contact Support
                    </button>
                </div>
            </div>
        </main>
    );
}
