import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Search from '../components/Search'
import Loader from '../components/Loader'
import Error from '../components/Error'

const Home = () => {
  //State to handle error (user not found)
  const [error, setError] = useState(false)
  //State to control request loading.
  const [isLoading, setIsLoading] = useState(false)
  //Checks if a search has already been performed
  const [hasSearched, setHasSearched] = useState(false)
  const navigate = useNavigate()

  //Function responsible for retrieving the user from the GitHub API
  const loadUser = async (userName: string) => {
    //Avoid requests with empty input fields
    if (!userName.trim()) return

    setIsLoading(true)
    setError(false)
    setHasSearched(true)

    //GitHub API request
    const res = await fetch(`https://api.github.com/users/${userName}`)

    setIsLoading(false)

    //If the user does not exist
    if (res.status === 404) {
      setError(true)
      return
    }

    //Redirects to user profile page
    navigate(`/profile/${userName.trim()}`)
  }

  //Displays the initial search screen before any search is performed
  if (!hasSearched) {
    return <Search loadUser={loadUser} />
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      {isLoading && <Loader />}
      {error && <Error loadUser={loadUser}/>}
    </div>
  )
}

export default Home