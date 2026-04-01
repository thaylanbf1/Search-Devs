import { Outlet } from "react-router-dom"
import LanguageToggle from "../components/LanguageToggle"
// Main layout displaying the content of routes nested via Outlet.
const Layout = () => {
  return (
    <main className="flex flex-col flex-1">
      <LanguageToggle/>
        <Outlet />
    </main>
  )
}

export default Layout