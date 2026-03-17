import React from 'react';
import { ArrowLeft, ClipboardList, Brain, BarChart2, Lightbulb, Zap, ChevronRight } from 'lucide-react';
import { UIStrings, Language } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';

interface HowItWorksPageProps {
    ui: UIStrings;
    language: Language;
    onStartSurvey: () => void;
}

interface Step {
    icon: React.ElementType;
    titleUk: string;
    titleEn: string;
    titleRu: string;
    descUk: string;
    descEn: string;
    descRu: string;
    color: string;
}

const STEPS: Step[] = [
    {
        icon: ClipboardList,
        titleUk: 'Оберіть формат тесту',
        titleEn: 'Choose your test format',
        titleRu: 'Выберите формат теста',
        descUk: 'Доступний повний когнітивний профіль (~20 хв) або скорочена експрес-діагностика (~8 хв). Обидва дають детальні результати.',
        descEn: 'Choose between a full cognitive profile (~20 min) or a shorter express diagnostics (~8 min). Both provide detailed results.',
        descRu: 'Доступен полный когнитивный профиль (~20 мин) или сокращённая экспресс-диагностика (~8 мин). Оба дают детальные результаты.',
        color: 'bg-blue-50 border-blue-100 text-blue-600 dark:bg-blue-900/10 dark:border-blue-800/20 dark:text-blue-400',
    },
    {
        icon: Zap,
        titleUk: 'Пройдіть тест',
        titleEn: 'Take the test',
        titleRu: 'Пройдите тест',
        descUk: 'Відповідайте на запитання про вашу здатність до візуалізації, слухової та просторової уяви, пам\'яті та мислення. Немає правильних чи неправильних відповідей.',
        descEn: 'Answer questions about your visual, auditory, and spatial imagination, memory, and thinking style. There are no right or wrong answers.',
        descRu: 'Отвечайте на вопросы о вашей способности к визуализации, слуховому и пространственному воображению, памяти и мышлению. Нет правильных или неправильных ответов.',
        color: 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-900/10 dark:border-amber-800/20 dark:text-amber-400',
    },
    {
        icon: BarChart2,
        titleUk: 'Отримайте сенсорну карту',
        titleEn: 'Receive your sensory map',
        titleRu: 'Получите сенсорную карту',
        descUk: 'Алгоритм розраховує ваші бали за кількома вимірами: Візуальний, Слуховий, Просторовий, Тактильний, Нюховий та Смаковий. Результат відображається у вигляді пелюсткової діаграми.',
        descEn: 'The algorithm calculates your scores across multiple dimensions: Visual, Auditory, Spatial, Tactile, Olfactory, and Gustatory. The result is displayed as a petal chart.',
        descRu: 'Алгоритм рассчитывает ваши баллы по нескольким измерениям: Визуальный, Слуховой, Пространственный, Тактильный, Обонятельный и Вкусовой. Результат отображается в виде лепестковой диаграммы.',
        color: 'bg-purple-50 border-purple-100 text-purple-600 dark:bg-purple-900/10 dark:border-purple-800/20 dark:text-purple-400',
    },
    {
        icon: Brain,
        titleUk: 'AI-аналіз',
        titleEn: 'AI Analysis',
        titleRu: 'AI-анализ',
        descUk: 'Ваші результати передаються до Google Gemini, який генерує персоналізований опис вашого когнітивного профілю, сильних сторін та особливостей сприйняття. Текст стримується в реальному часі.',
        descEn: 'Your results are sent to Google Gemini, which generates a personalized description of your cognitive profile, strengths, and perceptual traits. The text streams in real time.',
        descRu: 'Ваши результаты передаются в Google Gemini, который генерирует персонализированное описание вашего когнитивного профиля, сильных сторон и особенностей восприятия. Текст стримируется в реальном времени.',
        color: 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/10 dark:border-emerald-800/20 dark:text-emerald-400',
    },
    {
        icon: Lightbulb,
        titleUk: 'Персональні рекомендації',
        titleEn: 'Personal Recommendations',
        titleRu: 'Персональные рекомендации',
        descUk: 'На основі вашого профілю система (незабаром) надасть рекомендації щодо кар\'єри, навчання, творчості та медіа, адаптованих під ваш тип уяви.',
        descEn: 'Based on your profile, the system (coming soon) will provide recommendations on career, learning, creativity, and media tailored to your imagination type.',
        descRu: 'На основе вашего профиля система (скоро) предоставит рекомендации по карьере, обучению, творчеству и медиа, адаптированных под ваш тип воображения.',
        color: 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-900/10 dark:border-rose-800/20 dark:text-rose-400',
    },
];

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ ui, language, onStartSurvey }) => {
    const navigate = useNavigate();
    
    useSeoMetadata({
        title: ui.howItWorksTitle,
        description: ui.howItWorksSubtitle,
        canonical: '/how-it-works'
    });

    const getTitle = (s: Step) => language === 'uk' ? s.titleUk : language === 'ru' ? s.titleRu : s.titleEn;
    const getDesc = (s: Step) => language === 'uk' ? s.descUk : language === 'ru' ? s.descRu : s.descEn;

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
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-6 border border-emerald-200 dark:border-emerald-800/30">
                    <Zap className="w-3 h-3" />
                    NeuroProfile
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-graphite leading-tight mb-4 tracking-tight">
                    {ui.howItWorksTitle}
                </h1>
                <p className="text-stone-500 text-base leading-relaxed max-w-xl font-sans">
                    {ui.howItWorksSubtitle}
                </p>
            </header>

            {/* Steps */}
            <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-stone-line via-stone-line to-transparent" />

                <div className="space-y-6 pl-14">
                    {STEPS.map((step, i) => (
                        <div key={i} className="relative">
                            {/* Step number circle */}
                            <div className="absolute -left-14 top-4 w-10 h-10 rounded-full bg-brand-paper-accent border-2 border-stone-line flex items-center justify-center z-10">
                                <span className="text-xs font-bold text-brand-graphite">{i + 1}</span>
                            </div>

                            <div className="bg-brand-paper-accent border border-stone-line rounded-2xl p-6 shadow-sm hover:shadow-soft transition-shadow">
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-xl border flex-shrink-0 flex items-center justify-center ${step.color}`}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-serif font-bold text-brand-graphite mb-1.5">
                                            {getTitle(step)}
                                        </h3>
                                        <p className="text-sm text-stone-500 leading-relaxed font-sans">
                                            {getDesc(step)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Technical Detail section to increase word count */}
            <section className="mt-16 bg-brand-paper-accent/50 rounded-[2.5rem] p-8 border border-stone-line/50">
                <h2 className="text-2xl font-serif font-bold text-brand-graphite mb-6 tracking-tight">
                    {language === 'uk' ? 'Методологія дослідження' : language === 'ru' ? 'Методология исследования' : 'Research Methodology'}
                </h2>
                <div className="space-y-4 text-sm text-stone-500 leading-relaxed font-sans">
                    <p>
                        {language === 'uk' ? 'Наш тест базується на перевірених наукових методах, таких як Vividness of Visual Imagery Questionnaire (VVIQ), адаптованих для сучасних умов. Ми розширили класичний підхід, додавши оцінку інших сенсорних модальностей, таких як звук, дотик та просторове мислення.' 
                        : language === 'ru' ? 'Наш тест основан на проверенных научных методах, таких как Vividness of Visual Imagery Questionnaire (VVIQ), адаптированных для современных условий. Мы расширили классический подход, добавив оценку других сенсорных модальностей, таких как звук, прикосновение и пространственное мышление.'
                        : 'Our assessment is based on validated scientific methods such as the Vividness of Visual Imagery Questionnaire (VVIQ), adapted for modern contexts. We have expanded the traditional approach by including evaluations of other sensory modalities, such as auditory, tactile, and spatial reasoning.'}
                    </p>
                    <p>
                        {language === 'uk' ? 'Система аналізу використовує штучний інтелект для інтерпретації ваших відповідей. Це дозволяє не просто видати сухі бали, а надати глибокий наративний аналіз ваших когнітивних патернів. Ви отримаєте розуміння того, як ці особливості впливають на вашу повсякденну діяльність та спілкування з іншими.'
                        : language === 'ru' ? 'Система анализа использует искусственный интеллект для интерпретации ваших ответов. Это позволяет не просто выдать сухие баллы, а предоставить глубокий нарративный анализ ваших когнитивных паттернов. Вы получите понимание того, как эти особенности влияют на вашу повседневную деятельность и общение с другими.'
                        : 'The analysis system utilizes artificial intelligence to interpret your responses. This allows us to provide more than just raw scores — we deliver a deep narrative analysis of your cognitive patterns, helping you understand how these traits influence your daily life and interactions.'}
                    </p>
                    <p>
                        {language === 'uk' ? 'Усі дані обробляються з дотриманням принципів конфіденційності. Кожне дослідження допомагає нам краще розуміти нейрорізноманіття людського мозку та вдосконалювати алгоритми для надання ще більш точних рекомендацій у майбутньому.'
                        : language === 'ru' ? 'Все данные обрабатываются с соблюдением принципов конфиденциальности. Каждое исследование помогает нам лучше понимать нейроразнообразие человеческого мозга и совершенствовать алгоритмы для предоставления ещё более точных рекомендаций в будущем.'
                        : 'All data is processed with strict adherence to privacy principles. Each research participant helps us better understand the neurodiversity of the human brain and refine our algorithms to provide even more accurate recommendations in the future.'}
                    </p>
                </div>
            </section>

            {/* CTA */}
            <div className="mt-12 text-center">
                <button
                    onClick={onStartSurvey}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-ink text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:bg-brand-inkHover hover:shadow-soft hover:scale-105 transition-all"
                >
                    {ui.start}
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
