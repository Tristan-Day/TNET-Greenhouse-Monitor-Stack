import { withAuthenticator } from '@aws-amplify/ui-react'

import { createContext, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import { getUserData } from './logic/User'

import { Navigation } from './Navigation'
import SettingsRoutes from './subpage/Settings'

import Dashboard from './Dashboard'
import Loading from './Loading'

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

  useEffect(() => {
    if (!account.DEVICES) {
      return
    }

    const location = window.location.href.endsWith('/')
      ? window.location.href.substring(0, window.location.href.length - 1)
      : window.location.href

    if (location.split('/').length < 4) {
      window.location.replace(`${window.location.href}${account.DEVICES[0]}`)
    }
  }, [account])

  return (
    <AccountContext.Provider value={account}>
      <BrowserRouter>
        <ThemeProvider theme={createTheme({ palette: { mode: theme } })}>
          <CssBaseline>
            <Routes>
              <Route path="*" element={<Navigation />}>
                <Route index element={<Loading />}/>
                <Route path=":identifier" element={<Dashboard />} />
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
