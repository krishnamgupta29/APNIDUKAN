import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowToUse() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

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
        <main className="w-full min-h-[80vh] bg-[#fdfbf7] py-10 px-4 sm:px-6">
            <div className="w-full max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-8 transition"
                >
                    <ArrowLeft size={16} /> Back
                </button>

                <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100">
                    <div className="flex flex-col items-center text-center mb-10">
                        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                            How to Use <span className="text-blue-500">ApniDukaan</span>
                        </h1>
                        <p className="text-gray-500 font-medium max-w-xl mx-auto">
                            Follow these simple steps to easily browse, order, and track your daily needs right to your doorstep.
                        </p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6 mb-10">
                        {steps.map((step, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={idx} 
                                className={`${step.bg} p-6 md:p-8 rounded-3xl border border-white shadow-sm flex flex-col items-start hover:shadow-md transition-shadow`}
                            >
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-5">
                                    {step.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                                <p className="text-gray-600 font-medium text-sm leading-relaxed">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                    
                    <div className="bg-gray-900 text-white rounded-3xl p-8 text-center shadow-xl shadow-gray-900/10">
                        <h3 className="text-2xl font-bold mb-3">Ready to order?</h3>
                        <p className="text-gray-400 font-medium text-sm mb-6 max-w-md mx-auto">Get your daily needs and curated products delivered to your doorstep at lightning speed.</p>
                        <button onClick={() => navigate('/')} className="px-8 py-3.5 bg-white text-gray-900 font-extrabold rounded-xl hover:scale-105 active:scale-95 transition-transform">
                            Start Shopping Now
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
