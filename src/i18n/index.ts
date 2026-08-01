export type Locale = 'da' | 'en'

export const locales: Locale[] = ['da', 'en']

export const localeLabels: Record<Locale, string> = {
  da: 'Dansk',
  en: 'English',
}

export const en = {
  appTitle: 'Gym Coin Countdown',
  pageTitle: 'Gym Coin Countdown v1.1-intl',
  appName: 'GymCoins',
  manifestName: 'Gym Coin Countdown',
  manifestShortName: 'GymCoins',
  manifestDescription:
    'Track your Pokémon gym coin earnings and countdown timer.',
  placedInGym: 'Mon placed in gym at {time} on {date}',
  changeDateTime: 'Change Date & Time',
  coinsEarnedToday: 'Coins earned today:',
  timeInGym: 'Time in gym',
  coinsEarned: 'Coins earned',
  maxedOut: 'Maxed out',
  timeToMaxCoins: 'Time to 50 coins',
  alert: 'Alert',
  alertEnabled: 'Alert enabled!',
  notificationsBlocked: 'Notifications blocked in browser',
  reset: 'Reset',
  share: 'Share',
  feedback: 'Feedback',
  sendFeedback: 'Send feedback',
  closeFeedbackForm: 'Close feedback form',
  message: 'Message',
  messagePlaceholder: "Tell us what's on your mind...",
  email: 'Your E-mail (Required)',
  emailPlaceholder: 'you@example.com',
  cancel: 'Cancel',
  alertEnabledTitle: 'Alert enabled',
  closeNotificationNotice: 'Close notification notice',
  keepAppOpen: 'Do not close this app if you wish to receive notifications!',
  gotIt: 'Got it',
  shareThisApp: 'Share this app',
  closeShareDialog: 'Close share dialog',
  copyLink: 'Copy link',
  close: 'Close',
  gymScreenshot: 'Gym screenshot',
  coinsEarnedTodayScreenshot: 'Coins earned today',
  scanTimeInGym: 'Scan time in gym',
  scanCoinCount: 'Scan coin count',
  scanning: 'Scanning…',
  remove: 'Remove',
  recognizedText: 'Recognized text',
  dragDropOrUpload: 'Drag and drop an image, or choose one to upload.',
  chooseImage: 'Choose image',
  ocrFailed: 'OCR failed. Try again.',
  notificationTitle: 'Gym Coin Countdown',
  notificationBody: 'Your Pokémon has earned 50 coins!',
  feedbackSubject: 'Gym Coin Countdown Feedback',
  feedbackFrom: 'From:',
  notProvided: 'not provided',
  selectLanguage: 'Select language',
  buyMeACoffee: 'Buy me a coffee',
} as const

export const da = {
  appTitle: 'Gym Møntnedtæller',
  pageTitle: 'Gym Møntnedtæller v1.1-intl',
  appName: 'GymMønter',
  manifestName: 'Gym Møntnedtæller',
  manifestShortName: 'GymMønter',
  manifestDescription:
    'Hold styr på dine Pokémon gym-møntindtægter og nedtællingsur.',
  placedInGym: 'Mon placeret i gym kl. {time} d. {date}',
  changeDateTime: 'Skift dato og tid',
  coinsEarnedToday: 'Mønter optjent i dag:',
  timeInGym: 'Tid i gym',
  coinsEarned: 'Mønter optjent',
  maxedOut: 'Maksimalt',
  timeToMaxCoins: 'Tid til 50 mønter',
  alert: 'Alarm',
  alertEnabled: 'Alarm aktiveret!',
  notificationsBlocked: 'Notifikationer blokeret i browseren',
  reset: 'Nulstil',
  share: 'Del',
  feedback: 'Feedback',
  sendFeedback: 'Send feedback',
  closeFeedbackForm: 'Luk feedbackformular',
  message: 'Besked',
  messagePlaceholder: 'Fortæl os, hvad du tænker...',
  email: 'Din e-mail (påkrævet)',
  emailPlaceholder: 'dig@eksempel.dk',
  cancel: 'Annuller',
  alertEnabledTitle: 'Alarm aktiveret',
  closeNotificationNotice: 'Luk notifikationsmeddelelse',
  keepAppOpen: 'Luk ikke denne app, hvis du ønsker at modtage notifikationer!',
  gotIt: 'Forstået',
  shareThisApp: 'Del denne app',
  closeShareDialog: 'Luk delingsvinduet',
  copyLink: 'Kopier link',
  close: 'Luk',
  gymScreenshot: 'Gym-screenshot',
  coinsEarnedTodayScreenshot: 'Mønter optjent i dag',
  scanTimeInGym: 'Scan tid i gym',
  scanCoinCount: 'Scan møntantal',
  scanning: 'Scanner…',
  remove: 'Fjern',
  recognizedText: 'Genkendt tekst',
  dragDropOrUpload: 'Træk og slip et billede, eller vælg et at uploade.',
  chooseImage: 'Vælg billede',
  ocrFailed: 'OCR mislykkedes. Prøv igen.',
  notificationTitle: 'Gym Møntnedtæller',
  notificationBody: 'Din Pokémon har optjent 50 mønter!',
  feedbackSubject: 'Feedback til Gym Møntnedtæller',
  feedbackFrom: 'Fra:',
  notProvided: 'ikke angivet',
  selectLanguage: 'Vælg sprog',
  buyMeACoffee: 'Køb mig en kop Kaffe',
} as const

export const translations = { en, da }

export type TranslationKey = keyof typeof en

export function t(locale: Locale, key: TranslationKey, replacements?: Record<string, string>): string {
  let text: string = translations[locale][key]
  if (replacements) {
    for (const [placeholder, value] of Object.entries(replacements)) {
      text = text.replace(`{${placeholder}}`, value)
    }
  }
  return text
}

export function localeToBcp47(locale: Locale): string {
  return locale === 'da' ? 'da-DK' : 'en-GB'
}

export function formatDate(date: Date, locale: Locale): string {
  return date.toLocaleDateString(localeToBcp47(locale), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date: Date, locale: Locale): string {
  return date.toLocaleTimeString(localeToBcp47(locale), {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateTime(date: Date, locale: Locale): string {
  return `${formatDate(date, locale)} ${formatTime(date, locale)}`
}

export const defaultLocale: Locale = 'da'
