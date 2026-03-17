import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Newspaper, Clock, Tag, Mail } from 'lucide-react';
import { UIStrings, Language } from '@/types';
import { useNavigate } from 'react-router-dom';
import { NewsletterSubscribe } from './NewsletterSubscribe';
import { useSeoMetadata } from '@/hooks/useSeoMetadata';

interface NewsPageProps {
    ui: UIStrings;
    language: Language;
    onStartSurvey: () => void;
    userEmail?: string;
}

interface Article {
    id: string;
    date: string;
    tag: string;
    tagColor: string;
    readMin: number;
    titleUk: string;
    titleEn: string;
    titleRu: string;
    excerptUk: string;
    excerptEn: string;
    excerptRu: string;
    bodyUk: string[];
    bodyEn: string[];
    bodyRu: string[];
}

/* eslint-disable max-len */
const ARTICLES: Article[] = [
    {
        id: 'streaming-analysis',
        date: '2026-03-15',
        tag: 'Feature',
        tagColor: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30',
        readMin: 3,
        titleUk: `AI-аналіз тепер потоковий — результати з'являються в реальному часі`,
        titleEn: `AI Analysis is now streaming — results appear in real time`,
        titleRu: `AI-анализ теперь потоковый — результаты появляются в режиме реального времени`,
        excerptUk: `Ми оновили систему генерації AI-аналізу. Тепер замість очікування — текст з'являється по мірі генерації.`,
        excerptEn: `We updated the AI analysis generation system. Now instead of waiting — text appears as it is generated.`,
        excerptRu: `Мы обновили систему генерации AI-анализа. Теперь вместо ожидания — текст появляется по мере генерации.`,
        bodyUk: [
            `До оновлення користувачі чекали до 30 секунд на повну відповідь від AI. Це погіршувало досвід, особливо при повільному інтернет-з'єднанні. Тепер ми впровадили Server-Sent Events (SSE) — стандартний механізм потокової передачі даних.`,
            `Як це працює: після завершення тесту ваш профіль передається до Gemini API (Google). Відповідь надходить не єдиним блоком — кожен фрагмент тексту відразу відображається на екрані. Ви бачите, як AI буквально "думає" вголос.`,
            `Завдяки цьому сприйняте очікування скорочується з ~15 секунд до миттєвої реакції. Навіть якщо повна генерація займає той самий час, психологічно це набагато комфортніше.`,
            `Технічно: бекенд (FastAPI + Python) використовує generate_content_async із Gemini SDK з ітерацією по частинах відповіді. Фронтенд (React) оновлює стан рядково, запобігаючи зайвим перерендерингам через useRef.`,
        ],
        bodyEn: [
            `Before this update, users waited up to 30 seconds for a full AI response. This degraded the experience, especially on slow connections. We have now implemented Server-Sent Events (SSE) — a standard streaming data transfer mechanism.`,
            `How it works: after completing the test, your profile is sent to the Gemini API (Google). The response does not arrive as a single block — each fragment of text is displayed on screen immediately. You see the AI literally "thinking out loud".`,
            `This reduces perceived waiting time from ~15 seconds to an instant response. Even if the full generation takes the same amount of time, it is psychologically far more comfortable.`,
            `Technically: the backend (FastAPI + Python) uses generate_content_async from the Gemini SDK, iterating over response chunks. The frontend (React) updates state line by line, preventing unnecessary re-renders via useRef.`,
        ],
        bodyRu: [
            `До этого обновления пользователи ждали до 30 секунд полного ответа от AI. Это ухудшало опыт, особенно при медленном интернет-соединении. Теперь мы внедрили Server-Sent Events (SSE) — стандартный механизм потоковой передачи данных.`,
            `Как это работает: после завершения теста ваш профиль передаётся в Gemini API (Google). Ответ поступает не единым блоком — каждый фрагмент текста сразу отображается на экране. Вы видите, как AI буквально «думает» вслух.`,
            `Благодаря этому воспринимаемое ожидание сокращается с ~15 секунд до мгновенной реакции. Даже если полная генерация занимает то же время, психологически это намного комфортнее.`,
            `Технически: бэкенд (FastAPI + Python) использует generate_content_async из Gemini SDK с итерацией по частям ответа. Фронтенд (React) обновляет состояние построчно, предотвращая лишние перерендеринги через useRef.`,
        ],
    },
    {
        id: 'google-auth',
        date: '2026-03-14',
        tag: 'Security',
        tagColor: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30',
        readMin: 4,
        titleUk: `Google авторизація: чому ми перейшли з Telegram на OAuth 2.0`,
        titleEn: `Google Authorization: why we switched from Telegram to OAuth 2.0`,
        titleRu: `Google-авторизация: почему мы перешли с Telegram на OAuth 2.0`,
        excerptUk: `Детальний розбір нашої системи аутентифікації — від Telegram Login до власного бекенд-обміну токенами з Google.`,
        excerptEn: `A detailed breakdown of our authentication system — from Telegram Login to our own backend token exchange with Google.`,
        excerptRu: `Детальный разбор нашей системы аутентификации — от Telegram Login до собственного бэкенд-обмена токенами с Google.`,
        bodyUk: [
            `Спочатку NeuroProfile використовував Telegram Login Widget для аутентифікації. Це було зручно, але вимагало від користувачів мати акаунт Telegram та дозволяти доступ до нього. Крім того, верифікація підписів Telegram на бекенді іноді давала збої через часові мітки.`,
            `Ми перейшли на Google OAuth 2.0 з кількох причин: більше охоплення (майже кожен має Google-акаунт), надійніший стандарт, краща підтримка з боку бібліотек. Ми використовуємо @react-oauth/google на фронті та google-auth-library на бекенді.`,
            `Ключовий момент безпеки: ми не зберігаємо Google access token. Натомість, коли фронтенд отримує Google credential (JWT), він надсилає його на наш бекенд /api/auth/google/exchange. Там ми верифікуємо JWT через Google API та повертаємо власний внутрішній токен з полями user_id, hash, first_name тощо.`,
            `Цей внутрішній токен зберігається в localStorage та використовується для всіх подальших запитів до API. Hash виступає "підписом" — він дозволяє бекенду верифікувати запити без збереження сесій на сервері (stateless).`,
        ],
        bodyEn: [
            `Originally, NeuroProfile used the Telegram Login Widget for authentication. This was convenient but required users to have a Telegram account and grant it access. Additionally, Telegram signature verification on the backend sometimes failed due to timestamp issues.`,
            `We switched to Google OAuth 2.0 for several reasons: broader reach (almost everyone has a Google account), a more reliable standard, and better library support. We use @react-oauth/google on the frontend and google-auth-library on the backend.`,
            `The key security point: we do not store the Google access token. Instead, when the frontend receives the Google credential (JWT), it sends it to our backend at /api/auth/google/exchange. There we verify the JWT via the Google API and return our own internal token with fields like user_id, hash, first_name, etc.`,
            `This internal token is stored in localStorage and used for all subsequent API requests. The hash acts as a "signature" — allowing the backend to verify requests without storing sessions server-side (stateless).`,
        ],
        bodyRu: [
            `Изначально NeuroProfile использовал Telegram Login Widget для аутентификации. Это было удобно, но требовало от пользователей наличия аккаунта Telegram и разрешения доступа к нему. Кроме того, верификация подписей Telegram на бэкенде иногда давала сбои из-за временных меток.`,
            `Мы перешли на Google OAuth 2.0 по нескольким причинам: больший охват (у почти каждого есть Google-аккаунт), более надёжный стандарт, лучшая поддержка со стороны библиотек. Мы используем @react-oauth/google на фронтенде и google-auth-library на бэкенде.`,
            `Ключевой момент безопасности: мы не храним Google access token. Вместо этого, когда фронтенд получает Google credential (JWT), он отправляет его на наш бэкенд /api/auth/google/exchange. Там мы верифицируем JWT через Google API и возвращаем собственный внутренний токен с полями user_id, hash, first_name и т.д.`,
            `Этот внутренний токен хранится в localStorage и используется для всех последующих запросов к API. Hash выступает "подписью" — он позволяет бэкенду верифицировать запросы без хранения сессий на сервере (stateless).`,
        ],
    },
    {
        id: 'multilang',
        date: '2026-03-12',
        tag: 'i18n',
        tagColor: 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/30',
        readMin: 2,
        titleUk: `Три мови та динамічна локалізація AI-аналізу`,
        titleEn: `Three languages and dynamic AI analysis localization`,
        titleRu: `Три языка и динамическая локализация AI-анализа`,
        excerptUk: `NeuroProfile тепер повністю доступний українською, англійською та російською — включаючи AI-аналіз.`,
        excerptEn: `NeuroProfile is now fully available in Ukrainian, English, and Russian — including AI analysis.`,
        excerptRu: `NeuroProfile теперь полностью доступен на украинском, английском и русском — включая AI-анализ.`,
        bodyUk: [
            `Ми визначаємо мову автоматично через navigator.language при першому відвідуванні. Але ключовий момент — всі переклади зберігаються в translations.ts у вигляді типізованого об'єкта UIStrings. Це унеможливлює забути переклад для нового ключа.`,
            `Найцікавіше — локалізація AI-аналізу. Перед генерацією ми показуємо модальне вікно підтвердження, яке повідомляє користувача: "Ваш аналіз буде згенеровано мовою: Українська. Бажаєте змінити мову?" Це запобігає ситуації, коли людина змінила мову інтерфейсу, але аналіз уже згенерований іншою мовою.`,
            `Технічно ми передаємо вибрану мову у запиті до бекенду, де вона вбудовується в системний промпт для Gemini. Промпт явно вказує мову відповіді, що дає стабільніші результати, ніж автодетекція.`,
        ],
        bodyEn: [
            `We auto-detect the language via navigator.language on the first visit. But the key point is that all translations are stored in translations.ts as a typed UIStrings object. This makes it impossible to forget a translation for a new key.`,
            `The most interesting part is AI analysis localization. Before generation, we show a confirmation modal informing the user: "Your analysis will be generated in: English. Would you like to change the language?" This prevents the situation where a user changed the interface language but the analysis was already generated in a different language.`,
            `Technically, we pass the selected language in the request to the backend, where it is embedded in the system prompt for Gemini. The prompt explicitly states the response language, which gives more stable results than auto-detection.`,
        ],
        bodyRu: [
            `Мы определяем язык автоматически через navigator.language при первом посещении. Но ключевой момент — все переводы хранятся в translations.ts в виде типизированного объекта UIStrings. Это исключает возможность забыть перевод для нового ключа.`,
            `Самое интересное — локализация AI-анализа. Перед генерацией мы показываем модальное окно подтверждения, которое сообщает пользователю: "Ваш анализ будет сгенерирован на языке: Русский. Хотите изменить язык?" Это предотвращает ситуацию, когда человек сменил язык интерфейса, но анализ уже сгенерирован на другом языке.`,
            `Технически мы передаём выбранный язык в запросе к бэкенду, где он встраивается в системный промпт для Gemini. Промпт явно указывает язык ответа, что даёт более стабильные результаты, чем авто-детекция.`,
        ],
    },
    {
        id: 'sensory-map',
        date: '2026-03-10',
        tag: 'UX',
        tagColor: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30',
        readMin: 3,
        titleUk: `Сенсорна карта: як ми візуалізуємо когнітивний профіль`,
        titleEn: `Sensory Map: how we visualize the cognitive profile`,
        titleRu: `Сенсорная карта: как мы визуализируем когнитивный профиль`,
        excerptUk: `Пелюсткова діаграма, що відображає шість вимірів вашої уяви — від Візуального до Смакового.`,
        excerptEn: `A petal chart displaying six dimensions of your imagination — from Visual to Gustatory.`,
        excerptRu: `Лепестковая диаграмма, отображающая шесть измерений вашего воображения — от Визуального до Вкусового.`,
        bodyUk: [
            `Результати тесту складаються з шести вимірів: Візуальний, Слуховий, Просторовий, Тактильний, Нюховий та Смаковий. Кожен вимір оцінюється за шкалою від 1 до 5, де 1 = повна відсутність уяви (Афантазія), а 5 = надзвичайно яскрава уява (Гіперфантазія).`,
            `Для відображення ми використовуємо радарну (пелюсткову) діаграму, побудовану на чистому SVG — без зовнішніх бібліотек для чартів. Кожна вісь відповідає одному виміру, точки з'єднуються полігоном. Для кожного типу профілю є унікальне кольорове кодування.`,
            `Важливий нюанс: шкала інвертована для відображення. Оскільки афантазія — це "1" (мінімум), але центр діаграми зазвичай асоціюється з "нічого", ми відображаємо 1 ближче до краю, а 5 — до центру. Так люди з афантазією бачать широкий полігон, а люди з гіперфантазією — яскраво заповнений центр.`,
        ],
        bodyEn: [
            `The test results consist of six dimensions: Visual, Auditory, Spatial, Tactile, Olfactory, and Gustatory. Each dimension is scored on a scale of 1 to 5, where 1 = complete absence of imagination (Aphantasia) and 5 = extremely vivid imagination (Hyperphantasia).`,
            `For display, we use a radar (petal) chart built in pure SVG — without external chart libraries. Each axis corresponds to one dimension, with points connected by a polygon. For each profile type there is unique color coding.`,
            `Important nuance: the scale is inverted for display. Since aphantasia is "1" (minimum), but the center of the chart is usually associated with "nothing", we display 1 closer to the edge and 5 closer to the center. People with aphantasia see a wide polygon, while people with hyperphantasia see a brightly filled center.`,
        ],
        bodyRu: [
            `Результаты теста состоят из шести измерений: Визуальный, Слуховой, Пространственный, Тактильный, Обонятельный и Вкусовой. Каждое измерение оценивается по шкале от 1 до 5, где 1 = полное отсутствие воображения (Афантазия), а 5 = чрезвычайно яркое воображение (Гиперфантазия).`,
            `Для отображения мы используем радарную (лепестковую) диаграмму, построенную на чистом SVG — без сторонних библиотек для чартов. Каждая ось соответствует одному измерению, точки соединяются полигоном. Для каждого типа профиля есть уникальное цветовое кодирование.`,
            `Важный нюанс: шкала инвертирована для отображения. Поскольку афантазия — это "1" (минимум), но центр диаграммы обычно ассоциируется с "ничем", мы отображаем 1 ближе к краю, а 5 — к центру. Люди с афантазией видят широкий полигон, а люди с гиперфантазией — ярко заполненный центр.`,
        ],
    },
    {
        id: 'roadmap-2026',
        date: '2026-03-01',
        tag: 'Roadmap',
        tagColor: 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/30',
        readMin: 5,
        titleUk: `План розвитку NeuroProfile на 2026 рік`,
        titleEn: `NeuroProfile Roadmap for 2026`,
        titleRu: `План развития NeuroProfile на 2026 год`,
        excerptUk: `Наші плани на майбутнє: від нових когнітивних тестів до глибокої персоналізації рекомендацій.`,
        excerptEn: `Our plans for the future: from new cognitive tests to deep recommendation personalization.`,
        excerptRu: `Наши планы на будущее: от новых когнитивных тестов до глубокой персонализации рекомендаций.`,
        bodyUk: [
            `Цього року ми зосередимось на розширенні спектру досліджень. Окрім афантазії, ми плануємо додати тести на SDAM (Severely Deficient Autobiographical Memory) та прозопагнозію (сліпоту на обличчя), оскільки ці стани часто корелюють між собою.`,
            `Також ми активно працюємо над розділом "Рекомендації". Це не просто тексти, а інтерактивні вправи, розроблені спільно з психологами та нейробіологами, які допоможуть людям з різними типами уяви краще адаптуватись у побуті та роботі.`,
            `Одним із ключових викликів є покращення точності AI-аналізу. Ми тестуємо нові версії Gemini, щоб надати користувачам ще більш релевантні інсайти на основі їхнього унікального сенсорного підпису.`,
        ],
        bodyEn: [
            `This year we will focus on expanding the range of research. In addition to aphantasia, we plan to add tests for SDAM (Severely Deficient Autobiographical Memory) and prosopagnosia (face blindness), as these conditions often correlate.`,
            `We are also actively working on the "Recommendations" section. These are not just texts, but interactive exercises developed jointly with psychologists and neuroscientists to help people with different types of imagination adapt better in everyday life and work.`,
            `A key challenge is improving AI analysis accuracy. We are testing new versions of Gemini to provide users with even more relevant insights based on their unique sensory signature.`,
        ],
        bodyRu: [
            `В этом году мы сосредоточимся на расширении спектра исследований. Помимо афантазии, мы планируем добавить тесты на SDAM (Severely Deficient Autobiographical Memory) и прозопагнозию (лицевую слепоту), так как эти состояния часто коррелируют между собой.`,
            `Также мы активно работаем над разделом «Рекомендации». Это не просто тексты, а интерактивные упражнения, разработанные совместно с психологами и нейробиологами, которые помогут людям с разными типами воображения лучше адаптироваться в быту и работе.`,
            `Одним из ключевых вызовов является улучшение точности AI-анализа. Мы тестируем новые версии Gemini, чтобы предоставить пользователям еще более релевантные инсайты на основе их уникальной сенсорной подписи.`,
        ],
    },
];
/* eslint-enable max-len */

const ArticleCard: React.FC<{ article: Article; language: Language; onClick: () => void }> = ({ article, language, onClick }) => {
    const title = language === 'uk' ? article.titleUk : language === 'ru' ? article.titleRu : article.titleEn;
    const excerpt = language === 'uk' ? article.excerptUk : language === 'ru' ? article.excerptRu : article.excerptEn;
    const dateStr = new Date(article.date).toLocaleDateString(
        language === 'uk' ? 'uk-UA' : language === 'ru' ? 'ru-RU' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
    );

    return (
        <article
            onClick={onClick}
            className="group bg-brand-paper-accent border border-stone-line rounded-[2rem] p-7 shadow-sm hover:shadow-soft hover:border-brand-ink/20 transition-all cursor-pointer flex flex-col gap-4"
        >
            <div className="flex items-center justify-between gap-3">
                <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${article.tagColor}`}>
                    <Tag className="w-2.5 h-2.5 inline-block mr-1" />{article.tag}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                    <Clock className="w-3 h-3" />{article.readMin} min
                </span>
            </div>

            <div>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-2">{dateStr}</p>
                <h2 className="text-lg font-serif font-bold text-brand-graphite leading-snug mb-2 group-hover:text-brand-ink transition-colors">
                    {title}
                </h2>
                <p className="text-sm text-stone-500 leading-relaxed font-sans line-clamp-2">{excerpt}</p>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-stone-400 group-hover:text-brand-ink transition-colors mt-auto pt-3 border-t border-stone-line">
                {language === 'uk' ? 'Читати далі' : language === 'ru' ? 'Читать дальше' : 'Read more'}
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
        </article>
    );
};

const ArticleView: React.FC<{ article: Article; language: Language; onBack: () => void }> = ({ article, language, onBack }) => {
    const title = language === 'uk' ? article.titleUk : language === 'ru' ? article.titleRu : article.titleEn;
    const body = language === 'uk' ? article.bodyUk : language === 'ru' ? article.bodyRu : article.bodyEn;
    const dateStr = new Date(article.date).toLocaleDateString(
        language === 'uk' ? 'uk-UA' : language === 'ru' ? 'ru-RU' : 'en-US',
        { year: 'numeric', month: 'long', day: 'numeric' }
    );

    return (
        <div className="animate-fade-in max-w-2xl">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-stone-400 hover:text-brand-ink transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">
                    {language === 'uk' ? 'До новин' : language === 'ru' ? 'К новостям' : 'Back to news'}
                </span>
            </button>

            <header className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className={`text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full border ${article.tagColor}`}>
                        {article.tag}
                    </span>
                    <span className="text-[10px] text-stone-400 font-medium">{dateStr}</span>
                    <span className="flex items-center gap-1 text-[10px] text-stone-400 font-medium">
                        <Clock className="w-3 h-3" />{article.readMin} min
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-graphite leading-tight tracking-tight">
                    {title}
                </h1>
            </header>

            <div className="space-y-5">
                {body.map((para, i) => (
                    <p key={i} className="text-[15px] text-stone-600 dark:text-stone-400 leading-relaxed font-sans">
                        {para}
                    </p>
                ))}
            </div>
        </div>
    );
};

export const NewsPage: React.FC<NewsPageProps> = ({ ui, language, userEmail }) => {
    const navigate = useNavigate();
    const [activeArticle, setActiveArticle] = useState<Article | null>(null);

    const articleTitle = activeArticle
        ? (language === 'uk' ? activeArticle.titleUk : language === 'ru' ? activeArticle.titleRu : activeArticle.titleEn)
        : undefined;
    
    useSeoMetadata({
        title: articleTitle ? `${articleTitle} | News` : `${ui.navNews} — Latest Updates & Research`,
        description: activeArticle 
            ? (language === 'uk' ? activeArticle.excerptUk : language === 'ru' ? activeArticle.excerptRu : activeArticle.excerptEn)
            : (language === 'uk' 
                ? 'Новини та оновлення проєкту NeuroProfile. Дізнайтесь про нові функції AI-аналізу та дослідження афантазії.' 
                : language === 'ru' 
                    ? 'Новости и обновления проекта NeuroProfile. Узнайте о новых функциях AI-анализа и исследованиях афантазии.' 
                    : 'News and updates from the NeuroProfile project. Learn about new AI analysis features and aphantasia research.'),
        canonical: activeArticle ? `/news?id=${activeArticle.id}` : '/news'
    });

    if (activeArticle) {
        return (
            <div className="animate-fade-in pb-20">
                <ArticleView
                    article={activeArticle}
                    language={language}
                    onBack={() => setActiveArticle(null)}
                />
            </div>
        );
    }

    return (
        <div className="animate-fade-in text-left pb-20">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-stone-400 hover:text-brand-ink transition-colors mb-8 group"
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">{ui.back}</span>
            </button>

            <header className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-ink/5 text-brand-graphite rounded-full text-[9px] font-bold tracking-[0.2em] uppercase mb-6 border border-brand-ink/10">
                    <Newspaper className="w-3 h-3" />
                    NeuroProfile
                </div>
                <h1 className="text-4xl md:text-5xl font-serif font-bold text-brand-graphite leading-tight mb-3 tracking-tight">
                    {ui.navNews}
                </h1>
                <p className="text-stone-500 text-base leading-relaxed max-w-xl font-sans">
                    {language === 'uk'
                        ? 'Нові функції, технічні деталі та думки про розвиток проєкту.'
                        : language === 'ru'
                            ? 'Новые функции, технические детали и размышления о развитии проекта.'
                            : "New features, technical details, and thoughts on the project's development."}
                </p>
            </header>

            <div className="grid sm:grid-cols-2 gap-6">
                {ARTICLES.map((article) => (
                    <ArticleCard
                        key={article.id}
                        article={article}
                        language={language}
                        onClick={() => setActiveArticle(article)}
                    />
                ))}
            </div>

            {/* Newsletter subscribe block */}
            <div className="mt-12 bg-brand-paper-accent border border-stone-line rounded-[2rem] p-8 shadow-sm">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-11 h-11 rounded-2xl bg-brand-ink/5 border border-brand-ink/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-brand-ink" />
                    </div>
                    <div>
                        <h2 className="text-base font-serif font-bold text-brand-graphite mb-1">{ui.subscribeTitle}</h2>
                        <p className="text-sm text-stone-500 font-sans">{ui.subscribeSubtitle}</p>
                    </div>
                </div>
                <NewsletterSubscribe
                    ui={ui}
                    defaultEmail={userEmail ?? ''}
                    source="news_page"
                />
            </div>
        </div>
    );
};
