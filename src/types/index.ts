import type { DbMember } from '../hooks/useMembers'
import { publicUrl } from '../lib/supabase' // <-- 1. ДОБАВИЛИ ИМПОРТ

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
 */
const TAG_TO_CATEGORY: Record<string, MemberCategory> = {
  'вокалист': 'vocals',
  'админ': 'admin',
  'звукарь': 'sound',
  'художник': 'art',
  'монтажер': 'video',
  'монтажёр': 'video', // <-- 2. ДОБАВИЛИ ВАРИАНТ С БУКВОЙ Ё (частая причина "пропажи" из категории)
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
  role?: string
  tags: string[]
  birthDate?: string
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
    avatar: publicUrl(m.avatar_path) || '', // <-- 3. ИСПРАВИЛИ: теперь путь превращается в полную ссылку + сброс кэша
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
  originalLanguage?: string
  credits?: string[]
}

// ---------- Примеры адаптаций текстов ----------

export interface AdaptationLine {
  original: string
  adapted: string
  note?: string | null
  highlight?: 'rhyme' | 'rhythm' | 'meaning' | 'image' | null
}

export interface AdaptationVerse {
  label: string
  lines: AdaptationLine[]
}

export interface AdaptationExample {
  id: string
  title: string
  originalArtist: string
  originalLang: string
  year?: number
  teaser: string
  verses: AdaptationVerse[]
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

export type SubmissionType = 'service' | 'join' | 'cover'

export interface Submission {
  id: string
  userId?: string
  type: SubmissionType
  payload: Record<string, string>
  createdAt: string
}