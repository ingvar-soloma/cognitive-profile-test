import { SurveyDefinition } from './types';
import { APHANTASIA_CATEGORIES } from './db/aphantasia_test';
import { PERSONALITY_CATEGORIES } from './db/personality_test';
import { DEMO_CATEGORIES } from './db/demo_test';

export const SURVEY_DATA = [...APHANTASIA_CATEGORIES, ...PERSONALITY_CATEGORIES, ...DEMO_CATEGORIES];

export const AVAILABLE_SURVEYS: SurveyDefinition[] = [
  {
    id: 'express_demo',
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
    title: {
      uk: 'Повний Профіль Афантазії',
      en: 'Full Aphantasia Profile',
      ru: 'Полный Профиль Афантазии'
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
    title: {
      uk: '↳ Тільки Процеси Уяви',
      en: '↳ Imagination Processes Only',
      ru: '↳ Только Процессы Воображения'
    },
    description: {
      uk: 'Як саме ваш мозок конструює образи та думки.',
      en: 'How exactly your brain constructs images and thoughts.',
      ru: 'Как именно ваш мозг конструирует образы и мысли.'
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
  }
];