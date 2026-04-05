import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';

export default function ProductModal({ product, onClose, onAdd }) {
    const sources = product.images?.length > 0 ? product.images.map(x => `http://localhost:5000${x}`) : [product.image || 'https://via.placeholder.com/400'];
    const [curImg, setCurImg] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const total = sources.length;

    // Mobile Swipe Handler
    let touchX = 0;
    const handleTouchStart = e => { touchX = e.changedTouches[0].screenX; };
    const handleTouchEnd = e => {
        const d = e.changedTouches[0].screenX;
        if(d < touchX - 40) setCurImg((c) => (c + 1) % total);
        if(d > touchX + 40) setCurImg((c) => (c - 1 + total) % total);
    };

    // Auto Play
    useEffect(() => {
        if(isHovered || total <= 1) return;
        const interval = setInterval(() => { setCurImg(c => (c + 1) % total); }, 3000);
        return () => clearInterval(interval);
    }, [isHovered, total]);

    return (
        <React.Fragment>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-md z-[100]" onClick={onClose} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-white rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                
                <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><X size={20}/></button>

                {/* Left: Carousel */}
                <div 
                    className="flex-1 bg-[#fbfbfb] relative flex items-center justify-center p-8 group min-h-[300px]"
                    onMouseEnter={()=>setIsHovered(true)} onMouseLeave={()=>setIsHovered(false)}
                    onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
                >
                    {sources.map((src, i) => (
                        <img key={i} src={src} className={`absolute w-full h-full object-contain p-8 transition-all duration-700 ease-in-out ${i === curImg ? 'opacity-100 scale-100 group-hover:scale-105' : 'opacity-0 scale-95'}`} />
                    ))}
                    
                    {total > 1 && (
                        <>
                            <button onClick={()=>setCurImg((c)=>(c - 1 + total) % total)} className="absolute left-4 w-10 h-10 bg-white/80 backdrop-blur border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white hover:scale-110 hidden md:flex z-10"><ChevronLeft/></button>
                            <button onClick={()=>setCurImg((c)=>(c + 1) % total)} className="absolute right-4 w-10 h-10 bg-white/80 backdrop-blur border border-gray-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-white hover:scale-110 hidden md:flex z-10"><ChevronRight/></button>
                            <div className="absolute bottom-4 flex gap-2 z-10">
                                {sources.map((_, i) => <div key={i} onClick={()=>setCurImg(i)} className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${i===curImg ? 'bg-gray-800 scale-125' : 'bg-gray-300'}`} />)}
                            </div>
                        </>
                    )}
                </div>

                {/* Right: Info */}
                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center border-l border-gray-100 overflow-y-auto">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 leading-tight tracking-tight">{product.name}</h2>
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="px-3 py-1 rounded-full bg-yellow-100/80 border border-yellow-200/50 text-yellow-800 text-sm font-bold flex items-center gap-1 shadow-sm">⭐ {product.averageRating}</span>
                        <span className="text-gray-500 text-sm font-medium">{product.totalReviews} Ratings</span>
                        {product.outOfStock && <span className="ml-auto px-3 py-1 bg-red-100 text-red-700 text-xs font-black rounded-md tracking-widest shadow-sm border border-red-200">OUT OF STOCK</span>}
                    </div>

                    <div className="flex items-end gap-3 mb-6">
                        <span className="text-4xl font-bold">₹{product.price}</span>
                        {product.originalPrice && product.originalPrice > product.price && <span className="text-xl text-red-500 line-through mb-1">₹{product.originalPrice}</span>}
                    </div>

                    <div className="space-y-4 mb-8">
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base font-medium">{product.description}</p>
                        
                        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50 flex flex-col gap-1 shadow-inner">
                           <strong className="text-xs tracking-wider uppercase text-emerald-800/80 font-bold mb-1">Delivery Information</strong>
                           {product.isFreeDelivery ? <span className="text-emerald-600 font-extrabold text-sm flex items-center gap-2">✓ Free Local Delivery</span> : <span className="text-gray-600 font-bold text-sm">Delivery Charge: ₹{product.deliveryCharge}</span>}
                        </div>
                    </div>

                    <button 
                        disabled={product.outOfStock}
                        onClick={()=>{onAdd(); onClose();}} 
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${product.outOfStock ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300' : 'bg-gray-900 text-white hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-gray-900/20 hover:bg-black'}`}
                    >
                        <ShoppingBag size={20}/> {product.outOfStock ? 'Currently Unavailable' : 'Add to Cart'}
                    </button>
                </div>
            </motion.div>
        </React.Fragment>
    );
}
