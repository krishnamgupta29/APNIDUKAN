import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, FileText, Heart } from 'lucide-react';

export default function Legal() {
    return (
        <div className="flex-1 w-full max-w-4xl mx-auto px-6 py-12 md:py-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 md:p-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">Legal & Security</h1>
                    <p className="text-gray-500 font-medium max-w-lg mx-auto">We value your privacy and security above all. Read our terms and policies below.</p>
                </div>

                <div className="space-y-12">
                    {/* Security Clause */}
                    <section>
                        <div className="flex items-center gap-3 mb-4 text-emerald-600">
                            <ShieldCheck size={28} />
                            <h2 className="text-2xl font-bold text-gray-900">Platform Security</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed">
                            Your trust is our biggest asset. All transactions and interactions on ApniDukaan are completely secure. 
                            We employ robust encryption and standard security measures to ensure that your experience is safe. 
                            We do not store any sensitive payment information on our servers, and all local deliveries are 
                            handled by our trusted internal network.
                        </p>
                    </section>

                    {/* Privacy Policy */}
                    <section>
                        <div className="flex items-center gap-3 mb-4 text-blue-600">
                            <Lock size={28} />
                            <h2 className="text-2xl font-bold text-gray-900">Privacy Policy</h2>
                        </div>
                        <div className="text-gray-600 leading-relaxed space-y-3">
                            <p><strong>Your Data belongs to You:</strong> We strictly believe in data privacy. We collect only the essential information required to process and deliver your orders (such as Name, Phone Number, and Delivery Address).</p>
                            <p><strong>No Data Selling:</strong> We guarantee that your personal data will <strong>never</strong> be sold, rented, or misused by any third party. Your information is solely used to enhance your local shopping experience in Shahjahanpur.</p>
                            <p><strong>Communication:</strong> We will only contact you regarding your active orders or critical account updates.</p>
                        </div>
                    </section>

                    {/* Terms & Conditions */}
                    <section>
                        <div className="flex items-center gap-3 mb-4 text-purple-600">
                            <FileText size={28} />
                            <h2 className="text-2xl font-bold text-gray-900">Terms & Conditions</h2>
                        </div>
                        <div className="text-gray-600 leading-relaxed space-y-3">
                            <p>By using ApniDukaan, you agree to our local service terms. Our delivery services are strictly operational within the boundaries of Shahjahanpur, Uttar Pradesh.</p>
                            <p><strong>Order Fulfillment:</strong> We strive to fulfill all confirmed orders with Delivery within 24h. In case of unforeseen circumstances, delays will be communicated proactively.</p>
                            <p><strong>Right to Refuse:</strong> We reserve the right to cancel any order if the delivery location is outside our service area or if the product is out of stock. In such cases, no charges will be levied.</p>
                        </div>
                    </section>
                </div>
                
                <div className="mt-12 pt-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400">
                    <p>Last Updated: April 2026</p>
                    <p className="flex items-center justify-center gap-1 mt-2 sm:mt-0 whitespace-nowrap">Made with <Heart size={14} className="text-rose-500 fill-rose-500" /> for Shahjahanpur</p>
                </div>
            </motion.div>
        </div>
    );
}
