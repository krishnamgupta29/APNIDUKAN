import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Heart, Instagram } from 'lucide-react';

export default function Footer() {
    const navigate = useNavigate();
    
    return (
        <footer className="w-full bg-white border-t border-gray-100 pt-16 pb-8 mt-auto relative z-10">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <div className="text-2xl font-extrabold tracking-tight mb-4 text-gray-900">
                            Apni<span className="text-blue-500">Dukaan</span>
                        </div>
                        <p className="text-gray-500 font-medium mb-4 max-w-sm leading-relaxed">
                            Apni Dukan Shahjahanpur is your premier local marketplace. Experience the best online shopping and grocery delivery in Shahjahanpur, ensuring fast delivery right at your doorstep.
                        </p>

                        <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 w-max px-3 py-1.5 rounded-full mb-1">
                            <ShieldCheck size={16} /> 100% Secure & Trusted Checkout
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium ml-2">Your data is safe and encrypted.</div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Platform</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => navigate('/')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Shop Products</button></li>
                            <li><button onClick={() => navigate('/track')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Track Order</button></li>
                            <li><a href="mailto:support@apnidukaan.com" className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Contact Support</a></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-xs">Legal & Info</h4>
                        <ul className="space-y-4">
                            <li><button onClick={() => navigate('/legal')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> About Us</button></li>
                            <li><button onClick={() => navigate('/legal')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Terms & Conditions</button></li>
                            <li><button onClick={() => navigate('/legal')} className="text-gray-500 hover:text-blue-600 font-medium transition-colors text-sm flex items-center gap-2 group"><ArrowRight size={14} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all"/> Privacy Policy</button></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="text-sm font-medium text-gray-500">
                        &copy; {new Date().getFullYear()} ApniDukaan. All rights reserved.
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="flex items-center gap-3">
                            <a href="https://www.instagram.com/apni_dukan_shahjahanpur?igsh=MWdxaWlnaHdpM2VrYg==" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-[#E1306C] hover:text-white transition-colors">
                                <Instagram size={16} />
                            </a>
                        </div>
                        <div className="text-xs font-bold text-gray-400 tracking-wider">
                            Developed in Shahjahanpur & operated locally
                        </div>
                        <div className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                            Developed by <a href="https://krishnamportfolio.netlify.app/" target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">Krishnam Gupta</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
