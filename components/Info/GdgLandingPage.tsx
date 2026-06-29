import React, { useState } from 'react';
import { Zap, Sparkles, Brain, CheckCircle, Gift, ArrowRight, Code, Calendar, MapPin, Users, Award, ShieldAlert } from 'lucide-react';
import { UIStrings, Language, User } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';
import { ProfileService } from '@/services/ProfileService';
import toast from 'react-hot-toast';

interface GdgLandingPageProps {
    ui: UIStrings;
    language: Language;
    user: User | null;
    onStartSurvey: () => void;
}

export const GdgLandingPage: React.FC<GdgLandingPageProps> = ({ ui, language, user, onStartSurvey }) => {
    const navigate = useNavigate();
    const [promoCode, setPromoCode] = useState('WROC_AI_HACK');
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [redeemSuccess, setRedeemSuccess] = useState(false);

    useSeoMetadata({
        title: 'GDG Build with AI Wrocław - Hackathon Cognitive & SDLC Assessment',
        description: 'Prepare for GDG Build with AI Wrocław. Use WROC_AI_HACK to claim 500 free credits and map your cognitive profile for the hackathon.',
        canonical: '/gdg'
    });

    const handleRedeem = async () => {
        if (!user) {
            toast.error(language === 'uk' ? 'Будь ласка, спочатку авторизуйтеся в системі.' : 'Please log in first.');
            return;
        }

        setIsRedeeming(true);
        try {
            const res = await ProfileService.redeemPromoCode(promoCode);
            if (res && res.status === 'success') {
                setRedeemSuccess(true);
                toast.success(language === 'uk' ? 'Промокод успішно активовано! 500 кредитів додано.' : 'Promo code redeemed! 500 credits added.');
                user.credits = res.credits;
                globalThis.dispatchEvent(new CustomEvent('auth-login', { detail: user }));
            } else {
                toast.error(res?.detail || (language === 'uk' ? 'Недійсний промокод або вже активований.' : 'Invalid or already redeemed promo code.'));
            }
        } catch (e) {
            toast.error(language === 'uk' ? 'Помилка мережі.' : 'Network error.');
        } finally {
            setIsRedeeming(false);
        }
    };

    const handleStartTest = () => {
        navigate('/survey/full_aphantasia_profile');
    };

    const isUk = language === 'uk';
    const isRu = language === 'ru';

    return (
        <div className="min-h-screen text-foreground selection:bg-brand-ink/30 overflow-hidden font-sans bg-brand-bg pb-24">
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-ink/20 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-clay/10 rounded-full blur-[140px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 text-center space-y-12">
                {/* Event Badge */}
                <div className="inline-flex flex-col md:flex-row items-center gap-3 md:gap-6 px-6 py-3 bg-brand-bgCard border border-stone-line rounded-full shadow-soft mx-auto text-left">
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-brand-ink">
                        <Code className="w-4 h-4" />
                        GDG Wrocław Presents
                    </div>
                    <div className="hidden md:block w-px h-4 bg-stone-line" />
                    <span className="text-xs text-stone-500 font-bold">Build with AI Wrocław: Architecting the Future of Products</span>
                </div>

                {/* Hero section */}
                <div className="space-y-6 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-7xl font-serif font-black tracking-tight leading-none text-brand-textPrimary">
                        {isUk ? 'Підготуйте свій мозок до хакатону' : isRu ? 'Подготовьте свой мозг к хакатону' : 'Architect Your Hackathon Brain'}
                    </h1>
                    <p className="text-stone-500 text-lg md:text-xl font-medium leading-relaxed max-w-3xl mx-auto">
                        {isUk 
                            ? 'Спеціальний когнітивний асесмент для учасників Build with AI Wrocław. Дізнайтеся, як ваша уява, просторове моделювання та структура пам’яті впливають на роботу в команді при створенні AI-продуктів.'
                            : 'Special cognitive assessment for Build with AI Wrocław participants. Discover how your visual rendering, spatial intelligence, and memory style impact team collaboration during the product creation lifecycle.'
                        }
                    </p>
                </div>

                {/* Event Info Card */}
                <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
                    <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex items-start gap-4">
                        <Calendar className="w-8 h-8 text-brand-ink shrink-0" />
                        <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">When</h4>
                            <p className="text-sm font-bold text-brand-textPrimary mt-1">June 29 – July 4, 2026</p>
                            <p className="text-xs text-stone-500">4:00 PM – 8:00 PM (CEST)</p>
                        </div>
                    </div>
                    <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex items-start gap-4">
                        <MapPin className="w-8 h-8 text-brand-ink shrink-0" />
                        <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">Where</h4>
                            <p className="text-sm font-bold text-brand-textPrimary mt-1">Uniwersytet Ekonomiczny</p>
                            <p className="text-xs text-stone-500">Wrocław, Komandorska 118/120</p>
                        </div>
                    </div>
                    <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex items-start gap-4">
                        <Users className="w-8 h-8 text-brand-ink shrink-0" />
                        <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">Collaborative SDLC</h4>
                            <p className="text-sm font-bold text-brand-textPrimary mt-1">6-Day AI Journey</p>
                            <p className="text-xs text-stone-500">UX Designers + Devs + DevOps</p>
                        </div>
                    </div>
                </div>

                {/* Promo Code Box */}
                <div className="max-w-xl mx-auto p-8 bg-brand-bgCard border border-stone-line rounded-[2.5rem] shadow-soft space-y-6 relative">
                    <div className="absolute top-[-15px] left-1/2 -translate-x-1/2 bg-brand-ink text-white text-[10px] font-black tracking-widest uppercase px-4 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                        <Gift className="w-3.5 h-3.5" />
                        PROMO WROC_AI_HACK
                    </div>

                    <h3 className="font-serif font-bold text-xl text-brand-textPrimary pt-2">
                        {isUk ? 'Отримайте 500 безкоштовних кредитів' : 'Claim 500 Free Credits'}
                    </h3>
                    <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                        {isUk 
                            ? 'Використовуйте ексклюзивний промокод хакатону, щоб зняти ліміти на генерацію детальних рекомендацій щодо архітектури продукту та стилю підготовки.'
                            : 'Enter the official WROC_AI_HACK promo code below to unlock unlimited AI recommendation streaming and advanced diagnostic templates for your team.'
                        }
                    </p>

                    {!user ? (
                        <div className="p-4 bg-brand-clay/5 border border-brand-clay/20 text-brand-clay text-xs font-bold uppercase tracking-widest rounded-2xl animate-pulse">
                            {isUk ? 'Будь ласка, авторизуйтеся, щоб активувати промокод' : 'Please log in to redeem promo code'}
                        </div>
                    ) : redeemSuccess ? (
                        <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl text-xs font-bold text-green-600 flex items-center justify-center gap-2 uppercase tracking-wider">
                            <CheckCircle className="w-4 h-4" />
                            {isUk ? 'Промокод активовано!' : 'Promo Code Applied!'}
                        </div>
                    ) : (
                        <div className="flex gap-3 max-w-sm mx-auto">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                placeholder="PROMOCODE"
                                className="flex-1 px-4 py-3 bg-brand-bg border border-stone-line rounded-xl text-center font-bold tracking-widest text-brand-textPrimary focus:outline-none focus:border-brand-ink uppercase text-sm"
                            />
                            <button
                                disabled={isRedeeming}
                                onClick={handleRedeem}
                                className="px-6 py-3 bg-brand-ink text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:shadow-md transition-all shrink-0 flex items-center justify-center"
                            >
                                {isRedeeming ? (
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                ) : (isUk ? 'Активувати' : 'Redeem')}
                            </button>
                        </div>
                    )}
                </div>

                {/* SDLC Days Grid */}
                <div className="space-y-6 text-left max-w-4xl mx-auto">
                    <h3 className="text-2xl font-serif font-black text-brand-textPrimary flex items-center gap-2 border-b border-stone-line pb-2">
                        <Award className="w-6 h-6 text-brand-ink" />
                        {isUk ? 'Як тест допомагає у розрізі програми хакатону' : 'Aligning Cognition with the 6-Day Program'}
                    </h3>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-brand-bgCard/40 border border-stone-line rounded-3xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-brand-ink">Day 1 & 2 · Design & UX</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-clay/10 text-brand-clay rounded">Design Thinking</span>
                            </div>
                            <h4 className="font-serif font-bold text-brand-textPrimary">Product Design, Persona & UI Systems</h4>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                {isUk 
                                    ? 'Дізнайтеся глибину вашої візуалізації (Aphantasia/Hyperphantasia). Це допоможе розділити ролі: хто краще генерує інтерфейсні деталі в Figma, а хто структурує потік завдань.'
                                    : 'Understand your visualization scale (Aphantasia vs. Hyperphantasia). Helps delegate who compiles high-fidelity Figma styles and who outlines logical system scopes.'
                                }
                            </p>
                        </div>

                        <div className="p-6 bg-brand-bgCard/40 border border-stone-line rounded-3xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-brand-ink">Day 3 & 4 · Scale & Backend</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-ink/10 text-brand-ink rounded">Nx + NestJS + DBs</span>
                            </div>
                            <h4 className="font-serif font-bold text-brand-textPrimary">State, Reactivity & Data Architectures</h4>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                {isUk 
                                    ? 'Виміряйте свій рівень просторового інтелекту (Spatial Intelligence). Розробники з високим просторовим мисленням легко керують складними реактивними сигналами, монорепозиторіями Nx та зв’язками SQL.'
                                    : 'Measure your Spatial Intelligence. High-spatial builders intuitively navigate Nx dependency graphs, complex state management, and relational database schemas.'
                                }
                            </p>
                        </div>

                        <div className="p-6 bg-brand-bgCard/40 border border-stone-line rounded-3xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-brand-ink">Day 5 · MCP & CONTRACTIONS</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-green-500/10 text-green-600 rounded">AI Agents & TRIZ</span>
                            </div>
                            <h4 className="font-serif font-bold text-brand-textPrimary">Technical Contradictions & Custom MCP Servers</h4>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                {isUk 
                                    ? 'Оцініть свій внутрішній діалог. Невербальні розробники працюють за принципом абстрактних зв’язків, тоді як вербальні легше пишуть точні системні інструкції та правила для AI-агентів.'
                                    : 'Evaluate your internal monologue. Tells you if you formulate prompts and code rules conceptually or structurally, optimizing prompt and context engineering.'
                                }
                            </p>
                        </div>

                        <div className="p-6 bg-brand-bgCard/40 border border-stone-line rounded-3xl space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-black uppercase text-brand-ink">Day 6 · The Grand Hackathon</span>
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-600 rounded">Final Battle</span>
                            </div>
                            <h4 className="font-serif font-bold text-brand-textPrimary">Maximum Synergy Prototype Launch</h4>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                {isUk 
                                    ? 'Використовуйте згенерований звіт для визначення своєї ролі по Белбіну (Plant, Monitor Evaluator, Resource Investigator). Це запобігає конфліктам у команді під час 24-годинного спринту.'
                                    : 'Leverage your generated Belbin team role from our report. Ensures team chemistry and fast delegation during the high-stress, 24-hour sprint.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Ultimate Call to Action */}
                <div className="bg-gradient-to-br from-[#1a73e8] to-[#1253a8] text-white rounded-[3rem] p-10 md:p-16 text-center space-y-8 relative overflow-hidden group shadow-[0_32px_64px_-16px_rgba(26,115,232,0.35)] max-w-4xl mx-auto">
                    <div className="absolute top-0 right-0 p-8">
                        <Zap className="w-16 h-16 text-white/10 rotate-12" />
                    </div>
                    <div className="absolute bottom-0 left-0 p-8">
                        <Brain className="w-24 h-24 text-white/5 -rotate-12" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <h3 className="text-3xl md:text-5xl font-serif font-black tracking-tight leading-tight text-white">
                            {isUk ? 'Пройти повний когнітивний тест' : 'Take the Full Cognitive Assessment'}
                        </h3>
                        <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto font-medium">
                            {isUk
                                ? 'Когнітивний тест займе до 15 хвилин. Ви отримаєте інтерактивний радар-графік та детальний AI-звіт підготовки до хакатону.'
                                : 'Takes about 15 minutes. Instantly generates your interactive 8-axis radar chart and custom hackathon preparation recommendation playbook.'
                            }
                        </p>
                    </div>

                    <div className="relative z-10 flex justify-center">
                        <button
                            onClick={handleStartTest}
                            className="inline-flex items-center gap-4 px-10 py-5 bg-white text-[#1a73e8] rounded-[2rem] font-bold text-base hover:scale-105 transition-all shadow-xl group/btn"
                        >
                            {isUk ? 'Почати тестування' : 'Start Assessment'}
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
