import { CategoryData, QuestionType } from '../types';

export const PERFECTIONISM_CATEGORIES: CategoryData[] = [
  {
    id: 'rigid_perfectionism',
    title: {
      uk: 'Жорсткий перфекціонізм (Спрямований на себе)',
      en: 'Rigid Perfectionism (Self-Oriented)',
      ru: 'Жесткий перфекционизм (Направленный на себя)'
    },
    description: {
      uk: 'Ваше власне прагнення до досконалості та високі вимоги до себе.',
      en: 'Your own drive for perfection and high self-standards.',
      ru: 'Ваше собственное стремление к совершенству и высокие требования к себе.'
    },
    questions: [
      {
        id: 'bp_01',
        category: 'Perfectionism',
        subCategory: { uk: 'Прагнення до досконалості', en: 'Striving for Perfection', ru: 'Стремление к совершенству' },
        text: {
          uk: 'Я намагаюся бути настільки досконалим, наскільки це можливо.',
          en: 'I try to be as perfect as possible.',
          ru: 'Я стараюсь быть настолько совершенным, насколько это возможно.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_02',
        category: 'Perfectionism',
        subCategory: { uk: 'Високі стандарти', en: 'High Standards', ru: 'Высокие стандарты' },
        text: {
          uk: 'Для себе я ніколи не погоджуюся на менше, ніж досконале.',
          en: 'For myself, I never settle for less than perfect.',
          ru: 'Для себя я никогда не соглашаюсь на меньшее, чем совершенное.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_03',
        category: 'Perfectionism',
        subCategory: { uk: 'Важливість досконалості', en: 'Importance of Perfection', ru: 'Важность совершенства' },
        text: {
          uk: 'Для мене важливо бути досконалим в усьому, що я розпочинаю.',
          en: 'It is important for me to be perfect in everything I start.',
          ru: 'Для меня важно быть совершенным во всем, что я начинаю.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_04',
        category: 'Perfectionism',
        subCategory: { uk: 'Все або нічого', en: 'All or Nothing', ru: 'Все или ничего' },
        text: {
          uk: 'Я роблю справу ідеально, або не роблю взагалі.',
          en: 'I do things perfectly, or not at all.',
          ru: 'Я делаю дело идеально, или не делаю вообще.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_05',
        category: 'Perfectionism',
        subCategory: { uk: 'Відчуття правоти', en: 'Sense of Rightness', ru: 'Чувство правоты' },
        text: {
          uk: 'Мені завжди потрібно прагнути до ідеалу для того, щоб відчувати свою правоту.',
          en: 'I always need to strive for the ideal to feel like I am in the right.',
          ru: 'Мне всегда нужно стремиться к идеалу для того, чтобы чувствовать свою правоту.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_06',
        category: 'Perfectionism',
        subCategory: { uk: 'Самоповага', en: 'Self-Respect', ru: 'Самоуважение' },
        text: {
          uk: 'Я не зможу себе поважати, якщо припиню прагнути досконалості.',
          en: 'I will not be able to respect myself if I stop striving for perfection.',
          ru: 'Я не смогу себя уважать, если перестану стремиться к совершенству.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_07',
        category: 'Perfectionism',
        subCategory: { uk: 'Залежність самооцінки', en: 'Self-Esteem Dependency', ru: 'Зависимость самооценки' },
        text: {
          uk: 'Моя самооцінка залежить від можливості бути досконалим.',
          en: 'My self-esteem depends on the ability to be perfect.',
          ru: 'Моя самооценка зависит от возможности быть совершенным.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_08',
        category: 'Perfectionism',
        subCategory: { uk: 'Потрібність', en: 'Neediness', ru: 'Нужность' },
        text: {
          uk: 'Прагнення вдосконалюватись, наскільки це можливо, дає мені відчуття потрібності.',
          en: 'Striving to improve as much as possible gives me a sense of worthiness.',
          ru: 'Стремление совершенствоваться, насколько это возможно, дает мне ощущение нужности.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_09',
        category: 'Perfectionism',
        subCategory: { uk: 'Самооцінка', en: 'Self-Esteem', ru: 'Самооценка' },
        text: {
          uk: 'Моя самооцінка пов’язана з можливістю бути досконалим.',
          en: 'My self-esteem is tied to the ability to be perfect.',
          ru: 'Моя самооценка связана с возможностью быть совершенным.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_10',
        category: 'Perfectionism',
        subCategory: { uk: 'Страх помилки', en: 'Fear of Failure', ru: 'Страх ошибки' },
        text: {
          uk: 'Коли я помиляюсь, то відчуваю себе невдахою.',
          en: 'When I make a mistake, I feel like a failure.',
          ru: 'Когда я ошибаюсь, то чувствую себя неудачником.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_11',
        category: 'Perfectionism',
        subCategory: { uk: 'Тривога через помилки', en: 'Anxiety over Mistakes', ru: 'Тревога из-за ошибок' },
        text: {
          uk: 'Я відчуваю тривогу через можливість зробити помилку.',
          en: 'I feel anxious about the possibility of making a mistake.',
          ru: 'Я чувствую тревогу из-за возможности совершить ошибку.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_12',
        category: 'Perfectionism',
        subCategory: { uk: 'Ляк помилки', en: 'Dread of Mistakes', ru: 'Боязнь ошибки' },
        text: {
          uk: 'Мене лякає сама навіть думка про помилку.',
          en: 'Just the thought of making a mistake scares me.',
          ru: 'Меня пугает сама даже мысль об ошибке.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_13',
        category: 'Perfectionism',
        subCategory: { uk: 'Сором через помилки', en: 'Shame over Mistakes', ru: 'Стыд из-за ошибок' },
        text: {
          uk: 'Коли я помічаю, що зробив помилку, мені соромно.',
          en: 'When I notice I made a mistake, I feel ashamed.',
          ru: 'Когда я замечаю, что совершил ошибку, мне стыдно.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_14',
        category: 'Perfectionism',
        subCategory: { uk: 'Реакція на незначне', en: 'Minor Mistake Reaction', ru: 'Реакция на незначительное' },
        text: {
          uk: 'Я засмучуюсь, зробивши навіть незначну помилку.',
          en: 'I get upset even when I make a minor mistake.',
          ru: 'Я расстраиваюсь, совершив даже незначительную ошибку.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_15',
        category: 'Perfectionism',
        subCategory: { uk: 'Сумніви', en: 'Doubts', ru: 'Сомнения' },
        text: {
          uk: 'Я сумніваюсь у більшості своїх вчинків.',
          en: 'I doubt most of my actions.',
          ru: 'Я сомневаюсь в большинстве своих поступков.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_16',
        category: 'Perfectionism',
        subCategory: { uk: 'Невпевненість', en: 'Uncertainty', ru: 'Неуверенность' },
        text: {
          uk: 'Я відчуваю невпевненість щодо більшості справ, які я роблю.',
          en: 'I feel uncertain about most of the things I do.',
          ru: 'Я чувствую неуверенность относительно большинства дел, которые я делаю.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_17',
        category: 'Perfectionism',
        subCategory: { uk: 'Постійні сумніви', en: 'Constant Doubts', ru: 'Постоянные сомнения' },
        text: {
          uk: 'Я маю сумніви щодо всього, що б я не робив.',
          en: 'I have doubts about everything I do.',
          ru: 'У меня есть сомнения по поводу всего, что бы я ни делал.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_18',
        category: 'Perfectionism',
        subCategory: { uk: 'Невпевненість у рішеннях', en: 'Decision Uncertainty', ru: 'Неуверенность в решениях' },
        text: {
          uk: 'Я завжди невпевнений у правильності своїх вчинків/рішень.',
          en: 'I am always unsure about the correctness of my actions/decisions.',
          ru: 'Я всегда неуверен в правильности своих поступков/решений.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_19',
        category: 'Perfectionism',
        subCategory: { uk: 'Схильність до сумнівів', en: 'Proneness to Doubt', ru: 'Склонность к сомнениям' },
        text: {
          uk: 'Я схильний сумніватися у правильності своїх дій/вчинків.',
          en: 'I am prone to doubting the correctness of my actions.',
          ru: 'Я склонен сомневаться в правильности своих действий/поступков.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_20',
        category: 'Perfectionism',
        subCategory: { uk: 'Самокритика', en: 'Self-Criticism', ru: 'Самокритика' },
        text: {
          uk: 'Я ставлюсь до себе критично, коли роблю щось недосконало.',
          en: 'I am critical of myself when I do things imperfectly.',
          ru: 'Я отношусь к себе критично, когда делаю что-то несовершенно.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_21',
        category: 'Perfectionism',
        subCategory: { uk: 'Злість на себе', en: 'Self-Directed Anger', ru: 'Злость на себя' },
        text: {
          uk: 'Коли мій виступ недосколаний, зазвичай, я злюся на себе.',
          en: 'When my performance is imperfect, I usually get angry at myself.',
          ru: 'Когда мое выступление несовершенно, обычно я злюсь на себя.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_22',
        category: 'Perfectionism',
        subCategory: { uk: 'Розчарування в собі', en: 'Self-Disappointment', ru: 'Разочарование в себе' },
        text: {
          uk: 'Я почуваюся розчарованим в собі, коли не роблю щось досить добре.',
          en: 'I feel disappointed in myself when I don\'t do something well enough.',
          ru: 'Я чувствую разочарование в себе, когда не делаю что-то достаточно хорошо.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_23',
        category: 'Perfectionism',
        subCategory: { uk: 'Прощення себе', en: 'Self-Forgiveness', ru: 'Прощение себя' },
        text: {
          uk: 'Мені важко собі пробачити, коли моя робота недосконала.',
          en: 'I find it hard to forgive myself when my work is imperfect.',
          ru: 'Мне трудно себя простить, когда моя работа несовершенна.'
        },
        type: QuestionType.SCALE
      }
    ]
  },
  {
    id: 'socially_prescribed_perfectionism',
    title: {
      uk: 'Соціально зумовлений перфекціонізм',
      en: 'Socially Prescribed Perfectionism',
      ru: 'Социально обусловленный перфекционизм'
    },
    description: {
      uk: 'Ваше переконання, що інші люди очікують від вас досконалості.',
      en: 'Your belief that others expect you to be perfect.',
      ru: 'Ваше убеждение, что другие люди ожидают от вас совершенства.'
    },
    questions: [
      {
        id: 'bp_24',
        category: 'Perfectionism',
        subCategory: { uk: 'Очікування від інших', en: 'Expectations from Others', ru: 'Ожидания от других' },
        text: {
          uk: 'Люди занадто багато очікують від мене.',
          en: 'People expect too much from me.',
          ru: 'Люди слишком многого ожидают от меня.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_25',
        category: 'Perfectionism',
        subCategory: { uk: 'Розчарування оточуючих', en: 'Disappointing Others', ru: 'Разочарование окружающих' },
        text: {
          uk: 'Люди розчаровуються в мені, коли я роблю щось недосконало.',
          en: 'People get disappointed in me when I do something imperfectly.',
          ru: 'Люди разочаровываются во мне, когда я делаю что-то несовершенно.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_26',
        category: 'Perfectionism',
        subCategory: { uk: 'Вимоги оточуючих', en: 'Demands from Others', ru: 'Требования окружающих' },
        text: {
          uk: 'Оточуючі занадто багато вимагають від мене.',
          en: 'Others demand too much from me.',
          ru: 'Окружающие слишком многого требуют от меня.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_27',
        category: 'Perfectionism',
        subCategory: { uk: 'Тиск бути найкращим', en: 'Pressure to be the Best', ru: 'Давление быть лучшим' },
        text: {
          uk: 'Усі вважають, що я маю бути найкращим.',
          en: 'Everyone thinks I should be the best.',
          ru: 'Все считают, что я должен быть лучшим.'
        },
        type: QuestionType.SCALE
      }
    ]
  },
  {
    id: 'narcissistic_perfectionism',
    title: {
      uk: 'Нарцисичний перфекціонізм',
      en: 'Narcissistic Perfectionism',
      ru: 'Нарциссический перфекционизм'
    },
    description: {
      uk: 'Ваші очікування досконалості від інших та переконання у власній винятковості.',
      en: 'Your expectations of perfection from others and belief in your own exceptionality.',
      ru: 'Ваши ожидания совершенства от других и убежденность в собственной исключительности.'
    },
    questions: [
      {
        id: 'bp_28',
        category: 'Perfectionism',
        subCategory: { uk: 'Вимоги до близьких', en: 'Demands on Family/Friends', ru: 'Требования к близким' },
        text: {
          uk: 'Я вимагаю досконалості від моєї родини та друзів.',
          en: 'I demand perfection from my family and friends.',
          ru: 'Я требую совершенства от моей семьи и друзей.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_29',
        category: 'Perfectionism',
        subCategory: { uk: 'Бездоганність інших', en: 'Flawlessness of Others', ru: 'Безупречность других' },
        text: {
          uk: 'Все, що роблять інші, має бути бездоганним.',
          en: 'Everything others do must be flawless.',
          ru: 'Все, что делают другие, должно быть безупречным.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_30',
        category: 'Perfectionism',
        subCategory: { uk: 'Досконалість близьких', en: 'Perfection of Close Ones', ru: 'Совершенство близких' },
        text: {
          uk: 'Я очікую, що близькі мені люди повинні бути досконалими.',
          en: 'I expect people close to me to be perfect.',
          ru: 'Я ожидаю, что близкие мне люди должны быть совершенными.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_31',
        category: 'Perfectionism',
        subCategory: { uk: 'Скарги інших', en: 'Others\' Complaints', ru: 'Жалобы других' },
        text: {
          uk: 'Люди скаржаться, що я очікую занадто багато від них.',
          en: 'People complain that I expect too much from them.',
          ru: 'Люди жалуются, что я ожидаю слишком многого от них.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_32',
        category: 'Perfectionism',
        subCategory: { uk: 'Бездоганність роботи інших', en: 'Flawless Work from Others', ru: 'Безупречность работы других' },
        text: {
          uk: 'Для мене важливо, щоб оточуючі робили свою справу бездоганно.',
          en: 'It is important to me that others do their work flawlessly.',
          ru: 'Для меня важно, чтобы окружающие делали свое дело безупречно.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_33',
        category: 'Perfectionism',
        subCategory: { uk: 'Критика інших', en: 'Criticism of Others', ru: 'Критика других' },
        text: {
          uk: 'Я схильний критикувати недоліки інших людей.',
          en: 'I tend to criticize other people\'s flaws.',
          ru: 'Я склонен критиковать недостатки других людей.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_34',
        category: 'Perfectionism',
        subCategory: { uk: 'Розчарування в інших', en: 'Disappointment in Others', ru: 'Разочарование в других' },
        text: {
          uk: 'Я розчаровуюсь, коли інші люди припускаються помилок.',
          en: 'I get disappointed when other people make mistakes.',
          ru: 'Я разочаровываюсь, когда другие люди совершают ошибки.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_35',
        category: 'Perfectionism',
        subCategory: { uk: 'Незадоволеність іншими', en: 'Dissatisfaction with Others', ru: 'Неудовлетворенность другими' },
        text: {
          uk: 'Я незадоволений людьми, навіть якщо вони зробили все, що могли.',
          en: 'I am dissatisfied with people even if they have done their best.',
          ru: 'Я недоволен людьми, даже если они сделали все, что могли.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_36',
        category: 'Perfectionism',
        subCategory: { uk: 'Вказування на недоліки', en: 'Pointing Out Flaws', ru: 'Указание на недостатки' },
        text: {
          uk: 'Я одразу вказую на недоліки іншим людям.',
          en: 'I immediately point out flaws in other people.',
          ru: 'Я сразу указываю на недостатки другим людям.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_37',
        category: 'Perfectionism',
        subCategory: { uk: 'Особливе ставлення', en: 'Special Treatment', ru: 'Особое отношение' },
        text: {
          uk: 'Я заслуговую на особливе ставлення до себе.',
          en: 'I deserve special treatment.',
          ru: 'Я заслуживаю особого отношения к себе.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_38',
        category: 'Perfectionism',
        subCategory: { uk: 'Порушення правил', en: 'Rule Breaking for Me', ru: 'Нарушение правил для меня' },
        text: {
          uk: 'Я вважаю, що оточуючі повинні порушувати правила заради мене.',
          en: 'I believe others should break rules for me.',
          ru: 'Я считаю, что окружающие должны нарушать правила ради меня.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_39',
        category: 'Perfectionism',
        subCategory: { uk: 'Помічання досконалості', en: 'Noticing Perfection', ru: 'Замечание совершенства' },
        text: {
          uk: 'Я бентежуся, коли інші люди не помічають мою досконалість.',
          en: 'I get embarrassed/anxious when other people don\'t notice my perfection.',
          ru: 'Меня смущает, когда другие люди не замечают мое совершенство.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_40',
        category: 'Perfectionism',
        subCategory: { uk: 'Моє волевиявлення', en: 'My Way', ru: 'По-моему' },
        text: {
          uk: 'Я заслуговую на те, щоб завжди все було по-моєму.',
          en: 'I deserve to always have things my way.',
          ru: 'Я заслуживаю того, чтобы всегда все было по-моему.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_41',
        category: 'Perfectionism',
        subCategory: { uk: 'Найкращий', en: 'The Best', ru: 'Лучший' },
        text: {
          uk: 'Я найкращий в тому, що я роблю.',
          en: 'I am the best at what I do.',
          ru: 'Я лучший в том, что я делаю.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_42',
        category: 'Perfectionism',
        subCategory: { uk: 'Знання досконалості', en: 'Knowing Perfection', ru: 'Знание совершенства' },
        text: {
          uk: 'Я знаю, що я досконалий.',
          en: 'I know that I am perfect.',
          ru: 'Я знаю, что я совершенен.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_43',
        category: 'Perfectionism',
        subCategory: { uk: 'Заздрість інших', en: 'Others\' Envy', ru: 'Зависть других' },
        text: {
          uk: 'Інші люди таємно заздрять моїй досконалості.',
          en: 'Other people secretly envy my perfection.',
          ru: 'Другие люди втайне завидуют моему совершенству.'
        },
        type: QuestionType.SCALE
      },
      {
        id: 'bp_44',
        category: 'Perfectionism',
        subCategory: { uk: 'Визнання переваги', en: 'Superiority Recognition', ru: 'Признание превосходства' },
        text: {
          uk: 'Інші люди визнають мою перевагу над ними.',
          en: 'Other people recognize my superiority over them.',
          ru: 'Другие люди признают мое превосходство над ними.'
        },
        type: QuestionType.SCALE
      }
    ]
  }
];
