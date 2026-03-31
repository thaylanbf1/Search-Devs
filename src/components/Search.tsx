import { useState, type KeyboardEvent } from "react"
import { SearchIcon } from '@chakra-ui/icons' 
import {Input, InputGroup, InputLeftElement, Button, Flex} from '@chakra-ui/react'
import { useTranslation } from "react-i18next"

type SearchProps = {
    loadUser: (userName: string) => Promise<void>
}

const Search = ({ loadUser }: SearchProps) => {

    const [userName, setUserName] = useState('')
    const {t} = useTranslation() 

    // Pressing Enter triggers the search.
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') loadUser(userName)
    }

    return (
        <div className="flex flex-col items-center justify-center flex-1 min-h-screen px-6 pt-20 pb-12">
            <h1 className="font-nunito font-bold text-5xl md:text-8xl text-[#9d25cc] mb-3 text-center">
                <span className="text-[#4a82fa]">{t('search.title_blue')}</span> {t('search.title_purple')}
            </h1>
            <p className="text-gray-400 font-nunito text-sm mb-10 text-center">
                {t('search.subtitle')}
            </p>

            <Flex align="center" gap={5} w="full" maxW="lg">
                <InputGroup flex={1} borderRadius="xl" overflow="hidden" border="1px solid #e5e3f0" shadow="md">
                    <InputLeftElement pointerEvents="none" h="full" pl={1}>
                        <SearchIcon color="gray.600" />
                    </InputLeftElement>
                    <Input
                        placeholder={t('search.placeholder')}
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        border="none"
                        _focus={{ boxShadow: 'none' }}
                        bg="white"
                        fontSize="sm"
                        fontFamily="nunito"
                        h="48px"
                        pl={9}
                    />
                </InputGroup>

                <Button
                    colorScheme="purple"
                    fontSize="sm"
                    fontFamily="nunito"
                    h="48px"
                    px={10}
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

export default Search