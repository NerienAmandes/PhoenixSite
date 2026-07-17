export type PortfolioItem = {
  id: string
  title: string
  youtubeId: string
  type: 'cover'
}

// Замени youtubeId на реальные ID своих видео (часть ссылки после ?v= или youtu.be/)
export const portfolio: PortfolioItem[] = [
  {
    id: 'p1',
    title: 'Не Отпускай — кавер на Adele',
    youtubeId: 'dQw4w9WgXcQ',
    type: 'cover',
  },
  {
    id: 'p2',
    title: 'Танец На Краю — кавер на Dua Lipa',
    youtubeId: 'dQw4w9WgXcQ',
    type: 'cover',
  },
  {
    id: 'p3',
    title: 'Мы Выше — кавер на Coldplay',
    youtubeId: 'dQw4w9WgXcQ',
    type: 'cover',
  },
  {
    id: 'p4',
    title: 'Backstage — запись с концерта',
    youtubeId: 'dQw4w9WgXcQ',
    type: 'cover',
  },
]
