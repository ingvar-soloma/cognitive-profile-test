import React, { useEffect, useRef } from 'react';
import { Brain, Sparkles, ChevronRight, Eye, EyeOff, BarChart2, ArrowRight, Shield, Zap, Users, ShieldAlert, Mail } from 'lucide-react';
import { UIStrings } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';

interface LandingPageProps {
    ui: UIStrings;
    onStartSurvey: () => void;
}

const FloatingOrb: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`absolute rounded-full blur-3xl pointer-events-none animate-pulse-slow opacity-25 dark:opacity-10 ${className}`} />
);

export const LandingPage: React.FC<LandingPageProps> = ({ ui, onStartSurvey }) => {
    const navigate = useNavigate();
    const heroRef = useRef<HTMLDivElement>(null);

    useSeoMetadata({
        title: ui.title, // Use the shorter main title
        description: ui.description,
        canonical: '/'
    });

    // Parallax subtle movement
    useEffect(() => {
        const hero = heroRef.current;
        if (!hero) return;
        const handleMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const { innerWidth, innerHeight } = window;
            const dx = (clientX / innerWidth - 0.5) * 20;
            const dy = (clientY / innerHeight - 0.5) * 20;
            hero.style.setProperty('--hero-dx', `${dx}px`);
            hero.style.setProperty('--hero-dy', `${dy}px`);
        };
        window.addEventListener('mousemove', handleMove);
        return () => window.removeEventListener('mousemove', handleMove);
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
                <FloatingOrb className="w-[300px] h-[300px] bg-blue-400 dark:bg-blue-950/30 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

                <div className="relative z-10 max-w-3xl mx-auto">
                    {/* Label */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-paper-accent/80 backdrop-blur-md border border-stone-line rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500 mb-8 shadow-sm">
                        <Zap className="w-3 h-3 text-amber-500" />
                        {ui.cognitiveAssessment}
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-brand-graphite leading-[1.05] tracking-tight mb-6"
                        style={{ transform: 'translateX(calc(var(--hero-dx) * 0.3)) translateY(calc(var(--hero-dy) * 0.3))' }}>
                        {ui.heroTitle}
                    </h1>

                    <p className="text-lg text-stone-500 leading-relaxed max-w-xl mx-auto mb-10 font-sans">
                        {ui.heroSubtitle}
                    </p>

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
                            className="inline-flex items-center gap-2 px-6 py-4 bg-brand-paper-accent border border-stone-line rounded-2xl text-sm font-bold text-brand-graphite hover:border-brand-ink/30 hover:shadow-soft transition-all"
                        >
                            {ui.landingLearnMore}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Trust signals */}
                    <div className="flex items-center justify-center gap-6 mt-12 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" />{ui.security}</span>
                        <span className="w-px h-3 bg-stone-line" />
                        <span className="flex items-center gap-1.5"><Users className="w-3 h-3" />{ui.anonymity}</span>
                        <span className="w-px h-3 bg-stone-line" />
                        <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-500" />Free</span>
                    </div>
                </div>
            </section>

            {/* ── SPECTRUM ─────────────────────────────── */}
            <section className="py-16 px-4">
                <div className="max-w-4xl mx-auto">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 text-center mb-8">
                        {ui.aboutSpectrum ?? 'The Spectrum'}
                    </p>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {profiles.map((p) => (
                            <div
                                key={p.label}
                                className="bg-brand-paper-accent border border-stone-line rounded-[1.5rem] p-6 text-center shadow-sm hover:shadow-soft transition-shadow"
                            >
                                <div className={`w-12 h-12 rounded-2xl ${p.chip} flex items-center justify-center mx-auto mb-4`}>
                                    <p.icon className={`w-5 h-5 ${p.color}`} />
                                </div>
                                <div className="text-2xl font-serif font-bold text-brand-graphite mb-1">{p.pct}</div>
                                <div className="text-xs text-stone-500 font-sans">{p.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURES ─────────────────────────────── */}
            <section className="py-16 px-4 bg-brand-paper-accent/50">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-brand-graphite mb-3 tracking-tight">
                            {ui.marketingTitle}
                        </h2>
                        <p className="text-stone-500 text-sm max-w-lg mx-auto font-sans">{ui.whyTakeTest}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="bg-brand-paper-accent border border-stone-line rounded-[1.5rem] p-6 shadow-sm hover:shadow-soft transition-shadow flex flex-col gap-3"
                            >
                                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center`}>
                                    <f.icon className={`w-5 h-5 ${f.color}`} />
                                </div>
                                <h3 className="text-sm font-serif font-bold text-brand-graphite leading-snug">{f.title}</h3>
                                <p className="text-xs text-stone-500 leading-relaxed font-sans">{f.desc}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-left bg-white/5 dark:bg-black/5 rounded-[2.5rem] p-8 border border-stone-line/50">
                        <div className="grid md:grid-cols-2 gap-12">
                           <div className="space-y-4">
                                <h3 className="text-xl font-serif font-bold text-brand-graphite">{ui.aboutWhatIsAphantasia}</h3>
                                <p className="text-sm text-stone-500 leading-relaxed">
                                    {ui.aboutWhatIsAphantasiaDesc}
                                    <br /><br />
                                    {ui.aboutHowCommonDesc}
                                </p>
                           </div>
                           <div className="space-y-4">
                                <h3 className="text-xl font-serif font-bold text-brand-graphite">{ui.aboutSpectrum}</h3>
                                <p className="text-sm text-stone-500 leading-relaxed">
                                    {ui.aboutSpectrumDesc}
                                    <br /><br />
                                    {ui.aboutWhoDiscoveredDesc}
                                </p>
                           </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── FOOTER / DISCLAIMER ────────────────────── */}
            <footer className="py-20 px-8 bg-stone-50/50 dark:bg-black/20 border-t border-stone-line/30">
                <div className="max-w-4xl mx-auto space-y-12">
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
                            <p className="text-xs text-stone-500 leading-relaxed font-sans max-w-sm">
                                {ui.disclaimer}
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
                                <p className="text-xs text-stone-500 font-sans">
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
