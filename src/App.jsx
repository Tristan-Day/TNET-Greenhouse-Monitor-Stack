import { withAuthenticator } from '@aws-amplify/ui-react'

import { createContext, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import { getUserData } from './logic/User'

import { Navigation } from './Navigation'
import SettingsRoutes from './subpage/Settings'
import Dashboard from './Dashboard'

let theme = 'light'
if (
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
) {
  theme = 'dark'
}

export const AccountContext = createContext({})

function App() 
{
  const [account, setAccount] = useState({})

  useEffect(() => {
    getUserData()
      .then(result => {
        setAccount(result)
      })
      .catch(error => {
        console.log(error.message)
      })
  }, [])

  return (
    <AccountContext.Provider value={account}>
      <BrowserRouter>
        <ThemeProvider theme={createTheme({ palette: { mode: theme } })}>
          <CssBaseline>
            <Routes>
              <Route path="*" element={<Navigation />}>
                <Route path=":device" element={<Dashboard />} />
                <Route index element={<Dashboard />} />
                {SettingsRoutes()}
              </Route>
            </Routes>
          </CssBaseline>
        </ThemeProvider>
      </BrowserRouter>
    </AccountContext.Provider>
  )
}

export default withAuthenticator(App)
