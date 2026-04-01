import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from './locales/en/translation.json'
import ptTranslation from './locales/pt/translation.json'

i18n
  .use(LanguageDetector) // detects browser language automatically
  .use(initReactI18next)
  .init({
    debug: true,
    resources: {
      en: { translation: enTranslation },
      pt: { translation: ptTranslation },
    },
    supportedLngs: ['en', 'pt'],
    fallbackLng: 'pt',
    load: 'languageOnly',
    detection: {
      order: ['navigator'],  
      caches: [],            
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n