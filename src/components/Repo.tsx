import { StarIcon } from '@chakra-ui/icons'
import { Link } from 'react-router-dom'
import { type RepoProps } from '../types/repo'
import { useTranslation } from 'react-i18next'

// Returns the color associated with the repository's language.
const lang_colors: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Ruby: '#701516',
  Go: '#00ADD8',
  Rust: '#dea584',
  PHP: '#4F5D95',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  Vue: '#41b883',
}

const getLangColor = (lang?: string) => {
    return lang ? (lang_colors[lang] ?? '#8b5cf6') : '#8b5cf6'
}


const Repo = ({name, login, description, language, html_url, forks_count, stargazers_count, updated_at}: RepoProps) => {
  const { t } = useTranslation()

  
  // Calculates and formats the time since the repository was created/updated.
  const timeAgo = (dateStr?: string) => {
    if (!dateStr) return ''
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
    if (diff < 3600) return t('repo.time.minutes', { count: Math.round(diff / 60) })
    if (diff < 86400) return t('repo.time.hours', { count: Math.round(diff / 3600) })
    if (diff < 2592000) return t('repo.time.days', { count: Math.round(diff / 86400) })
    return t('repo.time.months', { count: Math.round(diff / 2592000) })
  }

  return (
     <div className="bg-white font-inter border border-[#e5e3f0] rounded-xl p-5 flex flex-col gap-2.5 hover:border-purple-DEFAULT hover:shadow-[0_4px_20px_rgba(139,92,246,0.1)] transition-all">

      <a href={html_url} target='_blank' rel="noreferrer">
        <h3 className="text-sm font-bold text-[#1a1523] hover:text-[#595cee]">{name}</h3>
      </a>

      {description && (
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{description}</p>
      )}

      <div className="flex items-center flex-wrap gap-3.5 mt-1">
        {language && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ background: getLangColor(language) }} />
            <span>{language}</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <StarIcon boxSize={3} />
          <span>{stargazers_count}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          {/* fork icon not available in Chakra icons */}
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
            <path d="M5 3.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm0 2.122a2.25 2.25 0 1 0-1.5 0v.878A2.25 2.25 0 0 0 5.75 8.5h1.5v2.128a2.251 2.251 0 1 0 1.5 0V8.5h1.5a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 0-1.5 0v.878a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 5 6.25v-.878zm3.75 7.378a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0zm3-8.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0z"/>
          </svg>
          <span>{forks_count}</span>
        </div>

        {updated_at && (
          <span className="text-[0.72rem] text-gray-500 ml-auto">
            {t('repo.updated')} {timeAgo(updated_at)}
          </span>
        )}

        <Link
          to={`/profile/${login}/${name}`}
          rel="noreferrer"
          className="flex items-center gap-1.5 text-purple-DEFAULT text-xs font-semibold px-3 py-1.5 border border-purple-DEFAULT rounded-md hover:bg-purple-DEFAULT hover:text-white transition-all whitespace-nowrap"
        >
          {t('repo.view_code')}
        </Link>
      </div>
    </div>  
)
}

export default Repo