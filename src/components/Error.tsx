import { useState, type KeyboardEvent } from 'react'
import {
  Alert, AlertIcon, AlertTitle, AlertDescription,
  Input, InputGroup, InputLeftElement, Button, Flex
} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'

type ErrorProps = {
  loadUser: (userName: string) => Promise<void>
}

const Error = ({ loadUser }: ErrorProps) => {
  const [userName, setUserName] = useState('')
  const {t} = useTranslation()

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') loadUser(userName)
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-8 py-24">
      {/* Displays an error when the specified user is not found on GitHub */}
      <Alert status='error' borderRadius="xl" maxW="lg"> 
        <AlertIcon />
        <AlertTitle>{t('error.title')}</AlertTitle>
        <AlertDescription>{t('error.description')}</AlertDescription>
      </Alert>

      <Flex align="center" gap={3} w="full" maxW="lg">
        <InputGroup flex={1} borderRadius="xl" overflow="hidden" border="1px solid #e5e3f0" shadow="md">
          <InputLeftElement pointerEvents="none" h="full" pl={1}>
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder={t('search.search_another_placeholder')}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onKeyDown={handleKeyDown}
            border="none"
            _focus={{ boxShadow: 'none' }}
            bg="white"
            fontSize="sm"
            h="48px"
            pl={9}
          />
        </InputGroup>

        <Button
          colorScheme="purple"
          fontSize="sm"
          h="48px"
          px={7}
          borderRadius="xl"
          flexShrink={0}
          onClick={() => loadUser(userName)}
        >
          {t('search.button')}
        </Button>
      </Flex>
    </div>
  )
}

export default Error