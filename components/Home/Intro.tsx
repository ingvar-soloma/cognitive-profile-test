import React, { useState } from 'react';
import { BrainCircuit, CheckCircle, Upload, ChevronRight, Sparkles, BarChart3, Zap, Pencil } from 'lucide-react';
import { AVAILABLE_SURVEYS } from '@/constants';
import { Language } from '@/types';
import { ConsentModal } from './ConsentModal';
import { useNavigate } from 'react-router-dom';

interface IntroProps {
    ui: any;
    language: Language;
    activeSurveyId: string;
    onSetActiveSurveyId: (id: string) => void;
    onStartSurvey: (id?: string) => void;
    onTriggerFileUpload: () => void;
    fileInputRef: React.RefObject<HTMLInputElement>;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isLoading?: boolean;
    surveyProgress?: Record<string, { answered: number; total: number; percent: number }>;
    hasExistingResults?: boolean;
    backendRecommendations?: Record<string, string>;
    onShowResults?: (surveyId?: string) => void;
}

export const Intro: React.FC<IntroProps> = ({
    ui,
    language,
    activeSurveyId,
    onSetActiveSurveyId,
    onStartSurvey,
    onTriggerFileUpload,
    fileInputRef,
    onFileUpload,
    isLoading = false,
    surveyProgress = {},
    hasExistingResults = false,
    backendRecommendations = {},
    onShowResults
}) => {
    const navigate = useNavigate();
    const [showConsent, setShowConsent] = useState(false);
    const [pendingAction, setPendingAction] = useState<{ type: 'start' | 'resume', surveyId?: string } | null>(null);

    // Get current survey config to display correct scale
    const activeSurvey = AVAILABLE_SURVEYS.find(s => s.id === activeSurveyId);
    const scaleConfig = activeSurvey?.scaleConfig;

    const min = scaleConfig?.min ?? 1;
    const max = scaleConfig?.max ?? 5;
    const scaleNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);

    const checkConsentAndProceed = (action: 'start' | 'resume', surveyId?: string) => {
        const hasConsented = localStorage.getItem('aphantasia_consent_accepted') === 'true';
        if (hasConsented) {
            if (action === 'start') onStartSurvey(surveyId);
            else onTriggerFileUpload();
        } else {
            setPendingAction({ type: action, surveyId });
            setShowConsent(true);
        }
    };

    const handleConsentAccept = () => {
        localStorage.setItem('aphantasia_consent_accepted', 'true');
        setShowConsent(false);
        if (pendingAction?.type === 'start') onStartSurvey(pendingAction.surveyId);
        else if (pendingAction?.type === 'resume') onTriggerFileUpload();
        setPendingAction(null);
    };

    return (
        <div className="animate-fade-in text-left">
            <ConsentModal
                isOpen={showConsent}
                onClose={() => setShowConsent(false)}
                onAccept={handleConsentAccept}
                ui={ui}
            />

            {/* Editorial Hero Section */}
            <div className="mb-12 md:mb-16 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-bg text-stone-500 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-6 border border-stone-line backdrop-blur-sm">
                    <Sparkles className="w-3 h-3 text-brand-clay" />
                    Cognitive Assessment
                </div>
                <h1 className="text-4xl md:text-6xl font-serif font-bold text-brand-graphite leading-[1.1] mb-6 tracking-tight">
                    Discover the unique architecture <br className="hidden md:block" /> of your imagination.
                </h1>
                <p className="text-lg md:text-xl text-stone-500 leading-relaxed max-w-2xl font-sans">
                    A scientifically grounded exploration of your cognitive profile. Get a personal mind map and AI recommendations.
                </p>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Test Selection */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">Select Exploration Format</h2>

                    <div className="flex flex-col gap-5">
                        {AVAILABLE_SURVEYS.filter(s => !s.parentId).map(survey => {
                            const progress = surveyProgress[survey.id] || { answered: 0, total: 0, percent: 0 };
                            const isActive = activeSurveyId === survey.id;
                            const hasAllAnswers = progress.percent === 100;
                            const hasRecommendation = !!backendRecommendations[survey.id];
                            const isCompleted = hasAllAnswers && hasRecommendation;

                            // Find children for this survey
                            const children = AVAILABLE_SURVEYS.filter(s => s.parentId === survey.id);

                            return (
                                <React.Fragment key={survey.id}>
                                    <div className="relative group">
                                        {isActive && !isCompleted && (
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-brand-ink to-brand-ink/40 rounded-2xl blur opacity-20 transition duration-500"></div>
                                        )}
                                        <div
                                            onClick={() => !survey.disabled && onSetActiveSurveyId(survey.id)}
                                            className={`relative bg-brand-paper-accent border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:shadow-md transition-all cursor-pointer ${isActive ? 'border-brand-ink/30 ring-1 ring-brand-ink/10' : 'border-stone-line hover:border-stone-line/80'
                                                } ${survey.disabled ? 'opacity-40 grayscale cursor-not-allowed border-dashed' : ''}`}
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    {survey.id === 'express_demo' ? <Zap className="w-5 h-5 text-brand-clay" /> : <BrainCircuit className="w-5 h-5 text-brand-ink" />}
                                                    <h3 className={`text-xl font-bold font-serif ${isActive ? 'text-brand-ink' : 'text-brand-graphite'}`}>
                                                        {survey.title[language]}
                                                    </h3>
                                                    {isCompleted ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-sage/10 text-brand-sage text-[9px] font-bold uppercase tracking-wider rounded-full border border-brand-sage/20">
                                                            {hasRecommendation ? 'Completed' : 'Ready for Analysis'} <CheckCircle className="w-3 h-3" />
                                                        </span>
                                                    ) : survey.disabled ? (
                                                        <span className="text-[9px] font-bold text-stone-400 bg-stone-bg px-2 py-0.5 rounded uppercase tracking-wider">Soon</span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold text-stone-400 bg-stone-bg px-2 py-0.5 rounded border border-stone-line uppercase tracking-wider">
                                                            {survey.id === 'express_demo' ? '2 min' : '15 min'}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-stone-500 pr-4 leading-relaxed">
                                                    {survey.description?.[language]}
                                                </p>

                                                {progress.percent > 0 && (
                                                    <div className="mt-4 flex gap-1 w-full max-w-xs">
                                                        {Array.from({ length: 10 }).map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${i < (progress.percent / 10) ? 'bg-brand-sage' : 'bg-stone-100'
                                                                    }`}
                                                            ></div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                             {!hasAllAnswers ? (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); checkConsentAndProceed('start', survey.id); }}
                                                    className={`shrink-0 h-10 px-6 ${isActive ? 'bg-brand-ink text-white shadow-soft' : 'bg-stone-bg text-brand-graphite'} rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2`}
                                                >
                                                    {isActive ? ui.start : 'Start'} <ChevronRight className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {!hasRecommendation && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); checkConsentAndProceed('start', survey.id); }}
                                                            className="h-10 px-4 bg-stone-bg text-brand-graphite rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-all flex items-center justify-center gap-2"
                                                            title="Edit Answers"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); onShowResults?.(survey.id); }}
                                                        className="h-10 px-6 bg-brand-ink text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:shadow-soft transition-all flex items-center justify-center gap-2"
                                                    >
                                                        {hasRecommendation ? ui.viewResults || 'View Results' : 'Analyze'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Children (Sub-tests) nested list */}
                                    {children.length > 0 && (
                                        <div className={`pl-6 border-l w-[calc(100%-1.5rem)] ml-6 flex flex-col gap-3 py-1 relative z-0 -mt-2 transition-colors ${isActive ? 'border-brand-ink/20' : 'border-stone-line'}`}>
                                            {children.map(child => {
                                                const childProgress = surveyProgress[child.id] || { answered: 0, total: 0, percent: 0 };
                                                const isChildCompleted = childProgress.percent === 100;
                                                return (
                                                    <div
                                                        key={child.id}
                                                        className="bg-brand-paper-accent/60 border border-stone-line rounded-xl p-4 shadow-sm flex items-center justify-between group relative select-none"
                                                    >
                                                        <div className="absolute -left-6 top-1/2 w-6 h-px bg-stone-line"></div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-brand-graphite">{child.title[language].replace('↳ ', '')}</h4>
                                                            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">{ui.navTests} Section</p>
                                                        </div>
                                                        <div className="flex items-center gap-4">
                                                            {isChildCompleted ? (
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-brand-sage">Completed</span>
                                                            ) : childProgress.answered > 0 ? (
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">{childProgress.answered} / {childProgress.total}</span>
                                                            ) : null}
                                                            <div className="w-7 h-7 rounded-full bg-stone-bg/30 flex items-center justify-center border border-stone-line text-stone-300">
                                                                <ChevronRight className="w-3 h-3" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}

                        <div className="flex gap-4 mt-2">
                            <button
                                onClick={() => checkConsentAndProceed('resume')}
                                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-stone-400 hover:text-brand-ink transition-colors pl-1"
                            >
                                <Upload className="w-3 h-3" />
                                {ui.resume}
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept=".json,.toon" onChange={onFileUpload} />
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-4">
                    <div className="bg-brand-paper-accent border border-stone-line rounded-[2rem] p-6 shadow-card sticky top-24 transition-colors">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-8 h-8 rounded-full bg-stone-bg flex items-center justify-center border border-stone-line">
                                <BarChart3 className="w-4 h-4 text-brand-ink" />
                            </div>
                            <h3 className="font-serif text-lg font-bold text-brand-graphite tracking-tight">Why explore your profile?</h3>
                        </div>

                        <div className="space-y-6 mb-8">
                            <InfoItem
                                letter="A"
                                color="bg-brand-ink/5 text-brand-ink"
                                title={ui.marketingPoint1Title}
                                desc={ui.marketingPoint1Desc}
                            />
                            <InfoItem
                                letter="C"
                                color="bg-brand-sage/5 text-brand-sage"
                                title={ui.marketingPoint2Title}
                                desc={ui.marketingPoint2Desc}
                            />
                            <InfoItem
                                letter="M"
                                color="bg-brand-clay/5 text-brand-clay"
                                title={ui.marketingPoint3Title}
                                desc={ui.marketingPoint3Desc}
                            />
                        </div>

                        <hr className="mb-8 border-stone-line/50" />

                        <div>
                            <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-300 mb-4">{ui.howToRateTitle}</h4>
                            <div className="space-y-3 font-sans text-[11px]">
                                {scaleNumbers.filter(n => [1, 3, 5].includes(n)).map(num => (
                                    <div key={num} className="flex items-center justify-between p-3 rounded-xl bg-stone-bg/30 border border-stone-line hover:bg-stone-bg/50 transition-colors overflow-hidden group/item">
                                        <span
                                            className={`font-bold truncate max-w-[140px] ${num === 1 ? 'text-brand-ink' : num === 5 ? 'text-brand-clay' : 'text-stone-600'}`}
                                            title={scaleConfig?.labels[num]?.[language] || ''}
                                        >
                                            {num}: {scaleConfig?.labels[num]?.[language] || ''}
                                        </span>
                                        <span className="text-stone-300 uppercase text-[8px] font-bold tracking-widest shrink-0 ml-2 group-hover/item:text-stone-400 transition-colors">
                                            {num === 1 ? 'Aphantasia' : num === 5 ? 'Hyperphantasia' : 'Vague'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Disclaimer and Contact info at the bottom */}
            <div className="mt-16 pt-8 border-t border-stone-line grid grid-cols-1 md:grid-cols-3 gap-8 text-[10px] sm:text-[11px]">
                <div>
                    <h5 className="font-bold text-brand-clay uppercase tracking-[0.2em] mb-4 text-[9px]">{ui.disclaimerTitle}</h5>
                    <p className="text-stone-500 leading-relaxed font-sans">{ui.disclaimer}</p>
                </div>
                <div>
                    <h5 className="font-bold text-brand-graphite uppercase tracking-[0.2em] mb-4 text-[9px]">{ui.gdprTitle}</h5>
                    <p className="text-stone-500 leading-relaxed font-sans mb-3">{ui.gdprText}</p>
                    <a 
                        href="/privacy" 
                        onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}
                        className="text-brand-ink hover:underline font-bold uppercase tracking-widest text-[9px] flex items-center gap-1"
                    >
                        {ui.privacyPolicy} <ChevronRight className="w-3 h-3" />
                    </a>
                </div>
                <div>
                    <h5 className="font-bold text-brand-graphite uppercase tracking-[0.2em] mb-4 text-[9px]">{ui.contactTitle}</h5>
                    <div className="flex flex-col gap-2 font-bold">
                        <a href="mailto:ingvar.soloma@gmail.com" className="text-brand-ink hover:text-brand-clay transition-colors">ingvar.soloma@gmail.com</a>
                        <a href="https://t.me/ingvar_soloma" target="_blank" rel="noopener noreferrer" className="text-brand-ink hover:text-brand-clay transition-colors flex items-center gap-1">
                            Telegram: @ingvar_soloma
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoItem: React.FC<{ letter: string, color: string, title: string, desc: string }> = ({ letter, color, title, desc }) => (
    <div className="flex items-start gap-4 group">
        <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center font-serif font-bold text-sm shadow-sm transition-transform group-hover:scale-105 ${color}`}>
            {letter}
        </div>
        <div>
            <h4 className="text-sm font-bold text-brand-graphite mb-1.5 leading-tight">{title}</h4>
            <p className="text-xs text-stone-500 leading-relaxed">{desc}</p>
        </div>
    </div>
);

