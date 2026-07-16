import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

export default function IntroLoader() {
  const [visible, setVisible] = useState(true)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const seen = sessionStorage.getItem('fp-intro-seen')
    if (seen) {
      setVisible(false)
      return
    }
    const leaveTimer = setTimeout(() => setLeaving(true), 1900)
    const hideTimer = setTimeout(() => {
      setVisible(false)
      sessionStorage.setItem('fp-intro-seen', '1')
    }, 2600)
    return () => {
      clearTimeout(leaveTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      aria-hidden={leaving}
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden transition-opacity duration-700 ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div
        className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full blur-3xl animate-breathe"
        style={{ background: 'radial-gradient(circle, #F84B6B 0%, transparent 60%)', opacity: 0.55 }}
      />
      <div
        className="absolute -bottom-40 -right-24 w-[600px] h-[600px] rounded-full blur-3xl animate-breathe"
        style={{ background: 'radial-gradient(circle, #F7882E 0%, transparent 60%)', opacity: 0.5, animationDelay: '1.5s' }}
      />

      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] blur-3xl"
        style={{ background: 'radial-gradient(ellipse at center, #DE3D3B 0%, transparent 70%)', opacity: 0.5 }}
      />

      {[...Array(14)].map((_, i) => (
        <span
          key={i}
          className="absolute bottom-0 w-2 h-2 rounded-full animate-flameParticle"
          style={{
            left: `${10 + (i * 6.5) % 80}%`,
            background: i % 3 === 0 ? '#FAE143' : i % 3 === 1 ? '#FF9D4D' : '#F84B6B',
            animationDelay: `${(i * 0.18) % 2}s`,
            animationDuration: `${2 + (i % 3)}s`,
            boxShadow: '0 0 18px currentColor',
            opacity: 0.8,
          }}
        />
      ))}

      <div className="relative flex flex-col items-center">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 flex gap-3">
          <Flame className="text-fire animate-flame" size={20} style={{ animationDelay: '0s' }} />
          <Flame className="text-warm animate-flame" size={14} style={{ animationDelay: '0.4s' }} />
          <Flame className="text-fire animate-flame" size={20} style={{ animationDelay: '0.8s' }} />
        </div>

        <div className="relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl animate-pulse"
            style={{ background: 'radial-gradient(circle, #F84B6B 0%, transparent 70%)', opacity: 0.7 }}
          />
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-base border border-border flex items-center justify-center p-6 shadow-glow animate-breathe">
            <img
              src="/logoPtitca.svg"
              alt="FirePhoenix"
              className="w-full h-full animate-floaty"
              style={{ filter: 'drop-shadow(0 6px 18px rgba(248, 75, 107, 0.45))' }}
            />
          </div>
        </div>

        <div className="mt-8 text-center overflow-hidden">
          <div
            className="font-display text-5xl sm:text-6xl tracking-tight"
            style={{ animation: 'fpTitleIn 1s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both' }}
          >
            Fire
            <span className="text-fire">Phoenix</span>
          </div>
          <div
            className="mt-3 text-sm sm:text-base tracking-[0.5em] uppercase text-muted"
            style={{ animation: 'fpSubIn 0.9s 0.7s cubic-bezier(0.22, 1, 0.36, 1) both' }}
          >
            cover band · moscow
          </div>
        </div>

        <div className="mt-10 w-64 sm:w-80 h-[2px] bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #F84B6B, #F7882E, #FAE143)',
              animation: 'fpProgress 1.8s cubic-bezier(0.65, 0, 0.35, 1) forwards',
            }}
          />
        </div>
      </div>
    </div>
  )
}
