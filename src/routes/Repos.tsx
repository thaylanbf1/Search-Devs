import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { UserSchema, type UserProps } from '../types/user'
import { RepoSchema, type RepoProps } from '../types/repo'
import Repo, { lang_colors } from '../components/Repo'
import User from '../components/User'
import Loader from '../components/Loader'
import { Select, Flex, InputGroup, InputLeftElement, Input, Button, Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons'
import { useTranslation } from 'react-i18next'

type SortOption = 'stargazers' | 'created' | 'updated' | 'pushed' | 'full_name' | 'forks_count'
type DirectionOption = 'asc' | 'desc'
type ForkFilterOption = 'all' | 'sources' | 'forks'

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
  const [languageFilter, setLanguageFilter] = useState<string>('all')
  const [forkFilter, setForkFilter] = useState<ForkFilterOption>('all')

  const pageRef = useRef(1)
  const hasMoreRef = useRef(true)
  const isLoadingMoreRef = useRef(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  /**
  * Retrieves the main user profile data from the GitHub API.
  * Returns null if the user is not found (404) and validates the response using Zod.
  */
  const fetchUser = async (login: string) => {
    const res = await fetch(`https://api.github.com/users/${login}`)
    if (res.status === 404) return null
    const data = await res.json()
    return UserSchema.parse(data)
  }

  /**
   * Searches for a specific page of the user's repositories.
   * Retrieves batches of 10 items, pre-ordered by the date of the last push, to populate the local cache
   */
  const fetchRepos = async (login: string, pageNum: number) => {
    const res = await fetch(
      `https://api.github.com/users/${login}/repos?per_page=10&page=${pageNum}&sort=pushed&direction=desc`
    )
    const data = await res.json()
    return RepoSchema.array().parse(data)
  }

  /**
   * Function responsible for feeding the Infinite Scroll
   *Searches for the next page of repositories and adds it to the existing state
   */
  const loadMore = useCallback(async () => {
    // Guards: Prevents requests if there is no user, if it is already loading, or if there are no more pages
    if (!username) return
    if (isLoadingMoreRef.current || !hasMoreRef.current) return

    isLoadingMoreRef.current = true
    setIsLoadingMore(true)

    const nextPage = pageRef.current + 1
    const reposData = await fetchRepos(username, nextPage)

    pageRef.current = nextPage
    // If fewer than 10 items were returned, it means we've reached the end of the list in the API
    hasMoreRef.current = reposData.length === 10 
    isLoadingMoreRef.current = false

    // Append the new repositories to the local cache (while preserving the old ones)
    setRepos(prev => [...prev, ...reposData])
    setIsLoadingMore(false)
  }, [username])

  /**
   *Responsible for applying filters (Language and Fork) and sorting (Stars, Date, etc.)
   * on the client-side
   * useMemo ensures that this calculation only runs when the repositories or filters change
   */
  const processedRepos = useMemo(() => {
    let filtered = [...repos];

    // 1. Applying Language and Type filters (Forks/Sources)
    if (languageFilter !== 'all') {
      filtered = filtered.filter(repo => repo.language === languageFilter);
    }

    if (forkFilter === 'sources') {
      filtered = filtered.filter(repo => !repo.fork);
    } else if (forkFilter === 'forks') {
      filtered = filtered.filter(repo => repo.fork);
    }

    // 2. Sorting the already filtered list
    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sort) {
        case 'stargazers':
          comparison = a.stargazers_count - b.stargazers_count;
          break;
        case 'forks_count':
          comparison = a.forks_count - b.forks_count;
          break;
        case 'created':
          comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
          break;
        case 'updated':
          comparison = new Date(a.updated_at || 0).getTime() - new Date(b.updated_at || 0).getTime();
          break;
        case 'pushed':
          comparison = new Date(a.pushed_at || 0).getTime() - new Date(b.pushed_at || 0).getTime();
          break;
        case 'full_name':
          comparison = a.name.localeCompare(b.name);
          break;
      }

      // It reverses the sign of the comparison depending on the direction (Increasing/Decreasing)
      return direction === 'asc' ? comparison : -comparison;
    });
  }, [repos, sort, direction, languageFilter, forkFilter]);

  /**
   * Infinite Scroll Observer
   * It "watches" the sentinel div at the bottom of the screen. When it appears, it triggers loadMore()
   * It is recreated whenever the list of processed repositories changes
   */
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

    // Cleanup: Disconnects the observer when the component unmounts or the effect runs again.
    return () => observerRef.current?.disconnect()
  }, [loadMore, processedRepos])

  /**
   * Initialization flow
   * Runs only when the component mounts or when the 'username' in the URL changes
   * Resets all local states, pagination, and performs the initial search (User + Page 1 of Repos)
   */
  useEffect(() => {
    if (!username) return

    const run = async () => {
      // Initial setup: clears the screen and filters
      setIsLoading(true)
      setError(false)
      setRepos([])
      setLanguageFilter('all') 
      setForkFilter('all')

      // Resets the pagination controls for the new user
      pageRef.current = 1
      hasMoreRef.current = true
      isLoadingMoreRef.current = false

      const userData = await fetchUser(username)
      if (!userData) {
        setError(true)
        setIsLoading(false)
        return
      }

      const reposData = await fetchRepos(username, 1)
      setUser(userData)
      setRepos(reposData)
      hasMoreRef.current = reposData.length === 10
      setIsLoading(false)
    }

    run()
  }, [username])

  /**
   * Dynamically assembles the options for the Language Select
   * Combines the color-mapped languages ​​(lang_colors) with the languages ​​that came from the API ensuring that no exotic language from a repository is left out of the filter
   */
  const availableLanguages = useMemo(() => {
    const baseLangs = Object.keys(lang_colors)
    const fetchLangs = repos.map(r => r.language).filter(Boolean) as string[]
    // Set() automatically removes duplicates
    return Array.from(new Set([...baseLangs, ...fetchLangs])).sort()
  }, [repos])

  /**
   * Navigation utility.
   * Prevents empty searches and pushes the new route to the React Router.
   */
  const loadUser = async (newUsername: string) => {
    if (!newUsername.trim()) return
    navigate(`/profile/${newUsername}`)
  }

  return (
    <>
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 z-50 backdrop-blur-md border-b border-[#e5e3f0] bg-[#f8f7ff]">
        <Link to="/" className="font-nunito font-bold text-xs gradient-text whitespace-nowrap shrink-0 hidden sm:block">
          {t('search.title_blue')} {t('search.title_purple')}
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

        {/* Inline error*/}
        {error && !isLoading && (
          <div className="flex justify-center mt-16">
            <Alert status='error' borderRadius="xl" maxW="lg">
              <AlertIcon />
              <AlertTitle>{t('error.title')}</AlertTitle>
              <AlertDescription>{t('error.description')}</AlertDescription>
            </Alert>
          </div>
        )}

        {!isLoading && !error && user && (
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-7 items-start">
            <User {...user} />

            <div className="flex flex-col gap-4">
              
              <div className="bg-white p-3 rounded-xl border border-[#e5e3f0] shadow-sm flex flex-wrap gap-2">
                  <Select
                    size="sm"
                    borderRadius="lg"
                    value={languageFilter}
                    onChange={e => setLanguageFilter(e.target.value)}
                    borderColor="#e5e3f0"
                    focusBorderColor="purple.400"
                    bg="gray.50"
                    fontSize="xs"
                    flex="1"
                    minW="130px"
                    maxW={{ base: 'full', sm: '180px' }}
                  >
                    <option value="all">🌐 {t('repos.filters.all_languages')}</option>
                    {availableLanguages.map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </Select>

                  <Select
                    size="sm"
                    borderRadius="lg"
                    value={forkFilter}
                    onChange={e => setForkFilter(e.target.value as ForkFilterOption)}
                    borderColor="#e5e3f0"
                    focusBorderColor="purple.400"
                    bg="gray.50"
                    fontSize="xs"
                    flex="1"
                    minW="130px"
                    maxW={{ base: 'full', sm: '160px' }}
                  >
                    <option value="all">🗂️ {t('repos.filters.all_types')}</option>
                    <option value="sources">📄 {t('repos.filters.sources')}</option>
                    <option value="forks">🔄 {t('repos.filters.forks')}</option>
                  </Select>

                  <Select
                    size="sm"
                    borderRadius="lg"
                    value={sort}
                    onChange={e => setSort(e.target.value as SortOption)}
                    borderColor="#e5e3f0"
                    focusBorderColor="purple.400"
                    bg="white"
                    fontSize="xs"
                    flex="1"
                    minW="120px"
                    maxW={{ base: 'full', sm: '160px' }}
                  >
                    <option value="stargazers">⭐ {t('repos.sort.stars')}</option>
                    <option value="forks_count">🔄 {t('repos.sort.forks')}</option>
                    <option value="created">📅 {t('repos.sort.created')}</option>
                    <option value="updated">🔄 {t('repos.sort.updated')}</option>
                    <option value="pushed">🚀 {t('repos.sort.pushed')}</option>
                    <option value="full_name">🔤 {t('repos.sort.name')}</option>
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
                    flex="1"
                    minW="110px"
                    maxW={{ base: 'full', sm: '140px' }}
                  >
                    <option value="desc">⬇️ {t('repos.direction.desc')}</option>
                    <option value="asc">⬆️ {t('repos.direction.asc')}</option>
                  </Select>
              </div>

              {processedRepos.length === 0 ? (
                <div className="bg-white border border-[#e5e3f0] rounded-xl p-8 text-center text-gray-300 text-sm">
                  {repos.length === 0 ? t('repos.empty') : t('repos.empty_filtered')}
                </div>
              ) : (
                <>
                  {processedRepos.map(repo => (
                    <Repo key={repo.id} {...repo} login={username} />
                  ))}

                  <div ref={sentinelRef} className="h-4" />

                  {isLoadingMore && (
                    <div className="text-center text-xs text-gray-400 py-2">
                      {t('repos.loading_more')}
                    </div>
                  )}

                  {!hasMoreRef.current && processedRepos.length > 0 && (
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