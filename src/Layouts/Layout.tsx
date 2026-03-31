import { Outlet } from "react-router-dom"
// Main layout displaying the content of routes nested via Outlet.
const Layout = () => {
  return (
    <main className="flex flex-col flex-1">
        <Outlet />
    </main>
  )
}

export default Layout