import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, MapPin, Settings } from 'lucide-react';
import NativeHome from './NativeHome';
import NativeCart from './NativeCart';
import NativeTrack from './NativeTrack';
import NativeSettings from './NativeSettings';
import NativeProductPage from './NativeProductPage';
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
        { path: '/',         icon: Home,        label: 'Home' },
        { path: '/cart',     icon: ShoppingBag, label: 'Cart', badge: cartCount },
        { path: '/track',    icon: MapPin,       label: 'Orders' },
        { path: '/settings', icon: Settings,     label: 'Settings' },
    ];

    const hideOn = ['/checkout', '/confirm-order', '/order-success', '/product'];
    if (hideOn.some(p => location.pathname.startsWith(p))) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 pb-safe pointer-events-none">
            <div
                className="mx-3 mb-2 rounded-[28px] pointer-events-auto"
                style={{
                    background: 'rgba(8, 2, 24, 0.88)',
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    boxShadow: '0 -2px 40px rgba(67,97,238,0.25), 0 8px 32px rgba(0,0,0,0.5)',
                    border: '1px solid rgba(255,255,255,0.07)',
                }}
            >
                <div className="flex items-center justify-around h-16 px-2">
                    {tabs.map((tab, idx) => {
                        const isActive =
                            location.pathname === tab.path ||
                            (tab.path === '/' && location.pathname.startsWith('/category'));
                        const Icon = tab.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => navigate(tab.path)}
                                className="relative flex flex-col items-center justify-center w-16 h-full transition-all duration-200 active:scale-90"
                            >
                                <div className={`flex flex-col items-center gap-0.5 transition-all duration-300 ${isActive ? '-translate-y-0.5' : ''}`}>
                                    <div
                                        className={`relative p-2.5 rounded-2xl transition-all duration-300 ${isActive ? 'shadow-lg' : ''}`}
                                        style={isActive ? { background: 'linear-gradient(135deg, #f72585, #4361ee)', boxShadow: '0 4px 18px rgba(247,37,133,0.4)' } : {}}
                                    >
                                        <Icon
                                            size={20}
                                            strokeWidth={isActive ? 2.5 : 2}
                                            className={isActive ? 'text-white' : 'text-white/35'}
                                        />
                                        {tab.badge > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 bg-[#f72585] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-black/30">
                                                {tab.badge > 9 ? '9+' : tab.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[9px] font-bold tracking-wide transition-all duration-300 ${isActive ? 'text-white' : 'text-white/30'}`}>
                                        {tab.label}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
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
        <div className="flex flex-col relative w-full h-full native-app-bg overflow-hidden">
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
                    <Route path="/track"    element={<NativeTrack />} />
                    <Route path="/settings" element={<NativeSettings />} />

                    <Route path="/product/:productId" element={<NativeProductPage addToCart={addToCart} />} />
                    <Route path="/checkout"      element={<Checkout cart={cart} subtotal={subtotal} deliveryTotal={deliveryTotal} totalCalc={totalCalc} setOrderPayload={setOrderPayload} />} />
                    <Route path="/confirm-order" element={<ConfirmOrder orderPayload={orderPayload} setCart={setCart} setOrderPayload={setOrderPayload} />} />
                    <Route path="/order-success" element={<OrderSuccess orderPayload={orderPayload} setOrderPayload={setOrderPayload} />} />

                    <Route path="/legal"       element={<Legal />} />
                    <Route path="/support"     element={<SupportPage />} />
                    <Route path="/how-to-use"  element={<HowToUse />} />
                    <Route path="/faqs"        element={<FAQs />} />
                </Routes>
            </div>
            <BottomNav cartCount={cart.reduce((a, c) => a + c.quantity, 0)} />
        </div>
    );
}
