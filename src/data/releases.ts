import type { Release } from '../types'

type CoverSize =
  | 'square_hd'
  | 'square'
  | 'portrait_4_3'
  | 'portrait_16_9'
  | 'landscape_4_3'
  | 'landscape_16_9'

/**
 * Генерирует URL обложки трека. Чтобы релизы не выглядели одинаково, у каждого
 * трека свой промпт под настроение / жанр и (опционально) свой размер полотна.
 *
 *   prompt — полный кастомный промпт; если не задан, берётся дефолтный фирменный
 *   size   — пропорции картинки (по умолчанию square_hd, как у стримингов)
 *   extra  — хвост промпта, чтобы добавить пару акцентов (текстура, свет и т.п.)
 */
const cover = (
  seed: string,
  opts: { prompt?: string; size?: CoverSize; extra?: string } = {}
) => {
  const { prompt, size = 'square_hd', extra } = opts
  const base =
    prompt ??
    `Album cover art for a cover band called FirePhoenix, abstract fire, vinyl record vibe, dark moody with warm orange and red accents, song title ${seed}, cinematic, 4k`
  const finalPrompt = extra ? `${base}, ${extra}` : base
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    finalPrompt
  )}&image_size=${size}`
}

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
    cover: cover('I Really Want to Stay At Your House', {
      prompt:
        "Synthwave album cover for a cyberpunk love ballad, neon-lit cityscape seen through a rainy window at night, deep magenta and electric cyan glow, silhouette of a person sitting on a rooftop, retro-futuristic aesthetic, lo-fi synth vibes, 4k cinematic still",
      size: 'square_hd',
      extra: 'soft film grain, gentle bokeh lights',
    }),
    releaseDate: '2026-09-01',
    status: 'upcoming',
    platforms: {
      youtube: 'https://www.youtube.com/watch?v=KvMY1uzSC1E&list=RDKvMY1uzSC1E&start_radio=1'
    },
    description: 'Описание готовится.',
    currentStage: 0,
    credits: ['fa1afe1', 'karki-05', 'lisme-s', 'relierfix', 'gnom-sovy', 'miwiy'],
  },
  {
    id: 'u2',
    title: 'Back to Life',
    originalArtist: 'HAN',
    cover: cover('Back to Life', {
      prompt:
        "Anime-style emotional ballad album cover, lone girl silhouette against falling cherry blossom petals, soft pastel pink and ivory sky at golden hour, hand-painted watercolor mood, gentle wind, hopeful and tender atmosphere, 4k cinematic illustration",
      size: 'portrait_4_3',
      extra: 'subtle paper texture, dreamy soft light',
    }),
    releaseDate: '2026-10-01',
    status: 'upcoming',
    platforms: {
      youtube: 'https://www.youtube.com/watch?v=F0UIsSnotlA&list=RDF0UIsSnotlA&start_radio=1'
    },
    description: 'Описание готовится.',
    currentStage: 10,
    credits: ['nixel04044', 'linapem', 'rey', 'gilt-majere', 'mizumi', 'yukishinara'],
  },
  {
    id: 'u3',
    title: 'Catch',
    originalArtist: 'Yena',
    cover: cover('Catch', {
      prompt:
        "K-pop bright pop album cover, playful candy-colored gradient background (peach, lavender, mint), floating glitter and stars, cute Y2K aesthetic, glossy 3D render, energetic and cheerful vibe, 4k",
      size: 'square_hd',
      extra: 'holographic foil highlights, sparkles',
    }),
    releaseDate: '2026-11-01',
    status: 'upcoming',
    platforms: {
      youtube: 'https://www.youtube.com/watch?v=NOiyDlWl534&list=RDNOiyDlWl534&start_radio=1'
    },
    description: 'Описание готовится.',
    currentStage: 10,
    credits: ['yuonginsk', 'rain432', 'l-fine', 'relierfix', 'myr-nita', 'myatlik'],
  },
  {
    id: 'u4',
    title: 'Test me!',
    originalArtist: 'Xdinary Heroes',
    cover: cover('Test me!', {
      prompt:
        "Aggressive rock album cover, cracked concrete wall splattered with black and crimson paint, electric lightning bolts cutting through smoke, distorted microphone silhouette, raw and rebellious energy, grunge textures, 4k cinematic",
      size: 'square_hd',
      extra: 'high contrast, motion blur on lightning',
    }),
    releaseDate: '2026-12-01',
    status: 'upcoming',
    platforms: {
      youtube: 'https://www.youtube.com/watch?v=CL6wr7jozs8&list=RDCL6wr7jozs8&start_radio=1'
    },
    description: 'Описание готовится.',
    currentStage: 11,
    credits: ['adam-grouse', 'urienkl', 'melissa', 'l-fine', 'svarshchik', 'gilt-majere'],
  },
  {
    id: 'u5',
    title: 'Candy Scar (Zombie Stage ROUND 1)',
    originalArtist: 'VIVINOS / Rubyeye · C!naH',
    cover: cover('Candy Scar Zombie Stage', {
      prompt:
        "Dark anime gothic album cover, two opposing silhouettes back-to-back under a blood-red moon, black roses and broken glass shards, dramatic chiaroscuro lighting, theatrical and ominous mood, 4k cinematic illustration",
      size: 'portrait_4_3',
      extra: 'matte painting look, deep shadows, faint embers',
    }),
    releaseDate: '2027-01-15',
    status: 'upcoming',
    platforms: {
      youtube: 'https://www.youtube.com/watch?v=giV5T1U4NyI' // ID from search
    },
    description: 'Тот самый Zombie Stage Round 1 (Mizi vs Sua).',
    currentStage: 9, // 9 = Монтаж видео: готовится видео.
    credits: ['enot-diosterigo', 'zhu-zhen', 'karki-05', 'gilt-majere', 'gnom-sovy', 'miwiy'],
  },
  {
    id: 'u6',
    title: 'Shadow Shadow',
    originalArtist: 'Project Sekai',
    cover: cover('Shadow Shadow Project Sekai', {
      prompt:
        "Vocaloid-inspired album cover, two overlapping mirror silhouettes in a digital void, glitching cyan and deep indigo pixels, floating holographic particles, mysterious and ethereal mood, 4k digital art",
      size: 'square_hd',
      extra: 'scanlines, soft chromatic aberration',
    }),
    releaseDate: '2027-03-01',
    status: 'upcoming',
    platforms: {},
    description: 'Shadow Shadow из Project Sekai — готовим русскую адаптацию.',
    currentStage: 7, // 7 = Арт: сведение готово, сейчас готовится арт.
    credits: ['yukishinara', 'afis', 'lisme-s', 'relierfix', 'mizumi', 'melissa'],
  },
]

// Объединённый список: сначала предстоящие, потом вышедшие.
// Так фильтр по status === 'upcoming' на главной странице работает корректно.
export const releases: Release[] = [
  ...upcomingReleases,
  {
    id: 'r4',
    title: 'Не Отпускай',
    originalArtist: 'Adele — Rolling in the Deep',
    cover: cover('Не Отпускай', {
      prompt:
        "Powerful soul ballad album cover, dramatic dark background with a single spotlight, swirling black smoke and a vintage microphone silhouette, deep navy and ember orange palette, cinematic opera mood, 4k photo-realistic",
      size: 'square_hd',
      extra: 'soft volumetric light, fine film grain',
    }),
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
    credits: ['rain432', 'miwiy', 'rey', 'l-fine', 'mizumi', 'yukishinara'],
  },
  {
    id: 'r5',
    title: 'Танец На Краю',
    originalArtist: 'Dua Lipa — Levitating',
    cover: cover('Танец На Краю', {
      prompt:
        "Retro-futuristic disco pop album cover, mirrorball scattering light beams across a chrome dance floor, neon pink and electric blue, model silhouette mid-dance, 80s synthwave meets modern pop, 4k glossy render",
      size: 'square_hd',
      extra: 'lens flares, polished metallic reflections',
    }),
    releaseDate: '2026-02-14',
    status: 'released',
    platforms: {
      spotify: 'https://open.spotify.com/',
      youtube: 'https://youtube.com/',
      yandex: 'https://music.yandex.ru/',
    },
    description:
      'Дерзкая подача, фанковые клавиши и много движения. Идеально для концертной программы.',
    credits: ['marinllen', 'yuonginsk', 'lisme-s', 'relierfix', 'myr-nita', 'myatlik'],
  },
  {
    id: 'r6',
    title: 'Мы Выше',
    originalArtist: 'Coldplay — Fix You',
    cover: cover('Мы Выше', {
      prompt:
        "Emotional uplifting rock ballad album cover, vast open sky at golden sunset, warm amber and rose clouds, lone figure with arms slightly raised, light rays breaking through clouds, hopeful and cinematic, 4k photo-realistic",
      size: 'landscape_4_3',
      extra: 'soft halation, gentle lens bloom',
    }),
    releaseDate: '2025-11-30',
    status: 'released',
    platforms: {
      spotify: 'https://open.spotify.com/',
      youtube: 'https://youtube.com/',
      apple: 'https://music.apple.com/',
    },
    description:
      'Лирический кавер, в котором вокал Алины звучит пронзительнее оригинала. Наш первый «миллионник».',
    credits: ['nixel04044', 'lisme-s', 'melissa', 'gilt-majere', 'svarshchik', 'miwiy'],
  },
  {
    id: 'r7',
    title: 'Шёпот Ливня',
    originalArtist: 'Lana Del Rey — Summertime Sadness',
    cover: cover('Шёпот Ливня', {
      prompt:
        "Dreamy indie album cover, vintage car under heavy rain at twilight, faded cyanotype and dusty rose tones, old film grain, melancholic and nostalgic atmosphere, soft focus on raindrops on glass, 4k cinematic still",
      size: 'portrait_4_3',
      extra: 'light leaks, muted pastel grading',
    }),
    releaseDate: '2025-08-19',
    status: 'released',
    platforms: {
      youtube: 'https://youtube.com/',
      yandex: 'https://music.yandex.ru/',
    },
    description:
      'Воздушное звучание, много эхо и фортепиано. Любимый трек нашей аудитории.',
    credits: ['fa1afe1', 'karki-05', 'rey', 'l-fine', 'gnom-sovy', 'yukishinara'],
  },
  {
    id: 'r8',
    title: 'Полымя',
    originalArtist: 'Imagine Dragons — Radioactive',
    cover: cover('Полымя', {
      prompt:
        "Epic alt-rock album cover, ancient ritual circle of flames in a ruined industrial hall, embers floating into thick smoke, deep crimson and charcoal palette, dramatic rim light, cinematic and powerful, 4k dark fantasy",
      size: 'square_hd',
      extra: 'heavy smoke, glowing ash particles, vignette',
    }),
    releaseDate: '2025-04-05',
    status: 'released',
    platforms: {
      spotify: 'https://open.spotify.com/',
      youtube: 'https://youtube.com/',
    },
    description:
      'Тяжёлый, ритуальный трек. Один из самых популярных на концертах — зал поёт хором.',
    credits: ['gilt-majere', 'adam-grouse', 'urienkl', 'lisme-s', 'yumiko', 'relierfix', 'myr-nita', 'myatlik'],
  },
]
