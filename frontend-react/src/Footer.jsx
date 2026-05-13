import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Instagram, Headphones, MapPin } from 'lucide-react';

export default function Footer() {
    const navigate = useNavigate();

    const go = (path) => () => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const LinkBtn = ({ to, children }) => (
        <button
            onClick={go(to)}
            className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group text-left"
        >
            <ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
            {children}
        </button>
    );

    return (
        <footer className="w-full bg-white border-t border-gray-100 pt-16 pb-8 mt-auto relative z-10">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">

                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="text-2xl font-extrabold tracking-tight mb-4 text-gray-900 cursor-pointer" onClick={go('/')}>
                            Apni<span className="text-blue-500">Dukaan</span>
                        </div>
                        <p className="text-gray-500 font-medium mb-5 max-w-sm leading-relaxed text-sm">
                            Apni Dukan Shahjahanpur is your premier local marketplace. Experience the best online shopping and fast delivery right at your doorstep.
                        </p>
                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 w-max px-3 py-1.5 rounded-full mb-2">
                            <ShieldCheck size={16} /> 100% Secure &amp; Trusted Checkout
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium ml-1">
                            <MapPin size={12} /> Shahjahanpur, Uttar Pradesh
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Platform</h4>
                        <ul className="space-y-4">
                            <li><LinkBtn to="/">Shop Products</LinkBtn></li>
                            <li><LinkBtn to="/track">My Orders</LinkBtn></li>
                            <li><LinkBtn to="/how-to-use">How To Use</LinkBtn></li>
                            <li><button onClick={() => navigate('/download')} className="text-gray-500 hover:text-emerald-600 font-medium transition-colors text-sm flex items-center gap-2 group text-left"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" /> Download App</button></li>
                            <li><LinkBtn to="/support">Contact Support</LinkBtn></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Legal &amp; Info</h4>
                        <ul className="space-y-4">
                            <li><LinkBtn to="/legal">About Us</LinkBtn></li>
                            <li><LinkBtn to="/legal">Terms &amp; Conditions</LinkBtn></li>
                            <li><LinkBtn to="/legal">Privacy Policy</LinkBtn></li>
                            <li><LinkBtn to="/faqs">FAQs</LinkBtn></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="text-sm font-medium text-gray-500">
                        &copy; {new Date().getFullYear()} ApniDukaan. All rights reserved.
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="flex items-center gap-3">
                            <a
                                href="https://www.instagram.com/apni_dukan_shahjahanpur?igsh=MWdxaWlnaHdpM2VrYg=="
                                target="_blank" rel="noreferrer"
                                className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#E1306C] hover:text-white hover:border-[#E1306C] transition-all"
                            >
                                <Instagram size={16} />
                            </a>
                            <a
                                href="mailto:supportspn07@gmail.com"
                                className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                            >
                                <Headphones size={16} />
                            </a>
                        </div>
                        <div className="text-sm font-medium text-gray-600">
                            Developed by{' '}
                            <a href="https://krishnamportfolio.netlify.app/" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                                Krishnam Gupta
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
