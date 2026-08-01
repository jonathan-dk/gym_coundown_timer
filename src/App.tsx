import { useEffect, useMemo, useRef, useState } from 'react'
import * as Tesseract from 'tesseract.js'
import { QRCodeSVG } from 'qrcode.react'
import { BuyMeACoffee } from './BuyMeACoffee'
import { CoinsInput } from './CoinsInput'
import { StatsDisplay } from './StatsDisplay'
import { LanguageSelector } from './LanguageSelector'
import { t, formatDate, localeToBcp47, type Locale } from './i18n'
import { useLocale } from './i18n/useLocale'
import './App.css'

const COINS_PER_MINUTE = 1 / 10
const MAX_COINS = 50

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function toDatetimeLocalValue(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

function parseTimeInGym(text: string): number | null {
  const normalized = text
    .toLowerCase()
    .replace(/[.,]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  let totalMs = 0
  let found = false

  const patterns = [
    { regex: /(\d+)\s*d(?:ays?)?\b/, ms: 24 * 60 * 60 * 1000 },
    { regex: /(\d+)\s*h(?:ours?|r)?\b/, ms: 60 * 60 * 1000 },
    { regex: /(\d+)\s*m(?:in(?:utes?)?)?\b/, ms: 60 * 1000 },
    { regex: /(\d+)\s*s(?:ec(?:onds?)?)?\b/, ms: 1000 },
  ]

  for (const { regex, ms } of patterns) {
    const match = normalized.match(regex)
    if (match) {
      totalMs += parseInt(match[1], 10) * ms
      found = true
    }
  }

  if (found) return totalMs

  const hmsMatch = normalized.match(/(\d+):(\d+):(\d+)/)
  if (hmsMatch) {
    return (
      (parseInt(hmsMatch[1], 10) * 3600 +
        parseInt(hmsMatch[2], 10) * 60 +
        parseInt(hmsMatch[3], 10)) *
      1000
    )
  }

  const msMatch = normalized.match(/(\d+):(\d+)/)
  if (msMatch) {
    return (parseInt(msMatch[1], 10) * 60 + parseInt(msMatch[2], 10)) * 1000
  }

  return null
}

function parseCoins(text: string): number | null {
  const coinMatch = text.match(/\+\s*(\d+)|(\d+)\s*(?:poke)?coins?/i)
  if (coinMatch) return parseInt(coinMatch[1] || coinMatch[2], 10)

  const numMatch = text.match(/\b(\d{1,4})\b/)
  if (numMatch) return parseInt(numMatch[1], 10)

  return null
}

async function recognizeText(file: File): Promise<string> {
  const result = await Tesseract.recognize(file, 'eng')
  return result.data.text
}

function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return Promise.resolve('denied')
  return Notification.requestPermission()
}

function sendMaxCoinsNotification(locale: Locale) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  try {
    new Notification(t(locale, 'notificationTitle'), {
      body: t(locale, 'notificationBody'),
      icon: '/favicon.svg',
    })
  } catch {
    // Ignore unsupported notification errors.
  }
}

let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (sharedAudioContext) return sharedAudioContext
  const AudioContextCtor: typeof window.AudioContext | undefined =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext
  if (!AudioContextCtor) return null
  sharedAudioContext = new AudioContextCtor()
  return sharedAudioContext
}

async function unlockAudio() {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    await ctx.resume().catch(() => {
      // Audio may be blocked until the user interacts with the page.
    })
  }
}

async function playHootHoot() {
  const ctx = getAudioContext()
  if (!ctx) return

  await ctx.resume().catch(() => {
    // Audio may be blocked until the user interacts with the page.
  })
  if (ctx.state !== 'running') return

  const now = ctx.currentTime
  const master = ctx.createGain()
  master.gain.value = 0.4
  master.connect(ctx.destination)

  const hoot = (start: number, freq: number) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, start)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(0.5, start + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55)

    osc.connect(gain).connect(master)
    osc.start(start)
    osc.stop(start + 0.6)
  }

  hoot(now, 350)
  hoot(now + 0.8, 310)
}

type ImageState = {
  url: string | null
  file: File | null
  ocrText: string
  scanning: boolean
}

function createImageState(): ImageState {
  return { url: null, file: null, ocrText: '', scanning: false }
}

function App() {
  const { locale } = useLocale()
  const now = new Date()
  const [placedAt, setPlacedAt] = useState(toDatetimeLocalValue(now))
  const [currentTime, setCurrentTime] = useState(Date.now())
  const [gymImage, setGymImage] = useState<ImageState>(createImageState())
  const [coinsImage, setCoinsImage] = useState<ImageState>(createImageState())
  const [coinsToday, setCoinsToday] = useState(0)
  const [notifyPermission, setNotifyPermission] = useState<NotificationPermission>(() =>
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'denied'
  )

  const notifiedRef = useRef(false)
  const initialRenderRef = useRef(true)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackEmail, setFeedbackEmail] = useState('')
  const [shareOpen, setShareOpen] = useState(false)
  const [alarmNoticeOpen, setAlarmNoticeOpen] = useState(false)
  const [dateInputVisible, setDateInputVisible] = useState(false)

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = t(locale, 'pageTitle')
  }, [locale])

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    return () => {
      if (gymImage.url) URL.revokeObjectURL(gymImage.url)
      if (coinsImage.url) URL.revokeObjectURL(coinsImage.url)
    }
  }, [gymImage.url, coinsImage.url])

  const placedDate = useMemo(() => new Date(placedAt), [placedAt])
  const elapsedMs = Math.max(0, currentTime - placedDate.getTime())
  const minutesInGym = elapsedMs / 60000
  const remainingDailyCap = Math.max(0, MAX_COINS - coinsToday)
  const coinsFromThisGym = Math.min(remainingDailyCap, Math.floor(minutesInGym * COINS_PER_MINUTE))
  const coinsEarned = Math.min(MAX_COINS, coinsToday + coinsFromThisGym)
  const msForMax = (remainingDailyCap / COINS_PER_MINUTE) * 60000
  const remainingMs = Math.max(0, msForMax - elapsedMs)
  const maxed = remainingDailyCap === 0 || elapsedMs >= msForMax

  useEffect(() => {
    if (initialRenderRef.current) {
      initialRenderRef.current = false
      if (maxed) notifiedRef.current = true
      return
    }

    if (maxed && !notifiedRef.current) {
      sendMaxCoinsNotification(locale)
      void playHootHoot()
      notifiedRef.current = true
    }

    if (!maxed) {
      notifiedRef.current = false
    }
  }, [maxed, locale])



  const setImageFile = (setter: React.Dispatch<React.SetStateAction<ImageState>>) => {
    return (file: File | undefined) => {
      if (!file) return
      setter((prev) => {
        if (prev.url) URL.revokeObjectURL(prev.url)
        return { ...prev, url: URL.createObjectURL(file), file, ocrText: '' }
      })
    }
  }

  const clearImage = (setter: React.Dispatch<React.SetStateAction<ImageState>>) => {
    return () => {
      setter((prev) => {
        if (prev.url) URL.revokeObjectURL(prev.url)
        return createImageState()
      })
    }
  }

  const scanGym = async () => {
    if (!gymImage.file) return
    setGymImage((prev) => ({ ...prev, scanning: true, ocrText: '' }))
    try {
      const text = await recognizeText(gymImage.file)
      const timeMs = parseTimeInGym(text)
      setGymImage((prev) => ({ ...prev, ocrText: text, scanning: false }))
      if (timeMs !== null) {
        setPlacedAt(toDatetimeLocalValue(new Date(Date.now() - timeMs)))
      }
    } catch {
      setGymImage((prev) => ({ ...prev, scanning: false, ocrText: t(locale, 'ocrFailed') }))
    }
  }

  const scanCoins = async () => {
    if (!coinsImage.file) return
    setCoinsImage((prev) => ({ ...prev, scanning: true, ocrText: '' }))
    try {
      const text = await recognizeText(coinsImage.file)
      const coins = parseCoins(text)
      setCoinsImage((prev) => ({ ...prev, ocrText: text, scanning: false }))
      if (coins !== null) {
        setCoinsToday(coins)
      }
    } catch {
      setCoinsImage((prev) => ({ ...prev, scanning: false, ocrText: t(locale, 'ocrFailed') }))
    }
  }

  const resetAll = () => {
    const resetTime = new Date()
    resetTime.setMilliseconds(0)
    setCurrentTime(resetTime.getTime())
    setPlacedAt(toDatetimeLocalValue(resetTime))
    setCoinsToday(0)
    clearImage(setGymImage)()
    clearImage(setCoinsImage)()
    notifiedRef.current = false
    void unlockAudio()
  }

  const submitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(t(locale, 'feedbackSubject'))
    const body = encodeURIComponent(
      `${feedbackMessage}\n\n${t(locale, 'feedbackFrom')} ${feedbackEmail || t(locale, 'notProvided')}`
    )
    window.location.href = `mailto:jonathan.dk@gmail.com?subject=${subject}&body=${body}`
    setFeedbackOpen(false)
    setFeedbackMessage('')
    setFeedbackEmail('')
  }

  return (
    <main className="container">
      <header className="app-header">
        <LanguageSelector />
      </header>
      <h1>{t(locale, 'appTitle')}</h1>

      <section className="timer-card">
        <label className="input-row">
          <span>
            {t(locale, 'placedInGym', {
              time: new Date(placedAt).toLocaleTimeString(localeToBcp47(locale), {
                hour: '2-digit',
                minute: '2-digit',
              }),
              date: formatDate(new Date(placedAt), locale),
            })}
            <button
              type="button"
              className="text-button"
              onClick={() => setDateInputVisible((visible) => !visible)}
              aria-expanded={dateInputVisible}
            >
              {t(locale, 'changeDateTime')}
            </button>
          </span>
          {dateInputVisible && (
            <input
              type="datetime-local"
              step="1"
              lang={localeToBcp47(locale)}
              value={placedAt}
              onChange={(e) => setPlacedAt(e.target.value)}
            />
          )}
        </label>

        <CoinsInput value={coinsToday} onChange={setCoinsToday} />

        <StatsDisplay
          timeInGym={formatDuration(elapsedMs)}
          coinsEarned={coinsEarned}
          coinsMax={MAX_COINS}
          remainingTime={formatDuration(remainingMs)}
          maxed={maxed}
        />

        <div className="alert-row">
          {notifyPermission === 'default' && (
              <button
              type="button"
              onClick={async () => {
                await unlockAudio()
                const permission = await requestNotificationPermission()
                setNotifyPermission(permission)
                if (permission === 'granted') await playHootHoot()
                setAlarmNoticeOpen(true)
              }}
            >
              {t(locale, 'alert')}
            </button>
          )}
          {notifyPermission === 'granted' && (
            <span className="alert-status">{t(locale, 'alertEnabled')}</span>
          )}
          {notifyPermission === 'denied' && (
            <span className="alert-status">{t(locale, 'notificationsBlocked')}</span>
          )}
          <button type="button" className="secondary reset-button" onClick={resetAll}>
            {t(locale, 'reset')}
          </button>
          <button
            type="button"
            className="secondary"
            onClick={() => setShareOpen(true)}
          >
            {t(locale, 'share')}
          </button>
          <button
            type="button"
            className="feedback-button"
            onClick={() => setFeedbackOpen((open) => !open)}
            aria-expanded={feedbackOpen}
          >
            {t(locale, 'feedback')}
          </button>
        </div>
        <BuyMeACoffee />

        {feedbackOpen && (
          <div
            className="feedback-modal-backdrop"
            onClick={() => setFeedbackOpen(false)}
            role="presentation"
          >
            <form
              className="feedback-form"
              onSubmit={submitFeedback}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="feedback-header">
                <h2>{t(locale, 'sendFeedback')}</h2>
                <button
                  type="button"
                  className="feedback-close"
                  onClick={() => setFeedbackOpen(false)}
                  aria-label={t(locale, 'closeFeedbackForm')}
                >
                  ×
                </button>
              </div>
              <label className="feedback-field">
                {t(locale, 'message')}
                <textarea
                  required
                  rows={4}
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder={t(locale, 'messagePlaceholder')}
                />
              </label>
              <label className="feedback-field">
                {t(locale, 'email')}
                <input
                  type="email"
                  required
                  value={feedbackEmail}
                  onChange={(e) => setFeedbackEmail(e.target.value)}
                  placeholder={t(locale, 'emailPlaceholder')}
                />
              </label>
              <div className="feedback-actions">
                <button type="submit">{t(locale, 'sendFeedback')}</button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setFeedbackOpen(false)}
                >
                  {t(locale, 'cancel')}
                </button>
              </div>
            </form>
          </div>
        )}

        {alarmNoticeOpen && (
          <div
            className="feedback-modal-backdrop"
            onClick={() => setAlarmNoticeOpen(false)}
            role="presentation"
          >
            <div
              className="feedback-form"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="feedback-header">
                <h2>{t(locale, 'alertEnabledTitle')}</h2>
                <button
                  type="button"
                  className="feedback-close"
                  onClick={() => setAlarmNoticeOpen(false)}
                  aria-label={t(locale, 'closeNotificationNotice')}
                >
                  ×
                </button>
              </div>
              <p>{t(locale, 'keepAppOpen')}</p>
              <div className="feedback-actions">
                <button
                  type="button"
                  onClick={() => setAlarmNoticeOpen(false)}
                >
                  {t(locale, 'gotIt')}
                </button>
              </div>
            </div>
          </div>
        )}

        {shareOpen && (
          <div
            className="feedback-modal-backdrop"
            onClick={() => setShareOpen(false)}
            role="presentation"
          >
            <div
              className="feedback-form share-form"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="feedback-header">
                <h2>{t(locale, 'shareThisApp')}</h2>
                <button
                  type="button"
                  className="feedback-close"
                  onClick={() => setShareOpen(false)}
                  aria-label={t(locale, 'closeShareDialog')}
                >
                  ×
                </button>
              </div>
              <div className="qr-code">
                <QRCodeSVG value={'https://buymeacoffee.com/jonathan.dk/e/561056'} size={200} level="M" />
              </div>
              <p className="share-url">{'https://buymeacoffee.com/jonathan.dk/e/561056'}</p>
              <div className="feedback-actions">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText('https://buymeacoffee.com/jonathan.dk/e/561056')
                  }}
                >
                  {t(locale, 'copyLink')}
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setShareOpen(false)}
                >
                  {t(locale, 'close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {elapsedMs === 0 && (
        <section className="images">
          <ImageCard
            title={t(locale, 'gymScreenshot')}
            state={gymImage}
            onFile={setImageFile(setGymImage)}
            onClear={clearImage(setGymImage)}
            onScan={scanGym}
            scanLabel={t(locale, 'scanTimeInGym')}
          />
          <ImageCard
            title={t(locale, 'coinsEarnedTodayScreenshot')}
            state={coinsImage}
            onFile={setImageFile(setCoinsImage)}
            onClear={clearImage(setCoinsImage)}
            onScan={scanCoins}
            scanLabel={t(locale, 'scanCoinCount')}
          />
        </section>
      )}

    </main>
  )
}

function ImageCard({
  title,
  state,
  onFile,
  onClear,
  onScan,
  scanLabel,
}: {
  title: string
  state: ImageState
  onFile: (file: File | undefined) => void
  onClear: () => void
  onScan: () => void
  scanLabel: string
}) {
  const { locale } = useLocale()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      onFile(file)
    }
  }

  return (
    <div
      className={`image-card ${isDragging ? 'dragging' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <h2>{title}</h2>
      {state.url ? (
        <>
          <img src={state.url} alt={title} />
          <div className="image-actions">
            <button
              type="button"
              onClick={onScan}
              disabled={state.scanning}
            >
              {state.scanning ? t(locale, 'scanning') : scanLabel}
            </button>
            <button type="button" className="secondary" onClick={onClear}>
              {t(locale, 'remove')}
            </button>
          </div>
          {state.ocrText && (
            <div className="ocr-result">
              <strong>{t(locale, 'recognizedText')}</strong>
              <pre>{state.ocrText}</pre>
            </div>
          )}
        </>
      ) : (
        <>
          <p>{t(locale, 'dragDropOrUpload')}</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button type="button" onClick={() => inputRef.current?.click()}>
            {t(locale, 'chooseImage')}
          </button>
        </>
      )}
    </div>
  )
}

export default App
