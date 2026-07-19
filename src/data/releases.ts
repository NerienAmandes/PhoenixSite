import type { Release } from '../types'

const cover = (seed: string, hue: number) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `Album cover art for a cover band called FirePhoenix, abstract fire, vinyl record vibe, dark moody with warm orange and red accents, song title ${seed}, cinematic, 4k`
  )}&image_size=square_hd`

// Заглушки предстоящих релизов — заполни вручную (название, дату, ссылки, описание)
// currentStage: 0..11 — номер текущего этапа (0 = Текст готов ещё не сделан)
//   0  Текст готов
//   1  Записывается вокал
//   2  Вокал готов
//   3  Этап тюнотайма
//   4  Тюнотайм готов
//   5  Сведение
//   6  Сведение готово
//   7  Арт (если требуется)
//   8  Арт готов
//   9  Монтаж видео
//  10  Видео готово
//  11  Предстоящая дата релиза
export const upcomingReleases: Release[] = [
  {
    id: 'u1',
    title: 'I Really Want to Stay At Your House',
    originalArtist: "Rosa Walton (Let's Eat Grandma)",
    cover: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop', // Cyberpunk neon vibe
    releaseDate: '2026-09-01',
    status: 'upcoming',
    platforms: {
      youtube: 'https://www.youtube.com/watch?v=KvMY1uzSC1E&list=RDKvMY1uzSC1E&start_radio=1'
    },
    description: 'Описание готовится.',
    currentStage: 0,
  },
  {
    id: 'u2',
    title: 'Back to Life',
    originalArtist: 'HAN',
    cover: 'https://images.unsplash.com/photo-1614680376593-902f74a936c2?q=80&w=800&auto=format&fit=crop', // Dark moody star vibe
    releaseDate: '2026-10-01',
    status: 'upcoming',
    platforms: {
      youtube: 'https://www.youtube.com/watch?v=F0UIsSnotlA&list=RDF0UIsSnotlA&start_radio=1'
    },
    description: 'Описание готовится.',
    currentStage: 10,
  },
  {
    id: 'u3',
    title: 'Catch',
    originalArtist: 'Yena',
    cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop', // Pop rock concert vibe
    releaseDate: '2026-11-01',
    status: 'upcoming',
    platforms: {
      youtube: 'https://www.youtube.com/watch?v=NOiyDlWl534&list=RDNOiyDlWl534&start_radio=1'
    },
    description: 'Описание готовится.',
    currentStage: 10,
  },
  {
    id: 'u4',
    title: 'Test me!',
    originalArtist: 'Xdinary Heroes',
    cover: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?q=80&w=800&auto=format&fit=crop', // Rock band vibe
    releaseDate: '2026-12-01',
    status: 'upcoming',
    platforms: {
      youtube: 'https://www.youtube.com/watch?v=CL6wr7jozs8&list=RDCL6wr7jozs8&start_radio=1'
    },
    description: 'Описание готовится.',
    currentStage: 11,
  },
  {
    id: 'u5',
    title: 'Candy Scar (Zombie Stage ROUND 1)',
    originalArtist: 'VIVINOS / Rubyeye · C!naH',
    cover: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=800&auto=format&fit=crop', // Dark stage with pink/red neon vibe
    releaseDate: '2027-01-15',
    status: 'upcoming',
    platforms: {
      youtube: 'https://www.youtube.com/watch?v=giV5T1U4NyI' // ID from search
    },
    description: 'Тот самый Zombie Stage Round 1 (Mizi vs Sua).',
    currentStage: 7, // 7 = Арт (если требуется). Текст(0) и Вокал(2) готовы, сведения и видео нет.
  },
]

export const releases: Release[] = [
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
