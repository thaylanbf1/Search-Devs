import { useTranslation } from 'react-i18next'
import { type UserProps } from '../types/user'
import { EmailIcon, LinkIcon } from '@chakra-ui/icons'

const User = ({login,name,avatar_url,followers,following,public_repos,location,bio,email,blog,twitter_username, linkedin_username}: UserProps) => {

  // Ensures the URL is valid by adding the protocol (http/https) if it doesn't already exist.
  //This prevents errors when opening links, as browsers require the explicit protocol.
  //Ex: "github.com/user" -> "https://github.com/user"
    const ensureHttp = (url: string) => {
        return url.startsWith('http') ? url : `https://${url}`
    }

    const {t} = useTranslation()
  return (
    <aside className="bg-white border font-inter border-[#e5e3f0] rounded-2xl p-6 flex flex-col gap-4 animate-[slideUp_0.35s_ease_both] sticky top-20 h-fit">
      {/* Avatar + name */}
      <div className="flex items-center gap-3">
        <img
          src={avatar_url}
          alt={login}
          className="w-25 h-25 rounded-full border-2 border-purple-DEFAULT object-cover shrink-0"
        />
        <div>
          <h2 className="text-sm font-bold leading-tight">{name || login}</h2>
          <span className="text-sm text-gray-400 font-medium">@{login}</span>
        </div>
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-xs text-gray-600 leading-relaxed">{bio}</p>
      )}

      {/* Stats */}
      <div className="flex gap-5">
        <div className="flex flex-col items-center">
          <span className="text-base font-bold">{followers}</span>
          <span className="text-[0.68rem] text-gray-500">{t('user.followers')}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-base font-bold">{following}</span>
          <span className="text-[0.68rem] text-gray-500">{t('user.following')}</span>
        </div>
        {public_repos !== undefined && (
          <div className="flex flex-col items-center">
            <span className="text-base font-bold">{public_repos}</span>
            <span className="text-[0.68rem] text-gray-500">{t('user.repos')}</span>
          </div>
        )}
      </div>

      {/* Info rows */}
      <div className="flex flex-col gap-2">
        {location && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            {/* location icon not available in Chakra icons */}
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            <span>{location}</span>
          </div>
        )}
        {email && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <EmailIcon flexShrink={0} />
            <a href={`mailto:${email}`} className="text-purple-DEFAULT hover:underline truncate">
              {email}
            </a>
          </div>
        )}
        {blog && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <LinkIcon flexShrink={0} /> {/* Chakra ✅ */}
            <a href={ensureHttp(blog)} target="_blank" rel="noreferrer" className="text-purple-DEFAULT hover:underline truncate">
              {blog}
            </a>
          </div>
        )}
        {twitter_username && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
             {/* Twitter/X icon not available in Chakra icons */}
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <a href={`https://twitter.com/${twitter_username}`} target="_blank" rel="noreferrer" className="text-purple-DEFAULT hover:underline">
              @{twitter_username}
            </a>
          </div>
        )}
        {linkedin_username && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
             {/* LinkedIn icon not available in Chakra icons */}
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            <a href={`https://www.linkedin.com/in/${linkedin_username}`} target="_blank" rel="noreferrer" className="text-purple-DEFAULT hover:underline">
              @{linkedin_username}
            </a>
          </div>
        )}
      </div>
    </aside>
  )
}

export default User