import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, HelpCircle } from 'lucide-react';
import { UIStrings, Language } from '@/types';
import { useNavigate } from 'react-router-dom';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';

interface FaqPageProps {
    ui: UIStrings;
    language: Language;
}

interface FaqItem {
    q: string;
    a: string;
}

const FAQ_DATA: Record<Language, FaqItem[]> = {
    uk: [
        {
            q: 'Чи є афантазія розладом або хворобою?',
            a: 'Ні. Афантазія — це когнітивна особливість, а не медичний розлад. Більшість людей з афантазією живуть абсолютно повноцінним життям. Вона не є причиною обмежень у навчанні, роботі чи стосунках, хоча може впливати на стиль сприйняття інформації.',
        },
        {
            q: 'Чи означає мій результат «Афантазія», що я не можу уявляти взагалі?',
            a: 'Не зовсім. Афантазія стосується саме зорових образів. Люди з афантазією часто зберігають просторову пам\'ять, емоційні спогади, музичну уяву та інші форми когнітивної діяльності, які не потребують візуальних картинок.',
        },
        {
            q: 'Наскільки точний ваш тест?',
            a: 'Тест базується на науково валідованих опитувальниках (зокрема VVIQ — Vividness of Visual Imagery Questionnaire). Він дає хорошу оцінку вашого суб\'єктивного досвіду, але не є клінічним інструментом. Результати слід сприймати як відправну точку для саморефлексії.',
        },
        {
            q: 'Що таке Гіперфантазія?',
            a: 'Гіперфантазія — протилежний кінець спектру. Люди з гіперфантазією «бачать» настільки яскраві та деталізовані образи, що їх важко відрізнити від реального сприйняття. Це також абсолютно нормальний варіант когнітивного профілю.',
        },
        {
            q: 'Чи можна «вилікуватися» від афантазії?',
            a: 'Зараз немає наукового підтвердження методів, що гарантовано змінюють рівень візуальної уяви. Деякі люди повідомляли про незначні зміни після медитативних практик або при певних медичних станах, але це не є загальним правилом.',
        },
        {
            q: 'Чи зберігає сервіс мої відповіді?',
            a: 'Після авторизації через Google ваші відповіді та результати зберігаються на нашому сервері. Це дозволяє вам повернутися до них у будь-який момент. Ми не передаємо їх третім особам. Детальніше — у Політиці конфіденційності.',
        },
        {
            q: 'Скільки часу займає тест?',
            a: 'Стандартний тест займає приблизно 15–25 хвилин. Є також скорочений формат (Експрес-діагностика) тривалістю близько 7–10 хвилин. Після завершення ви отримаєте AI-аналіз автоматично.',
        },
        {
            q: 'Що означає «AI-аналіз» і як він генерується?',
            a: 'Після проходження тесту ваші агреговані результати передаються до мовної моделі (Gemini від Google), яка генерує персоналізований опис вашого когнітивного профілю. Аналіз носить освітній характер і не є діагнозом.',
        },
        {
            q: 'Як працює система кредитів?',
            a: 'Кожен новий користувач отримує базовий бонус у 300 кредитів при реєстрації. Перше проходження тесту (будь-якого типу) є абсолютно безкоштовним. Повторне проходження того ж тесту для отримання нової версії аналізу коштує 100 кредитів.',
        },
        {
            q: 'Як отримати додаткові кредити безкоштовно?',
            a: 'Ви можете отримувати бонуси за запрошених друзів через реферальну систему. За перших 5 друзів, які пройдуть тест, ви отримаєте по 100 кредитів за кожного. За друзів з 6-го по 10-й — по 50 кредитів.',
        },
        {
            q: 'Як працює функція спільного доступу (Share)?',
            a: 'Ви можете зробити свій профіль публічним у налаштуваннях результатів. Це згенерує унікальне анонімне посилання, яким можна поділитися. Публічний доступ можна вимкнути в будь-який момент, що зробить посилання недійсним.',
        },
    ],
    en: [
        {
            q: 'Is aphantasia a disorder or disease?',
            a: 'No. Aphantasia is a cognitive trait, not a medical disorder. Most people with aphantasia live completely fulfilling lives. It does not cause limitations in learning, work, or relationships, though it may affect how people process information.',
        },
        {
            q: 'Does an "Aphantasia" result mean I cannot imagine at all?',
            a: 'Not exactly. Aphantasia specifically refers to visual imagery. People with aphantasia often retain spatial memory, emotional recollections, musical imagination, and other forms of cognitive activity that do not require mental pictures.',
        },
        {
            q: 'How accurate is the test?',
            a: 'The test is based on scientifically validated questionnaires (including VVIQ — the Vividness of Visual Imagery Questionnaire). It provides a good estimate of your subjective experience, but it is not a clinical tool. Results should be seen as a starting point for self-reflection.',
        },
        {
            q: 'What is Hyperphantasia?',
            a: 'Hyperphantasia is the opposite end of the spectrum. People with hyperphantasia \"see\" images so vivid and detailed that they can be hard to distinguish from real perception. This is also a completely normal cognitive profile variant.',
        },
        {
            q: 'Can aphantasia be \"cured\"?',
            a: 'There is currently no scientific evidence for methods that reliably change the level of visual imagination. Some individuals have reported minor changes after meditative practices or with certain medical conditions, but this is not a general rule.',
        },
        {
            q: 'Does the service store my answers?',
            a: 'After signing in with Google, your answers and results are stored on our server. This allows you to return to them at any time. We do not share them with third parties. For more, see the Privacy Policy.',
        },
        {
            q: 'How long does the test take?',
            a: 'The standard test takes approximately 15–25 minutes. There is also a shorter format (Express Diagnostics) of about 7–10 minutes. After completion, you will receive an AI analysis automatically.',
        },
        {
            q: 'What is the "AI analysis" and how is it generated?',
            a: 'After completing the test, your aggregated results are sent to a language model (Google\'s Gemini), which generates a personalized description of your cognitive profile. The analysis is educational in nature and is not a diagnosis.',
        },
        {
            q: 'How does the credit system work?',
            a: 'Every new user receives a 300-credit bonus upon registration. The first time you complete any test, it is free. Retaking the same test to generate a new analysis version costs 100 credits.',
        },
        {
            q: 'How can I get more credits for free?',
            a: 'You can earn bonuses via our referral system. For the first 5 friends who complete a test, you receive 100 credits each. For referrals 6 through 10, you receive 50 credits each.',
        },
        {
            q: 'How does the Share feature work?',
            a: 'You can make your profile public in the results settings. This generates a unique, anonymous link you can share. You can revoke public access at any time, making previous links invalid.',
        },
    ],
    ru: [
        {
            q: 'Является ли афантазия расстройством или болезнью?',
            a: 'Нет. Афантазия — это когнитивная особенность, а не медицинское расстройство. Большинство людей с афантазией живут абсолютно полноценной жизнью. Она не является причиной ограничений в учёбе, работе или отношениях, хотя может влиять на способ восприятия информации.',
        },
        {
            q: 'Означает ли результат «Афантазия», что я вообще не могу воображать?',
            a: 'Не совсем. Афантазия касается именно зрительных образов. Люди с афантазией часто сохраняют пространственную память, эмоциональные воспоминания, музыкальное воображение и другие формы когнитивной деятельности, которые не требуют визуальных картинок.',
        },
        {
            q: 'Насколько точен ваш тест?',
            a: 'Тест основан на научно валидированных опросниках (в том числе VVIQ — Vividness of Visual Imagery Questionnaire). Он даёт хорошую оценку вашего субъективного опыта, но не является клиническим инструментом. Результаты следует воспринимать как отправную точку для саморефлексии.',
        },
        {
            q: 'Что такое Гиперфантазия?',
            a: 'Гиперфантазия — противоположный конец спектра. Люди с гиперфантазией «видят» настолько яркие и детализированные образы, что их сложно отличить от реального восприятия. Это также абсолютно нормальный вариант когнитивного профиля.',
        },
        {
            q: 'Можно ли «вылечиться» от афантазии?',
            a: 'На данный момент нет научного подтверждения методов, которые гарантированно изменяют уровень визуального воображения. Некоторые люди сообщали о незначительных изменениях после медитативных практик или при определённых медицинских состояниях, но это не общее правило.',
        },
        {
            q: 'Сохраняет ли сервис мои ответы?',
            a: 'После авторизации через Google ваши ответы и результаты сохраняются на нашем сервере. Это позволяет вам вернуться к ним в любой момент. Мы не передаём их третьим лицам. Подробнее — в Политике конфиденциальности.',
        },
        {
            q: 'Сколько времени занимает тест?',
            a: 'Стандартный тест занимает примерно 15–25 минут. Есть также сокращённый формат (Экспресс-диагностика) продолжительностью около 7–10 минут. После завершения вы получите AI-анализ автоматически.',
        },
        {
            q: 'Что означает «AI-анализ» и как он генерируется?',
            a: 'После прохождения теста ваши агрегированные результаты передаются языковой модели (Gemini от Google), которая генерирует персонализированное описание вашего когнитивного профиля. Анализ носит образовательный характер и не является диагнозом.',
        },
        {
            q: 'Как работает система кредитов?',
            a: 'Каждый новый пользователь получает базовый бонус в 300 кредитов при регистрации. Первое прохождение любого теста бесплатно. Повторное прохождение того же теста для получения новой версии анализа стоит 100 кредитов.',
        },
        {
            q: 'Как получить дополнительные кредиты бесплатно?',
            a: 'Вы можете получать бонусы за приглашенных друзей через реферальную систему. За первых 5 друзей, прошедших тест, вы получите по 100 кредитов. За друзей с 6-го по 10-й — по 50 кредитов.',
        },
        {
            q: 'Как работает функция "Поделиться" (Share)?',
            a: 'Вы можете сделать свой профиль публичным в настройках результатов. Это создаст уникальную анонимную ссылку. Вы можете отключить публичный доступ в любой момент, тогда все старые ссылки перестанут работать.',
        },
    ],
};

const FaqAccordion: React.FC<{ item: FaqItem; index: number }> = ({ item, index }) => {
    const [open, setOpen] = useState(false);
    return (
        <div className="border border-stone-line rounded-2xl overflow-hidden bg-brand-paper-accent shadow-sm">
            <button
                onClick={() => setOpen((p) => !p)}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-stone-bg/50 transition-colors"
                aria-expanded={open}
            >
                <div className="flex items-start gap-3">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pt-0.5 min-w-[1.5rem]">
                        {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold text-brand-graphite leading-snug font-sans">{item.q}</span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-stone-400 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <p className="px-6 pb-6 text-sm text-stone-500 leading-relaxed font-sans pl-[3.75rem]">{item.a}</p>
            </div>
        </div>
    );
};

export const FaqPage: React.FC<FaqPageProps> = ({ ui, language }) => {
    const navigate = useNavigate();
    useSeoMetadata({
        title: `${ui.faqTitle} — Cognitive Research`,
        description: ui.faqSubtitle,
        canonical: '/faq'
    });
    const items = FAQ_DATA[language] ?? FAQ_DATA['en'];

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
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300 rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-6 border border-amber-200 dark:border-amber-800/30">
                    <HelpCircle className="w-3 h-3" />
                    FAQ
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-graphite leading-tight mb-4 tracking-tight">
                    {ui.faqTitle}
                </h1>
                <p className="text-stone-500 text-base leading-relaxed max-w-xl font-sans">
                    {ui.faqSubtitle}
                </p>
            </header>

            <div className="space-y-3">
                {items.map((item, i) => (
                    <FaqAccordion key={i} item={item} index={i} />
                ))}
            </div>
        </div>
    );
};
