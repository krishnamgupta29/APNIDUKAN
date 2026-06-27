import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Capacitor } from '@capacitor/core';
import { Rocket, X, Download, AlertTriangle } from 'lucide-react';

/* ─────────────────────────────────────────────
   CONFIG
   ───────────────────────────────────────────── */
const VERSION_JSON_URL = 'https://apnidukan-shahjahanpur.vercel.app/version.json';
const UPDATE_PAGE_URL  = 'https://apnidukan-shahjahanpur.vercel.app/#/download';
const CURRENT_VERSION  = '1.1.0';
const CHECK_INTERVAL   = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_KEY        = 'apni_update_last_check';
const DISMISSED_KEY    = 'apni_update_dismissed_version';

/* ─────────────────────────────────────────────
   Semver compare: returns 1 if a>b, -1 if a<b, 0 if equal
   ───────────────────────────────────────────── */
function compareSemver(a, b) {
    const pa = (a || '0.0.0').split('.').map(Number);
    const pb = (b || '0.0.0').split('.').map(Number);
    for (let i = 0; i < 3; i++) {
        const va = pa[i] || 0;
        const vb = pb[i] || 0;
        if (va > vb) return 1;
        if (va < vb) return -1;
    }
    return 0;
}

/* ─────────────────────────────────────────────
   UpdateChecker Component
   ───────────────────────────────────────────── */
export default function UpdateChecker() {
    const [updateInfo, setUpdateInfo] = useState(null);
    const [showDialog, setShowDialog] = useState(false);
    const [isForced, setIsForced] = useState(false);
    const checkingRef = useRef(false);

    const checkForUpdate = useCallback(async (force = false) => {
        // Prevent concurrent checks
        if (checkingRef.current) return;

        // Check cache unless forced
        if (!force) {
            try {
                const lastCheck = localStorage.getItem(CACHE_KEY);
                if (lastCheck && (Date.now() - parseInt(lastCheck, 10)) < CHECK_INTERVAL) {
                    return;
                }
            } catch {}
        }

        checkingRef.current = true;

        try {
            const response = await fetch(VERSION_JSON_URL, {
                cache: 'no-cache',
                headers: { 'Cache-Control': 'no-cache' }
            });

            if (!response.ok) throw new Error('Failed to fetch version info');

            const data = await response.json();

            // Save check timestamp
            try { localStorage.setItem(CACHE_KEY, String(Date.now())); } catch {}

            const { latestVersion, minimumVersion, apkUrl, message, forceUpdate } = data;

            // Check if update is available
            if (compareSemver(latestVersion, CURRENT_VERSION) > 0) {
                // Check if user already dismissed this version (and it's not forced)
                const dismissedVersion = localStorage.getItem(DISMISSED_KEY);
                if (!forceUpdate && dismissedVersion === latestVersion && !force) {
                    return;
                }

                // Check if force update is needed (current version < minimumVersion)
                const needsForce = forceUpdate || compareSemver(minimumVersion, CURRENT_VERSION) > 0;

                setUpdateInfo({
                    latestVersion,
                    message: message || 'A newer version of ApniDukan Shahjahanpur is available.',
                    apkUrl: apkUrl || UPDATE_PAGE_URL,
                    forceUpdate: needsForce
                });
                setIsForced(needsForce);
                setShowDialog(true);
            }
        } catch (err) {
            console.log('[UpdateChecker] Check failed:', err.message);
        } finally {
            checkingRef.current = false;
        }
    }, []);

    // On mount — initial check
    useEffect(() => {
        // Delay the check slightly to not block app startup
        const timer = setTimeout(() => checkForUpdate(false), 2000);
        return () => clearTimeout(timer);
    }, [checkForUpdate]);

    // App resume check (Capacitor)
    useEffect(() => {
        if (!Capacitor.isNativePlatform()) return;

        let listener;
        const setup = async () => {
            try {
                const { App } = await import('@capacitor/app');
                listener = await App.addListener('appStateChange', ({ isActive }) => {
                    if (isActive) {
                        checkForUpdate(false);
                    }
                });
            } catch {}
        };
        setup();

        return () => {
            if (listener) listener.remove();
        };
    }, [checkForUpdate]);

    // Periodic check every 24 hours while app is open
    useEffect(() => {
        const interval = setInterval(() => checkForUpdate(false), CHECK_INTERVAL);
        return () => clearInterval(interval);
    }, [checkForUpdate]);

    const handleUpdate = () => {
        const url = updateInfo?.apkUrl || UPDATE_PAGE_URL;
        window.open(url, '_system');
    };

    const handleDismiss = () => {
        if (!isForced && updateInfo) {
            try { localStorage.setItem(DISMISSED_KEY, updateInfo.latestVersion); } catch {}
            setShowDialog(false);
        }
    };

    // Only show on native platform
    if (!Capacitor.isNativePlatform()) return null;

    return (
        <AnimatePresence>
            {showDialog && updateInfo && (
                <motion.div
                    key="update-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[99999] flex items-center justify-center px-5"
                    style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                    onClick={isForced ? undefined : handleDismiss}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 30 }}
                        transition={{ type: 'spring', damping: 22, stiffness: 260 }}
                        className="w-full max-w-sm rounded-[28px] overflow-hidden relative"
                        style={{
                            background: '#ffffff',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* ── Gradient Header ── */}
                        <div
                            className="px-6 pt-8 pb-6 text-center relative overflow-hidden"
                            style={{ background: 'linear-gradient(135deg, #f72585 0%, #7209b7 50%, #4361ee 100%)' }}
                        >
                            {/* Decorative circles */}
                            <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10" />
                            <div className="absolute -left-4 bottom-0 w-16 h-16 rounded-full bg-white/10" />
                            <div className="absolute right-10 bottom-2 w-8 h-8 rounded-full bg-white/5" />

                            {/* Icon */}
                            <motion.div
                                initial={{ rotate: -20, scale: 0 }}
                                animate={{ rotate: 0, scale: 1 }}
                                transition={{ type: 'spring', delay: 0.15, damping: 12 }}
                                className="relative z-10 mx-auto w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 border border-white/20"
                            >
                                {isForced ? (
                                    <AlertTriangle size={32} className="text-white" strokeWidth={2.5} />
                                ) : (
                                    <Rocket size={32} className="text-white" strokeWidth={2.5} />
                                )}
                            </motion.div>

                            <h2 className="text-[20px] font-black text-white relative z-10 leading-tight">
                                {isForced ? '⚠️ Update Required' : '🚀 New Update Available'}
                            </h2>
                            <p className="text-white/70 text-xs font-semibold mt-1.5 relative z-10">
                                v{CURRENT_VERSION} → v{updateInfo.latestVersion}
                            </p>
                        </div>

                        {/* ── Body ── */}
                        <div className="px-6 py-5">
                            <p className="text-gray-600 text-[13px] leading-relaxed text-center">
                                {updateInfo.message}
                            </p>
                            <p className="text-gray-400 text-[11px] text-center mt-2 leading-relaxed">
                                Update now to enjoy new features, performance improvements and bug fixes.
                            </p>
                        </div>

                        {/* ── Buttons ── */}
                        <div className="px-6 pb-6 space-y-2.5">
                            {/* Update Now */}
                            <button
                                onClick={handleUpdate}
                                className="w-full py-3.5 rounded-[16px] text-white font-extrabold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #f72585, #4361ee)',
                                    boxShadow: '0 6px 24px rgba(247,37,133,0.35)'
                                }}
                            >
                                <Download size={18} strokeWidth={2.5} />
                                Update Now
                            </button>

                            {/* Later (only if not forced) */}
                            {!isForced && (
                                <button
                                    onClick={handleDismiss}
                                    className="w-full py-3 rounded-[16px] text-gray-500 font-bold text-sm bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
                                >
                                    Later
                                </button>
                            )}

                            {isForced && (
                                <p className="text-center text-red-500/70 text-[10px] font-bold mt-1">
                                    This update is required to continue using ApniDukan
                                </p>
                            )}
                        </div>

                        {/* Close X (only if not forced) */}
                        {!isForced && (
                            <button
                                onClick={handleDismiss}
                                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white/80 hover:text-white hover:bg-white/30 transition-all z-20"
                            >
                                <X size={16} strokeWidth={3} />
                            </button>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
