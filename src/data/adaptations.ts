import type { AdaptationExample } from '../types'

/**
 * Примеры адаптаций текстов.
 *
 * Каждый пример — это параллельное сравнение «оригинал ↔ наша русская версия».
 * Структура:
 *   verses[].lines[] — пара строк (original / adapted).
 *   У строки может быть note — короткая пометка, что именно тут сделали
 *   (сохранили ритм / поменяли рифму / переосмыслили образ и т.п.).
 *   highlight определяет тип визуального акцента на правой колонке.
 *
 * Когда пришлёшь оригиналы и переводы — заполни/дополни массив `adaptations`.
 */
export const adaptations: AdaptationExample[] = [
  {
    id: 'a-brain-rot',
    title: 'Brain Rot',
    originalArtist: 'Kasane Teto — Brain Rot',
    originalLang: '日本語 + English',
    year: 2024,
    teaser:
      'ВокалOID Kasane Teto. Оригинал двуязыкий — японский миксуется с английскими вставками «Doping time» и «Happy Happy Happy Dance». Сохранили эту двуязыкость: в адаптации английские рефрены остаются английскими, а японские строки превращаются в русские. Получился такой же «гибридный» по языку кавер.',
    verses: [
      {
        label: 'Припев',
        lines: [
          {
            original: 'youhou youryou dogaishi gouhou Doping time',
            adapted: 'Забив на нормы дозировки doping time (time)',
            highlight: 'image',
            note: '«度が過ぎ / 業報» (чересчур / кармический откат) → «Забив на нормы дозировки»: удержали дерзость и «передоз» как центральный образ',
          },
          {
            original: 'shitai no you de nou wa Happy Happy Happy Dance',
            adapted: 'Как овощ, но внутри я happy happy happy dance',
            highlight: 'meaning',
            note: '«Как труп, мозг танцует» → «Как овощ снаружи, но внутри — танец»: русский «овощ» естественнее в разговорной речи, чем «труп»',
          },
          {
            original: 'chotto dake kyuukei de owaretara wake nai wa',
            adapted: '"Просто поставь на паузу" это невозможный результат',
            highlight: 'meaning',
            note: '«Ну хотя бы перерывчиком не закончится же» → «пауза — невозможный результат»: вместо «перерыва» ввели «паузу», которая в русском звучит навязчивее, как кнопка плеера',
          },
        ],
      },
    ],
  },

  // === Заглушки — заполним, как пришлёшь оригиналы и переводы ===
  {
    id: 'a-shadow-shadow',
    title: 'Shadow Shadow',
    originalArtist: 'Project Sekai — Shadow Shadow (Miku)',
    originalLang: '日本語',
    year: 2023,
    teaser:
      'Трек из Project Sekai (Hatsune Miku). В оригинале образ «тени» появляется только в заголовке, а в адаптации развернули его в пару «тень / тьма» — получился более певучий и русский по духу финал.',
    verses: [
      {
        label: 'Куплет 1',
        lines: [
          {
            original: 'hitoshirezu naita urahara na Lie',
            adapted: 'Тайком текла слеза, я врала себе сама',
            highlight: 'meaning',
            note: '«Плакала втихаря, ложь, о которой жалею» → «Тайком слеза + я врала себе сама»: разнесли одну строку оригинала на «слезу» и «ложь самой себе» — две грани одного состояния',
          },
          {
            original: 'warui no wa sai ka shiruyoshi mo nai',
            adapted: 'Виновна ли судьба? Невозможно разгадать',
            highlight: 'rhyme',
            note: 'Сама ↔ разгадать: точная рифма-связка, которой в японском не было',
          },
          {
            original: 'utagai no taika kono mi de gitai',
            adapted: 'Жить в маске до конца - то сомнения цена',
            highlight: 'meaning',
            note: '«Нести на себе цену сомнений» → «Жизнь в маске»: перевели абстрактное «нести» в конкретный образ-маску',
          },
          {
            original: 'kodoku da Shadow Shadow',
            adapted: 'Совсем одна - как тень, как тьма',
            highlight: 'image',
            note: '«Я одинока, Shadow Shadow» → «как тень, как тьма»: расширили одно слово в поэтическую пару — финал стал сильнее',
          },
        ],
      },
    ],
  },

  {
    id: 'a-my-vyshe',
    title: 'Мы Выше',
    originalArtist: 'Coldplay — Fix You',
    originalLang: 'English',
    year: 2005,
    teaser:
      'Лирический кавер. Главное — сохранить хрупкость оригинала, поэтому ритм минимально отступает от английского.',
    releaseId: 'r6',
    verses: [
      {
        label: 'Куплет 1',
        lines: [
          // Заполни оригиналом и адаптацией ↓
          { original: '…', adapted: '…', highlight: null, note: null },
        ],
      },
    ],
  },

  {
    id: 'a-hazbin-easy',
    title: 'Easy',
    originalArtist: 'Hazbin Hotel — Easy (Charlie & Alastor)',
    originalLang: 'English',
    year: 2019,
    teaser:
      'Припев с «колючей» интонацией: «Shut up» в оригинале идёт рука об руку с нежностью. Сохранили и резкость, и нежность, и ABAB-рифму — но вместо образа «спирали» пришла «усталость от сомнений», а «cycle» стал «порочным кругом» (добавили остроты).',
    verses: [
      {
        label: 'Припев',
        lines: [
          {
            original: 'Shut up, you know that I love you',
            adapted: 'Заткнись, ты знаешь, люблю же.',
            highlight: 'meaning',
            note: '«Shut up» не смягчили — это важно для интонации Charlie',
          },
          {
            original: "But that's enough of this spiral",
            adapted: 'Сомнений больше не надо.',
            highlight: 'meaning',
            note: '«Спираль» → «усталость от сомнений»: сменили образ, сохранили эмоцию',
          },
          {
            original: "Some of your dreams haven't come true",
            adapted: 'Мечты несбыточны, все же',
            highlight: 'rhyme',
            note: 'Точная рифма-скрепа «же» ↔ «же» с первой строкой',
          },
          {
            original: "Well, here's how we'll break the cycle",
            adapted: 'Мы разорвём круг порочный.',
            highlight: 'image',
            note: '«Порочный круг» — острее, чем нейтральный cycle',
          },
        ],
      },
    ],
  },
]

/** Список доступных треков для переключателя (id + название). */
export const adaptationList = adaptations.map((a) => ({
  id: a.id,
  title: a.title,
  originalArtist: a.originalArtist,
}))
