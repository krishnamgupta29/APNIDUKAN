import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, ChevronLeft, History, User, Phone, Navigation, ShieldCheck } from 'lucide-react';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export default function Checkout({ cart, subtotal, deliveryTotal, totalCalc, setOrderPayload }) {
    const navigate = useNavigate();
    const [nameText, setNameText] = useState('');
    const [phoneText, setPhoneText] = useState('');
    const [addrText, setAddrText] = useState('');
    const [fetchingGPS, setFetchingGPS] = useState(false);
    const [locationError, setLocationError] = useState('');
    const [savedDetails, setSavedDetails] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem('apnidukan_user_details');
        if (saved) {
            setSavedDetails(JSON.parse(saved));
        }
    }, []);

    const handleAutoFill = () => {
        if (savedDetails) {
            setNameText(savedDetails.name || '');
            setPhoneText(savedDetails.phone || '');
            setAddrText(savedDetails.address || '');
        }
    };

    const reverseGeocode = async (lat, lon) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`, {
                headers: { 'Accept-Language': 'en' }
            });
            const data = await res.json();
            if (data && data.address) {
                // Try to build a clean address
                const a = data.address;
                const parts = [
                    a.suburb || a.neighbourhood || a.road,
                    a.city_district || a.city || a.town || a.village,
                    a.state_district || a.county,
                    a.state,
                    a.postcode
                ].filter(Boolean);
                return parts.join(', ') || data.display_name;
            }
            return data?.display_name || null;
        } catch(e) { 
            console.error("Geocoding error:", e);
            return null; 
        }
    };

    const handleUseGPS = async () => {
        setFetchingGPS(true);
        setLocationError('');
        
        try {
            let position;
            if (Capacitor.isNativePlatform()) {
                // Native Capacitor Geolocation
                const permission = await Geolocation.checkPermissions();
                if (permission.location !== 'granted') {
                    const request = await Geolocation.requestPermissions();
                    if (request.location !== 'granted') {
                        throw new Error("Location permission denied");
                    }
                }
                position = await Geolocation.getCurrentPosition({
                    enableHighAccuracy: true,
                    timeout: 10000
                });
            } else {
                // Browser Fallback
                if (!navigator.geolocation) throw new Error("GPS not supported on this device");
                position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000
                    });
                });
            }

            const { latitude, longitude } = position.coords;
            const address = await reverseGeocode(latitude, longitude);
            
            if (address) {
                setAddrText(address);
            } else {
                setAddrText(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
                setLocationError("Couldn't find address name, added coordinates instead.");
            }
        } catch (err) {
            console.error("GPS Error:", err);
            let msg = "Unable to fetch location";
            if (err.message.includes("denied")) msg = "Location permission denied. Please enable it in settings.";
            if (err.code === 3 || err.message.includes("timeout")) msg = "Location request timed out. Make sure GPS is on.";
            setLocationError(msg);
            alert(msg);
        } finally {
            setFetchingGPS(false);
        }
    };


    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-[#f8f9fd]">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-gray-200">
                    <ShieldCheck size={48} className="text-gray-300" />
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">Your bag is empty</h2>
                <p className="text-sm text-gray-400 mb-8">Add some items to start your checkout</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="w-full max-w-xs py-4 bg-gray-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-gray-900/20 active:scale-95 transition-transform"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    const handleMapClickSubmit = (e) => {
        if (e) e.preventDefault();
        const payload = {
            customerName: nameText,
            phone: phoneText,
            address: addrText,
            items: cart,
            subtotal,
            deliveryTotal,
            total: totalCalc
        };
        
        // Save details for next time
        localStorage.setItem('apnidukan_user_details', JSON.stringify({
            name: nameText,
            phone: phoneText,
            address: addrText
        }));

        setOrderPayload(payload);
        navigate('/confirm-order');
    };

    return (
        <div className="flex flex-col min-h-screen pb-20" style={{ background: '#f8f9fd' }}>
            {/* Header */}
            <div 
                className="sticky top-0 z-40 px-4 pt-12 pb-8 rounded-b-[40px]"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
            >
                <div className="flex items-center gap-4 mb-8">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/10 backdrop-blur-md active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <h1 className="text-2xl font-black text-white tracking-tight">Checkout</h1>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between px-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            <User size={16} className="text-[#240046]" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Details</span>
                    </div>
                    <div className="flex-1 h-[2px] bg-white/10 mx-3 mb-6" />
                    <div className="flex flex-col items-center gap-2 opacity-30">
                        <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
                            <CreditCard size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Review</span>
                    </div>
                    <div className="flex-1 h-[2px] bg-white/10 mx-3 mb-6" />
                    <div className="flex flex-col items-center gap-2 opacity-30">
                        <div className="w-9 h-9 rounded-2xl bg-white/10 flex items-center justify-center">
                            <ShieldCheck size={16} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Done</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleMapClickSubmit} className="px-5 mt-8 space-y-8">
                
                {/* Contact Section */}
                <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className="space-y-4">
                    <div className="flex items-center justify-between mb-2 ml-1">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Information</h3>
                    </div>
                    
                    <div className="bg-white rounded-[32px] p-2 shadow-xl shadow-blue-900/5 border border-gray-50">
                        <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#4361ee] group-focus-within:bg-[#4361ee] group-focus-within:text-white transition-all">
                                <User size={18} />
                            </div>
                            <input 
                                name="name" required 
                                value={nameText} onChange={e => setNameText(e.target.value)} 
                                placeholder="Full Name" 
                                className="w-full h-16 pl-20 pr-6 bg-transparent rounded-3xl font-black text-gray-800 text-sm outline-none transition-all placeholder:text-gray-300" 
                            />
                        </div>
                        <div className="h-px bg-gray-50 mx-6" />
                        <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center text-[#f72585] group-focus-within:bg-[#f72585] group-focus-within:text-white transition-all">
                                <Phone size={18} />
                            </div>
                            <input 
                                name="phone" required 
                                value={phoneText} onChange={e => setPhoneText(e.target.value)} 
                                type="tel" pattern="^[0-9]{10}$" 
                                placeholder="10-Digit Mobile Number" 
                                className="w-full h-16 pl-20 pr-6 bg-transparent rounded-3xl font-black text-gray-800 text-sm outline-none transition-all placeholder:text-gray-300" 
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Delivery Section */}
                <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.1}} className="space-y-4">
                    <div className="flex items-center justify-between mb-2 ml-1">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Delivery Address</h3>
                        {savedDetails && (
                            <button 
                                type="button" onClick={handleAutoFill}
                                className="px-3 py-1.5 bg-blue-50 text-[#4361ee] rounded-full text-[9px] font-black uppercase tracking-widest active:scale-95 transition-all"
                            >
                                <History size={12} className="inline mr-1" /> Use Saved
                            </button>
                        )}
                    </div>

                    <div className="bg-white rounded-[40px] p-3 shadow-xl shadow-blue-900/5 border border-gray-50 relative">
                        <div className="relative">
                            <div className="absolute left-4 top-4 w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <MapPin size={18} />
                            </div>
                            <textarea
                                name="address" required rows="4"
                                value={addrText}
                                onChange={e => { setAddrText(e.target.value); setLocationError(''); }}
                                placeholder="Street name, House/Flat no., Landmark (Shahjahanpur)"
                                className={`w-full p-6 pl-16 bg-gray-50/50 rounded-[32px] font-bold text-sm outline-none resize-none transition-all border-2 border-transparent focus:bg-white focus:border-purple-200 ${
                                    locationError ? 'border-red-300' : ''
                                }`}
                            />
                        </div>

                        <div className="mt-3 p-1">
                            <button 
                                type="button" onClick={handleUseGPS} disabled={fetchingGPS}
                                className="w-full h-14 rounded-[24px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-[#4361ee] text-white shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {fetchingGPS ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <><Navigation size={18} className="rotate-45" /> Auto-Detect My Location</>
                                )}
                            </button>
                            {locationError && (
                                <p className="text-[10px] text-red-500 font-black mt-3 text-center px-4 leading-tight uppercase tracking-widest">{locationError}</p>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Payment Section */}
                <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} transition={{delay:0.2}}>
                    <div className="flex items-center justify-between mb-4 ml-1">
                        <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Payment Mode</h3>
                    </div>
                    <div className="p-5 bg-white rounded-[32px] border-2 border-emerald-500/10 shadow-xl shadow-emerald-900/5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="font-black text-sm text-gray-900">Cash on Delivery</p>
                                <p className="text-[11px] text-emerald-600 font-bold">100% Safe Payment</p>
                            </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                    </div>
                </motion.div>

                {/* Action Button */}
                <button 
                    type="submit" 
                    className="w-full py-6 bg-gray-900 text-white rounded-[32px] font-black text-base flex justify-center items-center gap-3 shadow-2xl shadow-gray-900/40 active:scale-[0.98] transition-all mt-4"
                >
                    Review & Confirm <ArrowRight size={22}/>
                </button>
            </form>

            <div className="py-12 text-center">
                <div className="flex justify-center gap-6 opacity-20">
                    <div className="h-6 w-12 bg-gray-400 rounded-md" />
                    <div className="h-6 w-12 bg-gray-400 rounded-md" />
                    <div className="h-6 w-12 bg-gray-400 rounded-md" />
                </div>
                <p className="text-[10px] font-black text-gray-300 mt-6 uppercase tracking-[0.3em]">Encrypted Checkout v2.0</p>
            </div>
        </div>
    );
}
