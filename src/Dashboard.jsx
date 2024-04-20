import { useEffect, useContext, useState } from 'react'
import { useParams, useNavigate, Route } from 'react-router-dom'

import {
  Box,
  Button,
  Typography,
  IconButton,
  Divider,
  Card,
  Grow,
  Alert,
  useTheme
} from '@mui/material'

import { TuneOutlined } from '@mui/icons-material'
import { LineChart } from '@mui/x-charts'

import { Flex } from './component'
import { TransmitterIcon } from './component/icon/TransmitterIcon'

import { WindowContext } from './Navigation'
import Loading from './Loading'

import Configuration from './subpage/Configuration'
import { getMonitoringData, getWeatherData, extractDataset } from './logic/Data'

function Header({ device }) 
{
  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)

  const navigate = useNavigate()
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
      {isMobileView ? (
        <IconButton
          variant="outlined"
          onClick={() => {
            navigate('configuration')
          }}
        >
          <TuneOutlined fontSize="medium" />
        </IconButton>
      ) : (
        <Button
          variant="outlined"
          onClick={() => {
            navigate('configuration')
          }}
        >
          Edit Configuration
        </Button>
      )}
    </Flex>
  )
}

function LiveData({ packets }) 
{
  const DataCard = ({ name, units, value, factor }) => 
  {
    value = factor ? Math.round(value * factor * 100) / 10 : value
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
        value={packets[0].DATA[['Temperature']]}
      />
      <DataCard
        name="Pressure"
        units="kPa"
        value={packets[0].DATA[['Pressure']]}
        factor={0.001}
      />
      <DataCard
        name="Humidity"
        units="%"
        value={packets[0].DATA[['Humidity']]}
      />
      <DataCard
        name="Soil Sensor A"
        value={packets[0].DATA[['SoilMoisturePrimary']]}
      />
      <DataCard
        name="Soil Sensor B"
        value={packets[0].DATA[['SoilMoistureSecondary']]}
      />
    </Flex>
  )
}

function ChartData({ packets, weather }) 
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
            valueFormatter: value => {
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
    <Flex sx={{ flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
      <Card className="ChartCard">
        <ChartCard 
        dataset={packets}
        name="Temperature"
        units="°C" 
        />
      </Card>
      <Card className="ChartCard">
        <ChartCard 
        dataset={packets} 
        name="Humidity" 
        units="%"
        />
      </Card>
      <Card className="ChartCard">
        <ChartCard
          dataset={packets}
          name="Pressure"
          units="kPa"
          factor={0.001}
        />
      </Card>
      <Card className="ChartCard">
        <ChartCard
          dataset={packets}
          name="Soil Sensor A"
          attribute="SoilMoisturePrimary"
        />
      </Card>
      <Card className="ChartCard">
        <ChartCard
          dataset={packets}
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

  const [message, setMessage] = useState(false)
  const [weather, setWeather] = useState({})
  const [device, setDevice] = useState({})

  // Update local storage with a new dataset
  const setMonitoringData = data => {
    setDevice({ ...device, data: data })
    localStorage.setItem(identifier, JSON.stringify({ ...device, data: data }))
  }

  // Get new monitoring data from DynamoDB
  const refreshMonitoringData = () => {
    if (!device.ID) {
      return
    }
    setInterval(refreshMonitoringData, 660000)

    if (device.data) {
      if (new Date().getTime() - device.data.timestamp < 600000) {
        if (device.data.packets) {
          return
        }
      }
    }

    getMonitoringData(device.ID, 600000)
      .then(result => {
        setMonitoringData({
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

  // Set the window title
  useEffect(() => {
    windowContext.setWindow({ title: 'Greenhouse Monitor' })
  }, [])

  // Update device with contents from local storage
  useEffect(() => {
    if (!identifier) {
      return
    }
    setDevice({
      ID: identifier,
      ...JSON.parse(localStorage.getItem(identifier))
    })
  }, [identifier])

  // Refresh monitoring data and set window timestamp
  useEffect(() => {
    if (device.data) {
      const time = require('strftime')(
        '%F at %H:%M',
        new Date(device.data.timestamp)
      )
      windowContext.setWindow({
        title: 'Greenhouse Monitor',
        message: `Last Updated: ${time}`
      })
    }
    refreshMonitoringData()
  }, [device])

  if (!device.data) {
    return <Loading />
  }

  return (
    <Flex direction="column" grow={1}>
      <Header device={device} />
      <Divider />
      <Flex direction="column" grow={1} sx={{ margin: '2rem', gap: '2rem' }}>
        {message && (
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        )}
        <LiveData packets={device.data.packets} />
        <Divider />
        <ChartData packets={device.data.packets} />
      </Flex>
    </Flex>
  )
}

export default function DashboardRoutes() 
{
  return (
    <Route path="devices">
      <Route path=":identifier" element={<Dashboard />} />
      <Route path=":identifier/configuration" element={<Configuration />} />
    </Route>
  )
}
