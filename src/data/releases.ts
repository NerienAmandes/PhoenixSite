import type { Release } from '../types'

const cover = (seed: string, hue: number) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `Album cover art for a cover band called FirePhoenix, abstract fire, vinyl record vibe, dark moody with warm orange and red accents, song title ${seed}, cinematic, 4k`
  )}&image_size=square_hd`

export const releases: Release[] = [
  {
    id: 'r1',
    title: 'Пепел Слов',
    originalArtist: 'Billie Eilish — Bury a Friend',
    cover: cover('Пепел Слов', 0),
    releaseDate: '2026-09-12',
    status: 'upcoming',
    platforms: {
      youtube: 'https://youtube.com/',
      spotify: 'https://open.spotify.com/',
    },
    description:
      'Мрачная атмосфера оригинала в нашей русской интерпретации. Больше воздуха, живые барабаны, шёпот вокала на грани.',
  },
  {
    id: 'r2',
    title: 'Огни Над Рекой',
    originalArtist: 'The Weeknd — Blinding Lights',
    cover: cover('Огни Над Рекой', 30),
    releaseDate: '2026-08-02',
    status: 'upcoming',
    platforms: {
      spotify: 'https://open.spotify.com/',
      yandex: 'https://music.yandex.ru/',
    },
    description:
      'Синтвейв-энергия и ностальгия по летним ночным городам. Ближе к дебютному синглу сезона.',
  },
  {
    id: 'r3',
    title: 'Где Ты Сейчас',
    originalArtist: 'Imagine Dragons — Believer',
    cover: cover('Где Ты Сейчас', 60),
    releaseDate: '2026-05-18',
    status: 'upcoming',
    platforms: {
      youtube: 'https://youtube.com/',
    },
    description:
      'Эмоциональный кавер с нарастающей кульминацией. Уже на финальной стадии сведения.',
  },
  {
    id: 'r4',
    title: 'Не Отпускай',
    originalArtist: 'Adele — Rolling in the Deep',
    cover: cover('Не Отпускай', 90),
    releaseDate: '2026-04-04',
    status: 'released',
    platforms: {
      spotify: 'https://open.spotify.com/',
      youtube: 'https://youtube.com/',
      yandex: 'https://music.yandex.ru/',
      apple: 'https://music.apple.com/',
    },
    description:
      'Самый сильный трек на сегодня. Более 200 тысяч прослушиваний за первый месяц.',
  },
  {
    id: 'r5',
    title: 'Танец На Краю',
    originalArtist: 'Dua Lipa — Levitating',
    cover: cover('Танец На Краю', 120),
    releaseDate: '2026-02-14',
    status: 'released',
    platforms: {
      spotify: 'https://open.spotify.com/',
      youtube: 'https://youtube.com/',
      yandex: 'https://music.yandex.ru/',
    },
    description:
      'Дерзкая подача, фанковые клавиши и много движения. Идеально для концертной программы.',
  },
  {
    id: 'r6',
    title: 'Мы Выше',
    originalArtist: 'Coldplay — Fix You',
    cover: cover('Мы Выше', 150),
    releaseDate: '2025-11-30',
    status: 'released',
    platforms: {
      spotify: 'https://open.spotify.com/',
      youtube: 'https://youtube.com/',
      apple: 'https://music.apple.com/',
    },
    description:
      'Лирический кавер, в котором вокал Алины звучит пронзительнее оригинала. Наш первый «миллионник».',
  },
  {
    id: 'r7',
    title: 'Шёпот Ливня',
    originalArtist: 'Lana Del Rey — Summertime Sadness',
    cover: cover('Шёпот Ливня', 180),
    releaseDate: '2025-08-19',
    status: 'released',
    platforms: {
      youtube: 'https://youtube.com/',
      yandex: 'https://music.yandex.ru/',
    },
    description:
      'Воздушная аранжировка, много эхо и фортепиано. Любимый трек нашей аудитории.',
  },
  {
    id: 'r8',
    title: 'Полымя',
    originalArtist: 'Imagine Dragons — Radioactive',
    cover: cover('Полымя', 210),
    releaseDate: '2025-04-05',
    status: 'released',
    platforms: {
      spotify: 'https://open.spotify.com/',
      youtube: 'https://youtube.com/',
    },
    description:
      'Тяжёлый, ритуальный трек. Один из самых популярных на концертах — зал поёт хором.',
  },
]
