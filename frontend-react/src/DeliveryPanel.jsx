import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, CheckCircle, XCircle, LogOut } from 'lucide-react';
import API_URL from './api';

export default function DeliveryPanel() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    
    const token = sessionStorage.getItem('auth_token');
    const userName = sessionStorage.getItem('user_name');

    useEffect(() => {
        if (!token || sessionStorage.getItem('user_role') !== 'delivery') {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [navigate, token]);

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/orders/my-deliveries`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Filter to only show pending/assigned orders in active view
            setOrders(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status: newStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Remove from active list
            setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const logout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading...</div>;

    const activeOrders = orders.filter(o => o.status === 'assigned');
    const completedOrders = orders.filter(o => o.status === 'delivered' || o.status === 'returned');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-10">
                <div className="flex justify-between items-center max-w-lg mx-auto">
                    <div className="flex items-center gap-2">
                        <Package size={24} className="text-blue-400" />
                        <h1 className="font-bold text-lg">Delivery Panel</h1>
                    </div>
                    <button onClick={logout} className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            <div className="max-w-lg mx-auto p-4 pb-20">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 mt-2">Welcome, {userName}</h2>
                
                <h3 className="font-bold text-xl mb-3 text-gray-900">Active Deliveries ({activeOrders.length})</h3>
                <div className="space-y-4 mb-8">
                    {activeOrders.length === 0 ? (
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center text-gray-400 font-medium">
                            No active deliveries right now.
                        </div>
                    ) : activeOrders.map(order => (
                        <div key={order._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <span className="font-mono font-bold text-gray-900">{order.orderId}</span>
                                <span className="font-extrabold text-blue-600">₹{order.total}</span>
                            </div>
                            <h4 className="font-bold text-lg text-gray-800 mb-1">{order.customerName}</h4>
                            <p className="text-gray-500 font-mono text-sm mb-3">📞 {order.phone}</p>
                            
                            <div className="bg-gray-50 p-3 rounded-xl flex items-start gap-2 mb-4 border border-gray-100">
                                <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                                <span className="text-sm text-gray-700 leading-snug">{order.address}</span>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={() => updateStatus(order._id, 'delivered')} className="flex-1 bg-emerald-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                    <CheckCircle size={18} /> Delivered
                                </button>
                                <button onClick={() => updateStatus(order._id, 'returned')} className="flex-1 bg-red-50 text-red-600 font-bold py-3 rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-all">
                                    <XCircle size={18} /> Returned
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {completedOrders.length > 0 && (
                    <>
                        <h3 className="font-bold text-xl mb-3 text-gray-900 mt-8">Recent History</h3>
                        <div className="space-y-3">
                            {completedOrders.map(order => (
                                <div key={order._id} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center opacity-80">
                                    <div>
                                        <p className="font-bold text-gray-800">{order.orderId}</p>
                                        <p className="text-xs text-gray-500">{order.customerName}</p>
                                    </div>
                                    {order.status === 'delivered' ? (
                                        <span className="text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full border border-emerald-100">Delivered</span>
                                    ) : (
                                        <span className="text-xs font-bold bg-red-50 text-red-600 px-3 py-1 rounded-full border border-red-100">Returned</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
