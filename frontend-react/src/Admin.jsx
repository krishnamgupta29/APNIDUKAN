import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Package, Trash2, X, Check, UploadCloud, AlertOctagon, MapPin, Download, Users, Truck, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import API_URL from './api';
import { getImageUrl } from './utils';

export default function Admin() {
    const navigate = useNavigate();
    const ADMIN_TOKEN = sessionStorage.getItem('auth_token') || 'apnidukanspn9140';
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 1024);
    
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [auth, setAuth] = useState(!!sessionStorage.getItem('auth_token')); // Memory-only session or token presence
    const [pass, setPass] = useState('');
    const [error, setError] = useState('');
    const [shakeKey, setShakeKey] = useState(0);
    const [view, setView] = useState('catalog'); // 'orders' | 'catalog' | 'delivery'
    const [orderTab, setOrderTab] = useState('PENDING'); // 'PENDING' | 'DELIVERED'

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [deliveryUsers, setDeliveryUsers] = useState([]);

    useEffect(() => { 
        if (auth || sessionStorage.getItem('auth_token')) { 
            fetchOrders(); 
            fetchProducts(); 
            fetchDeliveryUsers();
        } 
    }, [auth]);

    const fetchDeliveryUsers = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/auth/delivery-users`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } });
            setDeliveryUsers(data);
        } catch (e) { console.error('No JWT or not admin'); }
    };

    if (isMobile) {
        return (
            <div className="flex-1 w-full flex items-center justify-center bg-[#fdfbf7] p-6 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 max-w-sm">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertOctagon size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Desktop Only</h2>
                    <p className="text-gray-500 text-sm font-medium">Admin panel accessible only on desktop view. Please use a laptop or desktop to manage.</p>
                </div>
            </div>
        );
    }

    const login = (e) => { 
        e.preventDefault(); 
        if (pass === 'apnidukanspn9140') { 
            setAuth(true); 
            // Do NOT save to localStorage to ensure refresh requires password again
            setError('');
        } else {
            setError('Incorrect password');
            setPass('');
            setShakeKey(prev => prev + 1);
        } 
    };


    const fetchOrders = async () => axios.get(`${API_URL}/api/orders`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}`, 'x-admin-token': ADMIN_TOKEN } }).then(res => setOrders(res.data));
    const fetchProducts = async () => axios.get(`${API_URL}/api/products`).then(res => setProducts(res.data));

    const updateStatus = async (id, status) => {
        await axios.put(`${API_URL}/api/orders/${id}/status`, { status }, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}`, 'x-admin-token': ADMIN_TOKEN } });
        fetchOrders();
    };

    const assignOrder = async (id, deliveryUserId) => {
        await axios.put(`${API_URL}/api/orders/${id}/assign`, { deliveryUserId }, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } });
        fetchOrders();
    };

    const deleteOrder = async (id) => {
        if(!confirm("Are you sure you want to completely delete this order?")) return;
        await axios.delete(`${API_URL}/api/orders/${id}`, { headers: { 'x-admin-token': ADMIN_TOKEN } });
        fetchOrders();
    };

    const downloadCSV = () => {
        const completedOrders = orders.filter(o => o.status === 'DELIVERED' || o.status === 'RETURNED');
        if(completedOrders.length === 0) return alert("No completed orders to download.");

        const headers = ["Name", "Number", "Address", "Product", "Total Price", "Date of Order", "Date of Delivery/Return", "Status", "Feedback Rating", "Feedback Comment"];
        
        const rows = completedOrders.map(o => {
            const itemsStr = o.items.map(i => `${i.quantity}x ${i.name}`).join('; ');
            
            // Fix Excel scientific notation for phone numbers
            const phoneStr = `="${o.phone}"`; 

            // Format dates nicely so Excel doesn't turn them into #######
            const formatDate = (dateString) => {
                if (!dateString) return 'N/A';
                const d = new Date(dateString);
                if (isNaN(d.getTime())) return 'N/A';
                return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
            };

            const orderDate = formatDate(o.createdAt);
            const deliveryDate = o.updatedAt ? formatDate(o.updatedAt) : 'N/A';
            
            const rating = o.feedback?.rating || o.rating || 'N/A';
            const comment = o.feedback?.comment || 'N/A';
            const addr = (o.address || '').replace(/,/g, ' ');
            
            return [
                o.customerName,
                phoneStr,
                addr,
                itemsStr,
                o.total,
                orderDate,
                deliveryDate,
                o.status,
                rating,
                comment
            ].map(String).map(s => `"${s.replace(/"/g, '""')}"`).join(",");
        });

        const csvContent = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `ApniDukan_Orders_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!auth) return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-900/40 backdrop-blur-md">
            <motion.form 
                key={shakeKey}
                initial={{ scale: 0.9, opacity: 0, x: 0 }} 
                animate={shakeKey > 0 ? { x: [-10, 10, -10, 10, 0], scale: 1, opacity: 1 } : { scale: 1, opacity: 1 }} 
                transition={shakeKey > 0 ? { duration: 0.4 } : { type: "spring", stiffness: 300, damping: 25 }} 
                onSubmit={login} 
                className="bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl shadow-emerald-900/20 w-full max-w-md text-center border border-white relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><Package size={40} strokeWidth={1.5} /></div>
                <h2 className="text-3xl font-extrabold mb-2 text-gray-900 tracking-tight">Admin Access</h2>
                <p className="text-sm text-gray-500 mb-8 font-medium">Please authenticate to continue.</p>
                
                <AnimatePresence>
                    {error && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-500 text-sm font-bold mb-4 bg-red-50 py-2 rounded-lg">{error}</motion.p>}
                </AnimatePresence>

                <input type="password" required autoFocus value={pass} onChange={e => {setPass(e.target.value); setError('');}} className={`w-full p-4 border rounded-2xl mb-6 text-center focus:ring-4 outline-none transition-all font-mono tracking-widest text-lg ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-50 bg-red-50/30' : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-50 bg-white/50'}`} placeholder="••••••••••••" />
                <button className="w-full py-4 bg-gray-900 text-white text-lg font-bold rounded-2xl hover:bg-black hover:-translate-y-1 transition-all shadow-xl shadow-gray-900/20">Authorize Step</button>
            </motion.form>
        </div>
    );

    return (
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-10 pb-6 border-b border-gray-100 gap-4">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight">Workspace<span className="text-emerald-500">.</span></h1>
                <div className="flex w-full md:w-auto gap-2 p-1.5 bg-gray-100/80 rounded-xl overflow-x-auto">
                    <button onClick={() => setView('catalog')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 font-bold text-sm md:text-base rounded-lg transition-all whitespace-nowrap ${view === 'catalog' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>Add Product</button>
                    <button onClick={() => setView('orders')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 font-bold text-sm md:text-base rounded-lg transition-all whitespace-nowrap ${view === 'orders' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}>Orders</button>
                    <button onClick={() => setView('delivery')} className={`flex-1 md:flex-none px-4 md:px-6 py-2.5 font-bold text-sm md:text-base rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${view === 'delivery' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}><Truck size={16}/> Delivery Staff</button>
                </div>
            </div>

            {view === 'orders' && (
                <div className="bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100/50">
                    <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <div className="flex gap-2">
                            <button onClick={() => setOrderTab('PENDING')} className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${orderTab === 'PENDING' ? 'bg-orange-50 text-orange-600 shadow-sm' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}>New Orders</button>
                            <button onClick={() => setOrderTab('DELIVERED')} className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all ${orderTab === 'DELIVERED' ? 'bg-emerald-50 text-emerald-600 shadow-sm' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}>Completed / Returned</button>
                        </div>
                        <button onClick={downloadCSV} title="Download Completed & Returned Orders" className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm">
                            <Download size={16} /> Export History
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto w-full pb-4">
                        <table className="w-full text-left min-w-[600px] border-collapse">
                            <thead><tr className="border-b border-gray-100 text-gray-400 text-xs tracking-wider uppercase"><th className="pb-4 pr-4 pl-2">Order Info</th><th className="pb-4 pr-4">Customer & Address</th><th className="pb-4 pr-4">Items</th><th className="pb-4 pr-4">Total</th><th className="pb-4">Action</th></tr></thead>
                            <tbody>
                                {orders.filter(o => orderTab === 'PENDING' ? (o.status !== 'DELIVERED' && o.status !== 'RETURNED' && o.status !== 'delivered' && o.status !== 'returned') : (o.status === 'DELIVERED' || o.status === 'RETURNED' || o.status === 'delivered' || o.status === 'returned')).map(o => (
                                    <tr key={o._id} className="border-b last:border-0 border-gray-50 hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 pr-4 pl-2 align-top">
                                            <strong className="text-gray-900 font-mono text-sm">{o.orderId}</strong><br />
                                            <span className="text-[10px] 2xl:text-xs text-gray-400 whitespace-nowrap">{new Date(o.createdAt).toLocaleString()}</span>
                                            {o.status === 'NEW' && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-extrabold rounded shadow-sm uppercase tracking-wide">New</span>}
                                        </td>
                                        <td className="pr-4 align-top max-w-[240px]">
                                            <div className="font-bold text-gray-800 text-sm tracking-tight">{o.customerName}</div>
                                            <div className="text-[11px] text-gray-400 font-mono mt-0.5">{o.phone}</div>
                                            <div className="text-[11px] text-gray-600 leading-[1.4] mt-1.5 p-2 bg-gray-50/80 border border-gray-100 rounded-xl line-clamp-3 hover:line-clamp-none transition-all cursor-default">
                                                <div className="flex items-start gap-1.5">
                                                    <MapPin size={10} className="mt-0.5 text-gray-400 shrink-0" />
                                                    <span>{o.address || <span className="text-gray-300 italic">Address not provided</span>}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-xs max-w-[200px] pr-4 align-top">
                                            <div className="flex flex-wrap gap-1">
                                                {o.items.map(i => <span key={i._id} className="inline-block bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-medium border border-gray-200">{i.quantity}x {i.name}</span>)}
                                            </div>
                                        </td>
                                        <td className="font-extrabold text-emerald-600 pr-4 align-top">₹{o.total}</td>
                                        <td className="align-top">
                                            {orderTab === 'PENDING' ? (
                                                <div className="flex flex-col gap-2 items-start">
                                                    <select 
                                                        value={o.status} 
                                                        onChange={e => updateStatus(o._id, e.target.value)} 
                                                        className={`p-2 pr-8 border rounded-xl text-[10px] font-black uppercase tracking-wider outline-none shadow-sm cursor-pointer transition-all appearance-none relative
                                                            ${o.status === 'assigned' ? 'bg-purple-50 border-purple-200 text-purple-700 focus:ring-purple-100' : ''}
                                                            ${o.status === 'pending' || o.status === 'NEW' ? 'bg-gray-50 border-gray-200 text-gray-700 focus:ring-gray-100' : ''}
                                                            ${o.status === 'DELIVERED' || o.status === 'delivered' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-100' : ''}
                                                            ${o.status === 'RETURNED' || o.status === 'returned' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 focus:ring-yellow-100' : ''}`}
                                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='3' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '0.8rem' }}
                                                    >
                                                        <option value="pending">⏳ ORDERED</option>
                                                        <option value="assigned">🚚 CONFIRMED</option>
                                                        <option value="delivered">✅ DELIVERED</option>
                                                        <option value="returned">🔄 RETURNED</option>
                                                    </select>
                                                    
                                                    {deliveryUsers.length > 0 && (
                                                        <select 
                                                            value={o.assignedTo || ''} 
                                                            onChange={e => assignOrder(o._id, e.target.value)}
                                                            className="p-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 w-full mt-1 outline-none focus:border-blue-400 shadow-sm"
                                                        >
                                                            <option value="">Assign Delivery...</option>
                                                            {deliveryUsers.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                                                        </select>
                                                    )}

                                                    <button onClick={() => deleteOrder(o._id)} title="Delete Order" className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg mt-1 transition-all"><Trash2 size={14}/></button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2 items-start min-w-[180px]">
                                                    <div className="flex items-center gap-2">
                                                        {o.status === 'DELIVERED' || o.status === 'delivered' ? (
                                                            <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-black rounded-lg tracking-widest uppercase flex items-center gap-1.5 shadow-md shadow-emerald-100"><Check size={12} strokeWidth={4}/> Delivered</span>
                                                        ) : (
                                                            <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-black rounded-lg tracking-widest uppercase flex items-center gap-1.5 shadow-md shadow-red-100"><X size={12} strokeWidth={4}/> Returned</span>
                                                        )}
                                                    </div>
                                                    
                                                    {(o.deliveredBy || o.assignedTo) && (
                                                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 w-full">
                                                            <div className="text-gray-400 mb-0.5">{o.status === 'RETURNED' || o.status === 'returned' ? 'Staff In-charge' : 'Delivered By'}</div>
                                                            <div className="text-gray-900 flex items-center gap-1.5">
                                                                <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><User size={10} /></div>
                                                                {deliveryUsers.find(u => u._id === (o.deliveredBy || o.assignedTo))?.name || 'Assigned Staff'}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {o.feedbackGiven && (
                                                        <div className={`w-full text-[10px] font-black uppercase tracking-widest border px-3 py-3 rounded-2xl flex flex-col gap-2 shadow-sm ${o.status === 'RETURNED' || o.status === 'returned' ? 'bg-red-50/50 border-red-100 text-red-600' : 'bg-yellow-50/50 border-yellow-100 text-yellow-700'}`}>
                                                            <div className="flex items-center justify-between">
                                                                <span>Customer Feedback</span>
                                                                {o.status !== 'RETURNED' && o.status !== 'returned' && <span className="text-yellow-600 bg-yellow-100 px-1.5 py-0.5 rounded">⭐ {o.feedback?.rating || o.rating || 5}/5</span>}
                                                            </div>
                                                            {o.feedback?.comment && (
                                                                <div className="text-gray-800 font-bold normal-case leading-snug p-2 bg-white/80 rounded-xl border border-inherit italic">
                                                                    "{o.feedback.comment}"
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <button onClick={() => deleteOrder(o._id)} title="Delete Order" className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all self-end"><Trash2 size={14}/></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                                {orders.filter(o => orderTab === 'PENDING' ? (o.status !== 'DELIVERED' && o.status !== 'RETURNED') : (o.status === 'DELIVERED' || o.status === 'RETURNED')).length === 0 && (
                                    <tr><td colSpan="5" className="py-12 text-center text-sm font-bold text-gray-400 bg-gray-50/50 rounded-xl">No {orderTab.toLowerCase()} orders actively found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {view === 'catalog' && (
                <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
                    <div className="w-full lg:w-[45%] xl:w-2/5">
                        <AddProductForm refreshCatalog={fetchProducts} />
                    </div>
                    <div className="lg:col-span-7">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <AnimatePresence>
                                {products.map(p => (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} key={p._id} className="bg-white p-5 rounded-3xl border border-gray-100 flex gap-4 relative group shadow-sm hover:shadow-md transition-shadow">
                                        <img src={getImageUrl(p.images?.[0] || p.image)} className="w-24 h-24 object-cover rounded-2xl bg-gray-50" />
                                        <div className="flex-1 overflow-hidden">
                                            <h4 className="font-bold text-gray-900 truncate">{p.name}</h4>
                                            <p className="text-sm text-gray-500 mb-2 truncate">{p.description}</p>
                                            <div className="flex items-end gap-2">
                                                <span className="font-bold text-lg text-emerald-600">₹{p.price}</span>
                                                {p.originalPrice && p.originalPrice > p.price && <span className="text-xs text-red-400 line-through mb-1">₹{p.originalPrice}</span>}
                                            </div>
                                            <div className="flex gap-2 mt-2">
                                                {p.isFreeDelivery && <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Free Del</span>}
                                                {p.outOfStock && <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2.5 py-1 rounded-full uppercase tracking-wider">Empty</span>}
                                            </div>
                                        </div>
                                        <button onClick={async () => { await axios.delete(`${API_URL}/api/products/${p._id}`, { headers: { 'x-admin-token': ADMIN_TOKEN } }); fetchProducts(); }} className="absolute top-4 right-4 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-full"><Trash2 size={18} /></button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            )}
            
            {view === 'delivery' && (
                <div className="bg-white rounded-3xl p-4 md:p-8 shadow-sm border border-gray-100/50">
                    <h2 className="text-xl font-bold mb-6">Delivery Staff Management</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Current Staff</h3>
                            <div className="space-y-3">
                                {deliveryUsers.map(user => (
                                    <div key={user._id} className="p-4 border rounded-xl flex justify-between items-center bg-gray-50 transition-all hover:border-gray-300 group">
                                        <div>
                                            <p className="font-bold">{user.name}</p>
                                            <p className="text-sm text-gray-500">@{user.username}</p>
                                            <p className="text-[10px] mt-1 text-gray-400">Phone: {user.contact || 'N/A'}</p>
                                        </div>
                                        <button 
                                            onClick={async () => {
                                                if(window.confirm('Delete this delivery user?')) {
                                                    await axios.delete(`${API_URL}/api/auth/delivery-users/${user._id}`, { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } });
                                                    fetchDeliveryUsers();
                                                }
                                            }}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                            title="Delete User"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                {deliveryUsers.length === 0 && <p className="text-gray-400 text-sm italic">No delivery staff added yet.</p>}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Add New Delivery Person</h3>
                            <form 
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    const fd = new FormData(e.target);
                                    try {
                                        await axios.post(`${API_URL}/api/auth/register-delivery`, Object.fromEntries(fd), { headers: { Authorization: `Bearer ${ADMIN_TOKEN}` } });
                                        fetchDeliveryUsers();
                                        e.target.reset();
                                    } catch (err) {
                                        alert("Error creating delivery user.");
                                    }
                                }} 
                                className="space-y-4"
                            >
                                <input name="name" required placeholder="Full Name" className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" />
                                <input name="username" required placeholder="Login Username" className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" />
                                <input name="password" type="password" required placeholder="Password" className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" />
                                <input name="contact" placeholder="Contact Number" className="w-full p-3 border rounded-xl outline-none focus:border-blue-500" />
                                <button className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">Create Staff Account</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function AddProductForm({ refreshCatalog }) {
    const fileInputRef = useRef(null);
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    
    // Core state
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [discountPrice, setDiscountPrice] = useState('');
    const [deliveryMode, setDeliveryMode] = useState('FREE'); // 'FREE' or 'CUSTOM'
    const [deliveryCharge, setDeliveryCharge] = useState('');
    const [outOfStock, setOutOfStock] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null); // { type: 'success' | 'error', msg: string }

    const isMissingField = (field) => {
        if (toast?.type !== 'error') return false;
        const msg = toast.msg.toLowerCase();
        return msg.includes(field);
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...newFiles]);
        const newPreviews = newFiles.map(f => URL.createObjectURL(f));
        setPreviews(prev => [...prev, ...newPreviews]);
        setToast(null);
    };

    const removeFile = (idx) => {
        setFiles(files.filter((_, i) => i !== idx));
        setPreviews(previews.filter((_, i) => i !== idx));
    };

    const submitProduct = async (e) => {
        e.preventDefault();
        
        if (!name.trim()) return setToast({ type: 'error', msg: 'Product Name is required.' });
        if (!desc.trim()) return setToast({ type: 'error', msg: 'Description is required.' });
        if (!price) return setToast({ type: 'error', msg: 'Regular Price is required.' });
        if (files.length === 0) return setToast({ type: 'error', msg: 'At least one media image is required.' });

        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', desc);
        
        if(discountPrice) {
            formData.append('price', discountPrice); // the selling price
            formData.append('originalPrice', price); // the MRP
        } else {
            formData.append('price', price);
        }

        formData.append('isFreeDelivery', deliveryMode === 'FREE');
        formData.append('deliveryCharge', deliveryMode === 'CUSTOM' ? (deliveryCharge||0) : 0);
        formData.append('outOfStock', outOfStock);

        files.forEach(f => formData.append('images', f));

        try {
            await axios.post(`${API_URL}/api/products`, formData, { headers: { 'x-admin-token': ADMIN_TOKEN } });
            
            // Success Reset State
            refreshCatalog();
            setToast({ type: 'success', msg: 'Product added successfully!' });
            setTimeout(() => setToast(null), 4000);
            
            setName(''); setDesc(''); setPrice(''); setDiscountPrice(''); 
            setDeliveryMode('FREE'); setDeliveryCharge(''); setOutOfStock(false);
            setFiles([]); setPreviews([]);
            if(fileInputRef.current) fileInputRef.current.value = null;

        } catch(err) {
            setToast({ type: 'error', msg: `Failed to add product: ${err.response?.data?.error || err.message}` });
        }
        setLoading(false);
    };

    return (
        <form onSubmit={submitProduct} className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-xl shadow-emerald-900/5 relative overflow-hidden">
            <h3 className="font-bold text-2xl mb-8 text-gray-900">Create Product</h3>

            {/* Premium Dynamic Alert Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{opacity:0, y:-20}} animate={{opacity:1, y:0}} exit={{opacity:0}} className={`absolute top-0 left-0 w-full p-4 border-b font-bold flex items-center justify-center gap-2 z-10 transition-colors ${toast.type === 'error' ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-700'}`}>
                        {toast.type === 'error' ? <X size={18}/> : <CheckCircle size={18}/>} 
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Product Details *</label>
                    <input value={name} onChange={e=>{setName(e.target.value); setToast(null);}} placeholder="Product Name" className={`w-full p-4 bg-gray-50 border sm:text-sm rounded-2xl outline-none transition-all font-medium text-gray-900 ${isMissingField('name') ? 'border-red-300 ring-2 ring-red-50 bg-red-50' : 'border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'}`} />
                </div>
                <div>
                    <textarea value={desc} onChange={e=>{setDesc(e.target.value); setToast(null);}} rows="2" placeholder="Short description..." className={`w-full p-4 bg-gray-50 border text-sm rounded-2xl outline-none transition-all resize-none ${isMissingField('description') ? 'border-red-300 ring-2 ring-red-50 bg-red-50' : 'border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'}`} />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Regular Price *</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                            <input value={price} onChange={e=>{setPrice(e.target.value); setToast(null);}} type="number" placeholder="0.00" className={`w-full py-4 pl-10 pr-4 bg-gray-50 border sm:text-sm rounded-2xl outline-none transition-all font-bold text-gray-900 ${isMissingField('price') ? 'border-red-300 ring-2 ring-red-50 bg-red-50' : 'border-gray-100 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50'}`} />
                        </div>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs font-bold text-emerald-500 uppercase tracking-widest mb-2 flex justify-between">Discount Price <span className="opacity-50">Optional</span></label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400 font-bold">₹</span>
                            <input value={discountPrice} onChange={e=>setDiscountPrice(e.target.value)} type="number" placeholder="0.00" className="w-full py-4 pl-10 pr-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl outline-none focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all font-bold text-emerald-700" />
                        </div>
                    </div>
                </div>

                {/* Optional Configuration Zone */}
                <div className="p-5 bg-gray-50/50 border border-gray-100 rounded-3xl space-y-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Delivery Strategy</p>
                            <p className="text-xs text-gray-500">How should customers be charged locally?</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3">
                        <div onClick={()=>setDeliveryMode('FREE')} className={`flex-1 flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${deliveryMode==='FREE'?'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm':'bg-white border-gray-200 hover:border-emerald-300'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMode==='FREE'?'border-emerald-500':'border-gray-300'}`}>
                                {deliveryMode==='FREE' && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                            </div>
                            <span className="font-bold text-sm">Free Delivery</span>
                        </div>

                        <div onClick={()=>setDeliveryMode('CUSTOM')} className={`flex-1 flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${deliveryMode==='CUSTOM'?'bg-blue-50 border-blue-200 text-blue-800 shadow-sm':'bg-white border-gray-200 hover:border-blue-300'}`}>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${deliveryMode==='CUSTOM'?'border-blue-500':'border-gray-300'}`}>
                                {deliveryMode==='CUSTOM' && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm shrink-0">Custom ₹</span>
                                {deliveryMode === 'CUSTOM' && (
                                    <input value={deliveryCharge} onChange={(e)=>setDeliveryCharge(e.target.value)} type="number" placeholder="50" className="w-16 p-1 border-b border-blue-300 bg-transparent outline-none font-bold placeholder-blue-300" onClick={e=>e.stopPropagation()} />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <label className={`flex items-center gap-4 p-4 border rounded-2xl cursor-pointer transition-all group ${outOfStock?'bg-red-50 border-red-200 text-red-800 shadow-sm':'bg-white border-gray-200 hover:border-red-200'}`}>
                            <input type="checkbox" checked={outOfStock} onChange={e=>setOutOfStock(e.target.checked)} className="hidden"/>
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${outOfStock?'bg-red-500 text-white shadow-md shadow-red-200' : 'bg-gray-100 text-transparent group-hover:bg-red-100 group-hover:text-red-300'}`}>
                                <Check size={16} strokeWidth={3} />
                            </div>
                            <div>
                                <p className="font-bold text-sm">Mark Out of Stock</p>
                                <p className="text-xs opacity-70">Disables purchasing for this item.</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Media Uploader */}
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Media Files * <span className="lowercase font-normal opacity-60 ml-2">(at least one required)</span></label>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                        <AnimatePresence>
                            {previews.map((src, i) => (
                                <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.8}} key={i} className="relative w-24 h-24 rounded-2xl border border-gray-200 shadow-sm overflow-hidden group">
                                    <img src={src} className="w-full h-full object-cover" />
                                    <button type="button" onClick={()=>removeFile(i)} className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white">
                                        <Trash2 size={20} />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        
                        <label className={`w-24 h-24 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${isMissingField('image') ? 'border-red-400 bg-red-50 text-red-500' : 'border-dashed border-gray-300 text-gray-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50'}`}>
                            <UploadCloud size={24} className="mb-1" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Add More</span>
                            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                        </label>
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-10 py-5 bg-gray-900 text-white text-lg font-bold rounded-2xl transition-all shadow-xl shadow-emerald-900/10 hover:bg-black hover:-translate-y-1 hover:shadow-2xl disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <><Check size={22} /> Publish Product</>}
            </button>
        </form>
    );
}

function CheckCircle({ size }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
}
