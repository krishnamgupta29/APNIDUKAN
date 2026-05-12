import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, ChevronLeft, CreditCard, ShoppingBag, Truck, Zap } from 'lucide-react';
import axios from 'axios';
import API_URL from './api';

export default function ConfirmOrder({ orderPayload, setCart, setOrderPayload }) {
    const navigate = useNavigate();
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    useEffect(() => {
        if (!orderPayload || !orderPayload.customerName) {
            navigate('/checkout');
        }
    }, [orderPayload, navigate]);

    if (!orderPayload || !orderPayload.customerName) return null;

    const confirmOrderPlace = async () => {
        setIsPlacingOrder(true);
        try {
            const res = await axios.post(`${API_URL}/api/orders`, orderPayload);
            const orderId = res.data.orderId;
            
            // Local History Save
            const localOrder = {
                _id: orderId,
                phone: orderPayload.phone,
                customerName: orderPayload.customerName,
                address: orderPayload.address,
                items: orderPayload.items,
                totalAmount: orderPayload.total,
                status: 'Pending',
                createdAt: new Date().toISOString(),
                paymentMethod: 'COD'
            };
            
            try {
                const history = JSON.parse(localStorage.getItem('apni_order_history') || '[]');
                localStorage.setItem('apni_order_history', JSON.stringify([localOrder, ...history]));
            } catch (e) { console.error("History save failed", e); }

            setCart([]); 
            setOrderPayload(prev => ({...prev, placedId: orderId}));
            navigate('/order-success');
        } catch(e) { 
            alert("Failed placing order."); 
            setIsPlacingOrder(false);
        }
    };

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
                    <h1 className="text-2xl font-black text-white">Review Order</h1>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between px-2">
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="text-xs font-black text-white">1</span>
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Details</span>
                    </div>
                    <div className="flex-1 h-0.5 bg-white/20 mx-2 mb-6" />
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg shadow-white/20">
                            <span className="text-xs font-black text-[#240046]">2</span>
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

            <div className="px-4 mt-8 space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-50">
                    <div className="p-6 bg-gray-50/50 border-b border-gray-100">
                        <h2 className="text-base font-black text-gray-900 flex items-center gap-2">
                            <ShoppingBag size={18} className="text-[#4361ee]" /> Order Summary
                        </h2>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        {orderPayload.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center">
                                <div className="flex-1 min-w-0 pr-4">
                                    <p className="text-sm font-bold text-gray-800 truncate">{item.name}</p>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity} × ₹{item.price}</p>
                                </div>
                                <span className="text-sm font-black text-gray-900">₹{item.price * item.quantity}</span>
                            </div>
                        ))}
                        
                        <div className="pt-4 border-t border-gray-50 space-y-2">
                            <div className="flex justify-between text-xs font-bold text-gray-400">
                                <span>Subtotal</span>
                                <span>₹{orderPayload.subtotal}</span>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                                <span className="text-gray-400">Delivery</span>
                                <span className={orderPayload.deliveryTotal > 0 ? 'text-gray-900' : 'text-emerald-500'}>
                                    {orderPayload.deliveryTotal > 0 ? `+ ₹${orderPayload.deliveryTotal}` : 'FREE'}
                                </span>
                            </div>
                            <div className="pt-3 flex justify-between items-center">
                                <span className="text-base font-black text-gray-900">Total to Pay</span>
                                <span className="text-xl font-black text-emerald-600">₹{orderPayload.total}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Card */}
                <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-50">
                    <div className="flex items-center gap-2 mb-4">
                        <Truck size={18} className="text-[#f72585]" />
                        <h2 className="text-base font-black text-gray-900">Shipping To</h2>
                    </div>
                    <p className="text-sm font-bold text-gray-800 mb-1">{orderPayload.customerName}</p>
                    <p className="text-xs font-black text-gray-400 mb-3">{orderPayload.phone}</p>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex gap-3">
                        <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-500 font-medium leading-relaxed">{orderPayload.address}</p>
                    </div>
                </div>

                {/* Action Button */}
                <button 
                    onClick={confirmOrderPlace} 
                    disabled={isPlacingOrder}
                    className="w-full py-5 bg-gray-900 text-white rounded-[28px] font-black text-base flex justify-center items-center gap-2 shadow-2xl shadow-gray-900/30 active:scale-95 transition-transform disabled:opacity-50"
                >
                    {isPlacingOrder ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <><CheckCircle2 size={20}/> Confirm & Place Order</>
                    )}
                </button>
            </div>
        </div>
    );
}
