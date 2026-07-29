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
  return (
    <div className="stats">
      <div className="stat">
        <span className="stat-label">Time in gym</span>
        <span className="stat-value">{timeInGym}</span>
      </div>
      <div className="stat">
        <span className="stat-label">Coins earned</span>
        <span className="stat-value">{coinsEarned} / {coinsMax}</span>
      </div>
      <div className="stat">
        <span className="stat-label">{maxed ? 'Maxed out' : 'Time to 50 Chioins'}</span>
        <span className="stat-value">{maxed ? '—' : remainingTime}</span>
      </div>
    </div>
  )
}
