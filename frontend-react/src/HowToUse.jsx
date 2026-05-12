import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, MapPin, CheckCircle2, ChevronLeft, Rocket, Zap, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HowToUse() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const steps = [
        {
            icon: Search,
            title: "Find Your Needs",
            desc: "Browse our curated local catalog. Use search or categories to find exactly what you're looking for in Shahjahanpur.",
            color: "#4361ee",
            bg: "rgba(67,97,238,0.1)"
        },
        {
            icon: ShoppingBag,
            title: "Fill Your Bag",
            desc: "Add items to your cart with a single tap. Review your items and totals easily before proceeding.",
            color: "#f72585",
            bg: "rgba(247,37,133,0.1)"
        },
        {
            icon: MapPin,
            title: "Add Address",
            desc: "Provide your delivery details. We use local landmarks to ensure your order reaches you without any hassle.",
            color: "#7209b7",
            bg: "rgba(114,9,183,0.1)"
        },
        {
            icon: CheckCircle2,
            title: "Order & Relax",
            desc: "Confirm your order. We'll handle the rest and deliver it to your doorstep within hours!",
            color: "#10b981",
            bg: "rgba(16,185,129,0.1)"
        }
    ];

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
                    <h1 className="text-2xl font-black text-white">How to Use</h1>
                </div>
            </div>

            {/* Intro Card */}
            <div className="px-4 mt-6 mb-8">
                <div className="bg-white rounded-[28px] p-6 shadow-xl shadow-blue-900/5 border border-blue-50/50">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Rocket size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-extrabold text-gray-900">Quick Guide</h2>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">4 Simple Steps</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        ApniDukan is designed to be fast and intuitive. Follow this guide to start shopping like a pro.
                    </p>
                </div>
            </div>

            {/* Steps Timeline */}
            <div className="px-4 space-y-4 relative">
                {/* Vertical Line */}
                <div className="absolute left-10 top-8 bottom-8 w-0.5 bg-gray-100" />

                {steps.map((step, idx) => {
                    const Icon = step.icon;
                    return (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                            key={idx}
                            className="flex gap-4 items-start relative z-10"
                        >
                            <div 
                                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                                style={{ background: step.bg }}
                            >
                                <Icon size={22} style={{ color: step.color }} strokeWidth={2.5} />
                            </div>
                            
                            <div className="flex-1 bg-white rounded-[24px] p-5 shadow-sm border border-gray-50">
                                <h3 className="text-base font-black text-gray-900 mb-1">{step.title}</h3>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer Tip */}
            <div className="px-4 mt-8">
                <div 
                    className="rounded-[28px] p-6 text-white overflow-hidden relative"
                    style={{ background: 'linear-gradient(135deg,#4361ee 0%,#7209b7 100%)', boxShadow: '0 12px 32px rgba(67,97,238,0.3)' }}
                >
                    <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10" />
                    <div className="absolute -left-4 -top-4 w-16 h-16 rounded-full bg-white/10" />
                    
                    <div className="flex items-center gap-3 mb-3">
                        <Zap size={20} className="text-yellow-400" />
                        <h3 className="text-lg font-extrabold">Pro Tip</h3>
                    </div>
                    <p className="text-sm text-white/80 font-medium leading-relaxed mb-6">
                        You can track all your orders locally in the "Track Order" section without logging in!
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-white text-[#4361ee] rounded-2xl font-black text-sm active:scale-95 transition-transform"
                    >
                        Start Shopping Now
                    </button>
                </div>
            </div>

            {/* Trust badge */}
            <div className="flex flex-col items-center justify-center py-10 opacity-30">
                <ShieldCheck size={40} className="text-gray-400 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">100% Trusted Store</p>
            </div>
        </div>
    );
}
