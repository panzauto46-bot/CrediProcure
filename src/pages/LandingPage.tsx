import { useState, useEffect } from 'react';
import { ArrowRight, Box, ShieldCheck, Zap, Coins, Fingerprint, Database, Code, RefreshCcw, Heart, Bookmark, Share2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface LandingPageProps {
    onEnterApp: () => void;
}

export function LandingPage({ onEnterApp }: LandingPageProps) {
    return (
        <div className="min-h-screen bg-[#090014] text-white overflow-hidden relative font-sans flex flex-col items-center selection:bg-purple-500/30">
            {/* Background Deep Purple Glows */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                {/* Top/Center Huge Glow */}
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[80vw] h-[80vw] md:w-[60vw] md:h-[60vw] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen" />
                {/* Bottom Left Glow */}
                <div className="absolute bottom-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/20 blur-[150px] mix-blend-screen" />
                {/* Bottom Right Glow */}
                <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/10 blur-[120px] mix-blend-screen" />
            </div>

            {/* Top Header */}
            <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-8 flex justify-between items-center animate-fade-in">
                <div className="font-medium tracking-wide text-white/90">
                    CrediProcure
                </div>
                <div className="text-xs font-semibold tracking-[0.2em] text-white/50 uppercase">
                    WEB3 DAPP
                </div>
            </header>

            {/* Main Content */}
            <main className="relative z-10 flex flex-col items-center w-full max-w-5xl px-4 mt-8 md:mt-16 text-center flex-1">

                {/* Hero Text */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 animate-fade-in-up">
                    CrediProcure
                </h1>
                <p className="text-lg md:text-xl text-purple-100/60 max-w-2xl mb-12 font-light leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                    Struggling with Trade Finance? Just mint your invoices as RWA. <br className="hidden md:block" />
                    Instant liquidity for SMEs, stable yields for DeFi investors.
                </p>

                {/* Center Mockup Window */}
                <div className="w-full max-w-4xl relative group animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    {/* Subtle Outer Glow for the Window */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-fuchsia-500/30 to-indigo-500/30 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition duration-1000"></div>

                    <div className="relative bg-[#0d0714]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                        {/* Mockup Top Bar */}
                        <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-white/[0.02]">
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-semibold text-white/80">CrediProcure App</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-white/60">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Creditcoin Testnet
                                </div>
                                <div className="w-8 h-4 rounded-full bg-white/10 relative">
                                    <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-white/80"></div>
                                </div>
                            </div>
                        </div>

                        {/* Mockup Content */}
                        <div className="p-8 md:p-16 flex flex-col items-center text-center">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60 mb-8 backdrop-blur-md">
                                <span className="text-purple-400 font-medium">New</span> RWA Engine Update
                            </div>

                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Finance your Invoices with Web3
                            </h2>
                            <p className="text-sm text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
                                A fully decentralized platform built on Creditcoin. Mint invoices into ERC-721 tokens, access P2P funding, and monitor your on-chain credit history seamlessly.
                            </p>

                            {/* Mockup Buttons */}
                            <div className="flex items-center gap-4 mb-16">
                                <button
                                    onClick={onEnterApp}
                                    className="px-5 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                >
                                    Get Started <ArrowRight className="w-4 h-4" />
                                </button>
                                <button className="px-5 py-2.5 bg-white/5 text-white/80 text-sm font-medium rounded-lg border border-white/10 hover:bg-white/10 transition-colors">
                                    View Smart Contracts
                                </button>
                            </div>

                            {/* Feature Cards in Mockup */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                                {/* Card 1 */}
                                <div className="bg-[#1a1125] border border-white/5 rounded-xl p-4 flex flex-col items-start gap-4 hover:border-purple-500/30 transition-colors text-left">
                                    <span className="text-xs font-medium text-white/50 font-mono">Invoices</span>
                                    <div className="w-full h-16 bg-white/5 rounded flex flex-col justify-center px-3 gap-2 border border-white/5">
                                        <div className="w-2/3 h-1.5 bg-white/20 rounded-full"></div>
                                        <div className="w-1/2 h-1.5 bg-white/10 rounded-full"></div>
                                    </div>
                                </div>
                                {/* Card 2 */}
                                <div className="bg-[#1a1125] border border-white/5 rounded-xl p-4 flex flex-col items-start gap-4 hover:border-purple-500/30 transition-colors text-left">
                                    <span className="text-xs font-medium text-white/50 font-mono">Liquidity</span>
                                    <div className="w-full h-16 bg-white/5 rounded flex flex-col justify-center items-center border border-white/5 relative">
                                        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                                        <div className="absolute bottom-2 right-2 w-4 h-2 bg-white/20 rounded-full"></div>
                                    </div>
                                </div>
                                {/* Card 3 */}
                                <div className="bg-[#1a1125] border border-white/5 rounded-xl p-4 flex flex-col items-start gap-4 hover:border-purple-500/30 transition-colors text-left">
                                    <span className="text-xs font-medium text-white/50 font-mono">Investors</span>
                                    <div className="w-full h-16 bg-white/5 rounded grid grid-cols-3 grid-rows-2 gap-2 p-3 border border-white/5 items-center justify-items-center">
                                        <Zap className="w-3 h-3 text-white/20" />
                                        <Coins className="w-3 h-3 text-white/20" />
                                        <ShieldCheck className="w-3 h-3 text-white/20" />
                                        <Box className="w-3 h-3 text-white/20" />
                                        <Heart className="w-3 h-3 text-white/20" />
                                        <ArrowRight className="w-3 h-3 text-white/20" />
                                    </div>
                                </div>
                                {/* Card 4 */}
                                <div className="bg-[#1a1125] border border-white/5 rounded-xl p-4 flex flex-col items-start gap-4 hover:border-purple-500/30 transition-colors text-left relative overflow-hidden">
                                    <span className="text-xs font-medium text-white/50 font-mono z-10">Yields...</span>
                                    <div className="w-full h-16 bg-white/5 rounded border border-white/5 z-10 flex relative">
                                        <div className="absolute bottom-0 left-0 w-[40%] h-[60%] border-t border-r border-purple-500/50 bg-purple-500/10 rounded-tr"></div>
                                        <div className="absolute top-0 right-0 w-[60%] h-full border-l border-b border-indigo-500/50 bg-indigo-500/10 rounded-bl backdrop-blur-md"></div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Launch Button Pill */}
                <div className="mt-12 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <button
                        onClick={onEnterApp}
                        className="group relative inline-flex items-center gap-2 pl-6 pr-2 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 rounded-full transition-all duration-300 shadow-[0_4px_24px_rgba(120,0,255,0.2)] hover:shadow-[0_4px_32px_rgba(120,0,255,0.4)]"
                    >
                        <span className="text-sm font-medium text-purple-200">launch-app.crediprocure.com</span>
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                            <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                    </button>
                </div>

            </main>

            {/* Footer Social Icons */}
            <footer className="relative z-10 w-full pb-12 pt-8 flex justify-center items-center gap-8 text-white/40 animate-fade-in">
                <button className="flex items-center gap-2 hover:text-white transition-colors text-xs font-medium">
                    <Heart className="w-4 h-4" /> Like
                </button>
                <button className="flex items-center gap-2 hover:text-white transition-colors text-xs font-medium">
                    <Bookmark className="w-4 h-4" /> Save
                </button>
                <button className="flex items-center gap-2 hover:text-white transition-colors text-xs font-medium">
                    <Share2 className="w-4 h-4" /> Share
                </button>
            </footer>
        </div>
    );
}
