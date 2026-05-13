import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, ArrowLeft, Phone } from 'lucide-react';
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

            // Save to local order history
            const localOrder = {
                _id: res.data._id, // Mongo ID for syncing
                orderId: res.data.orderId, // Custom ID for display
                phone: orderPayload.phone,
                customerName: orderPayload.customerName,
                address: orderPayload.address,
                items: orderPayload.items,
                totalAmount: orderPayload.total,
                status: 'ORDERED',
                createdAt: new Date().toISOString(),
                paymentMethod: 'COD'
            };
            try {
                const history = JSON.parse(localStorage.getItem('apni_order_history') || '[]');
                localStorage.setItem('apni_order_history', JSON.stringify([localOrder, ...history]));
            } catch (e) { console.error('History save failed', e); }

            setCart([]);
            setOrderPayload(prev => ({ ...prev, placedId: orderId }));
            navigate('/order-success');
        } catch(e) {
            alert('Failed placing order. Please try again.');
            setIsPlacingOrder(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="max-w-md mx-auto w-full px-4 py-8 mb-16"
        >
            <button onClick={() => navigate(-1)} disabled={isPlacingOrder} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 mb-6 transition">
                <ArrowLeft size={16} /> Edit Details
            </button>

            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-extrabold mb-2 text-gray-900">Confirm Order</h3>
                <p className="text-gray-500 text-sm mb-6 font-medium">Review your order details below.</p>

                <div className="bg-gray-50 p-5 rounded-2xl text-left text-sm space-y-3 mb-8 border border-gray-100">
                    <div className="flex justify-between items-start">
                        <p className="font-extrabold text-gray-900 tracking-tight">{orderPayload.customerName}</p>
                        <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-gray-100 text-gray-400 font-mono italic">Customer</span>
                    </div>
                    <p className="text-gray-500 text-xs flex items-center gap-2 font-medium">
                        <Phone size={12} className="text-gray-400" /> {orderPayload.phone}
                    </p>
                    <div className="bg-white/50 p-2.5 rounded-xl border border-gray-100/50">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                            <MapPin size={10} /> Delivery Address
                        </p>
                        <p className="text-gray-600 leading-relaxed max-h-24 overflow-y-auto text-xs font-medium">{orderPayload.address}</p>
                    </div>

                    <div className="space-y-2 pt-3 border-t border-gray-200/40">
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                            <span>Items Price</span>
                            <span>&#8377;{orderPayload.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-500">Delivery Charge</span>
                            <span className={orderPayload.deliveryTotal > 0 ? 'text-gray-900' : 'text-emerald-600'}>
                                {orderPayload.deliveryTotal > 0 ? <>{'+ \u20B9'}{orderPayload.deliveryTotal}</> : 'FREE'}
                            </span>
                        </div>
                        <div className="pt-2 mt-1 border-t border-gray-100 font-black flex justify-between text-base">
                            <span className="text-gray-900">Total To Pay</span>
                            <span className="text-emerald-600">&#8377;{orderPayload.total}</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={confirmOrderPlace}
                    disabled={isPlacingOrder}
                    className={`w-full py-4 font-bold rounded-xl transition flex justify-center items-center ${
                        isPlacingOrder
                            ? 'bg-gray-300 text-gray-300 animate-pulse cursor-wait'
                            : 'bg-gray-900 text-white hover:bg-black shadow-xl shadow-gray-900/20 active:scale-[0.98]'
                    }`}
                >
                    {isPlacingOrder ? 'Placing Order...' : 'Confirm Place Order'}
                </button>
            </div>
        </motion.div>
    );
}
