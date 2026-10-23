import React, { useEffect } from 'react'
import './App.css'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { useGlobal } from './context/GlobalContext'
import LanguageSwitcher from './components/LanguageSwitcher'
import en from './i18next/en.json'
import fr from './i18next/fr.json'
import ChapterBox from './components/ChapterBox'
import Chapter from './pages/chapter'
import HomeButton from './components/HomeButton'

const supportedLanguages = ['en', 'fr'] as const
type Language = (typeof supportedLanguages)[number]

function isLanguage(value: string | undefined): value is Language {
  return supportedLanguages.includes(value as Language)
}

function Chapters() {
  const { language } = useGlobal()
  const translations = language === 'en' ? en : fr
  const chapters = Array.from({ length: 10 }, (_, i) => i + 1)

  return (
    <>
      <section id="center">
        <h1>{translations.main.title}</h1>
        <div className="chapters-container">
          {chapters.map((level) => (
            <React.Fragment key={level}>
              <ChapterBox level={level} />
            </React.Fragment>
          ))}
        </div>
      </section>
    </> 
  )
}

function LocalizedPage() {
  const { language: routeLanguage, level: routeLevel } = useParams<{
    language: string
    level?: string
  }>()
  const { setLanguage } = useGlobal()

  useEffect(() => {
    if (isLanguage(routeLanguage)) {
      setLanguage(routeLanguage)
    }
  }, [routeLanguage, setLanguage])

  if (!isLanguage(routeLanguage)) {
    return <Navigate to="/en/" replace />
  }

  if (routeLevel !== undefined) {
    const level = Number(routeLevel)
    if (!Number.isInteger(level) || level < 1 || level > 10) {
      return <Navigate to={`/${routeLanguage}/`} replace />
    }

    return (
      <>
        <LanguageSwitcher />
        <HomeButton />
        <Chapter level={level} />
      </>
    )
  }

  return (
    <>
      <LanguageSwitcher />
      <HomeButton />
      <Chapters />
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/en/" replace />} />
      <Route path="/:language/" element={<LocalizedPage />} />
      <Route path="/:language/chapter/:level" element={<LocalizedPage />} />
      <Route path="*" element={<Navigate to="/en/" replace />} />
    </Routes>
  )
}

export default App
