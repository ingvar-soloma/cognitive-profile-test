import { SurveyDefinition } from './types';
import { APHANTASIA_CATEGORIES } from './db/aphantasia_test';
import { PERSONALITY_CATEGORIES } from './db/personality_test';
import { DEMO_CATEGORIES } from './db/demo_test';
import { PERFECTIONISM_CATEGORIES } from './db/perfectionism_test';
import { YSQ_CATEGORIES } from './db/ysq_test';

export const SURVEY_DATA = [...APHANTASIA_CATEGORIES, ...PERSONALITY_CATEGORIES, ...DEMO_CATEGORIES, ...PERFECTIONISM_CATEGORIES];

export const AVAILABLE_SURVEYS: SurveyDefinition[] = [
  {
    id: 'express_demo',
    aiEnabled: true,
    title: {
      uk: 'Експрес-діагностика (2 хв)',
      en: 'Express Diagnostics (2 min)',
      ru: 'Экспресс-диагностика (2 мин)'
    },
    description: {
      uk: 'Швидкий погляд на вашу уяву. Ідеально, якщо ви вперше на сайті.',
      en: 'A quick look at your imagination. Perfect for first-time visitors.',
      ru: 'Быстрый взгляд на ваше воображение. Идеально, если вы впервые на сайте.'
    },
    categories: [...DEMO_CATEGORIES],
    scaleConfig: {
      min: 1,
      max: 5,
      labels: {
        1: { uk: "Повна відсутність", en: "Total absence", ru: "Полное отсутствие" },
        2: { uk: "Слабко", en: "Weak", ru: "Слабо" },
        3: { uk: "Середньо", en: "Moderate", ru: "Средне" },
        4: { uk: "Чітко", en: "Clear", ru: "Четко" },
        5: { uk: "Максимально", en: "Vivid", ru: "Максимально" }
      }
    }
  },
  {
    id: 'full_aphantasia_profile',
    aiEnabled: true,
    title: {
      uk: 'Повний Когнітивний Профіль',
      en: 'Full Cognitive Profile',
      ru: 'Полный Когнитивный Профиль'
    },
    description: {
      uk: 'Детальний аналіз сенсорної уяви, процесів мислення та стратегій пам\'яті.',
      en: 'Detailed analysis of sensory imagination, thinking processes, and memory strategies.',
      ru: 'Детальный анализ сенсорного воображения, процессов мышления и стратегий памяти.'
    },
    categories: [...APHANTASIA_CATEGORIES],
    scaleConfig: {
      min: 1,
      max: 5,
      labels: {
        1: { uk: "Повна відсутність (Афантазія)", en: "Total absence (Aphantasia)", ru: "Полное отсутствие (Афантазия)" },
        2: { uk: "Дуже слабко / фрагментарно", en: "Very weak / Fragmented", ru: "Очень слабо / Фрагментарно" },
        3: { uk: "Нечітко / Силует", en: "Vague / Silhouette", ru: "Нечетко / Силуэт" },
        4: { uk: "Досить чітко", en: "Quite clear", ru: "Довольно четко" },
        5: { uk: "Як реальність (Гіперфантазія)", en: "Realistic (Hyperphantasia)", ru: "Как реальность (Гиперфантазия)" }
      }
    }
  },
  {
    id: 'sensory_only',
    aiEnabled: false,
    parentId: 'full_aphantasia_profile',
    title: {
      uk: '↳ Тільки Сенсорна Уява',
      en: '↳ Sensory Imagination Only',
      ru: '↳ Только Сенсорное Воображение'
    },
    description: {
      uk: 'Скорочений тест, що фокусується лише на візуальних, аудіальних та інших відчуттях.',
      en: 'Shortened test focusing only on visual, auditory, and other sensations.',
      ru: 'Сокращенный тест, фокусирующийся только на визуальных, аудиальных и других ощущениях.'
    },
    categories: [APHANTASIA_CATEGORIES[0]],
    scaleConfig: {
      min: 1,
      max: 5,
      labels: {
        1: { uk: "Повна відсутність (Афантазія)", en: "Total absence (Aphantasia)", ru: "Полное отсутствие (Афантазия)" },
        2: { uk: "Дуже слабко / фрагментарно", en: "Very weak / Fragmented", ru: "Очень слабо / Фрагментарно" },
        3: { uk: "Нечітко / Силует", en: "Vague / Silhouette", ru: "Нечетко / Силуэт" },
        4: { uk: "Досить чітко", en: "Quite clear", ru: "Довольно четко" },
        5: { uk: "Як реальність (Гіперфантазія)", en: "Realistic (Hyperphantasia)", ru: "Как реальность (Гиперфантазия)" }
      }
    }
  },
  {
    id: 'processes_only',
    aiEnabled: false,
    parentId: 'full_aphantasia_profile',
    title: {
      uk: '↳ Тільки Процеси Уяви',
      en: '↳ Imagination Processes Only',
      ru: '↳ Только Процессы Воображения'
    },
    description: {
      uk: 'Як саме ваш мозок конструює образи та думки.',
      en: 'How exactly your brain constructs images and thoughts.',
      ru: 'Как именно ваш мозок конструирует образы и мысли.'
    },
    categories: [APHANTASIA_CATEGORIES[1]],
    scaleConfig: {
      min: 1,
      max: 5,
      labels: {
        1: { uk: "Повна відсутність (Афантазія)", en: "Total absence (Aphantasia)", ru: "Полное отсутствие (Афантазия)" },
        2: { uk: "Дуже слабко / фрагментарно", en: "Very weak / Fragmented", ru: "Очень слабо / Фрагментарно" },
        3: { uk: "Нечітко / Силует", en: "Vague / Silhouette", ru: "Нечетко / Силуэт" },
        4: { uk: "Досить чітко", en: "Quite clear", ru: "Довольно четко" },
        5: { uk: "Як реальність (Гіперфантазія)", en: "Realistic (Hyperphantasia)", ru: "Как реальность (Гиперфантазия)" }
      }
    }
  },
  {
    id: 'strategies_only',
    aiEnabled: false,
    parentId: 'full_aphantasia_profile',
    title: {
      uk: '↳ Тільки Стратегії та Пам\'ять',
      en: '↳ Strategies and Memory Only',
      ru: '↳ Только Стратегии и Память'
    },
    description: {
      uk: 'Аналіз стилю мислення, пам\'яті та соціальної взаємодії.',
      en: 'Analysis of thinking style, memory, and social interaction.',
      ru: 'Анализ стиля мышления, памяти и социального взаимодействия.'
    },
    categories: [APHANTASIA_CATEGORIES[2]],
    scaleConfig: {
      min: 1,
      max: 5,
      labels: {
        1: { uk: "Повна відсутність (Афантазія)", en: "Total absence (Aphantasia)", ru: "Полное отсутствие (Афантазия)" },
        2: { uk: "Дуже слабко / фрагментарно", en: "Very weak / Fragmented", ru: "Очень слабо / Фрагментарно" },
        3: { uk: "Нечітко / Силует", en: "Vague / Silhouette", ru: "Нечетко / Силуэт" },
        4: { uk: "Досить чітко", en: "Quite clear", ru: "Довольно четко" },
        5: { uk: "Як реальність (Гіперфантазія)", en: "Realistic (Hyperphantasia)", ru: "Как реальность (Гиперфантазия)" }
      }
    }
  },
  {
    id: 'personality_mbti',
    disabled: true,
    aiEnabled: false,
    title: {
      uk: 'Особистісний профіль (MBTI-стиль)',
      en: 'Personality Profile (MBTI-style)',
      ru: 'Личностный профиль (MBTI-стиль)'
    },
    description: {
      uk: 'Окремий тест для визначення вашого стилю спілкування, роботи та прийняття рішень.',
      en: 'A separate test to determine your communication style, work, and decision-making.',
      ru: 'Отдельный тест для определения вашего стиля общения, работы и принятия решений.'
    },
    categories: [...PERSONALITY_CATEGORIES],
    scaleConfig: {
      min: 1,
      max: 5,
      labels: {
        1: { uk: "Зовсім не згоден", en: "Strongly Disagree", ru: "Совсем не согласен" },
        2: { uk: "Не згоден", en: "Disagree", ru: "Не согласен" },
        3: { uk: "Нейтрально", en: "Neutral", ru: "Нейтрально" },
        4: { uk: "Згоден", en: "Agree", ru: "Согласен" },
        5: { uk: "Цілком згоден", en: "Strongly Agree", ru: "Полностью согласен" }
      }
    }
  },
  {
    id: 'perfectionism_big_three',
    aiEnabled: true,
    title: {
      uk: 'Велика тривимірна шкала перфекціонізму',
      en: 'Big Three Perfectionism Scale',
      ru: 'Большая трехмерная шкала перфекционизма'
    },
    description: {
      uk: 'Оцінка жорсткого, соціально зумовленого та нарцисичного перфекціонізму за М. Смітом та колегами.',
      en: 'Assessment of rigid, socially prescribed, and narcissistic perfectionism by M. Smith and colleagues.',
      ru: 'Оценка жесткого, социально обусловленного и нарциссического перфекционизма по М. Смиту и коллегам.'
    },
    categories: [...PERFECTIONISM_CATEGORIES],
    scaleConfig: {
      min: 1,
      max: 5,
      labels: {
        1: { uk: "Повністю не погоджуюся", en: "Strongly Disagree", ru: "Полностью не согласен" },
        2: { uk: "Частково не погоджуюся", en: "Partially Disagree", ru: "Частично не согласен" },
        3: { uk: "Важко визначитися", en: "Hard to Decide", ru: "Трудно определиться" },
        4: { uk: "Частково погоджуюся", en: "Partially Agree", ru: "Частично согласен" },
        5: { uk: "Повністю погоджуюся", en: "Strongly Agree", ru: "Полностью согласен" }
      }
    }
  },
  {
    id: 'ysq_s3',
    aiEnabled: true,
    title: {
      uk: 'YSQ – S3',
      en: 'YSQ – S3',
      ru: 'YSQ – S3'
    },
    description: {
      uk: 'Інструкція: Нижче наводяться твердження, які Ви можете використати для опису себе. Будь ласка, прочитайте кожне твердження і оцініть його на основі того, наскільки точно воно відповідає Вам протягом минулого року. Якщо Ви невпевнені щодо найкращого варіанту відповіді, то нехай Ваша відповідь буде ближча до того, що Ви емоційно, аніж раціонально, відчуваєте є більш правдивим.\n\nКілька пунктів стосуються Ваших відносин з батьками або Ваших романтичних стосунків. Якщо будь-хто з цих людей помер, будь ласка, оцініть ці пункти на основі того, якими були Ваші стосунки, коли ці люди були живі. Якщо в даний момент у Вас немає партнера (романтичних стосунків), але в минулому вони у Вас були, будь ласка, оцініть відповідні пункти на основі Ваших нещодавніх, найбільш важливих для Вас стосунків.\n\nЗ поданої нижче шкали виберіть найбільш відповідну оцінку по шкалі від 1 до 6, яка найкраще Вас описує.',
      en: 'Instruction: Below are statements that you can use to describe yourself. Please read each statement and rate it based on how accurately it has applied to you over the past year. If you are unsure about the best answer, let your response be closer to what you feel emotionally rather than rationally.\n\nSeveral items concern your relationship with your parents or your romantic relationships. If any of these people have passed away, please rate these items based on what your relationship was like when they were alive. If you currently do not have a partner (romantic relationship) but have had them in the past, please rate the relevant items based on your most recent and most important relations.\n\nChoose the most appropriate rating on a scale from 1 to 6 that best describes you.',
      ru: 'Инструкция: Ниже приводятся утверждения, которые Вы можете использовать для описания себя. Пожалуйста, прочитайте каждое утверждение и оцените его на основе того, насколько точно оно соответствует Вам в течение прошлого года. Если Вы неуверенны относительно лучшего варианта ответа, то пусть Ваш ответ будет ближе к тому, что Вы эмоционально, а не рационально, чувствуете является более правдивым.\n\nНесколько пунктов касаются Ваших отношений с родителями или Ваших романтических отношений. Если кто-либо из этих людей умер, пожалуйста, оцените эти пункты на основе того, какими были Ваши отношения, когда эти люди были живы. Если в данный момент у Вас нет партнера (романтических отношений), но в прошлом они у Вас были, пожалуйста, оцените соответствующие пункты на основ Ваших недавних, наиболее важных для Вас отношений.\n\nИз представленной ниже шкалы выберите наиболее подходящую оценку по шкале от 1 до 6, которая лучше всего Вас описывает.'
    },
    categories: [...YSQ_CATEGORIES],
    scaleConfig: {
      min: 1,
      max: 6,
      labels: {
        1: { uk: "абсолютно не відповідає мені", en: "totally untrue of me", ru: "совершенно не обо мне" },
        2: { uk: "в основному не відповідає мені", en: "mostly untrue of me", ru: "в основном не обо мне" },
        3: { uk: "більше вірно, ніж невірно", en: "slightly more true than untrue", ru: "скорее верно, чем неверно" },
        4: { uk: "в міру відповідає мені", en: "moderately true of me", ru: "в меру обо мне" },
        5: { uk: "переважно відповідає мені", en: "mostly true of me", ru: "в основном обо мне" },
        6: { uk: "досконало описує мене", en: "describes me perfectly", ru: "совершенно точно обо мне" }
      }
    }
  }
];