import { useEffect, useContext, useState } from 'react'
import { useParams, useNavigate, Route } from 'react-router-dom'

import {
  Box,
  Button,
  Typography,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Card,
  Grow,
  Alert,
  useTheme
} from '@mui/material'
import { TuneOutlined, BarChart, Thermostat } from '@mui/icons-material'

import {
  getMonitoringData,
  getWeatherData,
  getColourCode,
  DataModel
} from './logic/Data'

import {
  Flex,
  ValueCard,
  GaugeCard,
  ChartCard,
  Loading
} from './component'

import { TransmitterIcon } from './component/icon/TransmitterIcon'
import { ConfigurationRoutes } from './subpage/configuration/'
import { WindowContext } from './Navigation'

function Header({ device }) 
{
  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)

  const navigate = useNavigate()
  const theme = useTheme()

  return (
    <Flex sx={{ margin: '1rem' }}>
      <Flex sx={{ marginRight: 'auto', gap: '1rem' }}>
        {!isMobileView && (
          <TransmitterIcon fill={theme.palette.text.primary} size={60} />
        )}
        {isMobileView ? (
          <Flex sx={{ alignItems: 'center' }}>
            <Box sx={{ width: '50vw' }}>
              <Typography variant="h6">
                {(device.configuration.nicknames &&
                  device.configuration.nicknames.device) ||
                  'Device Dashboard'}
              </Typography>
              <Typography noWrap>{device.ID || 'Loading...'}</Typography>
            </Box>
          </Flex>
        ) : (
          <Flex sx={{ alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                {(device.configuration.nicknames &&
                  device.configuration.nicknames.device) ||
                  'Device Dashboard'}
              </Typography>
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

function Footer({ tab, setTab }) 
{
  const theme = useTheme()

  return (
    <Tabs
      className="Footer"
      centered
      sx={{
        backgroundColor: theme.palette.background.default,
        padding: "0rem 1rem 0rem 1rem",
        borderColor: theme.palette.divider
      }}
      value={tab}
      onChange={(_, value) => {
        setTab(value)
      }}
      variant="fullWidth"
    >
      <Tab icon={<Thermostat />} label={'Live Data'}/>
      <Tab icon={<BarChart />} label={'Data Charts'}/>
    </Tabs>
  )
}

function CurrentData({ model, configuration }) 
{
  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const spacing = isMobileView ? '1.2rem' : '2rem'

  return (
    <Flex direction="row" sx={{ gap: spacing, flexWrap: 'wrap' }}>
      <ValueCard
        name="Temperature" units="°C"
        colour={getColourCode(
          model.getLatestValue('Temperature') +
            parseFloat(
              configuration.calibrations &&
                configuration.calibrations.temperature
                ? configuration.calibrations.temperature
                : 0
            )
        )}
        value={model.getLatestValue('Temperature')}
      />
      <ValueCard
        name="Humidity" units="%"
        value={model.getLatestValue('Humidity')}
      />
      <GaugeCard
        name={
          (configuration.nicknames &&
            configuration.nicknames.sensors &&
            'Moisture Sensor - ' + configuration.nicknames.sensors.A) ||
          'Soil Sensor A'
        }
        value={model.getLatestValue('SoilMoisturePrimary')}
        min={
          (configuration.calibrations &&
            configuration.calibrations.moisture &&
            configuration.calibrations.moisture.min) ||
          undefined
        }
        max={
          (configuration.calibrations &&
            configuration.calibrations.moisture &&
            configuration.calibrations.moisture.max) ||
          undefined
        }
      />
      <GaugeCard
        name={
          (configuration.nicknames &&
            configuration.nicknames.sensors &&
            'Moisture Sensor - ' + configuration.nicknames.sensors.B) ||
          'Soil Sensor B'
        }
        value={model.getLatestValue('SoilMoistureSecondary')}
        min={
          (configuration.calibrations &&
            configuration.calibrations.moisture &&
            configuration.calibrations.moisture.min) ||
          undefined
        }
        max={
          (configuration.calibrations &&
            configuration.calibrations.moisture &&
            configuration.calibrations.moisture.max) ||
          undefined
        }
      />
      <ValueCard
        name="Peak Temperature" units="°C"
        colour={getColourCode(
          model.getHighestValue('Temperature') +
            parseFloat(
              configuration.calibrations &&
                configuration.calibrations.temperature
                ? configuration.calibrations.temperature
                : 0
            )
        )}
        value={model.getHighestValue('Temperature')}
      />
      <ValueCard
        name="Peak Humidity" units="%"
        value={model.getHighestValue('Humidity')}
      />
      <ValueCard
        name="Lowest Temperature" units="°C"
        colour={getColourCode(
          model.getLowestValue('Temperature') +
            parseFloat(
              configuration.calibrations &&
                configuration.calibrations.temperature
                ? configuration.calibrations.temperature
                : 0
            )
        )}
        value={model.getLowestValue('Temperature')}
      />
      <ValueCard
        name="Lowest Humidity" units="%"
        value={model.getLowestValue('Humidity')}
      />
    </Flex>
  )
}

function HistoricalData({ model, configuration }) 
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

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const spacing = isMobileView ? '1.2rem' : '2rem'

  // Determine the number of points to show
  const length = viewport.width * 0.025

  return (
    <Flex sx={{ flexWrap: 'wrap', gap: spacing, justifyContent: 'center' }}>
      <Card className="ChartCard">
        <Typography variant="overline">Temperature (°C)</Typography>
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
        <Typography variant="overline">Humidity (%)</Typography>
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
        <Typography variant="overline">
          {(configuration.nicknames &&
            configuration.nicknames.sensors &&
            'Moisture Sensor - ' + configuration.nicknames.sensors.A) ||
            'Soil Sensor A'}
        </Typography>
        <ChartCard
          dataset={model.getDataset('SoilMoisturePrimary', length)}
          series={[{ dataKey: 'value', label: 'Soil Sensor A' }]}
        />
      </Card>
      <Card className="ChartCard">
        <Typography variant="overline">
          {(configuration.nicknames &&
            configuration.nicknames.sensors &&
            'Moisture Sensor - ' + configuration.nicknames.sensors.B) ||
            'Soil Sensor B'}
        </Typography>
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
  const [tab, setTab] = useState(0)

  const [timers, setTimers] = useState({})
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

  // Check for any alarms
  const refreshAlertData = () => {
    // Check if the device has ceased transmision
    if (!model) {
      return
    }

    if (new Date() - model.getTimestamp() > 30 * 60 * 1000) {
      setMessage({
        severity: 'warning',
        text: `Your device has not transmitted data in the last thirty minutes`
      })
      return
    }

    // Check for out-of-bounds values
    if (!device.configuration || !device.configuration.alerts) {
      return
    }

    let alerts = []

    Object.entries(device.configuration.alerts).forEach(([name, configuration]) => {
      if (!configuration.enabled) {
        return
      }

      if (configuration.min) 
        { 
        const minimum = parseFloat(configuration.min)
        const value = model.getLatestValue(name)

        if (minimum > value) {
          alerts.push(
            `${name.charAt(0).toUpperCase() + name.slice(1)} is ${
              (minimum - value).toPrecision(2)
            }${configuration.units ? configuration.units : ''} below target`
          )
        }
      }

      if (configuration.max) 
        { 
        const maximum = parseFloat(configuration.max)
        const value = model.getLatestValue(name)

        if (maximum < value) {
          alerts.push(
            `${name.charAt(0).toUpperCase() + name.slice(1)} is ${
              (value - maximum).toPrecision(2)
            }${configuration.units ? configuration.units : ''} above target`
          )
        }
      }
    })

    // Data alerts should not overwrite any errors or warnings
    if (!message && alerts.length) {
      setMessage({ severity: 'warning', text: alerts.at(0) })
    }
  }

  // Set the window title and import data from localstorage
  useEffect(() => {   
    windowContext.setWindow({ title: 'Greenhouse Monitor' })

    let data = JSON.parse(localStorage.getItem(identifier) || '{}')
    if (!data.hasOwnProperty('configuration')) {
      data = { ...data, configuration: {} }
    }

    setDevice({
      ID: identifier,
      ...data
    })
  }, [identifier])

  // Pull data from the cloud and create timers
  useEffect(() => {
    if (!device) {
      return
    }

    if (!timers.monitoringData) {
      setTimers({...timers, monitoringData: true})

      // Update weather data every 10 minutes
      refreshMonitoringData()
      setInterval(refreshMonitoringData, 660000)     
    }

    if (!timers.getWeatherData) {
      setTimers({...timers, weatherData: true})

      // Update weather data every 60 minutes
      refreshWeatherData()
      setInterval(refreshWeatherData, 3600000)      
    }
  }, [device])

  useEffect(() => {
    if (!device || !device.cache) {
      return
    }

    if (!device.cache || !device.cache.packets.length) {
      return
    }

    const model = new DataModel(device.cache.packets, weather)
    setModel(model); refreshAlertData()

    windowContext.setWindow({
      ...windowContext.window,
      message: `Last Updated: ${model.getFormattedTimestamp()}`
    })
  }, [device, weather])

  if (!device || !model) {
    return <Loading text="Loading Monitoring Data" />
  }

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const spacing = isMobileView ? '1.2rem' : '2rem'

  return (
    <Flex direction="column" grow={1}>
      <Header device={device} />
      <Divider />
      <Flex direction="column" grow={1} sx={{ margin: spacing, gap: spacing }}>
        {isMobileView && (
          <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Current Conditions</Typography>
            <Typography variant="body">
              {model.getFormattedTimestamp()}
            </Typography>
          </Flex>
        )}
        {message && (
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        )}
        {!isMobileView && (
          <>
            <CurrentData model={model} configuration={device.configuration} />
            <Divider />
            <HistoricalData model={model} configuration={device.configuration} />
          </>
        )}
        {isMobileView &&
          (tab ? (
            <HistoricalData model={model} configuration={device.configuration} />
          ) : (
            <CurrentData model={model} configuration={device.configuration} />
          ))}
      </Flex>
      {isMobileView && <Footer tab={tab} setTab={setTab} />}
    </Flex>
  )
}

export default function DashboardRoutes()
{
  return (
    <Route path="devices">
      <Route path=":identifier" element={<Dashboard />} />
      {ConfigurationRoutes()}
    </Route>
  )
}
