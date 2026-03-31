import { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { UserSchema, type UserProps } from '../types/user'
import { RepoSchema, type RepoProps } from '../types/repo'
import Repo from '../components/Repo'
import User from '../components/User'
import Loader from '../components/Loader'
import Error from '../components/Error'
import { Select, Flex, InputGroup, InputLeftElement, Input } from '@chakra-ui/react'
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
  const [error, setError] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [sort, setSort] = useState<SortOption>('stargazers')
  const [direction, setDirection] = useState<DirectionOption>('desc')

  const observerRef = useRef<IntersectionObserver | null>(null)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Sorts repos locally to avoid unnecessary API calls on sort/direction change
  const sortedRepos = useMemo(() => {
    const sorted = [...repos]

    // Aplica ordenação na lista de repositórios conforme o tipo selecionado,
    // convertendo valores (número, data ou string) para comparação
    // e respeitando a direção (asc/desc)
    sorted.sort((a, b) => {
      let valA: string | number
      let valB: string | number

      switch (sort) {
        case 'stargazers':
          valA = a.stargazers_count ?? 0
          valB = b.stargazers_count ?? 0
          break
        // Converte datas para timestamp para permitir comparação numérica
        case 'created':
          valA = new Date(a.created_at ?? '').getTime()
          valB = new Date(b.created_at ?? '').getTime()
          break
        case 'updated':
          valA = new Date(a.updated_at ?? '').getTime()
          valB = new Date(b.updated_at ?? '').getTime()
          break
        case 'pushed':
          valA = new Date(a.pushed_at ?? '').getTime()
          valB = new Date(b.pushed_at ?? '').getTime()
          break
        case 'full_name':
          valA = a.name?.toLowerCase() ?? ''
          valB = b.name?.toLowerCase() ?? ''
          break
        default:
          return 0
      }

      //Compares the values ​​considering the sorting direction
      if (valA < valB) return direction === 'asc' ? -1 : 1
      if (valA > valB) return direction === 'asc' ? 1 : -1
      return 0
    })

    return sorted
  }, [repos, sort, direction])

  // Fetches the user profile
  const fetchUser = async (login: string) => {
    const res = await fetch(`https://api.github.com/users/${login}`)
    if (res.status === 404) return null
    const data = await res.json()
    return UserSchema.parse(data)
  }

  // Fetches a single page of repos without sort/direction — sorting is done locally
  const fetchRepos = async (login: string, pageNum: number) => {
    const res = await fetch(
      `https://api.github.com/users/${login}/repos?per_page=10&page=${pageNum}`
    )
    const data = await res.json()
    return RepoSchema.array().parse(data)
  }

  // Loads everything from scratch — only triggered when username changes
  const loadInitial = useCallback(async (login: string) => {
    setIsLoading(true)
    setError(false)
    setRepos([])
    setPage(1)
    setHasMore(true)

    const userData = await fetchUser(login)
    if (!userData) {
      setError(true)
      setIsLoading(false)
      return
    }

    const reposData = await fetchRepos(login, 1)
    setUser(userData)
    setRepos(reposData)
    setHasMore(reposData.length === 10)
    setIsLoading(false)
  }, [])

  // Loads the next page for infinite scroll
  const loadMore = useCallback(async () => {
    if (!username || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)
    const nextPage = page + 1
    const reposData = await fetchRepos(username, nextPage)

    setRepos(prev => [...prev, ...reposData])
    setPage(nextPage)
    setHasMore(reposData.length === 10)
    setIsLoadingMore(false)
  }, [username, page, isLoadingMore, hasMore])

  // Only re-fetches when username changes — sort/direction changes are handled locally
  useEffect(() => {
    if (!username) return
    loadInitial(username)
  }, [username])

  // Sets up IntersectionObserver on the sentinel element to trigger loadMore
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect()

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore()
    }, { threshold: 1.0 })

    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current)

    return () => observerRef.current?.disconnect()
  }, [loadMore])

  const loadUser = async (newUsername: string) => {
    if (!newUsername.trim()) return
    navigate(`/profile/${newUsername}`)
  }

  return (
    <>
      {/* Header */}
      <div className="px-8 py-4 flex items-center gap-4 sticky top-0 z-50 backdrop-blur-md">
        <span className="font-nunito font-bold text-sm gradient-text hidden sm:block whitespace-nowrap">
          <Link to={`/`}>
            Search d_evs
          </Link>
        </span>
        <Flex align="center" gap={3} w="full" maxW="md">
          <InputGroup flex={1} borderRadius="xl" overflow="hidden" border="1px solid #e5e3f0" shadow="sm">
            <InputLeftElement pointerEvents="none" h="full" pl={1}>
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder={t('search.search_user_placeholder')}
              defaultValue={username}
              onKeyDown={(e) => {
                if (e.key === 'Enter') loadUser((e.target as HTMLInputElement).value)
              }}
              border="none"
              _focus={{ boxShadow: 'none' }}
              bg="white"
              fontSize="sm"
              h="40px"
              pl={9}
            />
          </InputGroup>
        </Flex>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {isLoading && <Loader />}
        {error && <Error loadUser={loadUser} />}

        {!isLoading && !error && user && (
          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-7 items-start">
            <User {...user} />

            <div className="flex flex-col gap-4">
              {/* Sort controls — changes are applied locally without new API calls */}
              <Flex gap={3} align="center">
                <Select
                  size="sm"
                  borderRadius="lg"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  borderColor="#e5e3f0"
                  focusBorderColor="purple.400"
                  bg="white"
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
                  onChange={(e) => setDirection(e.target.value as DirectionOption)}
                  borderColor="#e5e3f0"
                  focusBorderColor="purple.400"
                  bg="white"
                >
                  <option value="desc">{t('repos.direction.desc')}</option>
                  <option value="asc">{t('repos.direction.asc')}</option>
                </Select>
              </Flex>

              {/* Repo list — uses sortedRepos (locally sorted) instead of raw repos */}
              {sortedRepos.length === 0 ? (
                <div className="bg-white border border-[#e5e3f0] rounded-xl p-8 text-center text-gray-300 text-sm">
                  {t('repos.empty')}
                </div>
              ) : (
                <>
                  {sortedRepos.map((repo) => <Repo key={repo.id} {...repo} login={username} />)}

                  {/* Sentinel — invisible element at the bottom that triggers loadMore */}
                  <div ref={sentinelRef} className="h-4" />

                  {isLoadingMore && (
                    <div className="text-center text-xs text-gray-400 py-2">
                      {t('repos.loading_more')}
                    </div>
                  )}

                  {!hasMore && repos.length > 0 && (
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