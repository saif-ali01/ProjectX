import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Clients from './pages/client/Clients.jsx'
import AddWork from './pages/addWork/AddWork.jsx'
import SettingsPage from './pages/setting/SettingsPage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App /> */}
    {/* <Clients darkMode={true} /> */}
{/* <AddWork /> */}
<SettingsPage darkMode={false}  setDarkMode={false}/>
    {/* <Clients  darkMode={true} /> */}
  </StrictMode>,
)
