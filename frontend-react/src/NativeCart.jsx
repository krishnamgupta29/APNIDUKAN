import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { getImageUrl } from './utils';
import { motion } from 'framer-motion';

export default function NativeCart({ cart, remFromCart, decreaseQty, addToCart, totalCalc, deliveryTotal, subtotal }) {
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="flex flex-col min-h-screen bg-[#f8f9fa] pt-12 px-4 pb-24 items-center justify-center text-center">
                <div className="w-24 h-24 bg-[var(--color-pink-orchid)]/10 rounded-full flex items-center justify-center mb-6">
                    <ShoppingBag size={40} className="text-[var(--color-pink-orchid)]" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Your Cart is Empty</h2>
                <p className="text-sm text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="w-full py-4 rounded-[16px] bg-gradient-to-r from-[var(--color-pink-orchid)] to-[var(--color-sky-blue)] text-white font-bold shadow-lg"
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa] pb-32">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-[var(--color-pink-orchid)]/10 px-4 pt-12 pb-4 shadow-sm flex items-center gap-3">
                <h1 className="text-xl font-bold text-gray-900">Your Bag <span className="text-[var(--color-pink-orchid)]">({cart.length})</span></h1>
            </div>

            {/* Cart Items */}
            <div className="p-4 space-y-3">
                {cart.map(c => (
                    <motion.div 
                        key={c.productId} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[20px] p-3 shadow-sm border border-[var(--color-pink-orchid)]/10 flex gap-3 items-center relative overflow-hidden"
                    >
                        <div className="w-20 h-20 rounded-[12px] bg-[var(--color-icy-blue)]/20 p-2 flex-shrink-0">
                            <img src={getImageUrl(c.image)} alt={c.name} className="w-full h-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="flex-1 min-w-0 py-1">
                            <h4 className="font-semibold text-sm text-gray-800 leading-tight mb-1 truncate">{c.name}</h4>
                            <div className="text-sm font-black text-gray-900 mb-2">₹{c.price}</div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center bg-[#f8f9fa] rounded-full border border-[var(--color-pink-orchid)]/20">
                                    <button onClick={() => decreaseQty(c.productId)} className="w-8 h-8 flex items-center justify-center text-gray-600 active:bg-gray-100 rounded-l-full"><Minus size={14}/></button>
                                    <span className="text-xs font-bold w-4 text-center">{c.quantity}</span>
                                    <button onClick={() => addToCart({_id: c.productId}, 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 active:bg-gray-100 rounded-r-full"><Plus size={14}/></button>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => remFromCart(c.productId)} 
                            className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center text-red-400 bg-red-50 rounded-full active:scale-90 transition-transform"
                        >
                            <Trash2 size={14} />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Order Summary */}
            <div className="px-4 mt-2">
                <div className="bg-white rounded-[20px] p-5 shadow-sm border border-[var(--color-pink-orchid)]/10">
                    <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-semibold text-gray-800">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            <span className={deliveryTotal > 0 ? "font-semibold text-gray-800" : "font-bold text-[var(--color-pink-orchid)]"}>
                                {deliveryTotal > 0 ? `₹${deliveryTotal}` : 'FREE'}
                            </span>
                        </div>
                        <div className="pt-3 border-t border-[var(--color-pink-orchid)]/10 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="text-xl font-black text-gray-900">₹{totalCalc}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout Button (Fixed at bottom above nav bar) */}
            <div className="fixed bottom-[80px] left-0 w-full p-4 bg-gradient-to-t from-[#f8f9fa] to-transparent pointer-events-none z-30">
                <button 
                    onClick={() => navigate('/checkout')} 
                    className="w-full py-4 rounded-[16px] bg-gradient-to-r from-[var(--color-pink-orchid)] to-[var(--color-sky-blue)] text-white font-bold shadow-lg pointer-events-auto active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    Proceed to Checkout
                </button>
            </div>
        </div>
    );
}
