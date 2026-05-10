import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, MapPin, Settings } from 'lucide-react';
import NativeHome from './NativeHome';
import NativeCart from './NativeCart';
import NativeTrack from './NativeTrack';
import NativeSettings from './NativeSettings';
import ProductPage from './ProductPage';
import Checkout from './Checkout';
import ConfirmOrder from './ConfirmOrder';
import OrderSuccess from './OrderSuccess';
import Legal from './Legal';
import SupportPage from './SupportPage';
import HowToUse from './HowToUse';
import FAQs from './FAQs';

function BottomNav({ cartCount }) {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { path: '/', icon: Home, label: 'Home' },
        { path: '/cart', icon: ShoppingBag, label: 'Cart', badge: cartCount },
        { path: '/track', icon: MapPin, label: 'Track' },
        { path: '/settings', icon: Settings, label: 'Settings' }
    ];

    // Hide bottom nav on specific pages
    const hideOn = ['/checkout', '/confirm-order', '/order-success', '/product'];
    if (hideOn.some(path => location.pathname.startsWith(path))) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full h-[70px] bg-white/80 backdrop-blur-xl border-t border-[var(--color-pink-orchid)]/20 z-50 rounded-t-[24px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
            <div className="flex items-center justify-around h-full px-2">
                {tabs.map((tab, idx) => {
                    const isActive = location.pathname === tab.path || (tab.path === '/' && location.pathname.startsWith('/category'));
                    const Icon = tab.icon;
                    return (
                        <button
                            key={idx}
                            onClick={() => navigate(tab.path)}
                            className="relative flex flex-col items-center justify-center w-16 h-full transition-transform active:scale-90"
                        >
                            <div className={`relative p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-[var(--color-pink-orchid)] to-[var(--color-pastel-petal)] text-white shadow-md -translate-y-2' : 'text-gray-400'}`}>
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                {tab.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                        {tab.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold mt-0.5 transition-all duration-300 ${isActive ? 'text-gray-900 opacity-100 translate-y-0' : 'text-gray-400 opacity-0 translate-y-2 absolute bottom-1'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default function NativeApp({
    cart, addToCart, remFromCart, decreaseQty,
    subtotal, deliveryTotal, totalCalc,
    orderPayload, setOrderPayload, setCart
}) {
    return (
        <div className="flex flex-col relative w-full h-full bg-[#f8f9fa] overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden">
                <Routes>
                    <Route path="/" element={<NativeHome addToCart={addToCart} />} />
                    <Route path="/cart" element={
                        <NativeCart 
                            cart={cart} 
                            remFromCart={remFromCart} 
                            decreaseQty={decreaseQty} 
                            addToCart={addToCart} 
                            totalCalc={totalCalc} 
                            subtotal={subtotal} 
                            deliveryTotal={deliveryTotal} 
                        />
                    } />
                    <Route path="/track" element={<NativeTrack />} />
                    <Route path="/settings" element={<NativeSettings />} />
                    
                    {/* Reuse existing web pages for details, they are mobile optimized anyway */}
                    <Route path="/product/:productId" element={<ProductPage addToCart={addToCart} />} />
                    <Route path="/checkout" element={<Checkout cart={cart} subtotal={subtotal} deliveryTotal={deliveryTotal} totalCalc={totalCalc} setOrderPayload={setOrderPayload} />} />
                    <Route path="/confirm-order" element={<ConfirmOrder orderPayload={orderPayload} setCart={setCart} setOrderPayload={setOrderPayload} />} />
                    <Route path="/order-success" element={<OrderSuccess orderPayload={orderPayload} setOrderPayload={setOrderPayload} />} />
                    
                    <Route path="/legal" element={<Legal />} />
                    <Route path="/support" element={<SupportPage />} />
                    <Route path="/how-to-use" element={<HowToUse />} />
                    <Route path="/faqs" element={<FAQs />} />
                </Routes>
            </div>
            
            <BottomNav cartCount={cart.reduce((a, c) => a + c.quantity, 0)} />
        </div>
    );
}
