import { useLocale } from './i18n/useLocale'
import { t } from './i18n'

export function BuyMeACoffee() {
  const { locale } = useLocale()

  return (
    <div id="bmc-root">
      <link
        href="https://fonts.googleapis.com/css?family=Cookie&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .bmc-btn svg {
          height: 32px !important;
          margin-bottom: 0px !important;
          box-shadow: none !important;
          border: none !important;
          vertical-align: middle !important;
          transform: scale(0.9);
          flex-shrink: 0;
        }
        .bmc-btn {
          min-width: 210px;
          color: #000000 !important;
          background-color: #FFDD00 !important;
          height: 60px;
          border-radius: 12px;
          font-size: 28px;
          font-weight: Normal;
          border: none;
          padding: 0px 24px;
          line-height: 27px;
          text-decoration: none !important;
          display: inline-flex !important;
          align-items: center;
          font-family: 'Cookie', cursive !important;
          -webkit-box-sizing: border-box !important;
          box-sizing: border-box !important;
        }
        .bmc-btn:hover,
        .bmc-btn:active,
        .bmc-btn:focus {
          text-decoration: none !important;
          cursor: pointer;
        }
        .bmc-btn-text {
          text-align: left;
          margin-left: 8px;
          display: inline-block;
          line-height: 0;
          width: 100%;
          flex-shrink: 0;
          font-family: 'Cookie', cursive !important;
          white-space: nowrap;
        }
      `}</style>
      <a
        className="bmc-btn"
        href="https://buymeacoffee.com/jonathan.dk"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span style={{ fontSize: '32px', lineHeight: 0 }}>☕</span>
        <span className="bmc-btn-text">{t(locale, 'buyMeACoffee')}</span>
      </a>
    </div>
  )
}
