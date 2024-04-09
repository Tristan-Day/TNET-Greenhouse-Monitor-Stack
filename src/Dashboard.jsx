import { useEffect, useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { strftime } from 'strftime'

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

import { LineChart } from '@mui/x-charts'

import { Flex } from './component'
import { TransmitterIcon } from './component/icon/TransmitterIcon'

import { WindowContext } from './Navigation'
import { AccountContext } from './App'

import { getMonitoringData, getWeatherData } from './logic/Data'
import { isValidPostcode } from './logic/Validation'

function LocationDialog({ device, dialogState })
{
  const [postcode, setPostcode] = useState('')
  const [message, setMessage] = useState()

  const handleSubmit = () => {
    if (!postcode) {
      setMessage({ severity: 'warning', text: 'You must enter a postcode' })
      return
    }

    if (!isValidPostcode(postcode)) {
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
      text: 'This will enable weather integrations'
    })
  }, [])

  return (
    <Backdrop open={dialogState.open}>
      <Card className="Popup">
        {device.location ? (
          <Typography variant="h5">Update Device Location</Typography>
        ) : (
          <Typography variant="h5">Set Device Location</Typography>
        )}

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
          <Button
            variant={message && !message.loading ? 'outlined' : 'disabled'}
            onClick={() => dialogState.set(false)}
          >
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

function Header({ device, dialogState })
{
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
              <Typography noWrap>{device.ID || 'Loading...'}</Typography>
            </Box>
          </Flex>
        ) : (
          <Flex sx={{ alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Device Dashboard</Typography>
              <Typography>{device.ID || 'Loading...'}</Typography>
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

function LiveData({ device, weather }) 
{
  const SectionContents = 
  [
    { name: 'Temperature', units: '°C' },
    { name: 'Pressure',    units: 'Pa' },
    { name: 'Humidity',    units: '%'  },

    { name: 'Soil Sensor A', attribute: 'SoilMoisturePrimary'   },
    { name: 'Soil Sensor B', attribute: 'SoilMoistureSecondary' }
  ]

  const DataCard = ({ key, units, value }) => {
    return (
      <Card className="DataCard">
        <Flex sx={{ gap: '4px', marginLeft: (units && units.length) || 0 }}>
          <Typography variant="h5">{value || '-'}</Typography>
          {units && value && <Typography variant="caption">{units}</Typography>}
        </Flex>
        <Typography>{key}</Typography>
      </Card>
    )
  }

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const flexDirection = isMobileView ? 'column' : 'row'

  return (
    <Flex direction={flexDirection} sx={{ gap: '2rem', flexWrap: 'wrap' }}>
      {SectionContents.map(entry => 
      {
        const attribute = entry.attribute || entry.name
        const value = device.packets[0].DATA[attribute]

        return <DataCard key={entry.name} units={entry.units} value={value} />
      })}
    </Flex>
  )
}

function Charts({ device, weather }) 
{
  // https://mui.com/x/react-charts/lines/

  return <LineChart />
}

function Dashboard() 
{
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
    windowContext.setWindow({ title: 'Greenhouse Monitor' })
  }, [])

  useEffect(() => {
    if (!identifier) {
      return
    }
    setDevice({
      ID: identifier,
      ...JSON.parse(localStorage.getItem(identifier))
    })
  }, [identifier])

  useEffect(() => {
    if (!device.ID) {
      return
    }

    if (device.timestamp) {
      const date = new Date(device.timestamp)
      const time = require('strftime')('%F at %H:%M', date)

      windowContext.setWindow({
        title: 'Greenhouse Monitor',
        message: `Last Updated  -  ${time}`
      })

      if (new Date().getTime() - device.timestamp < 600000) {
        if (device.packets) {
          return
        }
      }
    }

    getMonitoringData(device.ID, 600000)
      .then(result => {
        setDevice({
          ...device,
          timestamp: new Date().getTime(),
          packets: result
        })
      })
      .catch(error => {
        setMessage({
          severity: 'error',
          text: error.message
        })
      })

    if (!device.location) {
      return
    }

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
  }, [device])

  useEffect(() => {
    if (!identifier) {
      return
    }
    localStorage.setItem(identifier, JSON.stringify(device))
  }, [device])

  return (
    <Flex direction="column" grow={1}>
      <LocationDialog device={device} dialogState={{ open: dialog, set: setDialog }} />
      <Header device={device} dialogState={{ open: dialog, set: setDialog }} />
      <Divider />

      <Flex grow={1} direction="column" sx={{ margin: '2rem', gap: '2rem' }}>
        {message && (
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        )}
        <LiveData device={device}/>
        <Divider />
      </Flex>
    </Flex>
  )
}

export default Dashboard
