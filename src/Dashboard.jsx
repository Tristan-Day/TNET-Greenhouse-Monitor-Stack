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
import { getMonitoringData, getWeatherData, DataModel } from './logic/Data'
import strftime from 'strftime'

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

function LiveData({ model }) 
{
  const DataCard = ({ name, units, value }) => 
  {
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
  const flexSpacing = isMobileView ? '1rem' : '2rem'

  return (
    <Flex direction={flexDirection} sx={{ gap: flexSpacing, flexWrap: 'wrap' }}>
      <DataCard
        name="Temperature"
        units="°C"
        value={model.getLatestValue('Temperature')}
      />
      <DataCard
        name="Humidity"
        units="%"
        value={model.getLatestValue('Humidity')}
      />
      <DataCard
        name="Pressure"
        units="kPa"
        value={Math.round(model.getLatestValue('Pressure') * 0.001)}
      />
      <DataCard
        name="Soil Sensor A"
        value={model.getLatestValue('SoilMoisturePrimary')}
      />
      <DataCard
        name="Soil Sensor B"
        value={model.getLatestValue('SoilMoistureSecondary')}
      />
    </Flex>
  )
}

function ChartData({ model }) 
{
  const [viewport, setViewport] = useState({
    width: window.innerWidth
  })

  // Add a hook to capture window size changes
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

  const ChartCard = ({ dataset, series, legend }) => 
  {
    const props = legend
      ? {
          legend: {
            padding: { top: -10 },
            itemGap: 20, markGap: 10
          }
        }
      : {
          legend: {
            hidden: true,
          }
        }

    return (
      <LineChart
        slotProps={props}
        sx={{paddingTop: legend ? '0.6rem' : 0}}
        xAxis={[
          {
            dataKey: 'timestamp',
            valueFormatter: value => {
              return require('strftime')('%H:%M', new Date(value))
            }
          }
        ]}
        series={series} dataset={dataset}
        margin={{ bottom: 30, top: legend ? 42 : 20 }}
        skipAnimation
      />
    )
  }

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const flexSpacing = isMobileView ? '1rem' : '2rem'

  // Determine the number of points to show
  const length = viewport.width * 0.025

  return (
    <Flex sx={{ flexWrap: 'wrap', gap: flexSpacing, justifyContent: 'center' }}>
      <Card className="ChartCard">
        <Typography variant='h6'>Temperature (°C)</Typography>
        {model.includesWeatherData() ? (
          <ChartCard
            dataset={model.getDataset('Temperature', length)}
            series={[
              { dataKey: 'indoor', label: 'Indoor' },
              { dataKey: 'outdoor', label: 'Outdoor' }
            ]}
            legend
          />
        ) : (
          <ChartCard
            dataset={model.getDataset('Temperature', length)}
            series={[{ dataKey: 'value', label: 'Temperature °C' }]}
          />
        )}
      </Card>
      <Card className="ChartCard">
        <Typography variant='h6'>Humidity (%)</Typography>
        {model.includesWeatherData() ? (
          <ChartCard
            dataset={model.getDataset('Humidity', length)}
            series={[
              { dataKey: 'indoor', label: 'Indoor' },
              { dataKey: 'outdoor', label: 'Outdoor' }
            ]}
            legend
          />
        ) : (
          <ChartCard
            dataset={model.getDataset('Humidity', length)}
            series={[{ dataKey: 'value', label: 'Humidity %' }]}
          />
        )}
      </Card>
      <Card className="ChartCard">
        <Typography variant='h6'>Pressure (kPa)</Typography>
        <ChartCard
          dataset={model.getDataset('Pressure', length).map(datapoint => {
            return { ...datapoint, value: datapoint.value * 0.001 }
          })}
          series={[{ dataKey: 'value', label: 'Pressure kPa' }]}
        />
      </Card>
      <Card className="ChartCard">
        <Typography variant='h6'>Soil Sensor A</Typography>
        <ChartCard
          dataset={model.getDataset('SoilMoisturePrimary', length)}
          series={[{ dataKey: 'value', label: 'Soil Sensor A' }]}
        />
      </Card>
      <Card className="ChartCard">
        <Typography variant='h6'>Soil Sensor B</Typography>
        <ChartCard
          dataset={model.getDataset('SoilMoistureSecondary', length)}
          series={[{ dataKey: 'value', label: 'Soil Sensor B' }]}
        />
      </Card>
    </Flex>
  )
}

function Dashboard() 
{
  const windowContext = useContext(WindowContext)
  let { identifier } = useParams()

  const [weather, setWeather] = useState()
  const [device, setDevice] = useState()

  const [message, setMessage] = useState(false)
  const [model, setModel] = useState()

  // Get new monitoring data from DynamoDB
  const refreshMonitoringData = () => {
    if (device.cache) {
      if (new Date().getTime() - device.cache.timestamp < 60000) {
        if (device.cache.packets) {
          return
        }
      }
    }
    getMonitoringData(device.ID)
      .then(result => {
        // Cache the result in local storage
        const cache = { timestamp: new Date().getTime(), packets: result }

        setDevice({ ...device, cache: cache })
        localStorage.setItem(
          device.ID,
          JSON.stringify({ ...device, cache: cache })
        )
      })
      .catch(error => {
        setMessage({
          severity: 'error',
          text: error.message
        })
      })
  }

  // Get new weather data from OpenMetro
  const refreshWeatherData = () => {
    if (!device.configuration || !device.configuration.location) {
      return
    }
    const location = device.configuration.location

    getWeatherData(location.lat, location.lon)
      .then(async response => {
        if (response.ok) {
          setWeather((await response.json()).hourly)
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

  const refreshAlertData = () => {
    if (!device.configuration || !device.configuration.thresholds) {
      return
    }
    const thresholds = device.configuration.thresholds

    if (thresholds['temperature'] < model.getLatestValue('Temperature')) {
      const difference = Math.round(
        model.getLatestValue('Temperature') - thresholds['temperature']
      )
      setMessage({
        severity: 'warning',
        text: `Greenhouse temperature is ${difference}°C above alert threshold`
      })
    } 
    
    else if (thresholds['humidity'] < model.getLatestValue('Humidity')) {
      const difference = Math.round(
        model.getLatestValue('Humidity') - thresholds['humidity']
      )
      setMessage({
        severity: 'warning',
        text: `Greenhouse humidity is ${difference}% above alert threshold`
      })
    }
    
    else {
      setMessage(undefined)
    }
  }

  // Set the window title and import data from localstorage
  useEffect(() => {
    windowContext.setWindow({ title: 'Greenhouse Monitor' })

    setDevice({
      ID: identifier,
      ...JSON.parse(localStorage.getItem(identifier))
    })
  }, [identifier])

  useEffect(() => {
    if (!device) {
      return
    }
    // Update weather data every 10 minutes
    refreshMonitoringData()
    setInterval(refreshMonitoringData, 660000)

    // Update weather data every 60 minutes
    refreshWeatherData()
    setInterval(refreshWeatherData, 3600000)
  }, [device])

  useEffect(() => {
    if (device && device.cache) {
      const time = strftime('%F at %H:%M', new Date(device.cache.timestamp))
      windowContext.setWindow({
        title: 'Greenhouse Monitor',
        message: `Last Updated: ${time}`
      })
    }

    if (device && device.cache) {
      setModel(new DataModel(device.cache.packets, weather))
    }
  }, [device, weather])

  useEffect(() => {
    if (model) {
      refreshAlertData()
    }
  }, [model])

  if (!model) {
    return <Loading text="Loading Monitoring Data" />
  }

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const spacing = isMobileView ? '1rem' : '2rem'

  return (
    <Flex direction="column" grow={1}>
      <Header device={device} />
      <Divider />
      <Flex direction="column" grow={1} sx={{ margin: spacing, gap: spacing }}>
        {message && (
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        )}
        <LiveData model={model}/>
        <Divider />
        <ChartData model={model} />
      </Flex>
    </Flex>
  )
}

export default function DashboardRoutes() {
  return (
    <Route path="devices">
      <Route path=":identifier" element={<Dashboard />} />
      <Route path=":identifier/configuration" element={<Configuration />} />
    </Route>
  )
}
