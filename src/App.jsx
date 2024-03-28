import { Amplify } from 'aws-amplify'

import { Authenticator, withAuthenticator } from '@aws-amplify/ui-react'
import { ThemeProvider, createTheme } from '@mui/material/styles'

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { createContext, useEffect, useState } from 'react'

import Navigation from './Navigation'
import Dashboard from './Dashboard'

import Settings from './subpage/Settings'

import awsExports from './aws-exports'
Amplify.configure(awsExports)

let theme = 'light'
if (
  window.matchMedia &&
  window.matchMedia('(prefers-color-scheme: dark)').matches
) {
  theme = 'dark'
}

function App() {
  return (
    <Authenticator>
      <BrowserRouter>
        <ThemeProvider theme={createTheme({ palette: { mode: theme } })}>
          <Routes>
            <Route path="*" element={<Navigation />}>
              <Route index path="*" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </Authenticator>
  )
}

export default withAuthenticator(App)
