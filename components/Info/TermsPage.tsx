import React from 'react';
import { ArrowLeft, FileText, Bot, Coins, RefreshCw } from 'lucide-react';
import { UIStrings } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';

interface TermsPageProps {
    ui: UIStrings;
}

export const TermsPage: React.FC<TermsPageProps> = ({ ui }) => {
    const navigate = useNavigate();
    useSeoMetadata({
        title: `${ui.termsTitle} — NeuroProfile Assessment`,
        description: ui.termsSubtitle,
        canonical: '/terms'
    });

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
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-6 mb-8">
                    <p className="text-amber-800 dark:text-amber-200 text-sm font-medium leading-relaxed font-sans">
                        {ui.complianceDisclaimer}
                    </p>
                </div>
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

            <div className="mb-14 p-8 bg-brand-paper-accent border border-stone-line rounded-[2rem] text-sm text-stone-500 leading-relaxed font-sans space-y-4">
                <h2 className="text-base font-serif font-bold text-brand-graphite">Additional Information</h2>
                <p>
                    By using this service, you acknowledge that the Cognitive Profile Assessment is a research-oriented tool. The data provided is for the purpose of self-exploration and understanding neurodiversity. We are committed to transparency and will provide updates on how AI models interpret these results.
                </p>
                <p>
                    Intellectual Property: All software, design, and analysis methodologies are the property of the NeuroProfile Project. User-submitted answers remain the property of the user, but we are granted a license to process them for generating results and aggregate research.
                </p>
                <p>
                    Data Retention: Users who authorize through Google have their data stored indefinitely to allow historical comparison. You can request full data deletion at any time by contacting us as detailed in the Privacy Policy.
                </p>
            </div>

            <footer className="border-t border-stone-line pt-8 text-center">
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                    NeuroProfile Project &copy; {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
};
