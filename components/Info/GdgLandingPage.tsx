import React, { useState } from 'react';
import { 
    Zap, 
    Sparkles, 
    Brain, 
    CheckCircle, 
    Gift, 
    ArrowRight, 
    Code, 
    Calendar, 
    MapPin, 
    Users, 
    Award, 
    Layers, 
    Terminal, 
    Cloud, 
    Monitor, 
    Cpu, 
    Compass
} from 'lucide-react';
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
        title: 'Build with AI Wrocław - GDG Wrocław Marathon & Assessment',
        description: 'Join the 6-day GDG Wrocław marathon. Map your cognitive profile using WROC_AI_HACK for 500 free credits and build the future of AI-native products.',
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

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-16 space-y-16">
                {/* Header Badge */}
                <div className="flex justify-center">
                    <div className="inline-flex flex-col md:flex-row items-center gap-2 md:gap-4 px-5 py-2 bg-brand-bgCard/80 border border-stone-line rounded-full shadow-sm text-center md:text-left backdrop-blur-md">
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-brand-ink">
                            <Code className="w-3.5 h-3.5" />
                            GDG Wrocław
                        </div>
                        <div className="hidden md:block w-px h-3 bg-stone-line" />
                        <span className="text-xs text-stone-500 font-semibold">Build with AI Wrocław</span>
                    </div>
                </div>

                {/* Hero section */}
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-black tracking-tight leading-none text-brand-textPrimary">
                        🚀 Build with AI Wrocław
                        <span className="block text-2xl md:text-4xl lg:text-5xl mt-4 font-sans font-bold text-stone-500">
                            Architecting the Future of Products
                        </span>
                    </h1>
                    <p className="text-stone-700 text-lg md:text-xl font-bold max-w-3xl mx-auto pt-4 leading-relaxed border-t border-dashed border-stone-line">
                        {isUk 
                            ? 'Епоха фраз "це не моя робота" закінчилася.'
                            : 'The era of "that\'s not my job" is officially over.'
                        }
                    </p>
                    <p className="text-stone-500 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                        {isUk 
                            ? 'Ласкаво просимо на "Build with AI Wrocław" — інтенсивний 6-денний марафон від GDG Wrocław, розроблений для того, щоб перетворити UI/UX дизайнерів, розробників та DevOps-інженерів на крос-функціональних творців продуктів (Product Creators). Ми використовуємо штучний інтелект як міст, що об\'єднує весь цикл розробки програмного забезпечення (SDLC).'
                            : 'Welcome to "Build with AI Wrocław" – an intensive 6-day marathon by GDG Wrocław designed to transform UI/UX designers, developers, and DevOps engineers into cross-functional Product Creators. We leverage AI as a bridge connecting the entire Software Development Life Cycle (SDLC).'
                        }
                    </p>
                </div>

                {/* Event Info Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex items-start gap-4 backdrop-blur-sm hover:border-brand-ink/30 transition-all duration-300">
                        <MapPin className="w-8 h-8 text-brand-ink shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">
                                {isUk ? 'Локація' : 'Location'}
                            </h4>
                            <p className="text-sm font-bold text-brand-textPrimary mt-1">Uniwersytet Ekonomiczny</p>
                            <p className="text-xs text-stone-500">we Wrocławiu (Komandorska 118/120)</p>
                        </div>
                    </div>
                    <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex items-start gap-4 backdrop-blur-sm hover:border-brand-ink/30 transition-all duration-300">
                        <Calendar className="w-8 h-8 text-brand-ink shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">
                                {isUk ? 'Дати заходу' : 'Dates'}
                            </h4>
                            <p className="text-sm font-bold text-brand-textPrimary mt-1">
                                {isUk ? '29 червня – 4 липня 2026' : 'June 29 – July 4, 2026'}
                            </p>
                            <p className="text-xs text-stone-500">{isUk ? '6-денний інтенсивний марафон' : '6-day intensive marathon'}</p>
                        </div>
                    </div>
                    <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex items-start gap-4 backdrop-blur-sm hover:border-brand-ink/30 transition-all duration-300 md:col-span-2 lg:col-span-1">
                        <Users className="w-8 h-8 text-brand-ink shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-400">
                                {isUk ? 'Формат' : 'Format'}
                            </h4>
                            <p className="text-sm font-bold text-brand-textPrimary mt-1">Product Creators Synergy</p>
                            <p className="text-xs text-stone-500">{isUk ? 'Марафон + Фінальний Хакатон' : 'Marathon + Grand Hackathon'}</p>
                        </div>
                    </div>
                </div>

                {/* Target Audience ("Для кого ця подія?") */}
                <div className="space-y-6 max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-textPrimary border-b border-stone-line pb-3 flex items-center gap-2">
                        <Users className="w-6 h-6 text-brand-ink" />
                        {isUk ? '🎯 Для кого ця подія?' : '🎯 Who is this event for?'}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="p-6 bg-brand-bgCard/40 border border-stone-line rounded-3xl hover:shadow-soft transition-all duration-300 space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-brand-ink/10 flex items-center justify-center text-brand-ink">
                                <Monitor className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-brand-textPrimary">
                                {isUk ? 'UI/UX Дизайнери' : 'UI/UX Designers'}
                            </h3>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                {isUk 
                                    ? 'які хочуть навчитися генерувати дизайн-системи за допомогою ШІ та інтегрувати їх безпосередньо у Figma.'
                                    : 'who want to learn how to generate design systems using AI tools and automatically bridge them to Figma.'
                                }
                            </p>
                        </div>
                        <div className="p-6 bg-brand-bgCard/40 border border-stone-line rounded-3xl hover:shadow-soft transition-all duration-300 space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-brand-clay/10 flex items-center justify-center text-brand-clay">
                                <Terminal className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-brand-textPrimary">
                                {isUk ? 'Frontend- та Backend-розробники' : 'Frontend & Backend Developers'}
                            </h3>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                {isUk 
                                    ? 'готові будувати масштабовані архітектури (Angular, Nx, NestJS) та розробляти автономних ШІ-агентів.'
                                    : 'ready to build scalable architectures (Angular, Nx, NestJS) and engineer autonomous, multi-agent AI systems.'
                                }
                            </p>
                        </div>
                        <div className="p-6 bg-brand-bgCard/40 border border-stone-line rounded-3xl hover:shadow-soft transition-all duration-300 space-y-3">
                            <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-600">
                                <Cloud className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-brand-textPrimary">
                                {isUk ? 'DevOps та Cloud-інженери' : 'DevOps & Cloud Engineers'}
                            </h3>
                            <p className="text-xs text-stone-500 leading-relaxed">
                                {isUk 
                                    ? 'які прагнуть розгортати складні LLM-інфраструктури, Cloud Run, Cloud SQL та MCP-сервери в Google Cloud.'
                                    : 'striving to deploy complex LLM infrastructures, Cloud Run, Cloud SQL, and customize Model Context Protocol (MCP) servers.'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Marathon Schedule */}
                <div className="space-y-6 max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-textPrimary border-b border-stone-line pb-3 flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-brand-ink" />
                        {isUk ? '🗓️ Програма марафону: Повний цикл створення продукту' : '🗓️ Marathon Program: End-to-End Product Lifecycle'}
                    </h2>
                    
                    <div className="grid gap-6">
                        {/* Day 1 */}
                        <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex flex-col md:flex-row gap-4 items-start hover:border-brand-ink/30 transition-all">
                            <div className="px-4 py-2 bg-brand-ink text-white font-bold rounded-2xl text-xs uppercase tracking-widest shrink-0">
                                {isUk ? 'День 1 · 29.06' : 'Day 1 · 29.06'}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-brand-textPrimary text-lg">
                                    Product Design, Scope & MVP
                                </h3>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    {isUk 
                                        ? 'Перейдіть від порожнього аркуша до чітко окресленого MVP. Ви дізнаєтесь, як створювати персону користувача, формулювати Problem Statement та моделювати бізнес-процеси за допомогою Design Thinking, BPMN та Event Storming.'
                                        : 'Go from a blank slate to a clean MVP. Learn how to map user personas, formulate Problem Statements, and model business processes using Design Thinking, BPMN, and Event Storming.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Day 2 */}
                        <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex flex-col md:flex-row gap-4 items-start hover:border-brand-ink/30 transition-all">
                            <div className="px-4 py-2 bg-brand-clay text-white font-bold rounded-2xl text-xs uppercase tracking-widest shrink-0">
                                {isUk ? 'День 2 · 30.06' : 'Day 2 · 30.06'}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-brand-textPrimary text-lg">
                                    UI/UX & AI-Native Design Systems
                                </h3>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    {isUk 
                                        ? 'Перетворіть продуктові ідеї на інклюзивні інтерфейси. Ви навчитеся основам цифрової доступності та зможете генерувати повноцінні дизайн-системи з нуля за допомогою ШІ (наприклад, інструменту Antigravity), автоматично переносячи їх у Figma.'
                                        : 'Translate product concepts into inclusive layouts. Discover digital accessibility principles and generate full design systems from scratch with AI models, directly bridged to Figma.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Day 3 */}
                        <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex flex-col md:flex-row gap-4 items-start hover:border-brand-ink/30 transition-all">
                            <div className="px-4 py-2 bg-stone-700 text-white font-bold rounded-2xl text-xs uppercase tracking-widest shrink-0">
                                {isUk ? 'День 3 · 01.07' : 'Day 3 · 01.07'}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-brand-textPrimary text-lg">
                                    Scaling Frontend Architecture & AI-Assisted Debugging
                                </h3>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    {isUk 
                                        ? 'Опануйте масштабування за допомогою Nx monorepo та сучасної реактивної архітектури Angular. Ви також навчитесь використовувати AI-агентів (Chrome DevTools MCP), щоб миттєво діагностувати та виправляти баги.'
                                        : 'Master system scaling using an Nx monorepo and reactive Angular architectures. Learn to deploy AI agents (Chrome DevTools MCP) to diagnose and resolve bugs instantly.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Day 4 */}
                        <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex flex-col md:flex-row gap-4 items-start hover:border-brand-ink/30 transition-all">
                            <div className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-2xl text-xs uppercase tracking-widest shrink-0">
                                {isUk ? 'День 4 · 02.07' : 'Day 4 · 02.07'}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-brand-textPrimary text-lg">
                                    Fullstack, Architecture & LLM Engineering
                                </h3>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    {isUk 
                                        ? 'З\'єднайте ваш Angular-фронтенд з кастомним бекендом на NestJS та базою даних PostgreSQL/Sequelize. Дізнайтеся секрети Prompt та Context інжинірингу і створіть автономні мультиагентні системи, здатні самостійно писати та перевіряти код.'
                                        : 'Connect your Angular frontend with a custom NestJS backend and PostgreSQL/Sequelize DB. Dive into Prompt and Context engineering to orchestrate autonomous multi-agent pipelines.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Day 5 */}
                        <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex flex-col md:flex-row gap-4 items-start hover:border-brand-ink/30 transition-all">
                            <div className="px-4 py-2 bg-green-600 text-white font-bold rounded-2xl text-xs uppercase tracking-widest shrink-0">
                                {isUk ? 'День 5 · 03.07' : 'Day 5 · 03.07'}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-brand-textPrimary text-lg">
                                    Deployment, Scale & Optimization
                                </h3>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    {isUk 
                                        ? 'Підготуйте продукт до продакшену. Налаштуйте CI/CD пайплайни, розгорніть вашу платформу та бази даних на Google Cloud Run і Cloud SQL. Розробіть власний MCP (Model Context Protocol) сервер для розв\'язання складних технічних протиріч за допомогою TRIZ.'
                                        : 'Get production-ready. Configure CI/CD, run your server and database on Google Cloud Run and Cloud SQL, and create a custom MCP server to resolve deep conflicts via TRIZ.'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Day 6 */}
                        <div className="p-6 bg-brand-bgCard/60 border border-stone-line rounded-3xl flex flex-col md:flex-row gap-4 items-start hover:border-brand-ink/30 transition-all">
                            <div className="px-4 py-2 bg-amber-500 text-white font-bold rounded-2xl text-xs uppercase tracking-widest shrink-0">
                                {isUk ? 'День 6 · 04.07' : 'Day 6 · 04.07'}
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-brand-textPrimary text-lg">
                                    The Grand Hackathon
                                </h3>
                                <p className="text-xs text-stone-500 leading-relaxed">
                                    {isUk 
                                        ? 'Фінальна 24-годинна битва! Команди об\'єднують усі отримані навички для розробки, тестування та запуску реального прототипу продукту.'
                                        : 'The final 24-hour battle! Teams merge their collective skills to conceptualize, design, build, test, and present a functional real-world prototype.'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Exclusive Assessment Section */}
                <div className="max-w-4xl mx-auto bg-gradient-to-br from-brand-bgCard to-brand-bg border border-stone-line p-8 md:p-12 rounded-[2.5rem] shadow-soft space-y-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-brand-clay/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-6 border-b border-stone-line pb-8">
                        <div className="w-16 h-16 rounded-2xl bg-brand-ink/10 flex items-center justify-center text-brand-ink shrink-0">
                            <Brain className="w-8 h-8" />
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-clay">
                                {isUk ? 'ЕКСКЛЮЗИВ ДЛЯ УЧАСНИКІВ' : 'EXCLUSIVE PARTICIPANT ACCESS'}
                            </span>
                            <h2 className="font-serif font-black text-2xl md:text-3xl text-brand-textPrimary">
                                {isUk ? '🧠 Побудуйте ідеальну команду з NeuroProfile' : '🧠 Build the Perfect Team with NeuroProfile'}
                            </h2>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <p className="text-sm text-stone-600 leading-relaxed">
                                {isUk 
                                    ? 'Спеціально для учасників "Build with AI Wrocław" доступна інтерактивна когнітивна оцінка від NP42 NeuroProfile. Дізнайтеся, як ваш тип уяви, просторовий інтелект та внутрішній монолог впливають на вашу роль у команді під час хакатону.'
                                    : 'Exclusively available to "Build with AI Wrocław" attendees is the interactive cognitive assessment by NP42 NeuroProfile. Discover how your imagination type, spatial intelligence, and internal monologue map to crucial hackathon team roles.'
                                }
                            </p>
                            <div className="p-4 bg-brand-clay/5 border border-brand-clay/10 rounded-2xl flex items-start gap-3">
                                <Gift className="w-5 h-5 text-brand-clay shrink-0 mt-0.5" />
                                <p className="text-xs text-brand-clay font-semibold">
                                    {isUk
                                        ? '🎁 Бонус: Використайте офіційний промокод WROC_AI_HACK при реєстрації, щоб отримати 500 безкоштовних кредитів для розширеної діагностики вашої команди!'
                                        : '🎁 Bonus: Enter the official WROC_AI_HACK promo code during signup to instantly claim 500 free credits for advanced multi-dimensional team layout profiles!'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Promo Code Input Box */}
                        <div className="p-6 bg-brand-bgCard border border-stone-line rounded-3xl space-y-4">
                            <h3 className="font-bold text-sm text-brand-textPrimary uppercase tracking-wider text-center">
                                {isUk ? 'Активувати бонусні кредити' : 'Redeem Event Promo Code'}
                            </h3>
                            
                            {!user ? (
                                <div className="p-4 bg-brand-clay/5 border border-brand-clay/20 text-brand-clay text-xs font-bold uppercase tracking-widest text-center rounded-2xl animate-pulse">
                                    {isUk ? 'Будь ласка, авторизуйтеся, щоб активувати промокод' : 'Please log in to redeem promo code'}
                                </div>
                            ) : redeemSuccess ? (
                                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl text-xs font-bold text-green-600 flex items-center justify-center gap-2 uppercase tracking-wider">
                                    <CheckCircle className="w-4 h-4" />
                                    {isUk ? 'Промокод активовано! +500 кредитів' : 'Promo Code Applied! +500 credits'}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={promoCode}
                                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                            placeholder="PROMOCODE"
                                            className="flex-1 px-4 py-2.5 bg-brand-bg border border-stone-line rounded-xl text-center font-bold tracking-widest text-brand-textPrimary focus:outline-none focus:border-brand-ink uppercase text-sm"
                                        />
                                        <button
                                            disabled={isRedeeming}
                                            onClick={handleRedeem}
                                            className="px-5 py-2.5 bg-brand-ink text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:shadow-md transition-all shrink-0 flex items-center justify-center"
                                        >
                                            {isRedeeming ? (
                                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                            ) : (isUk ? 'ОК' : 'Apply')}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-stone-400 text-center">
                                        {isUk ? 'Код діє під час проведення хакатону GDG' : 'Valid throughout the GDG Hackathon schedule'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Technology Stack */}
                <div className="space-y-6 max-w-4xl mx-auto">
                    <h2 className="text-2xl md:text-3xl font-serif font-black text-brand-textPrimary border-b border-stone-line pb-3 flex items-center gap-2">
                        <Cpu className="w-6 h-6 text-brand-ink" />
                        {isUk ? '💻 Технологічний стек, який ви опануєте:' : '💻 Technology Stack You Will Master:'}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-brand-bgCard/40 border border-stone-line rounded-2xl text-center space-y-2">
                            <span className="text-[10px] font-black text-brand-clay uppercase tracking-wider block">AI & LLM</span>
                            <span className="font-bold text-xs text-brand-textPrimary block">Gemini API, AI Agents</span>
                            <span className="text-[10px] text-stone-400 block">Prompt Eng, MCP Servers</span>
                        </div>
                        <div className="p-4 bg-brand-bgCard/40 border border-stone-line rounded-2xl text-center space-y-2">
                            <span className="text-[10px] font-black text-brand-ink uppercase tracking-wider block">Frontend</span>
                            <span className="font-bold text-xs text-brand-textPrimary block">Angular & TypeScript</span>
                            <span className="text-[10px] text-stone-400 block">Nx Monorepos, ng-diagram</span>
                        </div>
                        <div className="p-4 bg-brand-bgCard/40 border border-stone-line rounded-2xl text-center space-y-2">
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider block">Backend & Data</span>
                            <span className="font-bold text-xs text-brand-textPrimary block">NestJS & Sequelize</span>
                            <span className="text-[10px] text-stone-400 block">PostgreSQL, Docker</span>
                        </div>
                        <div className="p-4 bg-brand-bgCard/40 border border-stone-line rounded-2xl text-center space-y-2">
                            <span className="text-[10px] font-black text-green-600 uppercase tracking-wider block">Cloud & Scaling</span>
                            <span className="font-bold text-xs text-brand-textPrimary block">Google Cloud Platform</span>
                            <span className="text-[10px] text-stone-400 block">Cloud Run, Cloud SQL</span>
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
                            {isUk ? 'Пройти когнітивний тест NeuroProfile' : 'Claim Your Team Diagnostic Seat'}
                        </h3>
                        <p className="text-blue-100 text-sm md:text-base max-w-xl mx-auto font-medium">
                            {isUk
                                ? 'Когнітивний тест займе до 15 хвилин. Ви отримаєте інтерактивний радар-графік та детальний AI-звіт підготовки до хакатону.'
                                : 'Takes about 15 minutes. Instantly maps your visual, spatial, and cognitive traits to establish perfect team synergy.'
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

