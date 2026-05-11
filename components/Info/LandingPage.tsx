import React, { useEffect, useRef } from 'react';
import { Brain, Sparkles, ChevronRight, Eye, EyeOff, BarChart2, ArrowRight, Shield, Zap, Users as UsersIcon, ShieldAlert, Mail } from 'lucide-react';
import { UIStrings } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';
import { PrivacyPolicy } from '../Legal/PrivacyPolicy';

interface LandingPageProps {
    ui: UIStrings;
    onStartSurvey: () => void;
    user: any;
}

const FloatingOrb: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`absolute rounded-full blur-3xl pointer-events-none animate-pulse-slow opacity-50 dark:opacity-40 ${className}`} />
);

export const LandingPage: React.FC<LandingPageProps> = ({ ui, onStartSurvey, user }) => {
    const navigate = useNavigate();
    const heroRef = useRef<HTMLDivElement>(null);
    const [isLockedReport] = React.useState(true);
    const [email, setEmail] = React.useState('');
    const [leadStatus, setLeadStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleLeadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLeadStatus('loading');
        try {
            await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            setLeadStatus('success');
        } catch {
            setLeadStatus('error');
        }
    };

    useSeoMetadata({
        title: ui.title, // Use the shorter main title
        description: ui.description,
        canonical: '/'
    });

    // Parallax subtle movement
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;

        let rafId: number;
        const handleMove = (e: MouseEvent) => {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                const { clientX, clientY } = e;
                const { innerWidth, innerHeight } = window;
                const dx = (clientX / innerWidth - 0.5) * 20;
                const dy = (clientY / innerHeight - 0.5) * 20;
                hero.style.setProperty('--hero-dx', `${dx}px`);
                hero.style.setProperty('--hero-dy', `${dy}px`);
            });
        };
        window.addEventListener('mousemove', handleMove, { passive: true });
        return () => {
            window.removeEventListener('mousemove', handleMove);
            if (rafId) cancelAnimationFrame(rafId);
        };
    }, []);

    const features = [
        {
            icon: BarChart2,
            title: ui.sensoryMap,
            desc: ui.marketingPoint3Desc,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/10',
        },
        {
            icon: Brain,
            title: ui.aiAnalysisTitle,
            desc: ui.marketingPoint1Desc,
            color: 'text-brand-ink',
            bg: 'bg-brand-ink/5',
        },
        {
            icon: Sparkles,
            title: ui.navRecommendations,
            desc: ui.recommendationsDesc,
            color: 'text-amber-500',
            bg: 'bg-amber-50 dark:bg-amber-900/10',
        },
        {
            icon: Shield,
            title: ui.gdprTitle,
            desc: ui.gdprText.substring(0, 90) + '…',
            color: 'text-emerald-500',
            bg: 'bg-emerald-50 dark:bg-emerald-900/10',
        },
    ] as const;

    const profiles = [
        { label: ui.aphantasiaLabel, icon: EyeOff, pct: '2–4%', color: 'text-brand-ink', chip: 'bg-brand-ink/10' },
        { label: ui.vagueLabel, icon: Eye, pct: '~60%', color: 'text-stone-500', chip: 'bg-stone-200/60 dark:bg-stone-700/30' },
        { label: ui.hyperphantasiaLabel, icon: Sparkles, pct: '2–4%', color: 'text-brand-clay', chip: 'bg-brand-clay/10' },
    ];

    return (
        <div className="animate-fade-in overflow-hidden -mt-4">
            {/* ── HERO ─────────────────────────────────── */}
            <section
                ref={heroRef}
                className="relative min-h-[85vh] flex flex-col items-center justify-center text-center py-24 px-4"
                style={{ ['--hero-dx' as any]: '0px', ['--hero-dy' as any]: '0px' }}
            >
                <FloatingOrb className="w-[500px] h-[500px] bg-purple-400 -top-32 -right-40" />
                <FloatingOrb className="w-[400px] h-[400px] bg-brand-clay -bottom-20 -left-32" />
                <FloatingOrb className="w-[300px] h-[300px] bg-blue-400 dark:bg-blue-500/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                <div className="relative z-10 max-w-3xl mx-auto">
                    {/* Label */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-bgCard/60 backdrop-blur-md rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-8 shadow-sm">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {ui.cognitiveAssessment}
                    </div>

                    <div className="relative p-2 md:p-0">
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-brand-textPrimary leading-[1.05] tracking-tight mb-6"
                            style={{ transform: 'translateX(calc(var(--hero-dx) * 0.3)) translateY(calc(var(--hero-dy) * 0.3))' }}>
                            {ui.heroTitle}
                        </h1>

                        <p className="text-base sm:text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl mx-auto mb-10 font-sans">
                            {ui.heroSubtitle}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/survey/express_demo')}
                            className="group inline-flex items-center gap-3 px-8 py-4 bg-brand-ink text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-brand-inkHover hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            {ui.landingCtaButton}
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/about')}
                            className="inline-flex items-center gap-2 px-6 py-4 bg-brand-bgCard rounded-2xl text-sm font-bold text-brand-textPrimary hover:shadow-soft transition-all"
                        >
                            {ui.landingLearnMore}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Scientific Authority Block */}
                    <a href="/science" className="flex flex-row flex-wrap justify-center gap-8 opacity-40 grayscale mt-6 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest hover:opacity-80 transition-opacity">
                        <span>Based on VVIQ (1973)</span>
                        {/* <span>PSIQ Multisensory Metrics</span> */}
                        {/* <span>MBTI Cognitive Functions</span> */}
                        <span>SDAM Memory Framework</span>
                    </a>

                    {/* Trust signals */}
                    <div className="flex items-center justify-center gap-6 mt-12 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" />{ui.security}</span>
                        <span className="w-px h-3 bg-stone-line" />
                        <span className="flex items-center gap-1.5"><UsersIcon className="w-3 h-3" />{ui.anonymity}</span>
                        <span className="w-px h-3 bg-stone-line" />
                        <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-500" />Free</span>
                    </div>
                </div>
            </section>

            {/* ── SPECTRUM ─────────────────────────────── */}
            <section className="py-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 text-center mb-8">
                        {ui.aboutSpectrum ?? 'The Spectrum'}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {profiles.map((p) => (
                            <div
                                key={p.label}
                                className="bg-brand-bgCard rounded-[1.5rem] p-6 text-center shadow-sm hover:shadow-soft transition-shadow"
                            >
                                <div className={`w-12 h-12 rounded-xl ${p.chip} flex items-center justify-center mx-auto mb-4`}>
                                    <p.icon className={`w-5 h-5 ${p.color}`} />
                                </div>
                                <div className="text-2xl font-serif font-bold text-brand-textPrimary dark:text-white mb-1">{p.pct}</div>
                                <div className="text-xs text-stone-500 dark:text-stone-400 font-sans">{p.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────── */}
            <section className="py-16 px-4 bg-brand-bgCard/50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-textPrimary mb-3 tracking-tight">
                            {ui.marketingTitle}
                        </h2>
                        <p className="text-stone-500 dark:text-stone-400 text-sm max-w-lg mx-auto font-sans">{ui.whyTakeTest}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="bg-brand-bgCard rounded-[1.5rem] p-6 shadow-sm hover:shadow-soft transition-shadow flex flex-col gap-3"
                            >
                                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center`}>
                                    <f.icon className={`w-5 h-5 ${f.color}`} />
                                </div>
                                <h3 className="text-sm font-serif font-bold text-brand-textPrimary dark:text-white leading-snug">{f.title}</h3>
                                <p className="text-xs text-stone-500 dark:text-slate-400 leading-relaxed font-sans">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 mb-12 text-left">
                        <h3 className="text-xl font-serif font-bold text-brand-textPrimary mb-8 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-ink/5 flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-brand-ink" />
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
                                    className={`bg-brand-bgCard p-6 rounded-2xl text-sm text-stone-600 dark:text-slate-300 shadow-sm border border-stone-line/50 hover:shadow-soft hover:scale-[1.02] transition-all duration-300 flex flex-col justify-between ${idx === 4 ? 'md:col-span-2 lg:col-span-1' : ''}`}
                                >
                                    <p className="leading-relaxed">{insight}</p>
                                    <div className="mt-4 pt-4 border-t border-stone-line/30 flex items-center justify-between opacity-40">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-stone-500 dark:text-slate-400">Cognitive Trait</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-brand-ink" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Lead Capture Form */}
                    {!user && (
                        <div className="my-24 mx-auto max-w-5xl bg-[#5E4B8B] text-white rounded-[2.5rem] p-10 md:p-16 shadow-2xl text-center relative overflow-hidden group">
                            <FloatingOrb className="w-96 h-96 bg-purple-400/20 -top-20 -right-20 opacity-60 dark:opacity-60" />
                            <FloatingOrb className="w-64 h-64 bg-brand-clay/20 -bottom-20 -left-20 opacity-40 dark:opacity-40" />
                            
                            <div className="relative z-10 max-w-xl mx-auto">
                                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 tracking-tight">
                                    {ui.leadFormTitle}
                                </h2>
                                <p className="text-base text-stone-300 mb-10 leading-relaxed font-sans">
                                    {ui.leadFormSubtitle}
                                </p>
                                
                                <form onSubmit={handleLeadSubmit} className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1 relative">
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder={ui.leadFormEmailPlaceholder}
                                            className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-sm text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all"
                                        />
                                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={leadStatus === 'loading' || leadStatus === 'success'}
                                        className="px-10 py-4 bg-white text-[#5E4B8B] rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-stone-100 hover:scale-[1.03] active:scale-95 transition-all shadow-xl disabled:opacity-50"
                                    >
                                        {leadStatus === 'success' ? '✓' : ui.leadFormButton}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                    <div className="mt-24 text-left bg-brand-bgCard/50 dark:bg-black/10 rounded-[3rem] p-10 md:p-16 relative overflow-hidden border border-stone-line/30">
                        {isLockedReport && (
                            <div className="absolute inset-0 z-20 backdrop-blur-xl bg-white/40 dark:bg-black/60 flex flex-col items-center justify-center p-6">
                                <div className="w-20 h-20 bg-brand-ink text-white rounded-full flex items-center justify-center shadow-2xl mb-6 animate-pulse-slow">
                                    <EyeOff className="w-8 h-8" />
                                </div>
                                <p className="font-black uppercase tracking-[0.3em] text-xs md:text-sm text-brand-ink dark:text-white text-center drop-shadow-sm">
                                    {ui.lockedReportLabel}
                                </p>
                            </div>
                        )}
                        <div className={`grid md:grid-cols-2 gap-12 ${isLockedReport ? 'opacity-30 blur-sm pointer-events-none select-none' : ''}`}>
                            <div className="space-y-4">
                                <h3 className="text-xl font-serif font-bold text-brand-textPrimary">{ui.sectionCareer}</h3>
                                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                                    {ui.sectionCareerDesc}
                                    <br /><br />
                                    [Personalized career insights based on cognitive profile...]
                                </p>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-serif font-bold text-brand-textPrimary">{ui.sectionRelationships}</h3>
                                <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                                    {ui.sectionRelationshipsDesc}
                                    <br /><br />
                                    [Team dynamics and communication adaptation guidelines...]
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── PRICING TEASER ─────────────────────────────── */}
            <section className="py-16 px-4 bg-brand-bgCard/30 border-t border-stone-line/30">
                <div className="max-w-5xl mx-auto text-center space-y-6">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-textPrimary">
                        {ui.pricingTitle || "Access your full profile"}
                    </h2>
                    <p className="text-stone-500 dark:text-stone-400 max-w-xl mx-auto">
                        {ui.pricingDesc}
                    </p>
                    {/* Pricing Node */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '24px' }} className="mx-auto max-w-lg bg-black/5 dark:bg-white/5">
                        <span style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '14px' }}>{ui.pricingFuturePrice}</span>
                        <span style={{ fontWeight: 700, fontSize: '24px' }} className="text-brand-ink mt-2">{ui.pricingBetaOffer}</span>
                        <a href="/survey/express_demo" style={{ opacity: 0.7, marginTop: '16px', fontSize: '14px', textDecoration: 'underline' }}>{ui.pricingFallbackCTA}</a>
                    </div>
                </div>
            </section>

            {/* ── FOOTER / DISCLAIMER ────────────────────── */}
            <footer className="py-20 px-8 bg-stone-50/50 dark:bg-black/20 border-t border-stone-line/30">
                <div className="max-w-5xl mx-auto space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-clay/10 flex items-center justify-center border border-brand-clay/20">
                                    <ShieldAlert className="w-4 h-4 text-brand-clay" />
                                </div>
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                                    {ui.disclaimerTitle}
                                </h4>
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans max-w-sm">
                                {ui.disclaimer}
                            </p>
                            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/60 leading-relaxed font-sans max-w-sm font-medium">
                                {ui.complianceDisclaimer}
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-brand-ink/10 flex items-center justify-center border border-brand-ink/20">
                                    <Mail className="w-4 h-4 text-brand-ink dark:text-brand-clay" />
                                </div>
                                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
                                    {ui.contactTitle}
                                </h4>
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs text-stone-500 dark:text-stone-400 font-sans">
                                    {ui.contactText}
                                </p>
                                <div className="flex gap-4 pt-2">
                                    <button
                                        onClick={() => navigate('/terms')}
                                        className="text-[10px] font-bold uppercase tracking-widest text-brand-ink hover:text-brand-clay transition-colors"
                                    >
                                        {ui.navTerms}
                                    </button>
                                    <button
                                        onClick={() => navigate('/privacy-policy')}
                                        className="text-[10px] font-bold uppercase tracking-widest text-brand-ink hover:text-brand-clay transition-colors"
                                    >
                                        {ui.privacyPolicy}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-stone-line/20 text-center">
                        <p className="text-[10px] text-stone-400 font-sans tracking-tight">
                            &copy; {new Date().getFullYear()} NeuroProfile Research Project. Built for cognitive exploration.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};
