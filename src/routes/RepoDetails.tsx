import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import BackBtn from '../components/BackBtn'
import Loader from '../components/Loader'
import { Tabs, TabList, Tab, TabPanels, TabPanel, Badge } from '@chakra-ui/react'

//Data structure of a commit with basic information (message, author, and link)
type Commit = {
    sha: string
    html_url: string
    commit: {
        message: string
        author: { name: string; date: string }
    }
}

//Models a GitHub API issue, including status, author, and creation date
type Issue = {
    id: number
    number: number
    title: string
    state: 'open' | 'closed'
    html_url: string
    user: { login: string }
    created_at: string
    pull_request?: object // If this field is present, it's a PR.
}

const timeAgo = (dateStr: string) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 3600) return `há ${Math.round(diff / 60)} min`
    if (diff < 86400) return `há ${Math.round(diff / 3600)} h`
    if (diff < 2592000) return `há ${Math.round(diff / 86400)} dias`
    return `há ${Math.round(diff / 2592000)} meses`
}

const RepoDetails = () => {
    const { username, reponame } = useParams<{ username: string; reponame: string }>()

    const [commits, setCommits] = useState<Commit[]>([])
    const [issues, setIssues] = useState<Issue[]>([])
    const [prs, setPrs] = useState<Issue[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [repo, setRepo] = useState<{ description: string; stargazers_count: number; forks_count: number } | null>(null)

    useEffect(() => {
        if (!username || !reponame) return

        const fetchAll = async () => {
            setIsLoading(true)

            const [repoRes, commitsRes, issuesRes] = await Promise.all([
                fetch(`https://api.github.com/repos/${username}/${reponame}`),
                fetch(`https://api.github.com/repos/${username}/${reponame}/commits?per_page=10`),
                fetch(`https://api.github.com/repos/${username}/${reponame}/issues?state=all&per_page=10`)
            ])

            const repoData = await repoRes.json()
            const commitsData = await commitsRes.json()
            const issuesData = await issuesRes.json()

            setRepo(repoData)
            setCommits(Array.isArray(commitsData) ? commitsData : [])

            // Separate issues de pull requests
            const allIssues: Issue[] = Array.isArray(issuesData) ? issuesData : []
            setIssues(allIssues.filter(i => !i.pull_request))
            setPrs(allIssues.filter(i => !!i.pull_request))

            setIsLoading(false)
        }

        fetchAll()
    }, [username, reponame])

    return (
        <>
            <div className="border-b border-[#e5e3f0] bg-[#f8f7ff] px-4 py-4 flex items-center gap-3 sticky top-0 z-50 backdrop-blur-md overflow-hidden">
                <BackBtn />
                <span className="text-sm text-gray-400 truncate min-w-0">
                    <span className="font-semibold text-[#1a1523]">{username}</span>
                    {' / '}
                    <span className="font-semibold text-purple-DEFAULT">{reponame}</span>
                </span>
            </div>

            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-8">
                {isLoading ? <Loader /> : (
                    <>
                        {repo?.description && (
                            <p className="text-sm text-gray-400 mb-6">{repo.description}</p>
                        )}

                        <Tabs colorScheme="purple" variant="enclosed">
                            <TabList>
                                <Tab fontSize="sm" translate='no'>Commits ({commits.length})</Tab>
                                <Tab fontSize="sm" translate='no'>Issues ({issues.length})</Tab>
                                <Tab fontSize="sm" translate='no'>Pull Requests ({prs.length})</Tab>
                            </TabList>

                            <TabPanels>
                                {/* COMMITS */}
                                <TabPanel px={0}>
                                    <div className="flex flex-col gap-3">
                                        {commits.map((c) => (
                                            <a key={c.sha} href={c.html_url} target="_blank" rel="noreferrer"
                                                className="bg-white border border-[#e5e3f0] rounded-xl p-4 flex flex-col gap-1">
                                                <p className="text-sm font-medium text-[#1a1523] line-clamp-2 hover:text-[#a55ff5]">
                                                    {c.commit.message.split('\n')[0]}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <span>{c.commit.author.name}</span>
                                                    <span>·</span>
                                                    <span>{timeAgo(c.commit.author.date)}</span>
                                                    <span className="ml-auto font-mono text-[0.65rem] text-gray-300">
                                                        {c.sha.slice(0, 7)}
                                                    </span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </TabPanel>

                                {/* ISSUES */}
                                <TabPanel px={0}>
                                    <div className="flex flex-col gap-3">
                                        {issues.length === 0 ? (
                                            <p className="text-sm text-gray-300 text-center py-8">Nenhuma issue encontrada.</p>
                                        ) : issues.map((issue) => (
                                            <a key={issue.id} href={issue.html_url} target="_blank" rel="noreferrer"
                                                className="bg-white border border-[#e5e3f0] rounded-xl p-4 flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge colorScheme={issue.state === 'open' ? 'green' : 'red'} fontSize="0.6rem">
                                                        {issue.state}
                                                    </Badge>
                                                    <p className="text-sm font-medium text-[#1a1523] line-clamp-1 hover:text-[#a55ff5]">{issue.title}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <span>#{issue.number}</span>
                                                    <span>·</span>
                                                    <span>{issue.user.login}</span>
                                                    <span>·</span>
                                                    <span>{timeAgo(issue.created_at)}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </TabPanel>

                                {/* PULL REQUESTS */}
                                <TabPanel px={0}>
                                    <div className="flex flex-col gap-3">
                                        {prs.length === 0 ? (
                                            <p className="text-sm text-gray-300 text-center py-8">Nenhum pull request encontrado.</p>
                                        ) : prs.map((pr) => (
                                            <a key={pr.id} href={pr.html_url} target="_blank" rel="noreferrer"
                                                className="bg-white border border-[#e5e3f0] rounded-xl p-4 flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge colorScheme={pr.state === 'open' ? 'purple' : 'gray'} fontSize="0.6rem">
                                                        {pr.state}
                                                    </Badge>
                                                    <p className="text-sm font-medium text-[#1a1523] line-clamp-1 hover:text-[#a55ff5]">{pr.title}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <span>#{pr.number}</span>
                                                    <span>·</span>
                                                    <span>{pr.user.login}</span>
                                                    <span>·</span>
                                                    <span>{timeAgo(pr.created_at)}</span>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </>
                )}
            </div>
        </>
    )
}

export default RepoDetails