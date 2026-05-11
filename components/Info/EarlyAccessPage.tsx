import React, { useState } from 'react';
import { Zap, Sparkles, Brain, CheckCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { UIStrings } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';
import { useGoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

interface EarlyAccessPageProps {
    ui: UIStrings;
}

export const EarlyAccessPage: React.FC<EarlyAccessPageProps> = ({ ui }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useSeoMetadata({
        title: ui.earlyAccessTitle,
        description: ui.earlyAccessSubtitle,
        canonical: '/early-access'
    });

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setIsSubmitting(true);
            try {
                const apiUrl = (window as any).API_BASE_URL || import.meta.env.VITE_API_URL || '';
                const response = await fetch(`${apiUrl}/api/auth/google/exchange`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_token: tokenResponse.access_token,
                        source: 'early-access-v5'
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.id) {
                        localStorage.setItem('auth_token', JSON.stringify(data));
                        globalThis.dispatchEvent(new CustomEvent('auth-login', { detail: data }));
                        setIsSuccess(true);
                        toast.success(ui.earlyAccessSuccess);
                        setTimeout(() => navigate('/survey/express_demo'), 1500);
                    }
                } else {
                    throw new Error('Auth failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                toast.error(ui.subscribeError);
                // Fallback: let them try the demo anyway
                setTimeout(() => navigate('/survey/express_demo'), 1000);
            } finally {
                setIsSubmitting(false);
            }
        },
        onError: () => {
            toast.error(ui.subscribeError);
        }
    });

    return (
        <div className="min-h-screen text-foreground selection:bg-indigo-500/30 overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/40 dark:bg-indigo-600/50 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-500/30 dark:bg-purple-600/40 rounded-full blur-[120px] animate-pulse-extra-slow" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-32 text-center">
                <div className="space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-indigo-400 dark:text-indigo-300 shadow-sm mx-auto">
                        <Zap className="w-3 h-3 text-indigo-500" />
                        Next Gen Neurotech
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none bg-gradient-to-br from-foreground to-foreground/60 dark:from-white dark:to-white/70 bg-clip-text text-transparent italic">
                        {ui.earlyAccessTitle}
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
                        {ui.earlyAccessSubtitle}
                    </p>

                    <div className="max-w-2xl mx-auto relative group">
                        {!isSuccess ? (
                            <div className="space-y-8 flex flex-col items-center">
                                <div className="w-full max-w-md space-y-4">
                                    <button
                                        onClick={() => handleGoogleLogin()}
                                        disabled={isSubmitting}
                                        className="w-full flex items-center justify-center gap-4 px-8 py-6 mb-10 bg-white dark:bg-white text-slate-900 rounded-[2rem] font-black text-lg md:text-xl shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:shadow-[0_20px_60px_rgba(99,102,241,0.5)] hover:scale-[1.03] active:scale-95 transition-all border border-slate-200 group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 6.16l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span className="relative z-10">
                                            {isSubmitting ? '...' : ui.earlyAccessGoogleCta}
                                        </span>
                                    </button>

                                    <div className="space-y-3">
                                        <p className="text-sm font-bold text-indigo-400/90 uppercase tracking-[0.2em] animate-pulse">
                                            {ui.earlyAccessOneClickAuth}
                                        </p>
                                        <p className="text-xs font-medium text-muted-foreground dark:text-slate-400 italic">
                                            {ui.earlyAccessBetaBooking}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 bg-indigo-600/10 border border-indigo-600/30 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 animate-in zoom-in-95 duration-500">
                                <div className="flex items-center gap-4">
                                    <CheckCircle className="w-8 h-8 text-indigo-500" />
                                    <span className="text-lg font-bold text-indigo-400">{ui.earlyAccessSuccess}</span>
                                </div>
                                <div className="w-full h-1 bg-indigo-500/20 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-indigo-500 animate-[progress_2s_ease-in-out_forwards]" />
                                </div>
                            </div>
                        )}

                        {/* Scientific Authority Block */}
                        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-40 grayscale mt-12 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            <span>Based on VVIQ (1973)</span>
                            {/* <span>PSIQ Multisensory Metrics</span> */}
                            {/* <span>MBTI Cognitive Functions</span> */}
                            <span>SDAM Memory Framework</span>
                        </div>
                    </div>
                </div>

                {/* Concept Grid */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="space-y-4 text-left">
                            <h2 className="text-3xl font-black flex items-center gap-3 text-foreground dark:text-white">
                                <Brain className="w-8 h-8 text-indigo-500" />
                                {ui.principles}
                            </h2>
                            <p className="text-lg text-muted-foreground dark:text-slate-300 leading-relaxed">
                                {ui.earlyAccessConcept}
                            </p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                { icon: Sparkles, title: ui.earlyAccessF1Title, desc: ui.earlyAccessF1Desc },
                                { icon: Brain, title: ui.earlyAccessF2Title, desc: ui.earlyAccessF2Desc },
                                { icon: Zap, title: ui.earlyAccessF3Title, desc: ui.earlyAccessF3Desc }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-card dark:bg-white/5 rounded-3xl hover:bg-indigo-500/5 transition-colors group">
                                    <div className="w-12 h-12 bg-muted dark:bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <item.icon className="w-6 h-6 text-indigo-400 dark:text-indigo-300" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-black text-sm uppercase tracking-tighter text-foreground dark:text-white">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground dark:text-slate-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Curiosity Hook */}
                        <div className="mt-8 text-left">
                            <h3 className="text-lg font-bold text-foreground dark:text-white mb-6">
                                {ui.curiosityTitle}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-black/20 p-4 rounded-r-xl border-l-4 border-indigo-500">
                                {[
                                    ui.curiosityInsight1,
                                    ui.curiosityInsight2,
                                    ui.curiosityInsight3,
                                    ui.curiosityInsight4,
                                    ui.curiosityInsight5
                                ].map((insight, idx) => (
                                    <div key={idx} className="bg-card dark:bg-white/5 p-4 rounded-xl text-sm text-muted-foreground dark:text-slate-300 shadow-sm border border-black/5 dark:border-white/5">
                                        {insight}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative lg:pl-12 animate-in fade-in slide-in-from-right-8 duration-1000">
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl group bg-muted/20 dark:bg-white/5">
                            <div className="absolute inset-0 bg-indigo-600/20 group-hover:bg-indigo-600/10 transition-colors duration-700" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Brain className="w-48 h-48 text-indigo-500/30 animate-pulse" />
                            </div>
                            {/* Decorative mock UI */}
                            <div className="absolute inset-8 rounded-2xl flex flex-col p-6 space-y-4 backdrop-blur-md bg-foreground/5 dark:bg-white/5">
                                <div className="h-4 w-2/3 bg-foreground/20 dark:bg-white/20 rounded-full" />
                                <div className="h-4 w-full bg-foreground/10 dark:bg-white/10 rounded-full" />
                                <div className="h-4 w-1/2 bg-foreground/10 dark:bg-white/10 rounded-full" />
                                <div className="mt-8 flex gap-2">
                                    <div className="h-10 w-10 bg-indigo-500/60 rounded-lg shadow-lg shadow-indigo-500/20" />
                                    <div className="h-10 w-10 bg-foreground/10 dark:bg-white/20 rounded-lg" />
                                    <div className="h-10 w-10 bg-foreground/10 dark:bg-white/20 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Free Demo Promo - Dominating CTA Block */}
                <div className="bg-indigo-600 rounded-[3rem] p-10 md:p-20 text-center space-y-10 relative overflow-hidden group shadow-[0_32px_64px_-16px_rgba(79,70,229,0.4)]">
                    <div className="absolute top-0 right-0 p-8">
                        <Zap className="w-16 h-16 text-white/10 rotate-12" />
                    </div>
                    <div className="absolute bottom-0 left-0 p-8">
                        <Brain className="w-24 h-24 text-white/5 -rotate-12" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <h3 className="text-4xl md:text-6xl font-black tracking-tight leading-tight text-white">
                            {ui.tryExpressFree}
                        </h3>
                        <p className="text-indigo-100 text-xl max-w-2xl mx-auto font-medium">
                            {ui.demoCtaDesc}
                        </p>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-8">
                        <button
                            onClick={() => navigate('/survey/express_demo')}
                            className="inline-flex items-center gap-6 px-16 py-8 bg-white text-indigo-600 rounded-[3rem] font-black text-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl group"
                        >
                            {ui.expressDiagnosticsCta}
                            <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                        </button>

                        {/* Pricing Node - High Contrast */}
                        <div className="flex flex-col items-center p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 max-w-md w-full">
                            <span className="text-white/60 line-through text-sm font-bold tracking-widest uppercase">
                                {ui.pricingFuturePrice}
                            </span>
                            <span className="text-white text-3xl font-black mt-2 tracking-tight">
                                {ui.pricingBetaOffer}
                            </span>
                            <div className="mt-6 flex items-center gap-2 text-indigo-100 text-sm font-bold uppercase tracking-wider">
                                <Sparkles className="w-4 h-4 text-amber-300" />
                                Lifetime Beta License included
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>
            </div>
        </div>
    );
};
