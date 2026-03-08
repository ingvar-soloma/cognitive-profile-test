import React from 'react';
import { History, FileText, ChevronRight, Download, BarChart2 } from 'lucide-react';
import { Profile, UIStrings } from '@/types';
import { AVAILABLE_SURVEYS } from '@/constants';

interface DashboardResultsProps {
    profiles: Profile[];
    onViewResult: (profileId: string) => void;
    ui: UIStrings;
    language: 'uk' | 'en' | 'ru';
}

export const DashboardResults: React.FC<DashboardResultsProps> = ({ profiles, onViewResult, ui, language }) => {
    // Filter only profiles that have some answers
    const completedProfiles = profiles.filter(p => Object.keys(p.answers).length > 0);

    return (
        <div className="animate-fade-in text-left">
            <div className="flex items-center gap-6 mb-12">
                <div className="p-4 bg-brand-ink/5 border border-brand-ink/10 rounded-2xl text-brand-ink shadow-sm">
                    <History className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-graphite tracking-tight leading-tight mb-2">{ui.navResults}</h1>
                    <p className="text-stone-500 font-sans">{ui.resultsHistoryDesc}</p>
                </div>
            </div>

            {completedProfiles.length === 0 ? (
                <div className="card-editorial p-10 md:p-16 text-center">
                    <div className="w-16 h-16 bg-stone-bg border border-stone-line rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
                        <FileText className="w-8 h-8" />
                    </div>
                    <p className="text-stone-500 text-base mb-8 font-sans max-w-sm mx-auto">{ui.noTestsYet}</p>
                    <button
                        onClick={() => window.location.hash = ''}
                        className="btn-primary px-8 py-3 shadow-soft uppercase tracking-widest text-xs font-bold"
                    >
                        {ui.goToTests}
                    </button>
                </div>
            ) : (
                <div className="grid gap-5">
                    {completedProfiles.map(profile => {
                        const survey = AVAILABLE_SURVEYS.find(s => s.id === profile.surveyId);
                        const answerCount = Object.keys(profile.answers).length;

                        return (
                            <button
                                key={profile.id}
                                onClick={() => onViewResult(profile.id)}
                                className="flex items-center justify-between p-6 bg-brand-paper-accent border border-stone-line rounded-[2rem] shadow-card hover:shadow-soft hover:border-brand-ink/30 transition-all text-left group"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-brand-ink/5 border border-brand-ink/10 rounded-2xl flex items-center justify-center text-brand-ink group-hover:scale-105 group-hover:bg-brand-ink group-hover:text-white transition-all duration-300 shadow-sm">
                                        <BarChart2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-serif font-bold text-brand-graphite text-xl md:text-2xl tracking-tight mb-0.5">{profile.name}</h3>
                                        <div className="flex items-center gap-3 text-xs text-stone-400 font-sans">
                                            <span className="font-medium">{survey?.title[language] || 'General Test'}</span>
                                            <span className="w-1 h-1 bg-stone-200 rounded-full" />
                                            <span className="font-bold uppercase tracking-wider text-[9px] text-stone-300">{answerCount} {ui.answersLabel}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-[10px] uppercase font-bold text-stone-300 tracking-widest mb-1">{ui.dateLabel}</span>
                                        <span className="text-sm font-bold text-brand-graphite">
                                            {new Date(profile.lastUpdated).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-stone-bg flex items-center justify-center border border-stone-line group-hover:bg-brand-ink/5 transition-colors">
                                        <ChevronRight className="w-4 h-4 text-stone-400 group-hover:text-brand-ink group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
