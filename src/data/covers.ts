import type { CoverStageId } from '../types'

/** Минимальная стоимость кавер-заказа, ₽
 *  Базовый «голосовой» набор: текст + вокал + бэк-вокал + тюнинг + сведение. */
export const COVER_MIN_PRICE = 3000

/** Максимальная «типичная» стоимость кавер-заказа, ₽.
 *  Сверх этого — обсуждаем индивидуально, возможен отказ.
 *  Финальная цена может корректироваться от сложности трека. */
export const COVER_MAX_PRICE = 8000

/** Этапы, выбранные по умолчанию (= минимальный кавер) */
export const COVER_DEFAULT_STAGES: CoverStageId[] = [
  'lyrics',
  'vocal',
  'back-vocal',
  'tuning',
  'mixing',
]
