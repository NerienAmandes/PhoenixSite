import { useEffect } from 'react'

interface MetaOptions {
  title: string
  description?: string
  /** Абсолютный URL или относительный путь (например, '/releases/r4' или полный CDN). */
  image?: string
  /** По умолчанию 'website'. Для конкретных записей — 'article'. */
  type?: 'website' | 'article'
}

const DEFAULTS = {
  siteName: 'FirePhoenix',
  locale: 'ru_RU',
  description:
    'Кавер-группа, в которой рождается музыка. Релизы, состав, адаптации и набор музыкантов.',
  image: '/Phoenix.jpg',
  titleSuffix: ' — FirePhoenix',
}

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  if (!value) return
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  )
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', value)
}

/**
 * Обновляет <title> + Open Graph / Twitter meta-теги при монтировании компонента.
 * Возвращает к предыдущим значениям при размонтировании.
 *
 * Заменяет ручной `useDocumentTitle` для страниц, где нужен красивый шеринг.
 * OG-теги критичны для Telegram, VK, Facebook — без них ссылка показывается пустой.
 */
export function useMeta({
  title,
  description,
  image,
  type = 'website',
}: MetaOptions) {
  useEffect(() => {
    const previousTitle = document.title
    const previousOg = {
      title: document.head.querySelector<HTMLMetaElement>(
        'meta[property="og:title"]'
      )?.content,
      description: document.head.querySelector<HTMLMetaElement>(
        'meta[property="og:description"]'
      )?.content,
      image: document.head.querySelector<HTMLMetaElement>(
        'meta[property="og:image"]'
      )?.content,
      type: document.head.querySelector<HTMLMetaElement>(
        'meta[property="og:type"]'
      )?.content,
    }
    const previousTwitter = {
      title: document.head.querySelector<HTMLMetaElement>(
        'meta[name="twitter:title"]'
      )?.content,
      description: document.head.querySelector<HTMLMetaElement>(
        'meta[name="twitter:description"]'
      )?.content,
      image: document.head.querySelector<HTMLMetaElement>(
        'meta[name="twitter:image"]'
      )?.content,
    }

    const fullTitle = title.endsWith(DEFAULTS.siteName)
      ? title
      : `${title}${DEFAULTS.titleSuffix}`
    const desc = description ?? DEFAULTS.description
    const img = image ?? DEFAULTS.image

    document.title = fullTitle
    setMeta('property', 'og:title', fullTitle)
    setMeta('property', 'og:description', desc)
    setMeta('property', 'og:image', img)
    setMeta('property', 'og:type', type)
    setMeta('name', 'twitter:title', fullTitle)
    setMeta('name', 'twitter:description', desc)
    setMeta('name', 'twitter:image', img)
    setMeta('name', 'description', desc)

    return () => {
      document.title = previousTitle
      if (previousOg.title) setMeta('property', 'og:title', previousOg.title)
      if (previousOg.description)
        setMeta('property', 'og:description', previousOg.description)
      if (previousOg.image) setMeta('property', 'og:image', previousOg.image)
      if (previousOg.type) setMeta('property', 'og:type', previousOg.type)
      if (previousTwitter.title)
        setMeta('name', 'twitter:title', previousTwitter.title)
      if (previousTwitter.description)
        setMeta('name', 'twitter:description', previousTwitter.description)
      if (previousTwitter.image)
        setMeta('name', 'twitter:image', previousTwitter.image)
    }
  }, [title, description, image, type])
}