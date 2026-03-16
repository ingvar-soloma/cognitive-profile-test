import React from 'react';
import { ArrowLeft, FileText, Bot, Coins, RefreshCw } from 'lucide-react';
import { UIStrings } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

interface TermsPageProps {
    ui: UIStrings;
}

export const TermsPage: React.FC<TermsPageProps> = ({ ui }) => {
    const navigate = useNavigate();
    useDocumentTitle(ui.termsTitle);

    const sections = [
        {
            icon: FileText,
            title: ui.termsUsage,
            desc: ui.termsUsageDesc,
            accent: 'bg-brand-ink/5 border-brand-ink/10 text-brand-ink',
        },
        {
            icon: Bot,
            title: ui.termsAiDisclaimer,
            desc: ui.termsAiDisclaimerDesc,
            accent: 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/10 dark:border-amber-800/20 dark:text-amber-400',
        },
        {
            icon: Coins,
            title: ui.termsCredits,
            desc: ui.termsCreditsDesc,
            accent: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:border-emerald-800/20 dark:text-emerald-400',
        },
        {
            icon: RefreshCw,
            title: ui.termsChanges,
            desc: ui.termsChangesDesc,
            accent: 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-900/10 dark:border-purple-800/20 dark:text-purple-400',
        },
    ];

    const lastUpdated = 'March 2025';

    return (
        <div className="animate-fade-in text-left pb-20 max-w-3xl mx-auto">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-stone-400 hover:text-brand-ink transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">{ui.back}</span>
            </button>

            <header className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-ink/5 text-brand-graphite rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-6 border border-brand-ink/10">
                    <FileText className="w-3 h-3" />
                    Legal
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-graphite leading-tight mb-4 tracking-tight">
                    {ui.termsTitle}
                </h1>
                <p className="text-stone-500 text-base leading-relaxed max-w-xl font-sans">
                    {ui.termsSubtitle}
                </p>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mt-4">
                    {ui.termsLastUpdated}: {lastUpdated}
                </p>
            </header>

            <div className="space-y-5 mb-14">
                {sections.map((s, i) => (
                    <section
                        key={s.title}
                        className="flex gap-5 bg-brand-paper-accent border border-stone-line rounded-2xl p-7 shadow-sm"
                    >
                        <div className={`w-11 h-11 rounded-2xl border flex-shrink-0 flex items-center justify-center ${s.accent}`}>
                            <s.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-serif font-bold text-brand-graphite mb-2">{s.title}</h2>
                            <p className="text-sm text-stone-500 leading-relaxed font-sans">{s.desc}</p>
                        </div>
                    </section>
                ))}
            </div>

            <footer className="border-t border-stone-line pt-8 text-center">
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                    NeuroProfile Project &copy; {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
};
