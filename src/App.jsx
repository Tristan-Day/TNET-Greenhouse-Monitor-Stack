import { withAuthenticator } from '@aws-amplify/ui-react'

import { createContext, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import { CssBaseline } from '@mui/material'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import { Navigation } from './Navigation'
import Dashboard from './Dashboard'

import SettingsRoutes from './subpage/Settings'

let theme = 'light'
if (
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
) {
  theme = 'dark'
}

export const DeviceContext = createContext({ devices: [] })

function App() {
  const [devices, setDevices] = useState({
    devices: []
  })

  useEffect(() => {
    // Code to retreive the list of registered devices
  }, [])

  return (
    <DeviceContext.Provider value={devices}>
      <BrowserRouter>
        <ThemeProvider theme={createTheme({ palette: { mode: theme } })}>
          <CssBaseline>
            <Routes>
              <Route path="*" element={<Navigation />}>
                {SettingsRoutes()}
                <Route index path="*" element={<Dashboard />} />
              </Route>
            </Routes>
          </CssBaseline>
        </ThemeProvider>
      </BrowserRouter>
    </DeviceContext.Provider>
  )
}

export default withAuthenticator(App)
