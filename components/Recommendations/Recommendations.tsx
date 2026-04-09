import React, { useState, useMemo } from 'react';
import {
    Briefcase,
    Compass,
    Lightbulb,
    Palette,
    Lock,
    Copy,
    ExternalLink,
    X,
    Search,
    MessageSquare,
    ArrowRight,
    Zap,
    Terminal,
    AlertCircle,
    Users,
    Activity,
    Cpu,
    Music
} from 'lucide-react';
import { UIStrings, Profile, Language, Answer } from '@/types';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ProfileService } from '@/services/ProfileService';

interface RecommendationsProps {
    ui: UIStrings;
    isLocked: boolean;
    activeProfile?: Profile;
    user?: any;
    lang: Language;
}

const FULL_TEST_ID = 'full_aphantasia_profile';

export const Recommendations: React.FC<RecommendationsProps> = ({ ui, isLocked, activeProfile, user, lang }) => {
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [customPrompt, setCustomPrompt] = useState('');
    const navigate = useNavigate();

    const fullTestAnswers = useMemo(() => {
        return (activeProfile?.answers?.[FULL_TEST_ID] || {}) as Record<string, Answer>;
    }, [activeProfile]);

    const hasFullProfile = useMemo(() => {
        return Object.keys(fullTestAnswers).length > 0;
    }, [fullTestAnswers]);

    const profileContext = useMemo(() => {
        if (!activeProfile) return { profileInfo: 'Unknown', scoresContext: '', analysisText: '' };

        const recs = activeProfile.gemini_recommendations || {};
        let analysisText = '';

        const versionsKey = `${FULL_TEST_ID}_versions`;
        const indexKey = `${FULL_TEST_ID}_current_index`;

        if (recs[versionsKey] && Array.isArray(recs[versionsKey])) {
            const versions = recs[versionsKey];
            const currentIndex = typeof recs[indexKey] === 'number' ? recs[indexKey] : (versions.length - 1);
            analysisText = versions[currentIndex] || '';
        } else {
            analysisText = (recs[FULL_TEST_ID] as string) || '';
        }

        if (!analysisText) {
            const firstTestId = Object.keys(activeProfile.answers || {})[0];
            if (firstTestId) {
                const vKey = `${firstTestId}_versions`;
                const iKey = `${firstTestId}_current_index`;
                if (recs[vKey] && Array.isArray(recs[vKey])) {
                    const vs = recs[vKey];
                    const ci = typeof recs[iKey] === 'number' ? recs[iKey] : (vs.length - 1);
                    analysisText = vs[ci] || '';
                } else {
                    analysisText = (recs[firstTestId] as string) || '';
                }
            }
        }

        let type = activeProfile.type;
        if (!type && hasFullProfile) {
            const visualScore = ProfileService.calculateCategoryScore(fullTestAnswers, 'Visual');
            if (visualScore !== null) {
                type = ProfileService.getProfileType(visualScore);
            }
        }

        const profileInfo = ProfileService.getProfileTypeLabel(type, lang) || 'Unknown';

        let scoresContext = '';
        if (hasFullProfile) {
            scoresContext = Object.values(fullTestAnswers).map((ans: Answer) => {
                const val = typeof ans.value === 'number' ? ans.value : (typeof ans.value === 'string' ? ans.value : 'N/A');
                const qId = ans.questionId || 'N/A';
                return `Q:${qId}: ${val}`;
            }).join(', ');
        }

        return { profileInfo, scoresContext, analysisText };
    }, [activeProfile, fullTestAnswers, hasFullProfile, lang]);

    const getPromptTemplates = (ctx: any) => {
        const templates: Record<Language, any> = {
            uk: {
                resume: `Надай рекомендації щодо створення або редагування мого резюме на основі мого когнітивного аналізу. 

---
КОГНІТИВНИЙ АНАЛІЗ:
${ctx.analysisText}
---

Мій тип: ${ctx.profileInfo}. Зосередься на тому, як мої стратегії візуалізації та пам'яті можуть бути представлені як професійні сильні сторони.`,
                coverLetter: `Надай рекомендації щодо написання рекомендаційних листів, враховуючи мій специфічний когнітивний підхід до вирішення проблем і творчості.

---
КОГНІТИВНИЙ АНАЛІЗ:
${ctx.analysisText}
---

Мій профіль: ${ctx.profileInfo}. Допоможи мені "продати" мій тип мислення потенційному роботодавцю.`,
                jobIdeas: `Допоможи мені дослідити потенційні кар'єрні шляхи, які могли б мені підійти на основі мого когнітивного профілю.

---
КОГНІТИВНИЙ АНАЛІЗ:
${ctx.analysisText}
---

Мій тип: ${ctx.profileInfo}. Склади список ніш та професій, де мій спосіб обробки інформації є природною перевагою.`,
                worldview: `На основі мого когнітивного профілю (${ctx.profileInfo}) та аналізу, допоможи мені дослідити мої вірогідні переконання, особливості самоідентифікації та мою життєву Місію.

---
КОГНІТИВНИЙ АНАЛІЗ:
${ctx.analysisText}
---`,
                creativity: `Запропонуй творчі вправи чи проєкти, які використовують мої когнітивні можливості.

---
КОГНІТИВНИЙ АНАЛІЗ:
${ctx.analysisText}
---

Враховуючи, що мій тип — ${ctx.profileInfo}, як мені створювати контент (текст, код, структури) без опори на візуальні образи (або використовуючи їх по-іншому)?`,
                exploration: `Надай мені три завдання для саморефлексії для типу ${ctx.profileInfo}, щоб краще зрозуміти, як мій мозок обробляє сенсорну інформацію.

---
КОГНІТИВНИЙ АНАЛІЗ:
${ctx.analysisText}
---`,
                music: `Надай рекомендації щодо освоєння музичного інструменту або створення музики на основі мого когнітивного профілю.

---
КОГНІТИВНИЙ АНАЛІЗ:
${ctx.analysisText}
---

Мій тип: ${ctx.profileInfo}. Як мій мозок обробляє звукову та просторову інформацію? Запропонуй конкретні методики запам'ятовування нот, акордів або ритмів, оминаючи мої слабкі сторони (наприклад, візуалізацію) та спираючись на сильні (м'язова пам'ять, математичні патерни, аудіальні асоціації).`,
                audit: `Проведи когнітивний аудит мого процесу прийняття рішень на основі мого профілю.

---
КОГНІТИВНИЙ АНАЛІЗ:
${ctx.analysisText}
---

Проаналізуй, чи я більше схиляюся до логічно-структурних рішень чи інтуїтивно-абстрактних, і як це впливає на моє життя.`,
                brainstorm: `Ти — мій зовнішній візуалізатор. Я описуватиму свої ідеї як структури або концепції, а ти допомагай мені "побачити" їх, створюючи візуально-багаті описи або схеми, які я не можу згенерувати самостійно.

---
КОГНІТИВНИЙ АНАЛІЗ:
${ctx.analysisText}
---

Мій профіль: ${ctx.profileInfo}. Давай почнемо брейншторм!`,
                relationships: `Проаналізуй динаміку мого спілкування з іншими людьми на основі мого когнітивного типу (${ctx.profileInfo}).

---
КОГНІТИВНИЙ АНАЛІЗ:
${ctx.analysisText}
---

Які можливі точки тертя або непорозуміння можуть виникати з іншими людьми? Що вони можуть не розуміти в моїй манері розмови, і що я можу пропускати у їхній? Як мені краще адаптувати свою комунікацію?`
            },
            en: {
                resume: `Provide recommendations for creating or editing my resume based on my cognitive analysis. 

---
COGNITIVE ANALYSIS:
${ctx.analysisText}
---

My type is ${ctx.profileInfo}. Focus on how my visualization and memory strategies can be presented as professional strengths.`,
                coverLetter: `Provide recommendations on writing recommendation letters, highlighting my specific cognitive approach to problem-solving and creativity. 

---
COGNITIVE ANALYSIS:
${ctx.analysisText}
---

My profile is ${ctx.profileInfo}. Help me "sell" my thinking style to a potential employer.`,
                jobIdeas: `Help me explore potential career paths that could be a good fit for me based on my cognitive profile.

---
COGNITIVE ANALYSIS:
${ctx.analysisText}
---

My type is ${ctx.profileInfo}. List niches and professions where my way of processing information is a natural advantage.`,
                worldview: `Based on my cognitive profile (${ctx.profileInfo}) and analysis, help me explore my probable beliefs, self-identification, and life Mission.

---
COGNITIVE ANALYSIS:
${ctx.analysisText}
---`,
                creativity: `Suggest creative exercises or projects that leverage my cognitive strengths. 

---
COGNITIVE ANALYSIS:
${ctx.analysisText}
---

Given I am ${ctx.profileInfo}, how can I create content (text, code, structures) without relying on visual images (or using them differently)?`,
                exploration: `Provide me with three self-reflection tasks for a ${ctx.profileInfo} type to better understand how my brain handles sensory information.

---
COGNITIVE ANALYSIS:
${ctx.analysisText}
---`,
                audit: `Conduct a cognitive audit of my decision-making process based on my profile.

---
COGNITIVE ANALYSIS:
${ctx.analysisText}
---

Analyze whether I lean more towards logical-structural decisions or intuitive-abstract ones, and how this impacts my life.`,
                brainstorm: `You are my external visualizer. I will describe my ideas as structures or concepts, and you help me "see" them by creating visually rich descriptions or diagrams that I cannot generate myself.

---
COGNITIVE ANALYSIS:
${ctx.analysisText}
---

My profile: ${ctx.profileInfo}. Let's start brainstorming!`,
                relationships: `Analyze my communication dynamics with other people based on my cognitive type (${ctx.profileInfo}).

---
COGNITIVE ANALYSIS:
${ctx.analysisText}
---

What are the potential friction points or misunderstandings that might arise with others? What might they not understand about my way of talking, and what might I miss in theirs? How can I better adapt my communication?`,
                music: `Provide recommendations for mastering a musical instrument or creating music based on my cognitive profile.

---
COGNITIVE ANALYSIS:
${ctx.analysisText}
---

My type: ${ctx.profileInfo}. How does my brain process auditory and spatial information? Suggest specific methods for memorizing notes, chords, or rhythms, bypassing my weak points (e.g., visualization) and leveraging my strengths (muscle memory, mathematical patterns, auditory associations).`
            },
            ru: {
                resume: `Предоставь рекомендации по созданию или редактированию моего резюме на основе моего когнитивного анализа. 

---
КОГНИТИВНЫЙ АНАЛИЗ:
${ctx.analysisText}
---

Мой тип: ${ctx.profileInfo}. Сосредоточься на том, как мои стратегии визуализации и памяти могут быть представлены как профессиональные сильные стороны.`,
                coverLetter: `Предоставь рекомендации по написанию рекомендательных писем, подчеркивая мой специфический когнитивный подход к решению проблем и творчеству. 

---
КОГНИТИВНЫЙ АНАЛИЗ:
${ctx.analysisText}
---

Мой профиль: ${ctx.profileInfo}. Помоги мне «продать» мой тип мышления потенциальному работодателю.`,
                jobIdeas: `Помоги мне исследовать потенциальные карьерные пути, которые могли бы мне подойти на основе моего когнитивного профиля.

---
КОГНИТИВНЫЙ АНАЛИЗ:
${ctx.analysisText}
---

Мой тип: ${ctx.profileInfo}. Составь список ниш и профессий, где мой способ обработки информации является естественным преимуществом.`,
                worldview: `На основе моего когнитивного профиля (${ctx.profileInfo}) и анализа, помоги мне исследовать мои вероятные убеждения, особенности самоидентификации и мою жизненную Миссию.

---
КОГНИТИВНЫЙ АНАЛИЗ:
${ctx.analysisText}
---`,
                creativity: `Предложи творческие упражнения или проекты, которые используют мои когнитивные сильные стороны. 

---
КОГНИТИВНЫЙ АНАЛИЗ:
${ctx.analysisText}
---

Учитывая, что мой тип — ${ctx.profileInfo}, как мне создавать контент (текст, код, структуры) без опоры на визуальные образы (или используя их иначе)?`,
                exploration: `Предоставь мне три задания для саморефлексии для типа ${ctx.profileInfo}, чтобы лучше понять, как мой мозг обрабатывает сенсорную информацию.

---
КОГНИТИВНЫЙ АНАЛИЗ:
${ctx.analysisText}
---`,
                audit: `Проведи когнитивный аудит моего процесса принятия решений на основе моего профиля.

---
КОГНИТИВНЫЙ АНАЛИЗ:
${ctx.analysisText}
---

Проанализируй, склоняюсь ли я больше к логико-структурным решениям или интуитивно-абстрактным, и как это влияет на мою жизнь.`,
                brainstorm: `Ты — мой внешний визуализатор. Я буду описывать свои идеи как структуры или концепции, а ты помогай мне «видеть» их, создавая визуально-богатые описания или схемы, которые я не могу генерировать самостоятельно.

---
КОГНИТИВНЫЙ АНАЛИЗ:
${ctx.analysisText}
---

Мой профиль: ${ctx.profileInfo}. Давай начнем брейншторм!`,
                relationships: `Проанализируй динамику моего общения с другими людьми на основе моего когнитивного типа (${ctx.profileInfo}).

---
КОГНИТИВНЫЙ АНАЛИЗ:
${ctx.analysisText}
---

Какие возможные точки трения или недопонимания могут возникать с другими людьми? Что они могут не понимать в моей манере общения, и что я могу упускать в их? Как мне лучше адаптировать свою коммуникацию?`,
                music: `Предоставь рекомендации по освоению музыкального инструмента или созданию музыки на основе моего когнитивного профиля.

---
КОГНИТИВНЫЙ АНАЛИЗ:
${ctx.analysisText}
---

Мой тип: ${ctx.profileInfo}. Как мой мозг обрабатывает звуковую и пространственную информацию? Предложи конкретные методики запоминания нот, аккордов или ритмов, обходя мои слабые стороны (например, визуализацию) и опираясь на сильные (мышечная память, математические паттерны, аудиальные ассоциации).`
            }
        };

        return templates[lang] || templates.en;
    };

    const templates = useMemo(() => getPromptTemplates(profileContext), [profileContext, lang]);

    const sections = [
        {
            id: 'career',
            title: ui.sectionCareer,
            subline: ui.sectionCareerDesc,
            color: 'border-blue-500',
            iconColor: 'text-blue-400',
            cards: [
                {
                    id: 'resume',
                    title: ui.workshopResume,
                    icon: Briefcase,
                    template: () => templates.resume
                },
                {
                    id: 'cover-letter',
                    title: ui.workshopCoverLetter,
                    icon: MessageSquare,
                    template: () => templates.coverLetter
                },
                {
                    id: 'job-ideas',
                    title: ui.exploreJobIdeas,
                    icon: Search,
                    template: () => templates.jobIdeas
                }
            ]
        },
        {
            id: 'self',
            title: ui.sectionSelf,
            subline: ui.sectionSelfDesc,
            color: 'border-purple-500',
            iconColor: 'text-purple-400',
            cards: [
                {
                    id: 'worldview',
                    title: ui.worldview,
                    icon: Compass,
                    template: () => templates.worldview
                },
                {
                    id: 'exploration',
                    title: ui.selfExploration,
                    icon: Lightbulb,
                    template: () => templates.exploration
                },
                {
                    id: 'audit',
                    title: ui.cognitiveAudit,
                    icon: Cpu,
                    template: () => templates.audit
                }
            ]
        },
        {
            id: 'creativity',
            title: ui.sectionCreativity,
            subline: ui.sectionCreativityDesc,
            color: 'border-orange-500',
            iconColor: 'text-orange-400',
            cards: [
                {
                    id: 'creativity',
                    title: ui.creativityRecs,
                    icon: Palette,
                    template: () => templates.creativity
                },
                {
                    id: 'brainstorm',
                    title: ui.brainstormPartner,
                    icon: Activity,
                    template: () => templates.brainstorm
                },
                {
                    id: 'music',
                    title: ui.musicMastery,
                    icon: Music,
                    template: () => templates.music
                }
            ]
        },
        {
            id: 'relationships',
            title: ui.sectionRelationships,
            subline: ui.sectionRelationshipsDesc,
            color: 'border-pink-500',
            iconColor: 'text-pink-400',
            cards: [
                {
                    id: 'interpersonal',
                    title: ui.interpersonal,
                    icon: Users,
                    template: () => templates.relationships
                }
            ]
        }
    ];

    const handleCopy = (text: string) => {
        const area = document.createElement('textarea');
        area.value = text;
        document.body.appendChild(area);
        area.select();
        try {
            document.execCommand('copy');
            setCopied(true);
            toast.success(ui.promptCopied);
            if (selectedCategory?.id) {
                ProfileService.trackInteraction(selectedCategory.id, 'copy', FULL_TEST_ID);
            }
            setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            console.error('Copy failed', e);
        }
        document.body.removeChild(area);
    };

    const handleContinueToGemini = () => {
        if (selectedCategory?.id) {
            ProfileService.trackInteraction(selectedCategory.id, 'navigate', FULL_TEST_ID);
        }
        window.open('https://gemini.google.com/app', '_blank');
    };

    return (
        <div className="min-h-screen text-foreground p-6 md:p-12 font-sans selection:bg-indigo-500/30 -mx-6 md:-mx-12 -my-24 overflow-x-hidden transition-colors duration-300">
            <div className="max-w-6xl mx-auto mb-20 animate-fade-in pt-24 text-left">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4">
                            {ui.jumpToGemini}
                        </h1>
                        <p className="text-muted-foreground max-w-2xl leading-relaxed text-sm md:text-lg">
                            {ui.jumpToGeminiDesc.split('.')[0]}. {ui.jumpToGeminiDesc.split('.')[1] || ''}
                        </p>
                    </div>
                    <div className="bg-card border border-border px-6 py-3 rounded-full flex items-center gap-4 shadow-xl">
                        <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-xs font-bold text-white">₿</div>
                        <span className="text-base font-bold tracking-tight">{user?.credits ?? 0} {ui.credits}</span>
                    </div>
                </div>

                {!hasFullProfile && !isLocked && (
                    <div className="mt-12 bg-indigo-600/10 border border-indigo-500/30 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8 overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <div className="flex items-center gap-8 relative z-10 text-left">
                            <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center shrink-0 border border-indigo-500/20">
                                <AlertCircle className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-bold mb-2">{ui.recommendationsCTATitle}</h4>
                                <p className="text-muted-foreground text-sm md:text-base max-w-xl">{ui.recommendationsCTADesc}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-bold transition-all shadow-lg active:scale-95 shrink-0 relative z-10 text-lg"
                        >
                            {ui.recommendationsCTAButton}
                        </button>
                    </div>
                )}
            </div>

            {isLocked ? (
                <div className="max-w-6xl mx-auto bg-card border border-border border-dashed rounded-[40px] p-24 text-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/[0.02] pointer-events-none" />
                    <div className="relative z-10 max-w-md mx-auto">
                        <div className="w-20 h-20 bg-muted border border-border rounded-full flex items-center justify-center mx-auto mb-8 text-muted-foreground shadow-inner">
                            <Lock className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl md:text-4xl font-bold mb-6">
                            {ui.recommendationsLocked}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-lg">
                            {ui.recommendationsLockedDesc}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="mt-10 bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-xl font-bold transition-all text-lg shadow-xl"
                        >
                            {ui.recommendationsCTAButton}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="max-w-6xl mx-auto space-y-24 pb-24">
                    {sections.map((section) => (
                        <div key={section.id} id={section.id} className="scroll-mt-32">
                            <div className="mb-10 text-left">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase mb-2 flex items-center gap-4">
                                    <span className={`w-2 h-8 rounded-full ${section.color.replace('border-', 'bg-')}`} />
                                    {section.title}
                                </h2>
                                <p className="text-muted-foreground text-lg ml-6">{section.subline}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ml-6">
                                {section.cards.map((card) => (
                                    <div
                                        key={card.id}
                                        onClick={() => {
                                            setSelectedCategory({ ...card, sectionColor: section.color });
                                            ProfileService.trackInteraction(card.id, 'click', FULL_TEST_ID);
                                        }}
                                        className={`group bg-card border-l-4 ${section.color} border-t border-r border-b border-border rounded-[2.5rem] p-8 cursor-pointer transition-all duration-300 hover:bg-muted/50 hover:border-border/50 flex flex-col min-h-[420px] relative text-left shadow-lg hover:shadow-2xl hover:-translate-y-1`}
                                    >
                                        <div className="absolute top-8 right-8">
                                            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-500/20">
                                                {ui.freeInBeta}
                                            </span>
                                        </div>

                                        <div className="flex-1">
                                            <div className={`w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-8 border border-border group-hover:scale-110 transition-transform duration-500 ${section.iconColor}`}>
                                                <card.icon className="w-7 h-7" />
                                            </div>

                                            <h3 className="text-2xl font-bold mb-4 leading-tight group-hover:text-foreground transition-colors">
                                                {card.title}
                                            </h3>

                                            <div className="relative bg-background border border-border rounded-2xl p-5 group-hover:border-border/50 transition-colors h-[120px] overflow-hidden">
                                                <p className="text-muted-foreground text-xs font-mono leading-relaxed line-clamp-4">
                                                    {card.template()}
                                                </p>
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent opacity-40" />
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Terminal className={`w-4 h-4 ${section.iconColor} opacity-50`} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
                                            <span className="text-[10px] font-bold tracking-widest uppercase opacity-30 group-hover:opacity-60 transition-opacity">
                                                {ui.readyToUse}
                                            </span>
                                            <div className={`w-10 h-10 rounded-full border border-border flex items-center justify-center bg-muted group-hover:bg-foreground group-hover:text-background transition-all shadow-lg`}>
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Custom Prompt Block */}
                    <div className="bg-card border border-border rounded-[40px] p-10 md:p-16 shadow-2xl relative overflow-hidden group text-left border-t-indigo-500/30">
                        <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-start">
                            <div className="flex-1 space-y-6 w-full">
                                <h3 className="text-3xl md:text-5xl font-black tracking-tight flex items-center gap-4">
                                    <Zap className="w-8 h-8 text-indigo-500" />
                                    {ui.customPromptTitle}
                                </h3>
                                <div className="relative">
                                    <textarea
                                        value={customPrompt}
                                        onChange={(e) => setCustomPrompt(e.target.value)}
                                        placeholder={ui.customPromptPlaceholder}
                                        className="w-full bg-background border border-border rounded-[2rem] p-8 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/50 outline-none min-h-[180px] text-lg text-foreground transition-all placeholder-muted-foreground/50 shadow-inner"
                                    />
                                    <div className="absolute bottom-6 right-6 text-[10px] text-indigo-400 font-bold uppercase tracking-widest px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20 backdrop-blur-md">
                                        + profile context
                                    </div>
                                </div>
                            </div>
                            <div className="lg:pt-28 w-full lg:w-auto">
                                <button
                                    disabled={!hasFullProfile && !customPrompt.trim()}
                                    onClick={() => {
                                        const analysisLabel = { uk: 'КОГНІТИВНИЙ АНАЛІЗ', en: 'COGNITIVE ANALYSIS', ru: 'КОГНИТИВНЫЙ АНАЛИЗ' }[lang];
                                        const typeLabel = { uk: 'Тип користувача', en: 'User Type', ru: 'Тип пользователя' }[lang];
                                        const scoresLabel = { uk: 'Бали', en: 'Scores', ru: 'Баллы' }[lang];
                                        const full = `${customPrompt}\n\n---\n${analysisLabel}:\n${profileContext.analysisText}\n---\n\n${typeLabel}: ${profileContext.profileInfo}. ${scoresLabel}: ${profileContext.scoresContext}`;
                                        setSelectedCategory({ id: 'custom_prompt', title: ui.customPromptTitle, template: () => full, isCustom: true, sectionColor: 'border-indigo-500' });
                                        ProfileService.trackInteraction('custom_prompt', 'click', FULL_TEST_ID);
                                    }}
                                    className="w-full lg:w-64 py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl hover:bg-indigo-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-4 group/btn"
                                >
                                    Proceed
                                    <ArrowRight className="w-6 h-6 group-hover/btn:translate-x-2 transition-transform" />
                                </button>
                            </div>
                        </div>
                        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/[0.03] rounded-full blur-[120px] -mr-64 -mb-64 pointer-events-none" />
                    </div>
                </div>
            )}

            {/* Modal Window */}
            {selectedCategory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-2xl animate-in fade-in duration-500">
                    <div
                        className="absolute inset-0"
                        onClick={() => setSelectedCategory(null)}
                    />

                    <div className={`relative bg-card w-full max-w-3xl rounded-[40px] border-t-8 ${selectedCategory.sectionColor || 'border-indigo-600'} border-l border-r border-b border-border overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] dark:shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-300`}>
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="absolute top-10 right-10 w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-all hover:rotate-90 hover:bg-muted/50"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="p-10 md:p-16 text-left">
                            <div className="flex items-center gap-6 mb-10">
                                <div className={`w-16 h-16 bg-muted rounded-3xl flex items-center justify-center border border-border shadow-inner`}>
                                    {selectedCategory.icon ? <selectedCategory.icon className="w-8 h-8 text-indigo-400" /> : <Zap className="w-8 h-8 text-indigo-500" />}
                                </div>
                                <div>
                                    <h2 className="text-3xl md:text-4xl font-black tracking-tight">{selectedCategory.title}</h2>
                                    <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px] mt-1">{ui.freeInBeta}</p>
                                </div>
                            </div>

                            <div className="mb-12">
                                <div className="flex items-center justify-between mb-6">
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-black flex items-center gap-2">
                                        <Terminal className="w-4 h-4 opacity-30" />
                                        {ui.aiPromptLabel}
                                    </p>
                                </div>
                                <div className="bg-background border border-border rounded-3xl p-8 font-mono text-sm md:text-base text-foreground/80 leading-relaxed max-h-[350px] overflow-y-auto shadow-inner custom-scrollbar whitespace-pre-line ring-1 ring-border/5">
                                    {selectedCategory.template()}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <button
                                    onClick={() => handleCopy(selectedCategory.template())}
                                    className={`flex items-center justify-center gap-4 py-6 rounded-[2rem] font-black text-lg transition-all shadow-2xl ${copied
                                            ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-600/30'
                                            : 'bg-foreground text-background hover:opacity-90 hover:scale-[1.02] active:scale-95'
                                        }`}
                                >
                                    {copied ? <><Zap className="w-6 h-6 animate-pulse" /> {ui.copied}</> : <><Copy className="w-6 h-6" /> {ui.copyToClipboard}</>}
                                </button>

                                <button
                                    onClick={handleContinueToGemini}
                                    className={`flex items-center justify-center gap-4 py-6 rounded-[2rem] font-black text-lg transition-all border-2 border-border ${copied
                                            ? 'bg-indigo-600 border-transparent text-white hover:bg-indigo-500 hover:scale-[1.02] active:scale-95 shadow-lg'
                                            : 'bg-transparent text-muted-foreground cursor-not-allowed opacity-50'
                                        }`}
                                    disabled={!copied}
                                >
                                    <ExternalLink className="w-6 h-6" /> {ui.continueToGemini}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
