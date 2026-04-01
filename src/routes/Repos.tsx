import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { UserSchema, type UserProps } from '../types/user'
import { RepoSchema, type RepoProps } from '../types/repo'
import Repo from '../components/Repo'
import User from '../components/User'
import Loader from '../components/Loader'
import Error from '../components/Error'
import { Select, Flex, InputGroup, InputLeftElement, Input, Button } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'

type SortOption = 'stargazers' | 'created' | 'updated' | 'pushed' | 'full_name'
type DirectionOption = 'asc' | 'desc'

const Repos = () => {
  const { username } = useParams<{ username: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const [user, setUser] = useState<UserProps | null>(null)
  const [repos, setRepos] = useState<RepoProps[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchInput, setSearchInput] = useState(username ?? '')
  const [error, setError] = useState(false)
  const [sort, setSort] = useState<SortOption>('stargazers')
  const [direction, setDirection] = useState<DirectionOption>('desc')

  // Kept in refs so loadMore always reads the latest values
  // without needing to be re-created (which would re-trigger the observer useEffect)
  const pageRef = useRef(1)
  const hasMoreRef = useRef(true)
  const isLoadingMoreRef = useRef(false)
  const sortRef = useRef(sort)
  const directionRef = useRef(direction)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const fetchUser = async (login: string) => {
    const res = await fetch(`https://api.github.com/users/${login}`)
    if (res.status === 404) return null
    const data = await res.json()
    return UserSchema.parse(data)
  }

  const fetchRepos = async (
    login: string,
    pageNum: number,
    sortBy: SortOption,
    dir: DirectionOption
  ) => {
    const res = await fetch(
      `https://api.github.com/users/${login}/repos?per_page=10&page=${pageNum}&sort=${sortBy}&direction=${dir}`
    )
    const data = await res.json()
    return RepoSchema.array().parse(data)
  }

  // Stable callback — uses refs instead of state so it never changes reference,
  // which means the IntersectionObserver only needs to be created once
  const loadMore = useCallback(async () => {
    if (!username) return
    if (isLoadingMoreRef.current || !hasMoreRef.current) return

    isLoadingMoreRef.current = true
    setIsLoadingMore(true)

    const nextPage = pageRef.current + 1
    const reposData = await fetchRepos(username, nextPage, sortRef.current, directionRef.current)

    pageRef.current = nextPage
    hasMoreRef.current = reposData.length === 10
    isLoadingMoreRef.current = false

    setRepos(prev => [...prev, ...reposData])
    setIsLoadingMore(false)
  }, [username]) // only re-created when username changes

  // Create the IntersectionObserver once (per username) and never recreate it
  useEffect(() => {
    observerRef.current?.disconnect()

    observerRef.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) loadMore()
      },
      { threshold: 0 }
    )

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => observerRef.current?.disconnect()
  }, [loadMore]) // loadMore only changes when username changes

  // Re-attach observer to sentinel after every render
  // (sentinel unmounts during isLoading, so we need to re-observe it when it comes back)
  useEffect(() => {
    if (sentinelRef.current && observerRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }
  })

  // Loads from scratch whenever username, sort, or direction changes
  useEffect(() => {
    if (!username) return

    const run = async () => {
      setIsLoading(true)
      setError(false)
      setRepos([])

      // Reset refs
      pageRef.current = 1
      hasMoreRef.current = true
      isLoadingMoreRef.current = false
      sortRef.current = sort
      directionRef.current = direction

      const userData = await fetchUser(username)
      if (!userData) {
        setError(true)
        setIsLoading(false)
        return
      }

      const reposData = await fetchRepos(username, 1, sort, direction)
      setUser(userData)
      setRepos(reposData)
      hasMoreRef.current = reposData.length === 10
      setIsLoading(false)
    }

    run()
  }, [username, sort, direction])

  const loadUser = async (newUsername: string) => {
    if (!newUsername.trim()) return
    navigate(`/profile/${newUsername}`)
  }

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-50 backdrop-blur-md border-b border-[#e5e3f0] bg-[#f8f7ff]">
        <Link to="/" className="font-nunito font-bold text-xs gradient-text whitespace-nowrap shrink-0 hidden sm:block">
          Search d_evs
        </Link>
        <Flex align="center" gap={2} w="full" minW={0} maxW="md">
          <InputGroup flex={1} borderRadius="lg" overflow="hidden" border="1px solid #e5e3f0" shadow="sm" minW={0}>
            <InputLeftElement pointerEvents="none" h="full" pl={1}>
              <SearchIcon color="gray.300" boxSize={3} />
            </InputLeftElement>
            <Input
              placeholder={t('search.search_user_placeholder')}
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') loadUser(searchInput)
              }}
              border="none"
              _focus={{ boxShadow: 'none' }}
              bg="white"
              fontSize="xs"
              h="34px"
              pl={8}
            />
          </InputGroup>
          <Button
            colorScheme="purple"
            fontSize="xs"
            h="34px"
            px={3}
            borderRadius="lg"
            flexShrink={0}
            onClick={() => loadUser(searchInput)}
          >
            <SearchIcon className="sm:hidden" />
          </Button>
        </Flex>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6">
        {isLoading && <Loader />}
        {error && <Error loadUser={loadUser} />}

        {!isLoading && !error && user && (
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-7 items-start">
            <User {...user} />

            <div className="flex flex-col gap-4">
              {/* Sort controls */}
              <Flex gap={2} align="center">
                <Select
                  size="sm"
                  borderRadius="lg"
                  value={sort}
                  onChange={e => setSort(e.target.value as SortOption)}
                  borderColor="#e5e3f0"
                  focusBorderColor="purple.400"
                  bg="white"
                  fontSize="xs"
                >
                  <option value="stargazers">{t('repos.sort.stars')}</option>
                  <option value="created">{t('repos.sort.created')}</option>
                  <option value="updated">{t('repos.sort.updated')}</option>
                  <option value="pushed">{t('repos.sort.pushed')}</option>
                  <option value="full_name">{t('repos.sort.name')}</option>
                </Select>

                <Select
                  size="sm"
                  borderRadius="lg"
                  value={direction}
                  onChange={e => setDirection(e.target.value as DirectionOption)}
                  borderColor="#e5e3f0"
                  focusBorderColor="purple.400"
                  bg="white"
                  fontSize="xs"
                >
                  <option value="desc">{t('repos.direction.desc')}</option>
                  <option value="asc">{t('repos.direction.asc')}</option>
                </Select>
              </Flex>

              {/* Repo list */}
              {repos.length === 0 ? (
                <div className="bg-white border border-[#e5e3f0] rounded-xl p-8 text-center text-gray-300 text-sm">
                  {t('repos.empty')}
                </div>
              ) : (
                <>
                  {repos.map(repo => (
                    <Repo key={repo.id} {...repo} login={username} />
                  ))}

                  {/* Sentinel — triggers loadMore when scrolled into view */}
                  <div ref={sentinelRef} className="h-4" />

                  {isLoadingMore && (
                    <div className="text-center text-xs text-gray-400 py-2">
                      {t('repos.loading_more')}
                    </div>
                  )}

                  {!hasMoreRef.current && repos.length > 0 && (
                    <div className="text-center text-xs text-gray-300 py-2">
                      {t('repos.all_loaded')}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Repos