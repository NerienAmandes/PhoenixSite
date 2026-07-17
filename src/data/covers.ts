import type { CoverStageId } from '../types'

/** Минимальная стоимость кавер-заказа, ₽ */
export const COVER_MIN_PRICE = 3000

/** Максимальная «типичная» стоимость кавер-заказа, ₽.
 *  Сверх этого — обсуждаем индивидуально, возможен отказ. */
export const COVER_MAX_PRICE = 10000

/** Этапы, выбранные по умолчанию (= минимальный кавер) */
export const COVER_DEFAULT_STAGES: CoverStageId[] = ['lyrics', 'vocal', 'tuning']
