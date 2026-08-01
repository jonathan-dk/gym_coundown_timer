import { useLocale } from './i18n/useLocale'
import { t, type Locale, localeLabels } from './i18n'
import './LanguageSelector.css'

function DanishFlag({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 37 28"
      width="37"
      height="28"
      className={`flag ${active ? 'active' : ''}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="37" height="28" fill="#C60C30" />
      <rect x="12" width="4" height="28" fill="#FFFFFF" />
      <rect y="12" width="37" height="4" fill="#FFFFFF" />
    </svg>
  )
}

function UkFlag({ active }: { active: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 37 28"
      width="37"
      height="28"
      className={`flag ${active ? 'active' : ''}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="37" height="28" fill="#012169" />
      <path d="M0 0L37 28M37 0L0 28" stroke="#FFFFFF" strokeWidth="4" />
      <rect x="16.5" width="4" height="28" fill="#FFFFFF" />
      <rect y="12" width="37" height="4" fill="#FFFFFF" />
      <path d="M0 0L37 28M37 0L0 28" stroke="#C8102E" strokeWidth="2.5" />
      <rect x="17" width="3" height="28" fill="#C8102E" />
      <rect y="12.5" width="37" height="3" fill="#C8102E" />
    </svg>
  )
}

const flags: Record<Locale, typeof DanishFlag> = {
  da: DanishFlag,
  en: UkFlag,
}

export function LanguageSelector() {
  const { locale, setLocale } = useLocale()

  return (
    <div className="language-selector" role="group" aria-label={t(locale, 'selectLanguage')}>
      {( ['da', 'en'] as Locale[] ).map((lang) => {
        const Flag = flags[lang]
        const active = lang === locale
        return (
          <button
            key={lang}
            type="button"
            className={`language-button ${active ? 'active' : ''}`}
            onClick={() => setLocale(lang)}
            aria-pressed={active}
            aria-label={localeLabels[lang]}
            title={localeLabels[lang]}
          >
            <Flag active={active} />
          </button>
        )
      })}
    </div>
  )
}
