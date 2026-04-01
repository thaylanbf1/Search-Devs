import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Search from '../components/Search'
import Loader from '../components/Loader'

const Home = () => {
  //State to handle error (user not found)
  const [error, setError] = useState(false)
  //State to control request loading.
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  //Function responsible for retrieving the user from the GitHub API
  const loadUser = async (userName: string) => {
    //Avoid requests with empty input fields
    if (!userName.trim()) return

    setIsLoading(true)
    setError(false)

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6">
      {isLoading ? <Loader /> : <Search loadUser={loadUser} error={error} />}
    </div>
  )
}

export default Home