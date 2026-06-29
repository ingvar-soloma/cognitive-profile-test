import React, { useState } from 'react';
import { Zap, Sparkles, Brain, CheckCircle, Gift, ArrowRight, Code } from 'lucide-react';
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
        title: 'GDG Hackathon - Cognitive Profile & AI Copilot',
        description: 'Special hackathon landing page. Determine your cognitive profile and prepare for the GDG WROC Hackathon.',
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
                // Update local user credits
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

    const t = {
        en: {
            sub: 'GDG WROC Hackathon Edition',
            title: 'Optimize Your Hackathon Brain',
            desc: 'Every developer builds software differently. Discover your cognitive style, visual imagination depth, and memory architecture to divide tasks perfectly and build faster during WROC_AI_HACK.',
            promoTitle: 'Participant Special Offer',
            promoDesc: 'Enter the official hackathon promo code below to claim 500 free credits. This allows you to generate deep AI analysis and recommendations for your team.',
            loginCta: 'Log in to Redeem Promo',
            redeemed: 'Promo Code Applied!',
            redeemBtn: 'Redeem Code',
            testCta: 'Start Cognitive Assessment',
            techFocus: 'Scientific framework built for high-performance engineers'
        },
        uk: {
            sub: 'GDG WROC Hackathon Спецвипуск',
            title: 'Оптимізуйте роботу мозку на хакатоні',
            desc: 'Кожен розробник створює ПЗ по-своєму. Дізнайтеся свій когнітивний стиль, глибину візуальної уяви та архітектуру пам’яті, щоб ідеально розподілити завдання та кодити швидше під час WROC_AI_HACK.',
            promoTitle: 'Спеціальна пропозиція для учасників',
            promoDesc: 'Введіть промокод хакатону нижче, щоб отримати 500 безкоштовних кредитів. Це дозволить вам створити детальний аналіз штучного інтелекту та отримати персоналізовані рекомендації для вашої команди.',
            loginCta: 'Авторизуйтеся для активації промокоду',
            redeemed: 'Промокод успішно застосовано!',
            redeemBtn: 'Активувати код',
            testCta: 'Почати когнітивний тест',
            techFocus: 'Наукова модель, створена для високопродуктивних розробників'
        },
        ru: {
            sub: 'GDG WROC Hackathon Спецвыпуск',
            title: 'Оптимизируйте работу мозга на хакатоне',
            desc: 'Каждый разработчик создает ПО по-своему. Узнайте свой когнитивный стиль, глубину визуального воображения и архитектуру памяти, чтобы идеально распределить задачи и кодить быстрее во время WROC_AI_HACK.',
            promoTitle: 'Специальное предложение для участников',
            promoDesc: 'Введите промокод хакатона ниже, чтобы получить 500 бесплатных кредитов. Это позволит вам создать детальный анализ искусственного интеллекта и получить персональные рекомендации для вашей команды.',
            loginCta: 'Авторизуйтесь для активации промокода',
            redeemed: 'Промокод успешно применен!',
            redeemBtn: 'Активировать код',
            testCta: 'Начать когнитивный тест',
            techFocus: 'Научная модель, созданная для высокопроизводительных разработчиков'
        }
    }[language] || {
        en: {
            sub: 'GDG WROC Hackathon Edition',
            title: 'Optimize Your Hackathon Brain',
            desc: 'Every developer builds software differently. Discover your cognitive style, visual imagination depth, and memory architecture to divide tasks perfectly and build faster during WROC_AI_HACK.',
            promoTitle: 'Participant Special Offer',
            promoDesc: 'Enter the official hackathon promo code below to claim 500 free credits. This allows you to generate deep AI analysis and recommendations for your team.',
            loginCta: 'Log in to Redeem Promo',
            redeemed: 'Promo Code Applied!',
            redeemBtn: 'Redeem Code',
            testCta: 'Start Cognitive Assessment',
            techFocus: 'Scientific framework built for high-performance engineers'
        }
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-indigo-500/30 overflow-hidden font-sans">
            {/* Background glowing blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-ink/30 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-clay/20 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-20 pb-32 text-center">
                {/* Header/Intro Block */}
                <div className="space-y-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-ink/10 border border-brand-ink/20 rounded-full text-[10px] font-extrabold tracking-[0.2em] uppercase text-brand-ink shadow-sm mx-auto">
                        <Code className="w-3.5 h-3.5" />
                        {t.sub}
                    </div>

                    <h1 className="text-4xl md:text-7xl font-serif font-black tracking-tight leading-none text-brand-textPrimary">
                        {t.title}
                    </h1>

                    <p className="text-stone-500 text-lg md:text-xl font-medium max-w-3xl mx-auto leading-relaxed">
                        {t.desc}
                    </p>

                    {/* Promo Code Box */}
                    <div className="max-w-xl mx-auto p-8 bg-brand-bgCard/40 backdrop-blur-md border border-stone-line rounded-[2.5rem] shadow-soft space-y-6">
                        <div className="flex items-center gap-3 justify-center text-brand-ink">
                            <Gift className="w-6 h-6 animate-bounce" />
                            <h3 className="font-serif font-bold text-lg text-brand-textPrimary">{t.promoTitle}</h3>
                        </div>
                        <p className="text-xs text-stone-500 max-w-md mx-auto">{t.promoDesc}</p>

                        {!user ? (
                            <div className="bg-brand-clay/5 border border-brand-clay/20 p-4 rounded-2xl text-xs font-bold text-brand-clay uppercase tracking-wider animate-pulse">
                                {t.loginCta}
                            </div>
                        ) : redeemSuccess ? (
                            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl text-xs font-bold text-green-600 flex items-center justify-center gap-2 uppercase tracking-wider">
                                <CheckCircle className="w-4 h-4" />
                                {t.redeemed}
                            </div>
                        ) : (
                            <div className="flex gap-3 max-w-sm mx-auto">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    placeholder="PROMOCODE"
                                    className="flex-1 px-4 py-3 bg-brand-bgCard border border-stone-line rounded-xl text-center font-bold tracking-widest text-brand-textPrimary focus:outline-none focus:border-brand-ink uppercase text-sm"
                                />
                                <button
                                    disabled={isRedeeming}
                                    onClick={handleRedeem}
                                    className="px-6 py-3 bg-brand-ink text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:shadow-md transition-all shrink-0 flex items-center justify-center"
                                >
                                    {isRedeeming ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : t.redeemBtn}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Hackathon Readiness CTA */}
                <div className="bg-gradient-to-br from-brand-ink to-[#4A3B6D] text-white rounded-[3rem] p-10 md:p-16 text-center space-y-8 relative overflow-hidden group shadow-soft mb-20">
                    <div className="absolute top-0 right-0 p-8">
                        <Zap className="w-16 h-16 text-white/10 rotate-12" />
                    </div>
                    <div className="absolute bottom-0 left-0 p-8">
                        <Brain className="w-24 h-24 text-white/5 -rotate-12" />
                    </div>

                    <div className="relative z-10 space-y-4">
                        <h3 className="text-3xl md:text-5xl font-serif font-black tracking-tight leading-tight text-white">
                            Ready to Decode Your Cognition?
                        </h3>
                        <p className="text-brand-paper/80 text-base md:text-lg max-w-2xl mx-auto">
                            Takes 15 minutes. Analyzes sensory detail level, inner voice presence, mapping capabilities, and logical architecture.
                        </p>
                    </div>

                    <div className="relative z-10 flex justify-center">
                        <button
                            onClick={handleStartTest}
                            className="inline-flex items-center gap-4 px-10 py-5 bg-white text-brand-ink rounded-[2rem] font-bold text-base hover:scale-105 transition-all shadow-xl group/btn"
                        >
                            {t.testCta}
                            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Concept breakdown */}
                <div className="grid md:grid-cols-3 gap-8 text-left">
                    {[
                        {
                            title: '1. Visual Rendering',
                            desc: 'How vividly do you compile designs? Hypophantasic developers are great with clean abstract architecture, while hyperphantasic developers simulate UI mockups instantly.'
                        },
                        {
                            title: '2. Spatial Mapping',
                            desc: 'How easily do you trace class hierarchies, network packages, or asynchronous data streams? High spatial profiles excel in system architecture and state management.'
                        },
                        {
                            title: '3. Inner Monologue',
                            desc: 'Do you talk code to yourself? Developers with a strong inner voice parse logical flows textually, whereas non-verbal thinkers work with schematic links.'
                        }
                    ].map((item, i) => (
                        <div key={i} className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-[2rem] shadow-sm">
                            <h4 className="font-serif font-bold text-lg text-brand-textPrimary mb-3">{item.title}</h4>
                            <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                    {t.techFocus}
                </div>
            </div>
        </div>
    );
};
