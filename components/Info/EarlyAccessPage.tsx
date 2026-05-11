import React, { useState } from 'react';
import { Zap, Sparkles, Brain, CheckCircle, ChevronRight, ArrowRight } from 'lucide-react';
import { UIStrings, Language } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

interface EarlyAccessPageProps {
    ui: UIStrings;
    user: any;
}

export const EarlyAccessPage: React.FC<EarlyAccessPageProps> = ({ ui, user }) => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    React.useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                navigate('/survey/express_demo');
            }, 2200);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, navigate]);

    useSeoMetadata({
        title: ui.earlyAccessTitle,
        description: ui.earlyAccessSubtitle,
        canonical: '/early-access'
    });

    const handleNavigateToDemo = () => navigate('/survey/express_demo');

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

                    {(user || isSuccess) ? (
                        <div className="max-w-2xl mx-auto p-8 bg-indigo-600/10 border border-indigo-600/30 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 animate-in zoom-in-95 duration-500">
                             <div className="flex items-center gap-4">
                                <CheckCircle className="w-8 h-8 text-indigo-500" />
                                <span className="text-lg font-bold text-indigo-400">{ui.earlyAccessSuccess}</span>
                            </div>
                            
                            {isSuccess ? (
                                <div className="w-full h-1 bg-indigo-500/20 rounded-full mt-4 overflow-hidden">
                                    <div className="h-full bg-indigo-500 animate-[progress_2s_ease-in-out_forwards]" />
                                </div>
                            ) : (
                                <button
                                    onClick={handleNavigateToDemo}
                                    className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                                >
                                    {ui.expressDiagnosticsCta}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-2xl mx-auto relative group">
                            <div className="space-y-8 flex flex-col items-center">
                                <div className="w-full max-w-md space-y-4">
                                    <div className="w-full flex justify-center">
                                        <GoogleLogin
                                            onSuccess={async (credentialResponse) => {
                                                if (!credentialResponse.credential) return;
                                                setIsSubmitting(true);
                                                try {
                                                    const apiUrl = import.meta.env.VITE_API_URL || '';
                                                    const campaign = localStorage.getItem('lead_campaign') || undefined;
                                                    const intent = localStorage.getItem('lead_intent') || undefined;
                                                    const response = await fetch(`${apiUrl}/api/auth/google/exchange`, {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ 
                                                            credential: credentialResponse.credential,
                                                            source: 'early-access-landing',
                                                            campaign,
                                                            intent
                                                        })
                                                    });

                                                    if (!response.ok) throw new Error('Auth failed');
                                                    
                                                    const data = await response.json();
                                                    if (data && data.id && data.hash) {
                                                        localStorage.setItem('auth_token', JSON.stringify(data));
                                                        globalThis.dispatchEvent(new CustomEvent('auth-login', { detail: data }));
                                                        setIsSuccess(true);
                                                        toast.success(ui.subscribeSuccess);
                                                    }
                                                } catch (err) {
                                                    console.error('Registration error:', err);
                                                    toast.error(ui.subscribeError);
                                                } finally {
                                                    setIsSubmitting(false);
                                                }
                                            }}
                                            onError={() => {
                                                toast.error(ui.subscribeError);
                                            }}
                                            useOneTap={false}
                                            shape="pill"
                                            width="320"
                                        />
                                    </div>

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

                            {/* Scientific Authority Block */}
                            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 opacity-40 grayscale mt-12 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                <span>Based on VVIQ (1973)</span>
                                {/* <span>PSIQ Multisensory Metrics</span> */}
                                {/* <span>MBTI Cognitive Functions</span> */}
                                <span>SDAM Memory Framework</span>
                            </div>
                        </div>
                    )}
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
