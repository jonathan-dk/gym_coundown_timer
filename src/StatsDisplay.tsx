import { t } from './i18n'
import { useLocale } from './i18n/useLocale'
import './StatsDisplay.css'

type StatsDisplayProps = {
  timeInGym: string
  coinsEarned: number
  coinsMax: number
  remainingTime: string
  maxed: boolean
}

export function StatsDisplay({
  timeInGym,
  coinsEarned,
  coinsMax,
  remainingTime,
  maxed,
}: StatsDisplayProps) {
  const { locale } = useLocale()
  return (
    <div className="stats">
      <div className="stat">
        <span className="stat-label">{t(locale, 'timeInGym')}</span>
        <span className="stat-value">{timeInGym}</span>
      </div>
      <div className="stat">
        <span className="stat-label">{t(locale, 'coinsEarned')}</span>
        <span className="stat-value">{coinsEarned} / {coinsMax}</span>
      </div>
      <div className="stat">
        <span className="stat-label">{maxed ? t(locale, 'maxedOut') : t(locale, 'timeToMaxCoins')}</span>
        <span className="stat-value">{maxed ? '—' : remainingTime}</span>
      </div>
    </div>
  )
}
