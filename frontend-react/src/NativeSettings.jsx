import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HeadphonesIcon, HelpCircle, BookOpen, Shield, FileText,
    ChevronRight, ChevronDown, Settings as SettingsIcon,
    Star, Phone, Info
} from 'lucide-react';

const MENU = [
    {
        icon: HeadphonesIcon,
        color: '#4361ee',
        bg: 'rgba(67,97,238,0.1)',
        title: 'Support',
        sub: 'Get help from our team',
        path: '/support',
    },
    {
        icon: HelpCircle,
        color: '#f72585',
        bg: 'rgba(247,37,133,0.1)',
        title: 'How to Use',
        sub: 'Quick guide to the app',
        path: '/how-to-use',
    },
    {
        icon: BookOpen,
        color: '#10b981',
        bg: 'rgba(16,185,129,0.1)',
        title: 'FAQs',
        sub: 'Frequently asked questions',
        path: '/faqs',
    },
    {
        icon: Shield,
        color: '#7209b7',
        bg: 'rgba(114,9,183,0.1)',
        title: 'Privacy Policy',
        sub: 'How we handle your data',
        path: '/legal',
    },
    {
        icon: FileText,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.1)',
        title: 'Terms & Conditions',
        sub: 'Our terms of service',
        path: '/legal',
    },
];

const INFO_CARDS = [
    { icon: Phone, label: 'Contact', value: '+91 (Shahjahanpur)' },
    { icon: Star,  label: 'App Rating', value: '4.8 ★' },
    { icon: Info,  label: 'Version',  value: '1.0.0 Premium' },
];

export default function NativeSettings() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen pb-28" style={{ background: '#f0f1f7' }}>

            {/* Header */}
            <div
                className="px-4 pt-12 pb-6"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <SettingsIcon size={18} style={{ color: '#4cc9f0' }} />
                    <h1 className="text-2xl font-black text-white">Settings</h1>
                </div>
                <p className="text-white/40 text-xs font-medium">ApniDukan Shahjahanpur</p>
            </div>

            {/* Brand card */}
            <div className="px-4 mt-4 mb-3">
                <div
                    className="rounded-[20px] p-4 flex items-center gap-4"
                    style={{ background: 'linear-gradient(135deg,#f72585 0%,#7209b7 50%,#4361ee 100%)', boxShadow: '0 6px 24px rgba(247,37,133,0.3)' }}
                >
                    <div className="w-16 h-16 rounded-[18px] bg-white overflow-hidden shadow-lg flex-shrink-0">
                        <img src="/assets/app-logo.png" className="w-full h-full object-cover" alt="App Logo" />
                    </div>
                    <div>
                        <h2 className="text-white font-extrabold text-base leading-tight">ApniDukan</h2>
                        <p className="text-white/70 text-[11px] font-medium">Your local marketplace</p>
                        <p className="text-white/50 text-[10px] mt-0.5">Shahjahanpur, Uttar Pradesh</p>
                    </div>
                </div>
            </div>

            {/* Info pills */}
            <div className="px-4 mb-4">
                <div className="flex gap-2">
                    {INFO_CARDS.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className="flex-1 bg-white rounded-[14px] p-3 text-center"
                                style={{ boxShadow: '0 2px 10px rgba(67,97,238,0.08)' }}
                            >
                                <Icon size={14} className="mx-auto mb-1 text-gray-400" />
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{card.label}</p>
                                <p className="text-[10px] font-extrabold text-gray-800">{card.value}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Menu items */}
            <div className="px-4">
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2 ml-1">App</p>
                <div className="bg-white rounded-[20px] overflow-hidden" style={{ boxShadow: '0 2px 14px rgba(67,97,238,0.09)' }}>
                    {MENU.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <div key={idx}>
                                <button
                                    onClick={() => navigate(item.path)}
                                    className="w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-9 h-9 rounded-[11px] flex items-center justify-center flex-shrink-0"
                                            style={{ background: item.bg }}
                                        >
                                            <Icon size={17} style={{ color: item.color }} strokeWidth={2.2} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-[13px] text-gray-800 leading-tight">{item.title}</p>
                                            <p className="text-[10px] text-gray-400 font-medium mt-0.5">{item.sub}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                                </button>
                                {idx < MENU.length - 1 && <div className="h-px bg-gray-50 mx-4" />}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-8 mb-4 text-center px-4">
                <p className="text-[11px] font-extrabold text-gray-300 uppercase tracking-widest">ApniDukan Shahjahanpur</p>
                <p className="text-[10px] text-gray-400 mt-1">Version 1.0.0 • Premium Edition</p>
                <p className="text-[10px] text-gray-300 mt-0.5">Made with ❤️ in Shahjahanpur</p>
            </div>
        </div>
    );
}
