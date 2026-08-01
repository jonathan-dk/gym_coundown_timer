import { useState, type ReactNode } from 'react'
import { LocaleContext } from './context'
import { defaultLocale, locales, type Locale } from './index'

function resolveInitialLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale

  const stored = window.localStorage.getItem('locale') as Locale | null
  if (stored === 'en' || stored === 'da') return stored

  const browserLang = navigator.language.toLowerCase()
  for (const loc of locales) {
    if (browserLang === loc || browserLang.startsWith(`${loc}-`)) {
      return loc
    }
  }

  return defaultLocale
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(resolveInitialLocale)

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    window.localStorage.setItem('locale', newLocale)
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale: handleSetLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}
