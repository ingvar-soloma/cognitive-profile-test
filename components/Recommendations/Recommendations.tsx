import React from 'react';
import {
    Briefcase,
    Compass,
    Lightbulb,
    BookOpen,
    Palette,
    Lock,
    Coins,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { UIStrings } from '@/types';

interface RecommendationsProps {
    ui: UIStrings;
    isLocked: boolean;
    user: any;
}

export const Recommendations: React.FC<RecommendationsProps> = ({ ui, isLocked, user }) => {
    const categories = [
        {
            id: 'career',
            title: ui.careerAdvisor,
            icon: Briefcase,
            color: 'bg-blue-500',
            desc: ui.careerAdvisorDesc
        },
        {
            id: 'worldview',
            title: ui.worldview,
            icon: Compass,
            color: 'bg-purple-500',
            desc: ui.worldviewDesc
        },
        {
            id: 'exploration',
            title: ui.selfExploration,
            icon: Lightbulb,
            color: 'bg-amber-500',
            desc: ui.selfExplorationDesc
        },
        {
            id: 'media',
            title: ui.mediaRecs,
            icon: BookOpen,
            color: 'bg-emerald-500',
            desc: ui.mediaRecsDesc
        },
        {
            id: 'creativity',
            title: ui.creativityRecs,
            icon: Palette,
            color: 'bg-rose-500',
            desc: ui.creativityRecsDesc
        }
    ];

    return (
        <div className="animate-fade-in text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                <div className="max-w-xl">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-graphite tracking-tight leading-tight mb-3">
                        {ui.recommendationsTitle}
                    </h1>
                    <p className="text-stone-500 font-sans leading-relaxed text-sm md:text-base">
                        {ui.recommendationsDesc}
                    </p>
                </div>

                <div className="bg-brand-paper-accent/80 backdrop-blur-md px-5 py-2.5 rounded-2xl flex items-center gap-3 border border-stone-line shadow-sm self-start md:self-center">
                    <div className="w-7 h-7 rounded-full bg-brand-clay/10 flex items-center justify-center">
                        <Coins className="w-3.5 h-3.5 text-brand-clay" />
                    </div>
                    <span className="font-bold text-brand-graphite tracking-tight text-sm">100 {ui.credits}</span>
                </div>
            </div>

            {isLocked ? (
                <div className="bg-brand-paper/50 backdrop-blur-md border border-dashed border-stone-line rounded-[2.5rem] p-10 md:p-16 text-center space-y-4 shadow-card overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-paper-accent/0 via-brand-paper-accent/0 to-brand-ink/[0.03] pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-brand-paper-accent border border-stone-line rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 shadow-soft">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl md:text-3xl font-serif font-bold text-brand-graphite mb-3 tracking-tight">
                            {ui.recommendationsLocked}
                        </h3>
                        <p className="text-stone-500 font-sans max-w-sm mx-auto leading-relaxed text-sm">
                            {ui.recommendationsLockedDesc}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className="group relative bg-brand-paper-accent p-6 rounded-[2rem] border border-stone-line shadow-card hover:shadow-soft hover:border-brand-ink/30 transition-all text-left overflow-hidden flex flex-col"
                        >
                            {/* Soon badge */}
                            <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 border border-amber-200">
                                {ui.soon}
                            </span>

                            <div className="w-12 h-12 bg-brand-ink/5 border border-brand-ink/10 rounded-2xl flex items-center justify-center text-brand-ink mb-6 group-hover:scale-110 group-hover:bg-brand-ink group-hover:text-white transition-all duration-300 shadow-sm">
                                <cat.icon className="w-5 h-5" />
                            </div>

                            <h3 className="text-xl font-serif font-bold text-brand-graphite mb-3 tracking-tight flex items-center gap-3">
                                {cat.title}
                                <Sparkles className="w-3.5 h-3.5 text-brand-clay opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
                            </h3>

                            <p className="text-xs text-stone-500 mb-8 leading-relaxed font-sans flex-1">
                                {cat.desc}
                            </p>

                            <div className="flex items-center justify-between pt-5 border-t border-stone-line">
                                <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">{ui.creditsRequired}</span>
                                <div className="w-7 h-7 rounded-full bg-stone-bg flex items-center justify-center border border-stone-line group-hover:bg-brand-ink/5 transition-colors">
                                    <ChevronRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-brand-ink group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -top-4 -right-4 w-24 h-24 bg-brand-ink/[0.02] rounded-full blur-2xl group-hover:bg-brand-ink/[0.05] transition-colors duration-700" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
