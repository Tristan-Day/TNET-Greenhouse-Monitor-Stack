import { useState } from 'react'
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

import MenuIcon from '@mui/icons-material/Menu'
import LogoutIcon from '@mui/icons-material/Logout'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import SettingsIcon from '@mui/icons-material/Settings'

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

function Titlebar({ setOpen }) {
  const navigate = useNavigate()

  return (
    <AppBar sx={{ position: 'sticky', top: 0 }}>
      <Toolbar>
        <IconButton
          onClick={() => {
            setOpen(true)
          }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ display: 'flex', gap: '1rem', marginLeft: '1rem' }}>
          <img src="./Logo.svg" width='30'/>
          <Typography variant="h6">Greenhouse Monitor</Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />
        <IconButton
          onClick={() => {
            navigate('settings')
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}

function Navigation() {
  const [open, setOpen] = useState(false)

  return (
    <Box>
      <Titlebar setOpen={setOpen} />

      <Drawer {...DrawerProps} open={open}>
        <DrawerHeader>
          <Typography variant="h6" marginLeft="1rem">
            Greenhouse Monitor
          </Typography>
          <IconButton
            onClick={() => {
              setOpen(false)
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>

        <Divider />
        <Box flexGrow="30" />

        <Divider />
        <ListItemButton
          onClick={async () => {
            await signOut()
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItemButton>
      </Drawer>
      <Outlet />
    </Box>
  )
}

export default Navigation
