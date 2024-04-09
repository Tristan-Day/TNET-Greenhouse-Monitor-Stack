import { createContext, useState, useContext } from 'react'
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
  Drawer,
  List,
  ListItem
} from '@mui/material'

import {
  MenuOutlined,
  SettingsOutlined,
  LogoutOutlined,
  ChevronLeft,
  DevicesOutlined
} from '@mui/icons-material'

import { Flex } from './component'
import { MonitoringIcon } from './component/icon/MonitoringIcon'
import { AccountContext } from './App'

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

function Titlebar({ window, setDrawer }) 
{
  const navigate = useNavigate()

  return (
    <AppBar sx={{ position: 'sticky', top: 0 }}>
      <Toolbar>
        <IconButton
          sx={{ marginRight: '1.2rem' }}
          onClick={() => {
            setDrawer(true)
          }}
          color="inherit"
        >
          <MenuOutlined />
        </IconButton>

        <Flex sx={{ gap: '1rem', alignItems: 'center' }}>
          <MonitoringIcon size={30} />
          <Typography variant="h6">{window.title}</Typography>
        </Flex>

        <Box sx={{ flexGrow: 1 }} />

        <Flex sx={{ gap: '1rem', alignItems: 'center' }}>
          <Typography variant="p">{window.message}</Typography>
        </Flex>

        <IconButton
          sx={{ marginLeft: '1.2rem' }}
          onClick={() => {
            setDrawer(false)
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

export function Navigation() 
{
  const accountContext = useContext(AccountContext)

  const [window, setWindow] = useState({ title: 'Greenhouse Monitor' })
  const [drawer, setDrawer] = useState(false)

  const navigate = useNavigate()

  return (
    <Flex direction="column" sx={{ height: '100vh' }}>
      <Titlebar window={window} setDrawer={setDrawer} />

      <Drawer {...DrawerProps} open={drawer}>
        <DrawerHeader>
          <Typography variant="h6" marginLeft="1rem">
            Greenhouse Monitor
          </Typography>
          <IconButton
            onClick={() => {
              setDrawer(false)
            }}
          >
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>
        <Divider />

        {accountContext.DEVICES && (
          <List>
            {accountContext.DEVICES.map(device => {
              return (
                <ListItem key={device} disablePadding>
                  <ListItemButton
                    onClick={() => {
                      setDrawer(false)
                      navigate(device)
                    }}
                  >
                    <ListItemIcon>
                      <DevicesOutlined />
                    </ListItemIcon>
                    <ListItemText>{device.substring(0, 23)}...</ListItemText>
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        )}

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
    </Flex>
  )
}
