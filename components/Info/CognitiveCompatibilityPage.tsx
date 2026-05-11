import React, { useState } from 'react';
import { Mail, ArrowRight, Heart, CheckCircle, ChevronRight, Brain, Users as UsersIcon, Sparkles } from 'lucide-react';
import { UIStrings } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';
import toast from 'react-hot-toast';

interface CognitiveCompatibilityPageProps {
    ui: UIStrings;
}

export const CognitiveCompatibilityPage: React.FC<CognitiveCompatibilityPageProps> = ({ ui }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useSeoMetadata({
        title: ui.compatibilityTitle,
        description: ui.compatibilitySubtitle,
        canonical: '/compatibility'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            toast.error(ui.subscribeInvalidEmail);
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`${(window as any).API_BASE_URL || ''}/api/early-access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'compatibility-landing' }),
            });

            if (response.ok) {
                setIsSuccess(true);
                toast.success(ui.compatibilitySuccess);
            } else {
                throw new Error('Failed to register');
            }
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(ui.subscribeError);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-indigo-500/30 overflow-hidden">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-500/10 dark:bg-pink-500/20 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-32">
                <div className="text-center space-y-8 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-500/10 dark:bg-purple-500/20 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-purple-400 dark:text-purple-300 shadow-sm mx-auto">
                        <Heart className="w-3 h-3 text-purple-500" />
                        Relational Intelligence
                    </div>

                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none bg-gradient-to-br from-foreground to-foreground/60 dark:from-white dark:to-white/70 bg-clip-text text-transparent italic">
                        {ui.compatibilityTitle}
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
                        {ui.compatibilitySubtitle}
                    </p>

                    <div className="max-w-md mx-auto relative group">
                        {!isSuccess ? (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 p-2 bg-card dark:bg-white/5 rounded-[2.5rem] shadow-2xl focus-within:ring-4 focus-within:ring-purple-500/10 transition-all duration-500">
                                <div className="flex-1 flex items-center px-6">
                                    <Mail className="w-5 h-5 text-muted-foreground dark:text-slate-400 mr-3" />
                                    <input
                                        type="email"
                                        placeholder={ui.subscribePlaceholder}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent outline-none py-4 text-base font-medium placeholder:text-muted-foreground/50 dark:text-white"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-10 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 group-hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? '...' : ui.subscribeButton}
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </form>
                        ) : (
                            <div className="p-8 bg-purple-600/10 rounded-[2.5rem] flex items-center justify-center gap-4 animate-in zoom-in-95 duration-500">
                                <CheckCircle className="w-8 h-8 text-purple-500" />
                                <span className="text-lg font-bold text-purple-400">{ui.compatibilitySuccess}</span>
                            </div>
                        )}
                        <p className="mt-4 text-[10px] text-muted-foreground/60 dark:text-slate-500 uppercase tracking-widest font-bold font-sans">
                            {ui.earlyAccessCta}
                        </p>

                        {/* Scientific Authority Block */}
                        <a href="/science" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '32px', opacity: 0.4, filter: 'grayscale(100%)', marginTop: '24px' }} className="flex-wrap text-xs font-bold text-muted-foreground uppercase tracking-widest hover:opacity-80 transition-opacity">
                            <span>Based on VVIQ (1973)</span>
                            {/* <span>PSIQ Multisensory Metrics</span> */}
                            {/* <span>MBTI Cognitive Functions</span> */}
                            <span>SDAM Memory Framework</span>
                        </a>
                    </div>
                </div>

                {/* Concept Grid */}
                <div className="grid md:grid-cols-2 gap-12 items-center mb-32">
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
                        <div className="space-y-4 text-left">
                            <h2 className="text-3xl font-black flex items-center gap-3 text-foreground dark:text-white">
                                <Brain className="w-8 h-8 text-purple-500" />
                                {ui.principles}
                            </h2>
                            <p className="text-lg text-muted-foreground dark:text-slate-300 leading-relaxed">
                                {ui.earlyAccessConcept}
                            </p>
                        </div>
                        <div className="grid gap-4">
                            {[
                                { icon: UsersIcon, title: ui.compatibilityF1Title, desc: ui.compatibilityF1Desc },
                                { icon: Sparkles, title: ui.compatibilityF2Title, desc: ui.compatibilityF2Desc },
                                { icon: Brain, title: ui.compatibilityF3Title, desc: ui.compatibilityF3Desc }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-card dark:bg-white/5 rounded-3xl hover:bg-purple-500/5 transition-colors group">
                                    <div className="w-12 h-12 bg-muted dark:bg-white/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <item.icon className="w-6 h-6 text-purple-400 dark:text-purple-300" />
                                    </div>
                                    <div className="text-left">
                                        <h4 className="font-black text-sm uppercase tracking-tighter text-foreground dark:text-white">{item.title}</h4>
                                        <p className="text-xs text-muted-foreground dark:text-slate-400">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-20 mb-12 text-left">
                            <h3 className="text-xl font-serif font-bold text-foreground dark:text-white mb-8 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-purple-500/5 dark:bg-white/5 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-purple-500" />
                                </div>
                                {ui.curiosityTitle}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {[
                                    ui.curiosityInsight1,
                                    ui.curiosityInsight2,
                                    ui.curiosityInsight3,
                                    ui.curiosityInsight4,
                                    ui.curiosityInsight5
                                ].map((insight, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`bg-card dark:bg-white/5 p-6 rounded-2xl text-sm text-muted-foreground dark:text-slate-300 shadow-sm border border-black/5 dark:border-white/5 hover:shadow-soft hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between ${idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                                    >
                                        <p className="leading-relaxed">{insight}</p>
                                        <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between opacity-40">
                                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground dark:text-slate-400">Cognitive Trait</span>
                                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="relative lg:pl-12 animate-in fade-in slide-in-from-right-8 duration-1000">
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl group bg-muted/20 dark:bg-white/5">
                            <div className="absolute inset-0 bg-purple-600/20 group-hover:bg-purple-600/10 transition-colors duration-700" />
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                <UsersIcon className="w-32 h-32 text-purple-500/30 animate-pulse" />
                                <Heart className="w-16 h-16 text-pink-500/30" />
                            </div>
                            {/* Decorative mock UI */}
                            <div className="absolute inset-8 rounded-2xl flex flex-col p-6 space-y-4 backdrop-blur-md bg-foreground/5 dark:bg-white/5">
                                <div className="h-4 w-1/3 bg-foreground/20 dark:bg-white/20 rounded-full" />
                                <div className="h-4 w-full bg-foreground/10 dark:bg-white/10 rounded-full" />
                                <div className="h-4 w-1/2 bg-foreground/10 dark:bg-white/10 rounded-full" />
                                <div className="mt-8 flex gap-2">
                                    <div className="h-10 w-10 bg-purple-500/60 rounded-lg shadow-lg shadow-purple-500/20" />
                                    <div className="h-10 w-10 bg-foreground/10 dark:bg-white/20 rounded-lg" />
                                    <div className="h-10 w-10 bg-foreground/10 dark:bg-white/20 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Free Demo Promo */}
                <div className="bg-card dark:bg-white/5 rounded-[3rem] p-10 md:p-20 text-center space-y-8 relative overflow-hidden group">
                    <h3 className="text-3xl md:text-5xl font-black tracking-tight leading-tight text-foreground dark:text-white">
                        {ui.compatibilityDemoCta}
                    </h3>

                    <p className="text-muted-foreground dark:text-slate-300 text-lg max-w-xl mx-auto">
                        {ui.compatibilityDemoDesc}
                    </p>

                    <button
                        onClick={() => navigate('/survey/express_demo')}
                        className="inline-flex items-center gap-4 px-12 py-6 bg-foreground dark:bg-white text-background dark:text-black rounded-[2.5rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.3)] group"
                    >
                        {ui.expressDiagnosticsCta}
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                    </button>

                    {/* Pricing Node */}
                    <div className="mx-auto max-w-lg mt-8 relative z-10 bg-black/5 dark:bg-white/5 backdrop-blur-sm flex flex-col items-center border border-white/10 rounded-xl p-6">
                        <span className="line-through opacity-50 text-sm text-foreground dark:text-white">{ui.pricingFuturePrice}</span>
                        <span className="font-bold text-2xl text-purple-500 dark:text-purple-400 mt-2">{ui.pricingBetaOffer}</span>
                        <a href="/survey/express_demo" className="opacity-70 mt-4 text-sm underline text-foreground dark:text-white hover:opacity-100 transition-opacity">{ui.pricingFallbackCTA}</a>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
                </div>
            </div>
        </div>
    );
};
