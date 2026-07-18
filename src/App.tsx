import { Navigate, Route, Routes } from 'react-router-dom'
import RootLayout from './layouts/RootLayout'
import ThemeBoot from './components/ThemeBoot'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import TeamPage from './pages/TeamPage'
import ReleasesPage from './pages/ReleasesPage'
import ServicesHubPage from './pages/ServicesHubPage'
import ServicesLyricsPage from './pages/ServicesLyricsPage'
import ServicesCoverPage from './pages/ServicesCoverPage'
import JoinPage from './pages/JoinPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <>
      <ThemeBoot />
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/releases" element={<ReleasesPage />} />
          <Route path="/services" element={<ServicesHubPage />} />
          <Route path="/services/lyrics" element={<ServicesLyricsPage />} />
          <Route path="/services/cover" element={<ServicesCoverPage />} />
          {/* Старый прямой путь оставлен как алиас → хаб */}
          <Route path="/services/all" element={<Navigate to="/services" replace />} />
          <Route path="/join" element={<JoinPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  )
}
