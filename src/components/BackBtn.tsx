import {ChevronLeftIcon} from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

const BackBtn = () => {
  const navigate = useNavigate()
  const {t} = useTranslation()

  return (
    <button
      onClick={() => navigate(-1)} // Navigates to the previous route in the history.
      className="flex items-center gap-2 text-sm font-semibold text-purple-DEFAULT border border-purple-DEFAULT px-4 py-2 rounded-lg hover:bg-purple-DEFAULT hover:text-white transition-all"
    >
      <ChevronLeftIcon />
      {t('back')}
    </button>
  )
}

export default BackBtn
