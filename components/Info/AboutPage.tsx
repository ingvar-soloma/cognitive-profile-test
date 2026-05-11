import React from 'react';
import { ArrowLeft, Brain, Eye, EyeOff, Sparkles, ChevronRight, Microscope, Users as UsersIcon } from 'lucide-react';
import { UIStrings } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';

interface AboutPageProps {
    ui: UIStrings;
    onStartSurvey: () => void;
}

const FloatingOrb: React.FC<{ className?: string }> = ({ className }) => (
    <div className={`absolute rounded-full blur-3xl pointer-events-none animate-pulse-slow opacity-25 dark:opacity-10 ${className}`} />
);

export const AboutPage: React.FC<AboutPageProps> = ({ ui, onStartSurvey }) => {
    const navigate = useNavigate();
    useSeoMetadata({
        title: ui.aboutTitle,
        description: ui.aboutSubtitle,
        canonical: '/about'
    });

    const facts = [
        {
            icon: Eye,
            title: ui.aboutWhatIsAphantasia,
            desc: ui.aboutWhatIsAphantasiaDesc,
            color: 'bg-brand-ink/5 text-brand-ink border-brand-ink/10',
            accent: 'bg-brand-ink',
        },
        {
            icon: Brain,
            title: ui.aboutSpectrum,
            desc: ui.aboutSpectrumDesc,
            color: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-900/10 dark:text-purple-300 dark:border-purple-800/20',
            accent: 'bg-purple-500',
        },
        {
            icon: UsersIcon,
            title: ui.aboutHowCommon,
            desc: ui.aboutHowCommonDesc,
            color: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-300 dark:border-emerald-800/20',
            accent: 'bg-emerald-500',
        },
        {
            icon: Microscope,
            title: ui.aboutWhoDiscovered,
            desc: ui.aboutWhoDiscoveredDesc,
            color: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/10 dark:text-amber-300 dark:border-amber-800/20',
            accent: 'bg-amber-500',
        },
    ];

    const spectrumItems = [
        { label: ui.aphantasiaLabel, pct: 0, color: 'bg-brand-ink', textColor: 'text-brand-textPrimary' },
        { label: ui.vagueLabel, pct: 33, color: 'bg-stone-400', textColor: 'text-stone-500' },
        { label: ui.phantasiaLabel, pct: 60, color: 'bg-purple-400', textColor: 'text-purple-600' },
        { label: ui.hyperphantasiaLabel, pct: 100, color: 'bg-brand-clay', textColor: 'text-brand-clay' },
    ];

    return (
        <div className="animate-fade-in text-left pb-20 max-w-4xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-stone-400 hover:text-brand-ink transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">{ui.back}</span>
            </button>

            {/* Hero */}
            <header className="mb-14">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-6 border border-purple-200 dark:border-purple-800/30">
                    <Brain className="w-3 h-3" />
                    NeuroProfile
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-textPrimary leading-tight mb-6 tracking-tight">
                    {ui.aboutTitle}
                </h1>
                <p className="text-lg text-stone-500 dark:text-stone-400 leading-relaxed max-w-2xl">
                    {ui.aboutSubtitle}
                </p>
            </header>

            {/* Spectrum visual */}
            <section className="bg-brand-bgCard border border-stone-line dark:border-stone-line/20 rounded-[2rem] p-8 mb-10 shadow-sm">
                <h2 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-6">{ui.aboutSpectrum}</h2>
                <div className="relative h-3 bg-gradient-to-r from-brand-ink via-stone-300 dark:via-stone-700 via-purple-400 to-brand-clay rounded-full mb-8" />
                <div className="flex justify-between gap-2 text-center">
                    {spectrumItems.map((s) => (
                        <div key={s.label} className="flex-1">
                            <div className={`w-2.5 h-2.5 rounded-full ${s.color} mx-auto mb-2`} />
                            <span className={`text-[10px] font-bold ${s.textColor} dark:text-slate-300 leading-tight block`}>{s.label}</span>
                        </div>
                    ))}
                </div>
                <p className="text-xs text-stone-400 leading-relaxed mt-6 font-sans">{ui.aboutSpectrumDesc}</p>
            </section>

            {/* Fact cards */}
            <div className="grid sm:grid-cols-2 gap-6 mb-14">
                {facts.map((f) => (
                    <div
                        key={f.title}
                        className="bg-brand-bgCard border border-stone-line rounded-[2rem] p-7 shadow-sm flex flex-col gap-4 hover:shadow-soft transition-shadow"
                    >
                        <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${f.color}`}>
                            <f.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-serif font-bold text-brand-textPrimary dark:text-white">{f.title}</h3>
                        <p className="text-sm text-stone-500 dark:text-slate-400 leading-relaxed font-sans">{f.desc}</p>
                    </div>
                ))}
            </div>

            {/* CTA */}
            <section className="py-8">
                <div className="mx-auto text-center">
                    <div className="relative bg-brand-ink dark:bg-brand-bgCard border border-brand-ink/20 dark:border-white/10 rounded-[2.5rem] p-12 overflow-hidden shadow-xl">
                        <FloatingOrb className="w-64 h-64 bg-brand-clay -top-16 -right-16 opacity-30 dark:opacity-20" />
                        <FloatingOrb className="w-48 h-48 bg-white/20 -bottom-12 -left-12 opacity-15 dark:opacity-10" />
                        <div className="relative z-10">
                            <Sparkles className="w-8 h-8 text-amber-300 mx-auto mb-4 animate-pulse" />
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 tracking-tight">
                                {ui.aboutCtaTitle}
                            </h2>
                            <p className="text-white/80 text-sm leading-relaxed mb-10 max-w-sm mx-auto font-sans">
                                {ui.aboutCtaDesc}
                            </p>
                            <button
                                onClick={onStartSurvey}
                                className="inline-flex items-center gap-3 px-10 py-4 bg-white text-brand-ink rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-stone-200 dark:hover:bg-brand-bgMain transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                {ui.start}
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};
