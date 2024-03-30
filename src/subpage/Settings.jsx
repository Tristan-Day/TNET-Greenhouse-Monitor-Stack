import { useContext, useEffect, useState } from 'react'
import { Outlet, Route, useNavigate } from 'react-router-dom'

import {
  Box,
  Button,
  Divider,
  Tab,
  Tabs,
  Typography,
  useTheme
} from '@mui/material'
import { DeviceHub, InfoRounded } from '@mui/icons-material'

import { AccountIcon } from './component/icon/AccountIcon'
import { WindowContext } from '../Navigation'

import Devices from './Devices'
import Legal from './Legal'

const SettingsContents = [
  { name: 'Devices', icon: <DeviceHub />, URL: 'devices' },
  { name: 'Legal', icon: <InfoRounded />, URL: 'legal' }
]

function Header() {
  const navigate = useNavigate()

  return (
    <Box sx={{ display: 'flex', margin: '1.2rem 1rem 1.2rem 1rem' }}>
      <Box sx={{ display: 'flex', marginRight: 'auto', gap: '1rem' }}>
        <AccountIcon fill={useTheme().palette.text.primary} size={60} />
        <Box>
          <Typography variant="h6">Username</Typography>
          <Typography variant="h8">email@example.co.uk</Typography>
        </Box>
      </Box>
      <Button
        variant="outlined"
        onClick={() => {
          navigate('/')
        }}
      >
        Return
      </Button>
    </Box>
  )
}

function Settings() {
  const windowContext = useContext(WindowContext)
  const [selection, setSelection] = useState(0)

  const navigate = useNavigate()

  useEffect(() => {
    windowContext.setWindow({ title: 'Settings' })
  }, [])

  const handleChange = (_, value) => {
    navigate(SettingsContents[value].URL)
    setSelection(value)
  }

  const Contents = SettingsContents.map((entry, index) => {
    return <Tab key={index} label={entry.name} icon={entry.icon} />
  })

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1}}>
      <Header />
      <Divider />

      <Box sx={{ display: 'flex', flexGrow: 1}}>
        <Tabs orientation="vertical" value={selection} onChange={handleChange} sx={{minWidth: 'fit-content'}}>
          {Contents}
        </Tabs>
        <Divider flexItem orientation="vertical" />
        <Box sx={{ display: 'flex', margin: '1rem', flexGrow: 1}}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default function SettingsRoutes() {
  return (
    <Route path="settings" element={<Settings />}>
      <Route path="*" element={<Devices />} />
      <Route path="legal" element={<Legal />} />
    </Route>
  )
}
