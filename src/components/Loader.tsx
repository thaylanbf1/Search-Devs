import { Spinner } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const Loader = () => {
  const {t} = useTranslation()
  return (
    <div className='flex flex-col items-center justify-center flex-1 gap-4 py-24'>
      {/* Charging spinner using Chakra UI */}
        <Spinner color="purple.500" size="xl" /> 
        <span className="text-xs text-gray-400">{t('loader.searching')}</span>
    </div>
  )
}

export default Loader