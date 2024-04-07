import { useEffect, useContext, useState } from 'react'
import { useParams } from 'react-router-dom'

import {
  Box,
  Button,
  Typography,
  Divider,
  Card,
  TextField,
  Backdrop,
  Grow,
  Alert,
  useTheme
} from '@mui/material'

import { Flex } from './component'
import { TransmitterIcon } from './component/icon/TransmitterIcon'

import { WindowContext } from './Navigation'
import { AccountContext } from './App'
import { getWeatherData } from './logic/Data'

function DeviceLocation({ device, dialogState }) {
  const [postcode, setPostcode] = useState('')
  const [message, setMessage] = useState()

  const handleSubmit = () => {
    if (!postcode) {
      setMessage({ severity: 'warning', text: 'You must enter a postcode' })
      return
    }

    if (!postcode.match(/^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([AZa-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z])))) [0-9][A-Za-z]{2})$/gm)) {
      setMessage({ severity: 'error', text: 'Please enter a valid postcode' })
      return
    }

    setMessage({ severity: 'info', text: 'Checking postcode', loading: true })

    fetch(`https://api.postcodes.io/postcodes/${postcode}`)
      .then(async response => {
        setMessage({
          severity: 'success',
          text: 'Location sucessfully updated'
        })

        if (response.ok) {
          const result = (await response.json()).result

          localStorage.setItem(
            device.ID,
            JSON.stringify({
              location: { lon: result.longitude, lat: result.latitude }
            })
          )
        } else {
          setMessage({
            severity: 'error',
            text: 'Postcode not found, please try again'
          })
        }
      })
      .catch(() => {
        setMessage({
          severity: 'error',
          text: 'Postcode not found, please try again'
        })
      })
  }

  useEffect(() => {
    setMessage({
      severity: 'info',
      text: 'Setting a location enables weather integrations'
    })
  }, [])

  return (
    <Backdrop open={dialogState.open}>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: '1.2rem',
          padding: '1.5rem',
          minWidth: 'fit-content',
          maxWidth: '50vw'
        }}
      >
        <Typography variant="h5">Set Device Location</Typography>

        {message && (
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        )}
        <Divider sx={{ marginBottom: '0.8rem' }} />

        <TextField
          label="Enter a Postcode"
          onChange={event => {
            setPostcode(event.target.value)
          }}
          onBlur={event => {
            setPostcode(event.target.value)
          }}
        />

        <Flex sx={{ justifyContent: 'space-between', marginTop: '1rem' }}>
          <Button variant="outlined" onClick={() => dialogState.set(false)}>
            Close
          </Button>
          <Button
            variant={message && !message.loading ? 'contained' : 'disabled'}
            onClick={() => handleSubmit()}
          >
            Save
          </Button>
        </Flex>
      </Card>
    </Backdrop>
  )
}

function Header({ device, dialogState }) {
  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const theme = useTheme()

  return (
    <Flex sx={{ margin: '1.2rem 1rem 1.2rem 1rem' }}>
      <Flex sx={{ marginRight: 'auto', gap: '1rem' }}>
        {!isMobileView && (
          <TransmitterIcon fill={theme.palette.text.primary} size={60} />
        )}

        {isMobileView ? (
          <Flex sx={{ alignItems: 'center' }}>
            <Box sx={{ width: '50vw' }}>
              <Typography variant="h6">Device Dashboard</Typography>
              <Typography noWrap>{device.ID}</Typography>
            </Box>
          </Flex>
        ) : (
          <Flex sx={{ alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Device Dashboard</Typography>
              <Typography>{device.ID}</Typography>
            </Box>
          </Flex>
        )}
      </Flex>
      <Button
        variant="outlined"
        onClick={() => {
          dialogState.set(true)
        }}
      >
        Set Location
      </Button>
    </Flex>
  )
}

function Dashboard() {
  const windowContext = useContext(WindowContext)
  const accountContext = useContext(AccountContext)

  let { identifier } = useParams()
  if (!identifier && accountContext.DEVICES) {
    identifier = accountContext.DEVICES[0]
  }

  const [dialog, setDialog] = useState(false)
  const [message, setMessage] = useState(false)

  const [weather, setWeather] = useState({})
  const [device, setDevice] = useState({})

  useEffect(() => {
    windowContext.setWindow({ title: `Greenhouse Monitor` })
    setDevice({
      ID: identifier,
      ...JSON.parse(localStorage.getItem(identifier))
    })
  }, [])

  useEffect(() => {
    if (device && device.location) {
      getWeatherData(device.location.lat, device.location.lon)
        .then(async response => {
          if (response.ok) {
            setWeather(await response.json())
          } else {
            setMessage({
              severity: 'error',
              text: 'Failed to retreive weather data'
            })
          }
        })
        .catch(() => {
          setMessage({
            severity: 'error',
            text: 'Failed to retreive weather data'
          })
        })
    }
  }, [device])

  return (
    <Flex direction="column" grow={1}>
      <DeviceLocation device={device} dialogState={{ open: dialog, set: setDialog }} />
      <Header device={device} dialogState={{ open: dialog, set: setDialog }} />
      <Divider />

      {message && (
        <Grow in>
          <Alert severity={message.severity}>{message.text}</Alert>
        </Grow>
      )}

    </Flex>
  )
}

export default Dashboard
