import { CategoryData, QuestionType } from '../types';

export const DEMO_CATEGORIES: CategoryData[] = [
    {
        id: 'demo',
        title: {
            uk: 'Експрес-діагностика',
            en: 'Express Diagnostics',
            ru: 'Экспресс-диагностика'
        },
        description: {
            uk: '5 ключових запитань, щоб зрозуміти ваш тип уяви.',
            en: '5 key questions to understand your type of imagination.',
            ru: '5 ключевых вопросов, чтобы понять ваш тип воображения.'
        },
        questions: [
            {
                id: 'demo_1',
                category: 'Sensory',
                subCategory: { uk: 'Візуальна', en: 'Visual', ru: 'Визуальная' },
                text: {
                    uk: 'Уявіть стигле червоне яблуко на столі. Наскільки чітко ви його "бачите"?',
                    en: 'Imagine a ripe red apple on a table. How clearly do you "see" it?',
                    ru: 'Представьте спелое красное яблоко на столе. Насколько четко вы его "видите"?'
                },
                type: QuestionType.SCALE,
                examples: [
                    {
                        uk: 'Я бачу яблуко як на фото: можу розгледіти краплі води на шкірці та тінь на столі.',
                        en: 'I see the apple like in a photo: I can see water droplets on the skin and the shadow on the table.',
                        ru: 'Я вижу яблоко как на фото: могу разглядеть капли воды на кожуре и тень на столе.'
                    },
                    {
                        uk: 'Я не бачу картинки, але точно знаю, що воно там, і можу описати його властивості.',
                        en: 'I don\'t see a picture, but I know exactly it\'s there and can describe its properties.',
                        ru: 'Я не вижу картинки, но точно знаю, что оно там, и могу описать его свойства.'
                    }
                ]
            },
            {
                id: 'demo_2',
                category: 'Sensory',
                subCategory: { uk: 'Аудіальна', en: 'Auditory', ru: 'Аудиальная' },
                text: {
                    uk: 'Спробуйте "відтворити" у голові улюблену пісню. Ви чуєте її тембр та інструменти?',
                    en: 'Try to "play" your favorite song in your head. Do you hear its timbre and instruments?',
                    ru: 'Попробуйте "воспроизвести" в голове любимую песню. Вы слышите её тембр и инструменты?'
                },
                type: QuestionType.SCALE,
                examples: [
                    {
                        uk: 'Це як звучання в навушниках: я чую голос вокаліста та бас-гітару дуже реалістично.',
                        en: 'It\'s like listening in headphones: I hear the vocalist\'s voice and the bass guitar very realistically.',
                        ru: 'Это как звучание в наушниках: я слышу голос вокалиста и бас-гитару очень реалистично.'
                    },
                    {
                        uk: 'Я пам\'ятаю текст і ритм, але звук не звучить реально — це скоріше "ідея" музики.',
                        en: 'I remember the lyrics and rhythm, but the sound doesn\'t sound real — it\'s more of an "idea" of the music.',
                        ru: 'Я помню текст и ритм, но звук не звучит реально — это скорее "идея" музыки.'
                    }
                ]
            },
            {
                id: 'demo_3',
                category: 'Process',
                subCategory: { uk: 'Мислення', en: 'Thinking', ru: 'Мышление' },
                text: {
                    uk: 'Коли ви думаєте про вчорашній день, це більше схоже на перегляд фільму чи на читання списку фактів?',
                    en: 'When you think about yesterday, is it more like watching a movie or reading a list of facts?',
                    ru: 'Когда вы думаете о вчерашнем дне, это больше похоже на просмотр фильма или на чтение списка фактов?'
                },
                type: QuestionType.CHOICE,
                options: [
                    { label: { uk: 'Живий фільм', en: 'Living movie', ru: 'Живой фильм' }, value: 'movie' },
                    { label: { uk: 'Окремі кадри/фото', en: 'Separate frames/photos', ru: 'Отдельные кадры/фото' }, value: 'frames' },
                    { label: { uk: 'Тільки факти та знання', en: 'Only facts and knowledge', ru: 'Только факты и знания' }, value: 'facts' },
                ],
                examples: [
                    {
                        uk: 'Я можу буквально "перемотати" вчорашній вечір і знову побачити обличчя людей.',
                        en: 'I can literally "rewind" yesterday evening and see people\'s faces again.',
                        ru: 'Я могу буквально "перемотать" вчерашний вечер и снова увидеть лица людей.'
                    },
                    {
                        uk: 'Я пам\'ятаю, що я робив і що їв, але спогад не має візуальної складової.',
                        en: 'I remember what I did and what I ate, but the memory has no visual component.',
                        ru: 'I remember what I did and what I ate, but the memory has no visual component.'
                    }
                ]
            },
            {
                id: 'demo_4',
                category: 'Process',
                subCategory: { uk: 'Внутрішній голос', en: 'Inner voice', ru: 'Внутренний голос' },
                text: {
                    uk: 'Чи ведете ви постійний діалог із собою у голові (вербальне мислення)?',
                    en: 'Do you carry on a constant dialogue with yourself in your head (verbal thinking)?',
                    ru: 'Ведете ли вы постоянный диалог с собой в голове (вербальное мышление)?'
                },
                type: QuestionType.CHOICE,
                options: [
                    { label: { uk: 'Так, постійно', en: 'Yes, constantly', ru: 'Да, постоянно' }, value: 'constantly' },
                    { label: { uk: 'Іноді', en: 'Sometimes', ru: 'Иногда' }, value: 'sometimes' },
                    { label: { uk: 'Майже ніколи (мислення образами/концептами)', en: 'Almost never (thinking in images/concepts)', ru: 'Почти никогда (мышление образами/концептами)' }, value: 'never' },
                ],
                examples: [
                    {
                        uk: 'В моїй голові ніколи не буває тихо: я постійно коментую свої дії або веду суперечки сам із собою.',
                        en: 'It\'s never quiet in my head: I\'m constantly commenting on my actions or arguing with myself.',
                        ru: 'В моей голове никогда не бывает тихо: я постоянно комментирую свои действия или веду споры сам с собой.'
                    },
                    {
                        uk: 'Я думаю "чистими" смислами або картинками. Слів немає, поки я не почну говорити вголос.',
                        en: 'I think in "pure" meanings or images. There are no words until I start speaking aloud.',
                        ru: 'Я думаю "чистыми" смыслами или картинками. Слов нет, пока я не начну говорить вслух.'
                    }
                ]
            },
            {
                id: 'demo_5',
                category: 'Process',
                subCategory: { uk: 'Схема', en: 'Schema', ru: 'Схема' },
                text: {
                    uk: 'Намалюйте дуже просту схему: як ви уявляєте зв\'язок між поняттями "Час" та "Простір"?',
                    en: 'Draw a very simple schema: how do you imagine the connection between "Time" and "Space"?',
                    ru: 'Нарисуйте очень простую схему: как вы представляете связь между понятиями "Время" и "Пространство"?'
                },
                type: QuestionType.DRAWING,
                examples: [
                    {
                        uk: 'Користувачі часто малюють стрілу, що пронизує куб, або нескінченну спіраль.',
                        en: 'Users often draw an arrow piercing a cube, or an infinite spiral.',
                        ru: 'Пользователи часто рисуют стрелу, пронзающую куб, или бесконечную спираль.'
                    },
                    {
                        uk: 'Для багатьох це виглядає як 3D-сітка, де кожна точка — це подія.',
                        en: 'For many, it looks like a 3D grid where each point is an event.',
                        ru: 'Для многих это выглядит как 3D-сетка, где каждая точка — это событие.'
                    }
                ]
            }
        ]
    }
];

