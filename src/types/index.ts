import type { DbMember } from '../hooks/useMembers'

export interface Social {
  vk?: string
  telegram?: string
  instagram?: string
  youtube?: string
}

export type MemberCategory =
  | 'vocals'
  | 'sound'
  | 'art'
  | 'video'
  | 'translators'
  | 'admin'

export const MEMBER_CATEGORIES: { id: MemberCategory; label: string }[] = [
  { id: 'admin', label: 'Администрация' },
  { id: 'vocals', label: 'Вокалисты' },
  { id: 'sound', label: 'Звукари' },
  { id: 'art', label: 'Художники' },
  { id: 'video', label: 'Видеомонтажёры' },
  { id: 'translators', label: 'Переводчики' },
]

/**
 * Маппинг тегов участника в категории для сортировки на странице «Состав».
 * Используется в `getMemberCategories` ниже.
 */
const TAG_TO_CATEGORY: Record<string, MemberCategory> = {
  'вокалист': 'vocals',
  'админ': 'admin',
  'звукарь': 'sound',
  'художник': 'art',
  'монтажер': 'video',
  'переводчик': 'translators',
}

export function getMemberCategories(tags: string[]): MemberCategory[] {
  const cats = new Set<MemberCategory>()
  for (const tag of tags) {
    const cat = TAG_TO_CATEGORY[tag.toLowerCase()]
    if (cat) cats.add(cat)
  }
  return Array.from(cats)
}

export type Member = {
  id: string
  name: string
  role?: string  // добавить ?
  tags: string[]
  birthDate?: string  // добавить ?
  bio: string
  avatar: string
  socials: Record<string, string>
}

/** Маппит строку из БД (snake_case) в UI-представление для `MemberCard`. */
export function toUiMember(m: DbMember): Member {
  return {
    id: m.slug,
    name: m.display_name,
    role: m.role || undefined,
    tags: m.tags ?? [],
    birthDate: m.birth_mmdd || undefined,
    bio: m.bio ?? '',
    avatar: m.avatar_path ?? '',
    socials: m.socials ?? {},
  }
}

export interface ReleasePlatforms {
  spotify?: string
  youtube?: string
  yandex?: string
  apple?: string
}

export interface Release {
  id: string
  title: string
  originalArtist: string
  cover: string
  releaseDate: string
  status: 'upcoming' | 'released'
  platforms: ReleasePlatforms
  description: string
  currentStage?: number
  /** Язык оригинала (например, "Korean", "English", "Japanese"). */
  originalLanguage?: string
  /** ID участников, которые поработали над релизом (вокалисты, звукари, художники и т.д.).
   *  Хранятся slug'и (а не UUID) — это совпадает с тем, как `id` используется
   *  на клиенте и совместимо с фильтрами на /releases. */
  credits?: string[]
}

// ---------- Примеры адаптаций текстов ----------

/** Одна строка / строфа в параллельном сравнении оригинала и адаптации. */
export interface AdaptationLine {
  /** Оригинальная строка (на языке оригинала) */
  original: string
  /** Строка на русском в нашей адаптации */
  adapted: string
  /**
   * Короткая пометка «что тут сделали» (опционально).
   * Например: «сохранили ритм», «сменили рифму», «добавили образ».
   * Если null — просто параллельная строка без акцента.
   */
  note?: string | null
  /** Тип акцента для визуала (опционально). null/undefined = обычная строка. */
  highlight?: 'rhyme' | 'rhythm' | 'meaning' | 'image' | null
}

export interface AdaptationVerse {
  /** Подзаголовок фрагмента: «Куплет 1», «Припев», «Бридж» и т.п. */
  label: string
  lines: AdaptationLine[]
}

export interface AdaptationExample {
  id: string
  /** Русское название нашего кавера */
  title: string
  /** Оригинальный исполнитель и трек */
  originalArtist: string
  /** Язык оригинала (для подписи колонки) */
  originalLang: string
  /** Год оригинального трека (опционально) */
  year?: number
  /** Короткий анонс: о чём фрагмент и что в нём интересного */
  teaser: string
  /** Несколько параллельных фрагментов */
  verses: AdaptationVerse[]
  /** Опционально: ссылка на готовый релиз */
  releaseId?: string
}

export interface Service {
  id: string
  title: string
  description: string
  includes: string[]
  price: string
  turnaround: string
}

// ---------- Каверы ----------

export type CoverStageId =
  | 'lyrics'
  | 'vocal'
  | 'back-vocal'
  | 'tuning'
  | 'mixing'
  | 'art'
  | 'video'

export interface CoverStageMeta {
  id: CoverStageId
  title: string
  description: string
  /** Базовая цена этапа в рублях. Сумма выбранных этапов = стоимость заказа.
   *  Итог корректируется в зависимости от сложности трека. */
  basePrice: number
}

export const COVER_STAGES: CoverStageMeta[] = [
  {
    id: 'lyrics',
    title: 'Адаптация текста / лирика',
    description: 'Перевод оригинала или написание нового текста под мелодию.',
    basePrice: 1000,
  },
  {
    id: 'vocal',
    title: 'Запись вокала',
    description: 'Студийная запись основного голоса (3–4 дубля) в профессиональном качестве.',
    basePrice: 700,
  },
  {
    id: 'back-vocal',
    title: 'Бэк-вокал',
    description: 'Подложки, хоры и ответные партии — добавляем объём и фактуру.',
    basePrice: 300,
  },
  {
    id: 'tuning',
    title: 'Тюнотайм вокала',
    description: 'Программная коррекция интонации без «пластикового» звучания.',
    basePrice: 500,
  },
  {
    id: 'mixing',
    title: 'Сведение',
    description: 'Баланс вокала и минусовки, эффекты, компрессия, финальный мастеринг.',
    basePrice: 500,
  },
  {
    id: 'art',
    title: 'Арт',
    description: 'Обложка трека в фирменном стиле для стримингов и соцсетей.',
    basePrice: 1500,
  },
  {
    id: 'video',
    title: 'Видео',
    description: 'Лирик-видео, визуальный ролик или shorts-версия для продвижения.',
    basePrice: 3500,
  },
]

// ---------- Набор в группу ----------

export interface Vacancy {
  id: string
  role: string
  requirements: string[]
  conditions: string
  isOpen: boolean
}

// ---------- Пользователи и заявки ----------
// User больше не используется: авторизация зрителей убрана, осталась
// только админка, у которой свой Supabase User (@supabase/supabase-js).

export type SubmissionType = 'service' | 'join' | 'cover'

export interface Submission {
  id: string
  userId?: string
  type: SubmissionType
  payload: Record<string, string>
  createdAt: string
}
