import { Link } from 'react-router-dom'
import { Instagram, Youtube, Send, MessageCircle, Music2 } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative mt-24 border-t border-border">
      <div className="absolute inset-x-0 -top-px h-px bg-fire opacity-60" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-base border border-border flex items-center justify-center p-2 shadow-card">
                <img src="/logoPtitca.svg" alt="FirePhoenix" className="w-full h-full" />
              </div>
              <div>
                <div className="font-display text-3xl">FirePhoenix</div>
                <div className="text-xs tracking-[0.3em] uppercase text-muted mt-1">
                  cover band · est. 2019
                </div>
              </div>
            </div>
            <p className="mt-5 text-base text-muted">
              Кавер-группа, в которой рождается музыка. Берём любимые хиты и
              превращаем их в истории на русском языке.
            </p>
          </div>

          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-muted mb-5">
              Навигация
            </div>
            <ul className="grid gap-2.5 text-base">
              <li><Link to="/about" className="hover:text-accent">О группе</Link></li>
              <li><Link to="/team" className="hover:text-accent">Состав</Link></li>
              <li><Link to="/releases" className="hover:text-accent">Релизы</Link></li>
              <li><Link to="/services" className="hover:text-accent">Услуги</Link></li>
              <li><Link to="/join" className="hover:text-accent">Набор</Link></li>
            </ul>
          </div>

          <div>
            <div className="text-xs tracking-[0.3em] uppercase text-muted mb-5">
              Соцсети
            </div>
            <ul className="grid gap-3 text-base">
              <li>
                <a href="https://vk.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                  <MessageCircle size={16} /> ВКонтакте
                </a>
              </li>
              <li>
                <a href="https://t.me/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                  <Send size={16} /> Telegram
                </a>
              </li>
              <li>
                <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                  <Instagram size={16} /> Instagram
                </a>
              </li>
              <li>
                <a href="https://youtube.com/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                  <Youtube size={16} /> YouTube
                </a>
              </li>
              <li>
                <a href="https://music.yandex.ru/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:text-accent">
                  <Music2 size={16} /> Яндекс Музыка
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted">
          <div>© {new Date().getFullYear()} FirePhoenix. Все права защищены.</div>
          <div className="tracking-[0.3em] uppercase">Сделано с огнём</div>
        </div>
      </div>
    </footer>
  )
}
