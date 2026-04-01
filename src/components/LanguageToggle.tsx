import { useTranslation } from 'react-i18next'

const LanguageToggle = () => {
  const { i18n } = useTranslation()

  const currentLang = i18n.language.startsWith('pt') ? 'pt' : 'en'

  const toggle = () => {
    i18n.changeLanguage(currentLang === 'pt' ? 'en' : 'pt')
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-1 px-3 py-2 rounded-xl border border-[#4b1b79] bg-[#eef4fa] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer select-none"
    >
      <span
        className={`text-xs font-bold font-nunito transition-colors duration-200 ${
          currentLang === 'pt' ? 'text-purple-600' : 'text-gray-600'
        }`}
      >
        PT
      </span>

      <span className="relative mx-1 w-8 h-4 rounded-full bg-[#f0eeff] flex items-center">
        <span
          className={`absolute top-0.5 w-3 h-3 rounded-full bg-purple-500 shadow transition-all duration-300 ${
            currentLang === 'en' ? 'left-4' : 'left-0.5'
          }`}
        />
      </span>

      <span
        className={`text-xs font-bold font-nunito transition-colors duration-200 ${
          currentLang === 'en' ? 'text-purple-600' : 'text-gray-600'
        }`}
      >
        EN
      </span>
    </button>
  )
}

export default LanguageToggle