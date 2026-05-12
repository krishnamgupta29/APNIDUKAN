import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { getImageUrl } from './utils';
import { motion } from 'framer-motion';

export default function NativeCart({ cart, remFromCart, decreaseQty, addToCart, totalCalc, deliveryTotal, subtotal }) {
    const navigate = useNavigate();

    if (cart.length === 0) {
        return (
            <div className="flex flex-col min-h-screen items-center justify-center pb-28 px-6 text-center" style={{ background: '#f0f1f7' }}>
                <div
                    className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
                    style={{ background: 'linear-gradient(135deg,rgba(247,37,133,0.12),rgba(67,97,238,0.12))' }}
                >
                    <ShoppingBag size={48} style={{ color: '#f72585' }} />
                </div>
                <h2 className="text-2xl font-extrabold text-gray-800 mb-2">Your Cart is Empty</h2>
                <p className="text-sm text-gray-500 mb-8 max-w-xs">Looks like you haven't added anything yet. Start exploring!</p>
                <button
                    onClick={() => navigate('/')}
                    className="w-full py-4 rounded-[18px] font-bold text-white text-base shadow-xl"
                    style={{ background: 'linear-gradient(135deg,#f72585,#4361ee)', boxShadow: '0 8px 24px rgba(247,37,133,0.35)' }}
                >
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen pb-[200px]" style={{ background: '#f0f1f7' }}>

            {/* Header */}
            <div
                className="sticky top-0 z-40 px-4 pt-12 pb-4"
                style={{ background: 'linear-gradient(160deg,#0d0221 0%,#240046 100%)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
            >
                <h1 className="text-2xl font-black text-white">
                    Your Bag
                    <span className="ml-2 text-base font-bold" style={{ color: '#f72585' }}>({cart.length} items)</span>
                </h1>
            </div>

            {/* Cart Items */}
            <div className="p-3 space-y-3 mt-2">
                {cart.map((c, idx) => (
                    <motion.div
                        key={c.productId}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.06 }}
                        className="bg-white rounded-[18px] p-3 flex gap-3 items-center relative overflow-hidden"
                        style={{ boxShadow: '0 2px 14px rgba(67,97,238,0.09)' }}
                        onClick={() => navigate(`/product/${c.productId}`)}
                    >
                        {/* Product image */}
                        <div className="w-[72px] h-[72px] rounded-[12px] flex-shrink-0 flex items-center justify-center p-1.5" style={{ background: '#f6f7fb' }}>
                            <img src={getImageUrl(c.image)} alt={c.name} className="w-full h-full object-contain mix-blend-multiply" loading="lazy" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 py-0.5">
                            <h4 className="font-semibold text-[12px] text-gray-800 leading-tight mb-1 pr-8 line-clamp-2">{c.name}</h4>
                            <div className="text-sm font-extrabold text-gray-900 mb-2">₹{c.price}</div>

                            {/* Qty controls */}
                            <div
                                className="flex items-center rounded-full overflow-hidden w-fit"
                                onClick={e => e.stopPropagation()}
                                style={{ border: '1.5px solid rgba(67,97,238,0.15)', background: '#f0f1f7' }}
                            >
                                <button onClick={() => decreaseQty(c.productId)} className="w-8 h-8 flex items-center justify-center text-gray-600 active:bg-gray-200 transition-colors">
                                    <Minus size={13} />
                                </button>
                                <span className="text-xs font-bold w-5 text-center text-gray-900">{c.quantity}</span>
                                <button onClick={() => addToCart({ _id: c.productId }, 1)} className="w-8 h-8 flex items-center justify-center text-gray-600 active:bg-gray-200 transition-colors">
                                    <Plus size={13} />
                                </button>
                            </div>
                        </div>

                        {/* Delete */}
                        <button
                            onClick={e => { e.stopPropagation(); remFromCart(c.productId); }}
                            className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full bg-red-50 active:scale-90 transition-transform"
                        >
                            <Trash2 size={13} className="text-red-400" />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Order Summary */}
            <div className="px-3 mt-2">
                <div className="bg-white rounded-[20px] p-5" style={{ boxShadow: '0 2px 14px rgba(67,97,238,0.09)' }}>
                    <h3 className="font-extrabold text-gray-900 mb-4 text-base">Order Summary</h3>
                    <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Subtotal ({cart.reduce((a, c) => a + c.quantity, 0)} items)</span>
                            <span className="font-bold text-gray-800">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium flex items-center gap-1.5"><Truck size={13} />Delivery Fee</span>
                            {deliveryTotal > 0
                                ? <span className="font-bold text-gray-800">₹{deliveryTotal}</span>
                                : <span className="font-extrabold text-emerald-500">FREE 🎉</span>
                            }
                        </div>
                        <div className="pt-3.5 border-t border-gray-100 flex justify-between items-center">
                            <span className="font-extrabold text-gray-900 text-base">Total</span>
                            <span className="text-xl font-black" style={{ color: '#4361ee' }}>₹{totalCalc}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Checkout CTA – adaptive positioning above nav */}
            <div className="fixed bottom-0 left-0 w-full px-4 z-40 pointer-events-none pb-[calc(88px+env(safe-area-inset-bottom,16px))]">
                <div className="absolute inset-0 bg-gradient-to-t from-[#f0f1f7] via-[#f0f1f7]/80 to-transparent -z-10 h-32 mt-auto" />
                <button
                    onClick={() => navigate('/checkout')}
                    className="w-full py-4 rounded-[20px] text-white font-extrabold text-base flex items-center justify-center gap-2 pointer-events-auto active:scale-[0.98] transition-transform shadow-2xl"
                    style={{ 
                        background: 'linear-gradient(135deg,#f72585,#4361ee)', 
                        boxShadow: '0 8px 32px rgba(247,37,133,0.45)' 
                    }}
                >
                    Proceed to Checkout <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}
