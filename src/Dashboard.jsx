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
import { LineChart } from '@mui/x-charts'

import { Flex } from './component'
import { TransmitterIcon } from './component/icon/TransmitterIcon'

import { WindowContext } from './Navigation'
import Loading from './Loading'

import { getMonitoringData, getWeatherData, extractDataset } from './logic/Data'
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
  const DataCard = ({ name, units, value, factor }) => 
  {
    value = factor ? Math.round((value * factor) * 100) / 10 : value
    return (
      <Card className="DataCard">
        <Flex sx={{ gap: '4px', marginLeft: (units && units.length) || 0 }}>
          <Typography variant="h5">{value}</Typography>
          <Typography variant="caption">{units}</Typography>
        </Flex>
        <Typography>{name}</Typography>
      </Card>
    )
  }

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const flexDirection = isMobileView ? 'column' : 'row'

  return (
    <Flex direction={flexDirection} sx={{ gap: '2rem', flexWrap: 'wrap' }}>
      <DataCard
        name="Temperature"
        units="°C"
        value={device.packets[0].DATA[['Temperature']]}
      />
      <DataCard
        name="Pressure"
        units="kPa"
        value={device.packets[0].DATA[['Pressure']]}
        factor={0.001}
      />
      <DataCard
        name="Humidity"
        units="%"
        value={device.packets[0].DATA[['Humidity']]}
      />
      <DataCard
        name="Soil Sensor A"
        value={device.packets[0].DATA[['SoilMoisturePrimary']]}
      />
      <DataCard
        name="Soil Sensor B"
        value={device.packets[0].DATA[['SoilMoistureSecondary']]}
      />
    </Flex>
  )
}

function ChartData({ device, weather }) 
{
  const [viewport, setViewport] = useState({
    width: window.innerWidth
  })

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth
      })
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const ChartCard = ({ dataset, name, units, attribute, factor }) => 
  {
    const label = units ? `${name} - ${units}` : name
    const data = extractDataset(dataset, attribute || name, viewport.width * 0.025, factor)

    return (
      <LineChart
        xAxis={[
          {
            dataKey: 'timestamp',
            valueFormatter: (value) => {
              return require('strftime')('%H:%M', new Date(value))
            }
          }
        ]}
        series={[{ dataKey: 'value', label: label }]}
        dataset={data}
      />
    )
  }

  return (
    <Flex sx={{ flexWrap: 'wrap', gap: '2rem', justifyContent: 'center'}}>
      <Card className="ChartCard">
        <ChartCard 
          dataset={device.packets} 
          name="Temperature" 
          units="°C" />
      </Card>
      <Card className="ChartCard">
        <ChartCard 
          dataset={device.packets} 
          name="Humidity" 
          units="%" />
      </Card>
      <Card className="ChartCard">
        <ChartCard
          dataset={device.packets}
          name="Pressure"
          units="kPa"
          factor={0.001}
        />
      </Card>
      <Card className="ChartCard">
        <ChartCard
          dataset={device.packets}
          name="Soil Sensor A"
          attribute="SoilMoisturePrimary"
        />
      </Card>
      <Card className="ChartCard">
        <ChartCard
          dataset={device.packets}
          name="Soil Sensor B"
          attribute="SoilMoistureSecondary"
        />
      </Card>
    </Flex>
  )
}

function Dashboard()
{
  const windowContext = useContext(WindowContext)
  let { identifier } = useParams()

  const [dialog, setDialog] = useState(false)
  const [message, setMessage] = useState(false)

  const [weather, setWeather] = useState({})
  const [device, setDevice] = useState({})

  const refreshData = () => {
    if (!device.ID) {
      return
    }
    setInterval(refreshData, 660000)

    if (device.timestamp) {
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
  }

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
    refreshData()
  }, [device])

  useEffect(() => {
    if (!identifier) {
      return
    }
    if (device.timestamp) {
      const time = require('strftime')(
        '%F at %H:%M',
        new Date(device.timestamp)
      )
      windowContext.setWindow({
        title: 'Greenhouse Monitor',
        message: `Last Updated: ${time}`
      })
    }
    localStorage.setItem(identifier, JSON.stringify(device))
  }, [device])

  if (!device.packets) {
    return <Loading />
  }

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
        <LiveData device={device} weather={weather} />
        <Divider />
        <ChartData device={device} weather={weather} />
      </Flex>
    </Flex>
  )
}

export default Dashboard
