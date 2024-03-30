import { createContext, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { signOut } from 'aws-amplify/auth'
import { styled } from '@mui/material/styles'

import {
  Toolbar,
  Box,
  ListItemIcon,
  ListItemButton,
  AppBar,
  Typography,
  IconButton,
  ListItemText,
  Divider,
  Drawer
} from '@mui/material'

import {
  MenuOutlined,
  SettingsOutlined,
  LogoutOutlined,
  ChevronLeft
} from '@mui/icons-material'

import { MonitoringIcon } from './subpage/component/icon/MonitoringIcon'

const DrawerProps = {
  variant: 'persistent',
  anchor: 'left',
  sx: {
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: 310,
      boxSizing: 'border-box'
    }
  }
}

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between'
}))

export const WindowContext = createContext()

function Titlebar({ window, setDrawerOpen }) {
  const navigate = useNavigate()

  return (
    <AppBar sx={{ position: 'sticky', top: 0 }}>
      <Toolbar>
        <IconButton
          sx={{ marginRight: '1.2rem' }}
          onClick={() => {
            setDrawerOpen(true)
          }}
          color="inherit"
        >
          <MenuOutlined />
        </IconButton>
        <Box sx={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <MonitoringIcon size={30} />
          <Typography variant="h6">{window.title}</Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Box>
          <Typography variant="h7">{window.message}</Typography>
        </Box>
        <IconButton
          sx={{ marginLeft: '1.2rem' }}
          onClick={() => {
            setDrawerOpen(false)
            navigate('settings')
          }}
          color="inherit"
        >
          <SettingsOutlined />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

export function Navigation() {
  const [window, setWindow] = useState({
    title: 'Greenhouse Monitor'
  })

  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Titlebar window={window} setDrawerOpen={setDrawerOpen} />

      <Drawer {...DrawerProps} open={drawerOpen}>
        <DrawerHeader>
          <Typography variant="h6" marginLeft="1rem">
            Greenhouse Monitor
          </Typography>
          <IconButton
            onClick={() => {
              setDrawerOpen(false)
            }}
          >
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>
        <Divider />

        <Box sx={{ flexGrow: '30' }} />

        <Divider />
        <ListItemButton
          onClick={async () => {
            await signOut()
          }}
        >
          <ListItemIcon>
            <LogoutOutlined />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Drawer>

      <WindowContext.Provider value={{ window: window, setWindow: setWindow }}>
        <Outlet />
      </WindowContext.Provider>
    </Box>
  )
}
