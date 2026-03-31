import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './routes/Home.tsx'
import Repos from './routes/Repos.tsx'
import { ChakraProvider } from '@chakra-ui/react'
import Layout from './Layouts/Layout.tsx'
import RepoDetails from './routes/RepoDetails.tsx'
import './i18n'


// Defines the application routes, including nested routes for layout,
// Lists repositories and details of each repository
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // Main layout that encompasses all routes
    children: [
      {
        path: '/',
        element: <Home />, //User search homepage
      },
      {
        path: '/profile/:username',
        element: <Repos/>, //Displays the user's repositories.
      },
      {
        path: '/profile/:username/:reponame',
        element: <RepoDetails />, // Displays details of a specific repository
      }
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Global Chakra UI provider involving application routes */}
   <ChakraProvider resetCSS={false}> {/*  Disables the default CSS reset for Chakra UI */}
      <RouterProvider router={router} />
    </ChakraProvider>
  </StrictMode>,
)
