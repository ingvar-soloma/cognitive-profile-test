import { CategoryData, QuestionType } from '../types';

export const APHANTASIA_CATEGORIES: CategoryData[] = [
  {
    id: 'cat1',
    title: {
      uk: 'Категорія 1: Сенсорна Уява',
      en: 'Category 1: Sensory Imagination',
      ru: 'Категория 1: Сенсорное Воображение'
    },
    description: {
      uk: 'Оцініть яскравість образів за шкалою від 1 (Повна відсутність) до 5 (Гіперфантазія).',
      en: 'Rate the vividness of images on a scale from 1 (Total absence) to 5 (Hyperphantasia).',
      ru: 'Оцените яркость образов по шкале от 1 (Полное отсутствие) до 5 (Гиперфантазия).'
    },
    questions: [
      {
        id: '1_A_1',
        category: 'Sensory',
        subCategory: { uk: 'Візуальна', en: 'Visual', ru: 'Визуальная' },
        text: {
          uk: 'Уявіть червоний трикутник. Наскільки чітко Ви його "бачите"?',
          en: 'Imagine a red triangle. How clearly do you "see" it?',
          ru: 'Представьте красный треугольник. Насколько четко вы его "видите"?'
        },
        type: QuestionType.SCALE,
      },
      {
        id: '1_A_2',
        category: 'Sensory',
        subCategory: { uk: 'Візуальна', en: 'Visual', ru: 'Визуальная' },
        text: {
          uk: 'Уявіть обличчя близької людини. Чи бачите Ви його, чи просто знаєте його особливості?',
          en: 'Imagine the face of a loved one. Do you see it, or just know its features?',
          ru: 'Представьте лицо близкого человека. Вы видите его или просто знаете его особенности?'
        },
        type: QuestionType.TEXT,
        placeholder: {
          uk: 'Опишіть ваш досвід...',
          en: 'Describe your experience...',
          ru: 'Опишите ваш опыт...'
        },
      },
      {
        id: '1_A_3',
        category: 'Sensory',
        subCategory: { uk: 'Візуальна', en: 'Visual', ru: 'Визуальная' },
        text: {
          uk: 'Коли Ви читаєте художній опис природи, чи "розгортається" у Вашій голові картина?',
          en: 'When reading a descriptive passage of nature, does a scene "unfold" in your mind?',
          ru: 'Когда вы читаете художественное описание природы, "разворачивается" ли в вашей голове картина?'
        },
        hint: {
          uk: 'Приклад: Ви "бачите" зелений ліс і сонячні промені як у фільмі, чи просто розумієте факт "тут описано ліс" без візуалізації?',
          en: 'Example: Do you "see" a green forest and sunbeams like a movie, or just understand the fact "a forest is described" without visualizing?',
          ru: 'Пример: Вы "видите" зеленый лес и солнечные лучи как в фильме, или просто понимаете факт "здесь описан лес" без визуализации?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Так', en: 'Yes', ru: 'Да' }, value: 'yes' },
          { label: { uk: 'Ні', en: 'No', ru: 'Нет' }, value: 'no' },
          { label: { uk: 'Частково (як схема)', en: 'Partially (like a schema)', ru: 'Частично (как схема)' }, value: 'partial' },
        ],
      },
      {
        id: '1_B_1',
        category: 'Sensory',
        subCategory: { uk: 'Аудіальна', en: 'Auditory', ru: 'Аудиальная' },
        text: {
          uk: 'Уявіть мелодію улюбленої пісні. Наскільки чітко Ви її "чуєте"?',
          en: 'Imagine the melody of your favorite song. How clearly do you "hear" it?',
          ru: 'Представьте мелодию любимой песни. Насколько четко вы ее "слышите"?'
        },
        type: QuestionType.SCALE,
      },
      {
        id: '1_B_2',
        category: 'Sensory',
        subCategory: { uk: 'Аудіальна', en: 'Auditory', ru: 'Аудиальная' },
        text: {
          uk: 'Уявіть голос друга/родича. Ви чуєте його тон чи просто знаєте його тембр?',
          en: 'Imagine the voice of a friend/relative. Do you hear the tone or just know the timbre?',
          ru: 'Представьте голос друга/родственника. Вы слышите его тон или просто знаете его тембр?'
        },
        type: QuestionType.TEXT,
        placeholder: {
          uk: 'Опишіть, чи чуєте ви інтонації...',
          en: 'Describe if you hear intonations...',
          ru: 'Опишите, слышите ли вы интонации...'
        },
      },
      {
        id: '1_B_3',
        category: 'Sensory',
        subCategory: { uk: 'Аудіальна', en: 'Auditory', ru: 'Аудиальная' },
        text: {
          uk: 'Спробуйте уявити звук водоспаду. Наскільки реалістично це звучить?',
          en: 'Try to imagine the sound of a waterfall. How realistic does it sound?',
          ru: 'Попробуйте представить звук водопада. Насколько реалистично это звучит?'
        },
        type: QuestionType.SCALE,
      },
      {
        id: '1_C_1',
        category: 'Sensory',
        subCategory: { uk: 'Тактильна', en: 'Tactile', ru: 'Тактильная' },
        text: {
          uk: 'Уявіть, як гладите кота. Чи відчуваєте Ви його хутро (текстуру, тепло)?',
          en: 'Imagine petting a cat. Do you feel the fur (texture, warmth)?',
          ru: 'Представьте, как гладите кота. Чувствуете ли вы его мех (текстуру, тепло)?'
        },
        type: QuestionType.SCALE,
      },
      {
        id: '1_C_2',
        category: 'Sensory',
        subCategory: { uk: 'Смакова', en: 'Gustatory', ru: 'Вкусовая' },
        text: {
          uk: 'Уявіть смак лимона. Чи відчуваєте Ви кислоту?',
          en: 'Imagine the taste of a lemon. Do you feel the sourness?',
          ru: 'Представьте вкус лимона. Чувствуете ли вы кислоту?'
        },
        type: QuestionType.SCALE,
      },
      {
        id: '1_C_3',
        category: 'Sensory',
        subCategory: { uk: 'Нюхова', en: 'Olfactory', ru: 'Обонятельная' },
        text: {
          uk: 'Уявіть запах скошеної трави. Чи відчуваєте Ви аромат?',
          en: 'Imagine the smell of cut grass. Do you smell the scent?',
          ru: 'Представьте запах скошенной травы. Чувствуете ли вы аромат?'
        },
        type: QuestionType.SCALE,
      },
    ],
  },
  {
    id: 'cat2',
    title: {
      uk: 'Категорія 2: Процеси Уяви',
      en: 'Category 2: Imagination Processes',
      ru: 'Категория 2: Процессы Воображения'
    },
    description: {
      uk: 'Як саме ваш мозок конструює образи та думки.',
      en: 'How exactly your brain constructs images and thoughts.',
      ru: 'Как именно ваш мозг конструирует образы и мысли.'
    },
    questions: [
      {
        id: '2_1',
        category: 'Process',
        subCategory: { uk: 'Конструювання', en: 'Construction', ru: 'Конструирование' },
        text: {
          uk: 'Процес конструювання (Візуальний): Як з\'являється у свідомості складний об\'єкт (наприклад, стілець)?',
          en: 'Construction process (Visual): How does a complex object (e.g., a chair) appear in your mind?',
          ru: 'Процесс конструирования (Визуальный): Как появляется в сознании сложный объект (например, стул)?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Виникає миттєво і цілісно', en: 'Appears instantly and wholly', ru: 'Возникает мгновенно и целостно' }, value: 'instant' },
          { label: { uk: 'Поступово конструюється (по частинах)', en: 'Constructed gradually (part by part)', ru: 'Постепенно конструируется (по частям)' }, value: 'gradual' },
          { label: { uk: 'Не бачу, але аналізую властивості', en: 'I don\'t see, but analyze properties', ru: 'Не вижу, но анализирую свойства' }, value: 'analytical' },
        ],
      },
      {
        id: '2_2',
        category: 'Process',
        subCategory: { uk: 'Абстрактне мислення', en: 'Abstract Thinking', ru: 'Абстрактное мышление' },
        text: {
          uk: 'Формат абстрактного мислення: У якому форматі відбувається Ваше мислення, коли розмірковуєте про складну проблему?',
          en: 'Abstract thinking format: In what format does your thinking occur when pondering a complex problem?',
          ru: 'Формат абстрактного мышления: В каком формате происходит ваше мышление, когда размышляете о сложной проблеме?'
        },
        hint: {
          uk: 'Приклад: Ви ведете внутрішній монолог ("так, спершу це..."), уявляєте візуальні схеми/структури, чи просто "знаєте" зв\'язки без слів і картинок?',
          en: 'Example: Do you have an inner monologue ("ok, first this..."), imagine visual schemas/structures, or just "know" connections without words/images?',
          ru: 'Пример: Вы ведете внутренний монолог ("так, сперва это..."), представляете визуальные схемы/структуры, или просто "знаете" связи без слов и картинок?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Внутрішній діалог (слова)', en: 'Inner dialogue (words)', ru: 'Внутренний диалог (слова)' }, value: 'verbal' },
          { label: { uk: 'Абстрактні символи/концепції', en: 'Abstract symbols/concepts', ru: 'Абстрактные символы/концепции' }, value: 'abstract' },
          { label: { uk: 'Схеми, діаграми', en: 'Schemas, diagrams', ru: 'Схемы, диаграммы' }, value: 'schematic' },
        ],
      },
      {
        id: '2_3',
        category: 'Process',
        subCategory: { uk: 'Кінестетика', en: 'Kinesthetics', ru: 'Кинестетика' },
        text: {
          uk: 'Домінування уяви руху: Коли уявляєте фізичну дію (кидаєте м\'яч), що чіткіше?',
          en: 'Movement imagination dominance: When imagining a physical action (throwing a ball), what is clearer?',
          ru: 'Доминирование воображения движения: Когда представляете физическое действие (бросаете мяч), что четче?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Візуальна картинка', en: 'Visual picture', ru: 'Визуальная картинка' }, value: 'visual' },
          { label: { uk: 'Кінестетичне відчуття (м\'язи)', en: 'Kinesthetic sensation (muscles)', ru: 'Кинестетическое ощущение (мышцы)' }, value: 'kinesthetic' },
          { label: { uk: 'Обидва рівнозначно', en: 'Both equally', ru: 'Оба равнозначно' }, value: 'both' },
          { label: { uk: 'Нічого', en: 'Nothing', ru: 'Ничего' }, value: 'none' },
        ],
      },
      {
        id: '2_4',
        category: 'Process',
        subCategory: { uk: 'Деталізація', en: 'Detailing', ru: 'Детализация' },
        text: {
          uk: 'Швидкість та зусилля деталізації: Якщо образ нечіткий, скільки часу потрібно, щоб додати деталі?',
          en: 'Speed and effort of detailing: If an image is vague, how long does it take to add details?',
          ru: 'Скорость и усилия детализации: Если образ нечеткий, сколько времени нужно, чтобы добавить детали?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Деталі додаються одразу', en: 'Details added instantly', ru: 'Детали добавляются сразу' }, value: 'instant' },
          { label: { uk: 'Потрібно кілька секунд зусиль', en: 'Takes a few seconds of effort', ru: 'Нужно несколько секунд усилий' }, value: 'effort' },
          { label: { uk: 'Зусилля не допомагають', en: 'Effort does not help', ru: 'Усилия не помогают' }, value: 'impossible' },
        ],
      },
      {
        id: '2_5',
        category: 'Process',
        subCategory: { uk: 'Концептуалізація', en: 'Conceptualization', ru: 'Концептуализация' },
        text: {
          uk: 'Опишіть різницю між "знанням" про об\'єкт та "баченням" його у голові. Чи відчуваєте Ви цю різницю?',
          en: 'Describe the difference between "knowing" about an object and "seeing" it in your head. Do you feel this difference?',
          ru: 'Опишите разницу между "знанием" об объекте и "видением" его в голове. Чувствуете ли вы эту разницу?'
        },
        type: QuestionType.TEXT,
      },
      {
        id: '2_6',
        category: 'Process',
        subCategory: { uk: 'Просторова Маніпуляція', en: 'Spatial Manipulation', ru: 'Пространственная Манипуляция' },
        text: {
          uk: 'Як Ви уявляєте обертання складного 3D-об\'єкта (наприклад, неіснуючого механізму)?',
          en: 'How do you imagine rotating a complex 3D object (e.g., a non-existent mechanism)?',
          ru: 'Как вы представляете вращение сложного 3D-объекта (например, несуществующего механизма)?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Бачу, як він обертається, як у відео', en: 'I see it rotating like a video', ru: 'Вижу, как он вращается, как в видео' }, value: 'visual_rotate' },
          { label: { uk: 'Знаю його нову позицію, використовуючи логіку/правила', en: 'I know its new position using logic/rules', ru: 'Знаю его новую позицию, используя логику/правила' }, value: 'logic_rules' },
          { label: { uk: 'Відчуваю рух як кінестетичне відчуття', en: 'I feel the movement as a kinesthetic sensation', ru: 'Ощущаю движение как кинестетическое чувство' }, value: 'kinesthetic' },
        ],
      },
      {
        id: '2_7',
        category: 'Process',
        subCategory: { uk: 'Робоча Пам\'ять', en: 'Working Memory', ru: 'Рабочая Память' },
        text: {
          uk: 'Коли Ви утримуєте в пам\'яті список із 7-10 слів, Ви їх:',
          en: 'When holding a list of 7-10 words in memory, you are:',
          ru: 'Когда вы удерживаете в памяти список из 7-10 слов, вы их:'
        },
        hint: {
          uk: 'Приклад: Ви постійно їх проговорюєте внутрішнім голосом, чи уявляєте, що вони написані на дошці?',
          en: 'Example: Are you constantly repeating them with an inner voice, or do you imagine them written on a board?',
          ru: 'Пример: Вы постоянно их проговариваете внутренним голосом, или представляете, что они написаны на доске?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Постійно проговорюєте внутрішнім діалогом', en: 'Constantly repeating them via inner dialogue', ru: 'Постоянно проговариваете внутренним диалогом' }, value: 'verbal_loop' },
          { label: { uk: 'Уявляєте, що вони написані/позначені', en: 'Imagine them written/labeled', ru: 'Представляете, что они написаны/обозначены' }, value: 'visual_labels' },
          { label: { uk: 'Перетворюєте на концепції, щоб "знати" їх', en: 'Convert them into concepts to "know" them', ru: 'Превращаете в концепции, чтобы "знать" их' }, value: 'conceptual' },
        ],
      },
      {
        id: '2_DRAW_1',
        category: 'Process',
        subCategory: { uk: 'Візуальна Реконструкція', en: 'Visual Reconstruction', ru: 'Визуальная Реконструкция' },
        text: {
          uk: 'Завдання на малювання: Намалюйте велосипед з пам\'яті настільки детально, наскільки можете.',
          en: 'Drawing Task: Draw a bicycle from memory as detailed as you can.',
          ru: 'Задание на рисование: Нарисуйте велосипед по памяти настолько детально, насколько сможете.'
        },
        hint: {
          uk: 'Не хвилюйтеся про художні навички. Важливо те, які саме деталі (спиці, ланцюг, рама) Ви пам\'ятаєте візуально.',
          en: 'Don\'t worry about artistic skills. What matters is which details (spokes, chain, frame) you remember visually.',
          ru: 'Не беспокойтесь о художественных навыках. Важно то, какие именно детали (спицы, цепь, рама) Вы помните визуально.'
        },
        type: QuestionType.DRAWING,
      },
      {
        id: '2_DRAW_2',
        category: 'Process',
        subCategory: { uk: 'Просторова Пам\'ять', en: 'Spatial Memory', ru: 'Пространственная Память' },
        text: {
          uk: 'Завдання на малювання: Намалюйте схематичне планування Вашої кімнати (де знаходяться вікна, двері, меблі).',
          en: 'Drawing Task: Draw a schematic layout of your room (windows, doors, furniture locations).',
          ru: 'Задание на рисование: Нарисуйте схематичную планировку Вашей комнаты (окна, двери, мебель).'
        },
        hint: {
          uk: 'Це допомагає зрозуміти різницю між візуалізацією об\'єктів та знанням просторових зв\'язків.',
          en: 'This helps understand the difference between object visualization and spatial relationship knowledge.',
          ru: 'Это помогает понять разницу между визуализацией объектов и знанием пространственных связей.'
        },
        type: QuestionType.DRAWING,
      },
    ],
  },
  {
    id: 'cat3',
    title: {
      uk: 'Категорія 3: Стратегії та Пам\'ять',
      en: 'Category 3: Strategies and Memory',
      ru: 'Категория 3: Стратегии и Память'
    },
    description: {
      uk: 'Аналіз стилю мислення, пам\'яті та соціальної взаємодії.',
      en: 'Analysis of thinking style, memory, and social interaction.',
      ru: 'Анализ стиля мышления, памяти и социального взаимодействия.'
    },
    questions: [
      {
        id: '3_A_1',
        category: 'Strategy',
        subCategory: { uk: 'Логіка', en: 'Logic', ru: 'Логика' },
        text: {
          uk: 'Обробка абстрактної логіки: Як Ви вирішуєте складну логічну задачу? (Словами, схемами, відчуттям?)',
          en: 'Abstract logic processing: How do you solve a complex logic problem? (Words, schemas, feeling?)',
          ru: 'Обработка абстрактной логики: Как вы решаете сложную логическую задачу? (Словами, схемами, ощущением?)'
        },
        hint: {
          uk: 'Приклад: Ви будуєте ментальну модель/графік, проговорюєте логічний ланцюжок словами, чи покладаєтесь на інтуїтивне відчуття правильності?',
          en: 'Example: Do you build a mental model/graph, speak the logic chain in words, or rely on an intuitive feeling of correctness?',
          ru: 'Пример: Вы строите ментальную модель/график, проговариваете логическую цепочку словами, или полагаетесь на интуитивное ощущение правильности?'
        },
        type: QuestionType.TEXT,
      },
      {
        id: '3_A_2',
        category: 'Strategy',
        subCategory: { uk: 'Мовлення', en: 'Speech', ru: 'Речь' },
        text: {
          uk: 'Коли Ви говорите, чи формулюєте Ви речення послідовно в голові, чи слова просто "з\'являються"?',
          en: 'When you speak, do you formulate sentences sequentially in your head, or do words just "appear"?',
          ru: 'Когда вы говорите, формулируете ли вы предложения последовательно в голове, или слова просто "появляются"?'
        },
        type: QuestionType.TEXT,
      },
      {
        id: '3_A_3',
        category: 'Strategy',
        subCategory: { uk: 'Діалог', en: 'Dialogue', ru: 'Диалог' },
        text: {
          uk: 'Чи використовуєте Ви внутрішній діалог (розмова із собою у голові) часто і детально?',
          en: 'Do you use inner dialogue (talking to yourself in your head) often and in detail?',
          ru: 'Используете ли вы внутренний диалог (разговор с собой в голове) часто и детально?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Так', en: 'Yes', ru: 'Да' }, value: 'yes' },
          { label: { uk: 'Ні', en: 'No', ru: 'Нет' }, value: 'no' },
          { label: { uk: 'Частково', en: 'Partially', ru: 'Частично' }, value: 'partial' },
        ]
      },
      {
        id: '3_A_4',
        category: 'Strategy',
        subCategory: { uk: 'Механізми', en: 'Mechanisms', ru: 'Механизмы' },
        text: {
          uk: 'Коли Ви уявляєте, як щось працює (наприклад, двигун), Ви уявляєте це як 3D модель чи як список правил?',
          en: 'When you imagine how something works (e.g., an engine), do you see it as a 3D model or a list of rules?',
          ru: 'Когда вы представляете, как что-то работает (например, двигатель), вы представляете это как 3D модель или как список правил?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: '3D Модель', en: '3D Model', ru: '3D Модель' }, value: '3d' },
          { label: { uk: 'Список функцій/правил', en: 'List of functions/rules', ru: 'Список функций/правил' }, value: 'rules' },
          { label: { uk: 'Змішаний тип', en: 'Mixed type', ru: 'Смешанный тип' }, value: 'mixed' },
        ]
      },
      {
        id: '3_B_1',
        category: 'Memory',
        subCategory: { uk: 'Епізодична', en: 'Episodic', ru: 'Эпизодическая' },
        text: {
          uk: 'Опишіть свій найяскравіший спогад дитинства. Наскільки яскрава візуальна картинка?',
          en: 'Describe your most vivid childhood memory. How vivid is the visual picture?',
          ru: 'Опишите свое самое яркое воспоминание детства. Насколько яркая визуальная картинка?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Як фільм (жива картина)', en: 'Like a movie (living picture)', ru: 'Как фильм (живая картина)' }, value: 'movie' },
          { label: { uk: 'Як послідовність подій', en: 'Like a sequence of events', ru: 'Как последовательность событий' }, value: 'sequence' },
          { label: { uk: 'Як сухий факт', en: 'Like a dry fact', ru: 'Как сухой факт' }, value: 'fact' },
        ]
      },
      {
        id: '3_B_2',
        category: 'Memory',
        subCategory: { uk: 'Семантична', en: 'Semantic', ru: 'Семантическая' },
        text: {
          uk: 'Чи часто трапляється, що Ви знаєте факт, але не пам\'ятаєте, коли/де про це дізналися?',
          en: 'Does it happen often that you know a fact but don\'t remember when/where you learned it?',
          ru: 'Часто ли случается, что вы знаете факт, но не помните, когда/где об этом узнали?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Так', en: 'Yes', ru: 'Да' }, value: 'yes' },
          { label: { uk: 'Ні', en: 'No', ru: 'Нет' }, value: 'no' },
        ]
      },
      {
        id: '3_B_3',
        category: 'Memory',
        subCategory: { uk: 'Обличчя', en: 'Faces', ru: 'Лица' },
        text: {
          uk: 'Чи легко Вам запам\'ятовувати імена людей, порівняно з їхніми обличчями?',
          en: 'Is it easy for you to remember people\'s names compared to their faces?',
          ru: 'Легко ли вам запоминать имена людей по сравнению с их лицами?'
        },
        type: QuestionType.TEXT,
      },
      {
        id: '3_B_4',
        category: 'Memory',
        subCategory: { uk: 'Сновидіння', en: 'Dreams', ru: 'Сновидения' },
        text: {
          uk: 'Які Ваші сновидіння?',
          en: 'What are your dreams like?',
          ru: 'Какие у вас сновидения?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Чіткі, кольорові, реалістичні візуальні образи', en: 'Clear, colorful, realistic visual images', ru: 'Четкие, цветные, реалистичные визуальные образы' }, value: 'visual_dreams' },
          { label: { uk: 'Невізуальні (діалог, відчуття, знання того, що відбувається)', en: 'Non-visual (dialogue, feelings, knowing what happens)', ru: 'Невизуальные (диалог, ощущения, знание происходящего)' }, value: 'non_visual_dreams' },
          { label: { uk: 'Не пам\'ятаю сновидінь', en: 'I do not remember dreams', ru: 'Не помню сновидений' }, value: 'no_recall' },
        ],
      },
      {
        id: '3_C_1',
        category: 'Navigation',
        subCategory: { uk: 'Карта', en: 'Map', ru: 'Карта' },
        text: {
          uk: 'У великій будівлі Ви легко формуєте ментальну карту, чи орієнтуєтеся по кроках ("наліво-прямо")?',
          en: 'In a large building, do you easily form a mental map, or navigate by steps ("left, then straight")?',
          ru: 'В большом здании вы легко формируете ментальную карту, или ориентируетесь по шагам ("налево-прямо")?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Ментальна карта', en: 'Mental map', ru: 'Ментальная карта' }, value: 'map' },
          { label: { uk: 'Послідовність кроків', en: 'Sequence of steps', ru: 'Последовательность шагов' }, value: 'steps' },
        ]
      },
      {
        id: '3_D_1',
        category: 'Social',
        subCategory: { uk: 'Емпатія', en: 'Empathy', ru: 'Эмпатия' },
        text: {
          uk: 'Коли хтось розповідає про травму, Ви відчуваєте емоцію чи аналізуєте ситуацію?',
          en: 'When someone talks about trauma, do you feel the emotion or analyze the situation?',
          ru: 'Когда кто-то рассказывает о травме, вы чувствуете эмоцию или анализируете ситуацию?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Відчуваю емоцію (Співчуття)', en: 'Feel emotion (Compassion)', ru: 'Чувствую эмоцию (Сочувствие)' }, value: 'emotional' },
          { label: { uk: 'Аналізую ситуацію (Когнітивна емпатія)', en: 'Analyze situation (Cognitive empathy)', ru: 'Анализирую ситуацию (Когнитивная эмпатия)' }, value: 'cognitive' },
          { label: { uk: 'Обидва', en: 'Both', ru: 'Оба' }, value: 'both' },
        ]
      },
      {
        id: '3_D_2',
        category: 'Social',
        subCategory: { uk: 'Суперечка', en: 'Argument', ru: 'Спор' },
        text: {
          uk: 'Що є Вашим головним інструментом у суперечці?',
          en: 'What is your main tool in an argument?',
          ru: 'Что является вашим главным инструментом в споре?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Логічні аргументи', en: 'Logical arguments', ru: 'Логические аргументы' }, value: 'logic' },
          { label: { uk: 'Емоційна переконливість', en: 'Emotional persuasiveness', ru: 'Эмоциональная убедительность' }, value: 'emotion' },
        ]
      },
      {
        id: '3_E_1',
        category: 'Strategy',
        subCategory: { uk: 'Навчання', en: 'Learning', ru: 'Обучение' },
        text: {
          uk: 'Що є найефективнішим для запам\'ятовування нової інформації (наприклад, розділу підручника)?',
          en: 'What is most effective for you to memorize new information (e.g., a textbook chapter)?',
          ru: 'Что является наиболее эффективным для запоминания новой информации (например, раздела учебника)?'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Багаторазове читання/переказ вголос (фокус на словах)', en: 'Multiple reading/reciting aloud (focus on words)', ru: 'Многократное чтение/пересказ вслух (фокус на словах)' }, value: 'verbal_repetition' },
          { label: { uk: 'Побудова ментальних схем, логічних карт (фокус на зв\'язках)', en: 'Building mental schemas, logical maps (focus on connections)', ru: 'Построение ментальных схем, логических карт (фокус на связях)' }, value: 'schematic_mapping' },
          { label: { uk: 'Спроба візуалізувати матеріал як сцену', en: 'Trying to visualize the material as a scene', ru: 'Попытка визуализировать материал как сцену' }, value: 'visualize_scene' },
        ],
      },
      {
        id: '3_E_2',
        category: 'Strategy',
        subCategory: { uk: 'Ухвалення Рішень', en: 'Decision Making', ru: 'Принятие Решений' },
        text: {
          uk: 'При ухваленні важливого рішення Ви покладаєтесь на:',
          en: 'When making an important decision, you rely on:',
          ru: 'При принятии важного решения вы полагаетесь на:'
        },
        type: QuestionType.CHOICE,
        options: [
          { label: { uk: 'Детальний логічний аналіз (плюси/мінуси)', en: 'Detailed logical analysis (pros/cons)', ru: 'Подробный логический анализ (плюсы/минусы)' }, value: 'pure_logic' },
          { label: { uk: 'Швидке інтуїтивне "відчуття" правильності', en: 'Quick intuitive "feeling" of correctness', ru: 'Быстрое интуитивное "чувство" правильности' }, value: 'intuition' },
          { label: { uk: 'Змішаний підхід, з перевагою логіки', en: 'Mixed approach, leaning towards logic', ru: 'Смешанный подход, с преобладанием логики' }, value: 'mixed_logic' },
        ],
      },
    ],
  }
];
