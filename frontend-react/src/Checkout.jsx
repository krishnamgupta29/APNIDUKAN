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

    const handleMapClickSubmit = async (e) => {
        e.preventDefault();
        const customerName = nameText;
        const phone = phoneText;
        setLocationError('');

        localStorage.setItem('apnidukan_user_details', JSON.stringify({
            name: customerName,
            phone: phone,
            address: addrText
        }));

        setOrderPayload({
            customerName, phone, address: addrText, items: cart, 
            subtotal, deliveryTotal, total: totalCalc
        });
        navigate('/confirm-order');
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

    return (
        <div className="flex flex-col min-h-screen pb-20" style={{ background: '#f8f9fd' }}>
            {/* Header */}
            <div 
                className="sticky top-0 z-40 px-4 pt-12 pb-6"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
                <div className="flex items-center gap-4 mb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 active:scale-90 transition-transform"
                    >
                        <ChevronLeft size={24} className="text-white" />
                    </button>
                    <h1 className="text-2xl font-black text-white">Checkout</h1>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/20">
                            <span className="text-xs font-black text-[#240046]">1</span>
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Details</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-white/20 mx-2 mb-6" />
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-xs font-black text-white">2</span>
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Review</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-white/20 mx-2 mb-6" />
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-xs font-black text-white">3</span>
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Done</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleMapClickSubmit} className="px-4 mt-8 space-y-6">
                {/* Contact Section */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center gap-2 mb-6">
                        <User size={18} className="text-[#4361ee]" />
                        <h2 className="text-base font-black text-gray-900">Contact Information</h2>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="relative">
                            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                name="name" required 
                                value={nameText} onChange={e => setNameText(e.target.value)} 
                                placeholder="Full Name" 
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#4361ee] font-bold text-sm outline-none transition-all" 
                            />
                        </div>
                        <div className="relative">
                            <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input 
                                name="phone" required 
                                value={phoneText} onChange={e => setPhoneText(e.target.value)} 
                                type="tel" pattern="^[0-9]{10}$" 
                                placeholder="Phone Number" 
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:border-[#4361ee] font-bold text-sm outline-none transition-all" 
                            />
                        </div>
                    </div>
                </div>

                {/* Delivery Section */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <MapPin size={18} className="text-[#f72585]" />
                            <h2 className="text-base font-black text-gray-900">Delivery Address</h2>
                        </div>
                        {savedDetails && (
                            <button 
                                type="button" onClick={handleAutoFill}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform"
                            >
                                <History size={12} /> Recent
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div className="relative">
                            <MapPin size={16} className="absolute left-4 top-5 text-gray-400" />
                            <textarea
                                name="address" required rows="4"
                                value={addrText}
                                onChange={e => { setAddrText(e.target.value); setLocationError(''); }}
                                placeholder="Full address with landmarks..."
                                className={`w-full p-4 pl-12 bg-gray-50 border rounded-2xl focus:bg-white font-bold text-sm outline-none resize-none transition-all ${
                                    locationError ? 'border-red-300 focus:border-red-500 bg-red-50/20' : 'border-gray-100 focus:border-[#f72585]'
                                }`}
                            />
                        </div>

                        <button 
                            type="button" onClick={handleUseGPS} disabled={fetchingGPS}
                            className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 bg-blue-50 text-[#4361ee] active:scale-95 transition-transform disabled:opacity-50"
                        >
                            {fetchingGPS ? (
                                <div className="w-5 h-5 border-2 border-[#4361ee] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <><Navigation size={18} /> Use Current Location</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Payment Section (Locked to COD) */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                        <ShieldCheck size={18} className="text-emerald-500" />
                        <h2 className="text-base font-black text-gray-900">Payment Method</h2>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                        <span className="font-bold text-emerald-700 text-sm">Cash on Delivery (COD)</span>
                    </div>
                </div>

                {/* Action Button */}
                <button 
                    type="submit" 
                    className="w-full py-5 bg-gray-900 text-white rounded-[24px] font-black text-base flex justify-center items-center gap-2 shadow-2xl shadow-gray-900/30 active:scale-95 transition-transform"
                >
                    Review Order <ArrowRight size={20}/>
                </button>
            </form>

            <div className="py-10 text-center opacity-30">
                <p className="text-[10px] font-black uppercase tracking-widest">Secure Checkout v1.2</p>
            </div>
        </div>
    );
}
