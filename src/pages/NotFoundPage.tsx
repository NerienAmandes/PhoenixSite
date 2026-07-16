import { Link } from 'react-router-dom'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('404')
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-base border border-border shadow-card animate-breathe p-3">
          <img src="/logoPtitca.svg" alt="FirePhoenix" className="w-full h-full" />
        </div>
        <h1 className="mt-7 font-display text-7xl text-fire">404</h1>
        <p className="mt-3 text-lg text-muted">
          Эта страница сгорела в нашем огне. Попробуйте вернуться на главную.
        </p>
        <Link to="/" className="btn btn-primary mt-7">
          На главную
        </Link>
      </div>
    </div>
  )
}
