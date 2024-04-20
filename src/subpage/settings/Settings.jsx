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

import { Flex } from '../../component'
import { AccountIcon } from '../../component/icon/AccountIcon'

import Devices from './Devices'
import Legal from './Legal'

import { AccountContext } from '../../App'
import { WindowContext } from '../../Navigation'

const SettingsContents = 
[
  { name: 'Devices', icon: <DeviceHub />, URL: 'devices' },
  { name: 'Legal', icon: <InfoRounded />, URL: 'legal' }
]

function Header() 
{
  const accountContext = useContext(AccountContext)
  const navigate = useNavigate()

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const theme = useTheme()

  return (
    <Flex sx={{ margin: '1.2rem 1rem 1.2rem 1rem' }}>
      <Flex sx={{ marginRight: 'auto', gap: '1rem' }}>
        {!isMobileView && (
          <AccountIcon fill={theme.palette.text.primary} size={60} />
        )}
        {isMobileView ? (
          <Flex sx={{ alignItems: 'center' }}>
            <Box sx={{ width: '50vw' }}>
              <Typography variant="h6">{accountContext.NAME}</Typography>
              <Typography noWrap>{accountContext.EMAIL}</Typography>
            </Box>
          </Flex>
        ) : (
          <Flex sx={{ alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{accountContext.NAME}</Typography>
              <Typography>{accountContext.EMAIL}</Typography>
            </Box>
          </Flex>
        )}
      </Flex>

      <Button
        variant="outlined"
        onClick={() => {
          navigate(`/devices/${accountContext.DEVICES[0]}`)
        }}
      >
        Return
      </Button>
    </Flex>
  )
}

function Settings() 
{
  const windowContext = useContext(WindowContext)
  const [tab, setTab] = useState(0)

  const navigate = useNavigate()

  const Contents = SettingsContents.map((entry, index) => {
    return <Tab key={index} label={entry.name} icon={entry.icon} />
  })

  const handleChange = (_, value) => {
    navigate(SettingsContents[value].URL)
    setTab(value)
  }

  // Set the window title
  useEffect(() => {
    windowContext.setWindow({ title: 'Settings' })
  }, [])

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)

  return (
    <Flex direction="column" grow={1}>
      <Header />
      <Divider />

      {isMobileView ? (
        <Flex direction="column" grow={1}>
          <Tabs value={tab} onChange={handleChange}>
            {Contents}
          </Tabs>
          <Divider flexItem orientation="horizontal" />
          <Flex grow={1} sx={{ margin: '1rem' }}>
            <Outlet />
          </Flex>
        </Flex>
      ) : (
        <Flex direction="inline" grow={1}>
          <Tabs orientation="vertical" value={tab} onChange={handleChange} sx={{ minWidth: 'fit-content' }}>
            {Contents}
          </Tabs>
          <Divider flexItem orientation="vertical" />
          <Flex grow={1} sx={{ margin: '2rem' }}>
            <Outlet />
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}

export default function SettingsRoutes() 
{
  return (
    <Route path="settings" element={<Settings />}>
      <Route path="*" element={<Devices />} />
      <Route path="legal" element={<Legal />} />
    </Route>
  )
}
