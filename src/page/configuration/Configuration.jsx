import { useEffect, useContext, useState, createContext } from 'react'
import { useParams, useNavigate, Route, Outlet } from 'react-router-dom'

import 
{
  Button, 
  Divider,
  Tab,
  Tabs, 
  useTheme 
} from '@mui/material'
import { SettingsOutlined, NotificationsOutlined } from '@mui/icons-material'

import { Flex, Loading } from '../../common/component'
import { WindowContext } from '../../Navigation'

import GeneralConfiguration from './General'
import AlertConfiguration from './Alerts'

function Footer({ handleClose, handleSave })
{
  const theme = useTheme()

  return (
    <Flex
      className="Footer"
      sx={{
        backgroundColor: theme.palette.background.default,
        borderColor: theme.palette.divider, padding: '1.2rem'
      }}
    >
      <Button
        onClick={() => {
          handleClose()
        }}
      >
        Return
      </Button>
      <Button
        onClick={() => {
          handleSave()
        }}
        variant="contained"
      >
        Save
      </Button>
    </Flex>
  )
}

const ConfigurationContents = 
[
  { name: 'General', icon: <SettingsOutlined />, URL: '' },
  { name: 'Alerts', icon: <NotificationsOutlined />, URL: 'alerts' }
]

export const ConfigurationContext = createContext()

function Configuration()
{
  const windowContext = useContext(WindowContext)
  let { identifier } = useParams()

  const [configuration, setConfiguration] = useState()
  const [tab, setTab] = useState(0)

  const navigate = useNavigate()

  const Contents = ConfigurationContents.map((entry, index) => {
    return <Tab key={index} label={entry.name} icon={entry.icon} />
  })

  const switchTab = (_, value) => {
    navigate(ConfigurationContents[value].URL)
    setTab(value)
  }

  const handleClose = () => {
    navigate(`/devices/${identifier}`)
  }

  const handleSave = () => {
    localStorage.setItem(
      identifier + '/configuration', JSON.stringify(configuration)
    )
  }

  // Set the window title
  useEffect(() => {
    windowContext.setWindow({ title: 'Device Configuration' })
  }, [])

  // Load the current configuration from local storage
  useEffect(() => {
    if (!identifier) {
      return
    }
    setConfiguration(
      JSON.parse(
        localStorage.getItem(identifier + '/configuration'
      ) || '{}')
    )
  }, [identifier])

  // Only show once the configuration is loaded
  if (!configuration) {
    return <Loading text="Loading Device Configuration" />
  }

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)

  return (
    <Flex direction="column" grow={1}>
      <Divider />
      <Flex direction={isMobileView ? 'column' : 'inline'} grow={1}>
        {isMobileView ? (
          <>
            <Tabs orientation={'horizontal'} value={tab} onChange={switchTab}>
              {Contents}
            </Tabs>
            <Divider flexItem orientation={'horizontal'} />
          </>
        ) : (
          <>
            <Tabs orientation={'vertical'} value={tab} onChange={switchTab}>
              {Contents}
            </Tabs>
            <Divider flexItem orientation={'vertical'} />
          </>
        )}
        <Flex direction="column" grow={1}>
          <ConfigurationContext.Provider value={{ configuration, setConfiguration }}>
            <Outlet />
            <Footer handleClose={handleClose} handleSave={handleSave} />
          </ConfigurationContext.Provider>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default function ConfigurationRoutes() {
  return (
    <Route path=":identifier/configuration" element={<Configuration />}>
      <Route path="*" element={<GeneralConfiguration />} />
      <Route path="alerts" element={<AlertConfiguration />} />
    </Route>
  )
}
