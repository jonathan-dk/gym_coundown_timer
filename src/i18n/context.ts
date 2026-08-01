import { createContext } from 'react'
import { type Locale } from './index'

export const LocaleContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
} | null>(null)
