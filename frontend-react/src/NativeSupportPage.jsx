import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, HeadphonesIcon, MessageSquare, ChevronLeft, Send, Phone, MapPin, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SupportPage() {
    const navigate = useNavigate();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const supportOptions = [
        {
            title: "Email Support",
            desc: "Response within 24 hours",
            value: "supportspn07@gmail.com",
            icon: Mail,
            color: "#4361ee",
            bg: "rgba(67,97,238,0.1)",
            link: "mailto:supportspn07@gmail.com"
        },
        {
            title: "Call Us",
            desc: "10 AM - 8 PM IST",
            value: "+91 (Local Support)",
            icon: Phone,
            color: "#10b981",
            bg: "rgba(16,185,129,0.1)",
            link: "tel:+91"
        },
        {
            title: "App Guide",
            desc: "Learn how to use",
            value: "View FAQs",
            icon: MessageSquare,
            color: "#f72585",
            bg: "rgba(247,37,133,0.1)",
            link: "/faqs"
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
                    <h1 className="text-2xl font-black text-white">Contact Us</h1>
                </div>
            </div>

            {/* Support Hero */}
            <div className="px-4 mt-8 mb-8 text-center">
                <div className="w-20 h-20 bg-white rounded-[32px] shadow-xl flex items-center justify-center mx-auto mb-6 border border-blue-50/50">
                    <HeadphonesIcon size={40} className="text-[#4361ee]" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 leading-tight">We're here for you!</h2>
                <p className="text-sm text-gray-400 font-medium mt-2 max-w-[280px] mx-auto">
                    Facing issues or have suggestions? Reach out through any channel below.
                </p>
            </div>

            {/* Support Cards */}
            <div className="px-4 space-y-4">
                {supportOptions.map((opt, i) => {
                    const Icon = opt.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            onClick={() => opt.link.startsWith('http') || opt.link.startsWith('mailto') || opt.link.startsWith('tel') ? window.location.href = opt.link : navigate(opt.link)}
                            className="bg-white rounded-[28px] p-5 shadow-sm border border-gray-50 active:scale-[0.98] transition-transform flex items-center gap-4"
                        >
                            <div 
                                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                                style={{ background: opt.bg }}
                            >
                                <Icon size={24} style={{ color: opt.color }} strokeWidth={2.5} />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-base font-black text-gray-900">{opt.title}</h3>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{opt.desc}</p>
                                <p className="text-xs font-bold mt-1" style={{ color: opt.color }}>{opt.value}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                                <ExternalLink size={16} />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Location Info */}
            <div className="px-4 mt-8">
                <div className="bg-gray-900 rounded-[32px] p-6 text-white relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/5 rounded-full" />
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <MapPin size={20} className="text-red-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-black">Main Office</h4>
                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Shahjahanpur, UP</p>
                        </div>
                    </div>
                    <p className="text-xs text-white/70 leading-relaxed font-medium">
                        Our local team manages deliveries and quality checks from our main hub in Shahjahanpur City.
                    </p>
                </div>
            </div>

            {/* Footer space */}
            <div className="py-10 text-center opacity-20">
                <Send size={24} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Live Support v1.0</p>
            </div>
        </div>
    );
}
