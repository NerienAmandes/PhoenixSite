export type PortfolioItem = {
  id: string
  title: string
  youtubeId: string
  type: 'cover' | 'live' | 'shorts'
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
    title: 'Полымя — live на концерте',
    youtubeId: 'dQw4w9WgXcQ',
    type: 'live',
  },
  {
    id: 'p5',
    title: 'Шёпот Ливня — live-версия',
    youtubeId: 'dQw4w9WgXcQ',
    type: 'live',
  },
  {
    id: 'p6',
    title: 'Backstage — запись с концерта',
    youtubeId: 'dQw4w9WgXcQ',
    type: 'cover',
  },
]
