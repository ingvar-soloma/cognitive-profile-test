import logging
import asyncpg
from datetime import date

logger = logging.getLogger(__name__)

async def seed_badges(conn: asyncpg.Connection):
    badges = [
        ("founding_member", "Founding Member", "✨", "Recognized as an early contributor who shaped the project's foundation during the initial beta phase.", True, False),
        ("3_sigma_outlier", "3-Sigma Outlier", "📊", "For exceptional cognitive architecture significantly deviating from the mean.", True, False),
        ("ux_pioneer", "UX Pioneer", "🎨", "For helping fix critical mobile UI issues.", True, False),
        ("early_adopter", "Early Adopter", "🚀", "Joined during the initial launch phase of the project.", True, False),
        ("bug_hunter", "Bug Hunter", "🐛", "For reporting critical bugs that were fixed.", True, False),
        ("neurodiversity_advocate", "Neurodiversity Advocate", "🧠", "For contributing to the understanding of cognitive diversity.", True, False),
        ("node_expander", "Node Expander", "📍", "Successfully referred 3 new participants to the cognitive assessment.", True, False)
    ]
    
    try:
        await conn.executemany('''
            INSERT INTO badges (code, name, icon, description, is_active, is_secret)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (code) DO UPDATE SET
                name = EXCLUDED.name,
                icon = EXCLUDED.icon,
                description = EXCLUDED.description
        ''', badges)
        logger.info("Badges seeded successfully")
    except Exception as e:
        logger.error(f"Failed to seed badges: {e}")

async def seed_feature_flags(conn: asyncpg.Connection):
    flags = [
        ("share", "Social Sharing", "Enable/Disable profile sharing and referral links.", True),
        ("multi_survey", "Multi-Survey Management", "Allow users to take multiple tests and manage them in dashboard.", False),
        ("ai_streaming", "AI Analysis Streaming", "Enable real-time streaming of Gemini analysis results.", True),
        ("survey_express_demo", "Express Diagnostics (AI)", "Enable/Disable express diagnostics test and AI analysis.", True),
        ("survey_full_aphantasia_profile", "Full Cognitive Profile (AI)", "Enable/Disable full profile test and AI analysis.", True),
        ("survey_perfectionism_big_three", "Perfectionism Scale (AI)", "Enable/Disable perfectionism test and AI analysis.", True),
        ("survey_ysq_s3", "YSQ – S3 Schema Questionnaire (AI)", "Enable/Disable YSQ test and AI analysis.", True)
    ]
    
    try:
        await conn.executemany('''
            INSERT INTO feature_flags (code, name, description, is_enabled)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (code) DO NOTHING
        ''', flags)
        logger.info("Feature flags seeded successfully")
    except Exception as e:
        logger.error(f"Failed to seed feature flags: {e}")

async def seed_news(conn: asyncpg.Connection):
    news = [
        (
            'privacy-uuid-sharing', date(2026, 3, 20), 'Privacy', 
            'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30',
            3,
            'Від анонімності до безпеки: Нова система UUID-посилань',
            'From Anonymity to Security: The New UUID Sharing System',
            'От анонимности к безопасности: Новая система UUID-ссылок',
            'Ми відмовилися від використання ідентифікаторів соцмереж у публічних посиланнях на користь унікальних UUID.',
            'We have moved away from using social media identifiers in public links in favor of unique UUIDs.',
            'Мы отказались от использования идентификаторов соцсетей в публичных ссылках в пользу уникальных UUID.',
            [
                'Твій когнітивний профіль — це твоя приватна територія. Раніше, коли ви ділилися результатами, посилання містило ваш внутрішній ідентифікатор Google (наприклад, g_12345...). Хоча це було технічно просто, ми вирішили, що це недостатньо приватно.',
                'Що змінилося: Тепер для кожного поширення генерується унікальний UUID — довгий набір випадкових символів, який не має жодного зв’язку з вашим профілем Google або особистими даними. Це означає, що ніхто не зможе дізнатися ваш ID, аналізуючи URL посилання.',
                'Крім того, ми впровадили налаштування видимості. Тепер ви можете в будь-який момент зробити свій профіль приватним, навіть якщо посилання вже було опубліковано — доступ просто закриється.',
                'Технічно: Ми додали нову таблицю в базу даних для керування "токенами поширення" (share tags). Кожен такий таг прив’язаний до конкретного результату, але не містить жодної персональної інформації про власника.'
            ],
            [
                'Your cognitive profile is your private territory. Previously, when you shared results, the link contained your internal Google identifier (e.g., g_12345...). While technically simple, we decided this wasn’t private enough.',
                'What’s changed: Now, each share generates a unique UUID — a long string of random characters that has no link to your Google profile or personal information. This means no one can find out your ID by analyzing the link URL.',
                'Additionally, we’ve implemented visibility settings. You can now make your profile private at any time, even if the link has already been published — access will simply be revoked.',
                'Technically: We added a new table to the database to manage "share tags." Each tag is linked to a specific result but contains no personal information about the owner.'
            ],
            [
                'Твой когнитивный профиль — это твоя частная территория. Раньше, когда вы делились результатами, ссылка содержала ваш внутренний идентификатор Google (например, g_12345...). Хотя это было технично просто, мы решили, что это недостаточно приватно.',
                'Что изменилось: Теперь для каждого шеринга генерируется уникальный UUID — длинный набор случайных символов, который не имеет никакой связи с вашим профилем Google или личными данными. Это означает, что никто не сможет узнать ваш ID, анализируя URL ссылки.',
                'Кроме того, мы внедрили настройки видимости. Теперь вы можете в любой момент сделать свой профиль приватным, даже если ссылка уже была опубликована — доступ просто закроется.',
                'Технически: Мы добавили новую таблицу в базу данных для управления "токенами шеринга" (share tags). Каждый такой таг привязан к конкретному результату, но не содержит никакой персональной информации о владельце.'
            ]
        ),
        (
            'streaming-analysis', date(2026, 3, 15), 'Feature',
            'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800/30',
            3,
            'AI-аналіз тепер потоковий — результати з\'являються в реальному часі',
            'AI Analysis is now streaming — results appear in real time',
            'AI-анализ теперь потоковый — результаты появляются в режиме реального времени',
            'Ми оновили систему генерації AI-аналізу. Тепер замість очікування — текст з\'являється по мірі генерації.',
            'We updated the AI analysis generation system. Now instead of waiting — text appears as it is generated.',
            'Мы обновили систему генерации AI-анализа. Теперь вместо ожидания — текст появляется по мере генерации.',
            [
                'До оновлення користувачі чекали до 30 секунд на повну відповідь від AI. Це погіршувало досвід, особливо при повільному інтернет-з\'єднанні. Тепер ми впровадили Server-Sent Events (SSE) — стандартний механізм потокової передачі даних.',
                'Як це працює: після завершення тесту ваш профіль передається до Gemini API (Google). Відповідь надходить не єдиним блоком — кожен фрагмент тексту відразу відображається на екрані. Ви бачите, як AI буквально "думає" вголос.',
                'Завдяки цьому сприйняте очікування скорочується з ~15 секунд до миттєвої реакції. Навіть якщо повна генерація займає той самий час, психологічно це набагато комфортніше.',
                'Технічно: бекенд (FastAPI + Python) використовує generate_content_async із Gemini SDK з ітерацією по частинах відповіді. Фронтенд (React) оновлює стан рядково, запобігаючи зайвим перерендерингам через useRef.'
            ],
            [
                'Before this update, users waited up to 30 seconds for a full AI response. This degraded the experience, especially on slow connections. We have now implemented Server-Sent Events (SSE) — a standard streaming data transfer mechanism.',
                'How it works: after completing the test, your profile is sent to the Gemini API (Google). The response does not arrive as a single block — each fragment of text is displayed on screen immediately. You see the AI literally "thinking out loud".',
                'This reduces perceived waiting time from ~15 seconds to an instant response. Even if the full generation takes the same amount of time, it is psychologically far more comfortable.',
                'Technically: the backend (FastAPI + Python) uses generate_content_async from the Gemini SDK, iterating over response chunks. The frontend (React) updates state line by line, preventing unnecessary re-renders via useRef.'
            ],
            [
                'До этого обновления пользователи ждали до 30 секунд полного ответа от AI. Это ухудшало опыт, особенно при медленном интернет-соединении. Теперь мы внедрили Server-Sent Events (SSE) — стандартный механизм потоковой передачи данных.',
                'Как это работает: после завершения теста ваш профиль передаётся в Gemini API (Google). Ответ поступает не единым блоком — каждый фрагмент текста сразу отображается на экране. Вы видите, как AI буквально «думает» вслух.',
                'Благодаря этому воспринимаемое ожидание сокращается с ~15 секунд до мгновенной реакции. Даже если полная генерация занимает то же время, психологически это намного комфортнее.',
                'Технически: бэкенд (FastAPI + Python) использует generate_content_async из Gemini SDK с итерацией по частям ответа. Фронтенд (React) обновляет состояние построчно, предотвращая лишние перерендеринги через useRef.'
            ]
        ),
        (
            'google-auth', date(2026, 3, 14), 'Security',
            'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800/30',
            4,
            'Google авторизація: чому ми перейшли з Telegram на OAuth 2.0',
            'Google Authorization: why we switched from Telegram to OAuth 2.0',
            'Google-авторизация: почему мы перешли с Telegram на OAuth 2.0',
            'Детальний розбір нашої системи аутентифікації — від Telegram Login до власного бекенд-обміну токенами з Google.',
            'A detailed breakdown of our authentication system — from Telegram Login to our own backend token exchange with Google.',
            'Детальный разбор нашей системы аутентификации — от Telegram Login до собственного бэкенд-обмена по логам с Google.',
            [
                'Спочатку NeuroProfile використовував Telegram Login Widget для аутентифікації. Це було зручно, але вимагало від користувачів мати акаунт Telegram та дозволяти доступ до нього. Крім того, верифікація підписів Telegram на бекенді іноді давала збої через часові мітки.',
                'Ми перейшли на Google OAuth 2.0 з кількох причин: більше охоплення (майже кожен має Google-акаунт), надійніший стандарт, краща підтримка з боку бібліотек. Ми використовуємо @react-oauth/google на фронті та google-auth-library на бекенді.',
                'Ключовий момент безпеки: ми не зберігаємо Google access token. Натомість, калі фронтенд отримує Google credential (JWT), він надсилає його на наш бекенд /api/auth/google/exchange. Там ми верифікуємо JWT через Google API та повертаємо власний внутрішній токен з полями user_id, hash, first_name тощо.',
                'Цей внутрішній токен зберігається в localStorage та використовується для всіх подальших запитів до API. Hash виступає "підписом" — він дозволяє бекенду верифікувати запити без збереження сесій на сервері (stateless).'
            ],
            [
                'Originally, NeuroProfile used the Telegram Login Widget for authentication. This was convenient but required users to have a Telegram account and grant it access. Additionally, Telegram signature verification on the backend sometimes failed due to timestamp issues.',
                'We switched to Google OAuth 2.0 for several reasons: broader reach (almost everyone has a Google account), a more reliable standard, and better library support. We use @react-oauth/google on the frontend and google-auth-library on the backend.',
                'The key security point: we do not store the Google access token. Instead, when the frontend receives the Google credential (JWT), it sends it to our backend at /api/auth/google/exchange. There we verify the JWT via the Google API and return our own internal token with fields like user_id, hash, first_name, etc.',
                'This internal token is stored in localStorage and used for all subsequent API requests. The hash acts as a "signature" — allowing the backend to verify requests without storing sessions server-side (stateless).'
            ],
            [
                'Изначально NeuroProfile использовал Telegram Login Widget для аутентификации. Это было удобно, но требовало от пользователей наличия аккаунта Telegram и разрешения доступа к нему. Кроме того, верификация подписей Telegram на бэкенде иногда давала сбои из-за временных меток.',
                'Мы перешли на Google OAuth 2.0 по нескольким причинам: больший охват (у почти каждого есть Google-аккаунт), более надёжный стандарт, лучшая поддержка со стороны библиотек. Мы используем @react-oauth/google на фронтенде и google-auth-library на бэкенде.',
                'Ключевой момент безопасности: мы не храним Google access token. Вместо этого, когда фронтенд получает Google credential (JWT), он отправляет его на наш бэкенд /api/auth/google/exchange. Там мы верифицируем JWT через Google API и возвращаем собственный внутренний токен с полями user_id, hash, first_name и т.д.',
                'Этот внутренний токен хранится в localStorage и используется для всех последующих записей к API. Hash выступает "подписью" — он позволяет бэкенду верифицировать запросы без хранения сессий на сервере (stateless).'
            ]
        ),
        (
            'multilang', date(2026, 3, 12), 'i18n',
            'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800/30',
            2,
            'Три мови та динамічна локалізація AI-аналізу',
            'Three languages and dynamic AI analysis localization',
            'Три языка и динамическая локализация AI-анализа',
            'NeuroProfile тепер повністю доступний українською, англійською та російською — включаючи AI-аналіз.',
            'NeuroProfile is now fully available in Ukrainian, English, and Russian — including AI analysis.',
            'NeuroProfile теперь полностью доступен на украинском, английском и русском — включая AI-анализ.',
            [
                'Ми визначаємо мову автоматично через navigator.language при першому відвідуванні. Але ключовий момент — всі переклади зберігаються в translations.ts у вигляді типізованого об\'єкта UIStrings. Це унеможливлює забути переклад для нового ключа.',
                'Найцікавіше — локалізація AI-аналізу. Перед генерацією ми показуємо модальне вікно підтвердження, яке повідомляє користувача: "Ваш аналіз буде згенеровано мовою: Українська. Бажаєте змінити мову?" Це запобігає ситуації, коли людина змінила мову інтерфейсу, але аналіз уже згенерований іншою мовою.',
                'Технічно ми передаємо вибрану мову у запиті до бекенду, де вона вбудовується в системний промпт для Gemini. Промпт явно вказує мову відповіді, що дає стабільніші результати, ніж автодетекція.'
            ],
            [
                'We auto-detect the language via navigator.language on the first visit. But the key point is that all translations are stored in translations.ts as a typed UIStrings object. This makes it impossible to forget a translation for a new key.',
                'The most interesting part is AI analysis localization. Before generation, we show a confirmation modal informing the user: "Your analysis will be generated in: English. Would you like to change the language?" This prevents the situation where a user changed the interface language but the analysis was already generated in a different language.',
                'Technically, we pass the selected language in the request to the backend, where it is embedded in the system prompt for Gemini. The prompt explicitly states the response language, which gives more stable results than auto-detection.'
            ],
            [
                'Мы определяем язык автоматически через navigator.language при первом посещении. Но ключевой момент — все переводы хранятся в translations.ts в виде типизированного объекта UIStrings. Это исключает возможность забыть перевод для нового ключа.',
                'Самое интересное — локализация AI-анализа. Перед генерацией мы показываем модальное окно подтверждения, которое сообщает пользователю: "Ваш анализ будет сгенерирован на языке: Русский. Хотите изменить язык?" Это предотвращает ситуацию, когда человек сменил язык интерфейса, но анализ уже сгенерирован на другом языке.',
                'Технически мы передаём выбранный язык в запросе к бэкенду, где он встраивается в системный промпт для Gemini. Промпт явно указывает язык ответа, что даёт более стабильные результаты, чем авто-детекция.'
            ]
        ),
        (
            'sensory-map', date(2026, 3, 10), 'UX',
            'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800/30',
            3,
            'Сенсорна карта: як ми візуалізуємо когнітивний профіль',
            'Sensory Map: how we visualize the cognitive profile',
            'Сенсорная карта: как мы визуализируем когнитивный профиль',
            'Пелюсткова діаграма, що відображає шість вимірів вашої уяви — від Візуального до Смакового.',
            'A petal chart displaying six dimensions of your imagination — from Visual to Gustatory.',
            'Лепестковая диаграмма, отображающая шесть измерений вашего воображения — от Визуального до Вкусового.',
            [
                'Результати тесту складаються з шести вимірів: Візуальний, Слуховий, Просторовий, Тактильний, Нюховий та Смаковий. Кожен вимір оцінюється за шкалою від 1 до 5, де 1 = повна відсутність уяви (Афантазія), а 5 = надзвичайно яскрава уява (Гіперфантазія).',
                'Для відображення ми використовуємо радарну (пелюсткову) діаграму, побудовану на чистому SVG — без зовнішніх бібліотек для чартів. Кожна вісь відповідає одному виміру, точки з\'єднуються полігоном. Для кожного типу профілю є унікальне кольорове кодування.',
                'Важливий нюанс: шкала інвертована для відображення. Оскільки афантазія — це "1" (мінімум), але центр діаграми зазвичай асоціюється з "нічого", ми відображаємо 1 ближче до краю, а 5 — до центру. Так люди з афантазією бачать широкий полігон, а люди з гіперфантазією — яскраво заповнений центр.'
            ],
            [
                'The test results consist of six dimensions: Visual, Auditory, Spatial, Tactile, Olfactory, and Gustatory. Each dimension is scored on a scale of 1 to 5, where 1 = complete absence of imagination (Aphantasia) and 5 = extremely vivid imagination (Hyperphantasia).',
                'For display, we use a radar (petal) chart built in pure SVG — without external chart libraries. Each axis corresponds to one dimension, with points connected by a polygon. For each profile type there is unique color coding.',
                'Important nuance: the scale is inverted for display. Since aphantasia is "1" (minimum), but the center of the chart is usually associated with "nothing", we display 1 closer to the edge and 5 closer to the center. People with aphantasia see a wide polygon, while people with hyperphantasia see a brightly filled center.'
            ],
            [
                'Результаты теста состоят из пяти измерений: Визуальный, Слуховой, Пространственный, Тактильный, Обонятельный и Вкусовой. Каждое измерение оценивается по шкале от 1 до 5, где 1 = полное отсутствие воображения (Афантазия), а 5 = чрезвычайно яркое воображение (Гиперфантазия).',
                'Для отображения мы используем радарную (лепестковую) диаграмму, построенную на чистом SVG — без сторонних библиотек для чартов. Каждая ось соответствует одному измерению, точки соединяются полигоном. Для каждого типа профиля есть уникальное цветовое кодирование.',
                'Важный нюанс: шкала инвертирована для отображения. Поскольку афантазия — это "1" (минимум), но центр диаграммы обычно ассоциируется с "ничем", мы отображаем 1 ближе к краю, а 5 — к центру. Люди с афантазией видят широкий полыгон, а люди с гиперфантазией — ярко заполненный центр.'
            ]
        ),
        (
            'roadmap-2026', date(2026, 3, 1), 'Roadmap',
            'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-300 dark:border-rose-800/30',
            5,
            'План розвитку NeuroProfile на 2026 рік',
            'NeuroProfile Roadmap for 2026',
            'План развития NeuroProfile на 2026 год',
            'Наші плани на майбутнє: від нових когнітивних тестів до глибокої персоналізації рекомендацій.',
            'Our plans for the future: from new cognitive tests to deep recommendation personalization.',
            'Наши планы на будущее: от новых когнитивных тестов до глубокой персонализации рекомендаций.',
            [
                'Цього року ми зосередимось на розширенні спектру досліджень. Окрім афантазії, ми плануємо додати тести на SDAM (Severely Deficient Autobiographical Memory) та прозопагнозію (сліпоту на обличчя), оскільки ці стани часто корелюють між собою.',
                'Також ми активно працюємо над розділом "Рекомендації". Це не просто тексти, а інтерактивні вправи, розроблені спільно з психологами та нейробіологами, які допоможуть людям з різними типами уяви краще адаптуватись у побуті та роботі.',
                'Одним із ключових викликів є покращення точності AI-аналізу. Ми тестуємо нові версії Gemini, щоб надати користувачам ще більш релевантні інсайти на основі їхнього унікального сенсорного підпису.'
            ],
            [
                'This year we will focus on expanding the range of research. In addition to aphantasia, we plan to add tests for SDAM (Severely Deficient Autobiographical Memory) and prosopagnosia (face blindness), as these conditions often correlate.',
                'We are also actively working on the "Recommendations" section. These are not just texts, but interactive exercises developed jointly with psychologists and neuroscientists to help people with different types of imagination adapt better in everyday life and work.',
                'A key challenge is improving AI analysis accuracy. We are testing new versions of Gemini to provide users with even more relevant insights based on their unique sensory signature.'
            ],
            [
                'В этом году мы сосредоточимся на расширении спектра исследований. Помимо афантазии, мы планируем добавить тесты на SDAM (Severely Deficient Autobiographical Memory) и прозопагнозию (лицевую слепоту), так как эти состояния часто коррелируют между собой.',
                'Также мы активно работаем над разделом «Рекомендации». Это не просто тексты, а интерактивные упражнения, разработанные совместно с психологами и нейробиологами, которые помогут людям с разными типами воображения лучше адаптироваться в быту и работе.',
                'Одним из ключевых вызовов является улучшение точности AI-анализа. Мы тестируем новые версии Gemini, чтобы предоставить пользователям еще более релевантные инсайты на основе их уникальной сенсорной подписи.'
            ]
        )
    ]
    
    try:
        await conn.executemany('''
            INSERT INTO news (
                id, date, tag, tag_color, read_min, 
                title_uk, title_en, title_ru, 
                excerpt_uk, excerpt_en, excerpt_ru, 
                body_uk, body_en, body_ru
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (id) DO UPDATE SET
                date = EXCLUDED.date,
                tag = EXCLUDED.tag,
                tag_color = EXCLUDED.tag_color,
                read_min = EXCLUDED.read_min,
                title_uk = EXCLUDED.title_uk,
                title_en = EXCLUDED.title_en,
                title_ru = EXCLUDED.title_ru,
                excerpt_uk = EXCLUDED.excerpt_uk,
                excerpt_en = EXCLUDED.excerpt_en,
                excerpt_ru = EXCLUDED.excerpt_ru,
                body_uk = EXCLUDED.body_uk,
                body_en = EXCLUDED.body_en,
                body_ru = EXCLUDED.body_ru
        ''', news)
        logger.info("News seeded successfully")
    except Exception as e:
        logger.error(f"Failed to seed news: {e}")
