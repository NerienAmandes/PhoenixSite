import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import IntroLoader from '../components/IntroLoader'

export default function RootLayout() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [pathname])
  return (
    <div className="min-h-full flex flex-col">
      <IntroLoader />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
