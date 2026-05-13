import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HeadphonesIcon, HelpCircle, BookOpen, Shield, FileText,
    ChevronRight, Settings as SettingsIcon,
    Star, Phone, Info, User, LogOut, Package
} from 'lucide-react';
import { motion } from 'framer-motion';

const SECTIONS = [
    {
        label: 'Account & Orders',
        items: [
            { icon: Package, color: '#4361ee', bg: 'rgba(67,97,238,0.1)', title: 'My Orders', sub: 'Track your active & past orders', path: '/track' },
        ]
    },
    {
        label: 'Help & Support',
        items: [
            { icon: HeadphonesIcon, color: '#4361ee', bg: 'rgba(67,97,238,0.1)', title: 'Customer Support', sub: 'Talk to our team 24/7', path: '/support' },
            { icon: HelpCircle, color: '#f72585', bg: 'rgba(247,37,133,0.1)', title: 'How to Use', sub: 'Learn how the app works', path: '/how-to-use' },
            { icon: BookOpen, color: '#10b981', bg: 'rgba(16,185,129,0.1)', title: 'FAQs', sub: 'Common questions & answers', path: '/faqs' },
        ]
    },
    {
        label: 'Legal & Info',
        items: [
            { icon: Shield, color: '#7209b7', bg: 'rgba(114,9,183,0.1)', title: 'Privacy Policy', sub: 'Data handling terms', path: '/legal' },
            { icon: FileText, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', title: 'Terms of Service', sub: 'Standard app agreements', path: '/legal' },
        ]
    }
];

export default function NativeSettings() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen pb-40" style={{ background: '#f8f9fd' }}>

            {/* Header Area */}
            <div
                className="px-6 pt-14 pb-12 rounded-b-[40px] relative overflow-hidden"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}
            >
                <div className="absolute top-[-50px] right-[-50px] w-48 h-48 rounded-full bg-[#f72585]/10 blur-3xl" />
                <div className="absolute bottom-[-50px] left-[-50px] w-48 h-48 rounded-full bg-[#4361ee]/10 blur-3xl" />
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md">
                                <SettingsIcon size={20} className="text-white" />
                            </div>
                            <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
                        </div>
                    </div>

                    {/* Profile Banner */}
                    <motion.div 
                        initial={{y:20, opacity:0}} animate={{y:0, opacity:1}}
                        className="bg-white/10 backdrop-blur-xl rounded-[32px] p-6 border border-white/10 flex items-center gap-4"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden shadow-2xl p-0.5">
                            <img src="/assets/app-logo.png" className="w-full h-full object-cover rounded-[14px]" alt="Logo" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-white font-black text-lg leading-tight">ApniDukan</h2>
                            <p className="text-white/60 text-xs font-semibold flex items-center gap-1 mt-0.5">
                                <Info size={10} /> Premium Edition v2.0
                            </p>
                            <div className="flex gap-2 mt-3">
                                <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active</span>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-white/10 border border-white/20">
                                    <span className="text-[9px] font-black text-white/70 uppercase tracking-widest">Shahjahanpur</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Menu Sections */}
            <div className="px-5 -mt-6 relative z-20 space-y-8">
                {SECTIONS.map((section, sIdx) => (
                    <div key={sIdx}>
                        <h3 className="text-[11px] font-black text-gray-400 uppercase mb-4 ml-2">{section.label}</h3>
                        <div className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-blue-900/5 border border-gray-50">
                            {section.items.map((item, iIdx) => {
                                const Icon = item.icon;
                                return (
                                    <div key={iIdx}>
                                        <button
                                            onClick={() => item.path !== '#' && navigate(item.path)}
                                            className="w-full flex items-center justify-between p-5 active:bg-gray-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div 
                                                    className="w-11 h-11 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90"
                                                    style={{ background: item.bg }}
                                                >
                                                    <Icon size={20} style={{ color: item.color }} strokeWidth={2.5} />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-black text-gray-900 leading-tight">{item.title}</p>
                                                    <p className="text-[11px] text-gray-400 font-bold mt-1">{item.sub}</p>
                                                </div>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-gray-600 transition-all">
                                                <ChevronRight size={16} />
                                            </div>
                                        </button>
                                        {iIdx < section.items.length - 1 && (
                                            <div className="h-px bg-gray-50 mx-6" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="py-12 text-center">
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-100 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Systems Operational</span>
                </div>
                <p className="text-[10px] font-bold text-gray-300 px-12">
                    Handcrafted for Shahjahanpur with ❤️. © 2026 ApniDukan. All rights reserved.
                </p>
            </div>
        </div>
    );
}
