import { withAuthenticator } from '@aws-amplify/ui-react'

import { createContext, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import { getUserData } from './common/logic/User'
import { Navigation } from './Navigation'

import Loading from './common/component/Loading'
import SettingsRoutes from './page/settings'
import DashboardRoutes from './dashboard/Dashboard'

let theme = {
  palette: { mode: 'light', contrastThreshold: 4.5 }
}

if (
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
) {
  theme.palette.mode = 'dark'
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
    const location = window.location.href.endsWith('/')
    ? window.location.href.substring(0, window.location.href.length - 1)
    : window.location.href

    if (!account.DEVICES && location.split('/').length < 4) {
      window.location.replace(`${window.location.href}settings`)
    }

    else if (location.split('/').length < 4) {
      window.location.replace(`${window.location.href}devices/${account.DEVICES[0]}`)
    }
  }, [account])

  return (
    <AccountContext.Provider value={account}>
      <BrowserRouter>
        <ThemeProvider theme={createTheme(theme)}>
          <CssBaseline>
            <Routes>
              <Route path="*" element={<Navigation />}>
                {DashboardRoutes()} {SettingsRoutes()}
                <Route index element={<Loading />}/>
              </Route>
            </Routes>
          </CssBaseline>
        </ThemeProvider>
      </BrowserRouter>
    </AccountContext.Provider>
  )
}

export default withAuthenticator(App)
