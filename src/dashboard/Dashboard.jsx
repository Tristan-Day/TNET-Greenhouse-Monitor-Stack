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
import { getAlerts } from './logic/Alerts'

import {
  Flex,
  ValueCard,
  GaugeCard,
  ChartCard,
  Loading
} from '../common/component'
import { useInterval } from '../common/Interval'

import { TransmitterIcon } from '../common/component/icon/TransmitterIcon'
import { ConfigurationRoutes } from '../page/configuration'
import { WindowContext } from '../Navigation'

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
                {(device.configuration.nicknames?.device) ||
                  'Device Dashboard'}
              </Typography>
              <Typography noWrap>{device.ID || 'Loading...'}</Typography>
            </Box>
          </Flex>
        ) : (
          <Flex sx={{ alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">
                {(device.configuration.nicknames?.device) ||
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
              configuration.calibrations?.temperature
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
          (configuration.nicknames?.sensors?.A &&
            'Moisture Sensor - ' + configuration.nicknames.sensors.A) ||
          'Soil Sensor A'
        }
        value={model.getLatestValue('SoilMoisturePrimary')}
        min={
          (configuration.calibrations?.moisture &&
            configuration.calibrations.moisture.min) ||
          undefined
        }
        max={
          (configuration.calibrations?.moisture &&
            configuration.calibrations.moisture.max) ||
          undefined
        }
      />
      <GaugeCard
        name={
          (configuration.nicknames?.sensors?.B &&
            'Moisture Sensor - ' + configuration.nicknames.sensors.B) ||
          'Soil Sensor B'
        }
        value={model.getLatestValue('SoilMoistureSecondary')}
        min={
          (configuration.calibrations?.moisture &&
            configuration.calibrations.moisture.min) ||
          undefined
        }
        max={
          (configuration.calibrations?.moisture &&
            configuration.calibrations.moisture.max) ||
          undefined
        }
      />
      <ValueCard
        name="Peak Temperature" units="°C"
        colour={getColourCode(
          model.getHighestValue('Temperature') +
            parseFloat(
              configuration.calibrations?.temperature
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
              configuration.calibrations?.temperature
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
          {(configuration.nicknames?.sensors?.A &&
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
          {(configuration.nicknames?.sensors?.B &&
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

  const [tab, setTab] = useState(0)
  const [messages, setMessages] = useState([])

  const [device, setDevice] = useState()
  const [model, setModel] = useState()

 
  const refreshMonitoringData = async () => 
  {
    setMessages([])

    // Handle get monitoring data from DynamoDB
    let monitoringData = []

    try {
      monitoringData = await getMonitoringData(identifier)
    }
    catch (error) {
      setMessages([
        ...messages,
        {
          severity: 'error',
          text: error.message
        }
      ])
      return
    }

    const configuration = JSON.parse(
      localStorage.getItem(identifier + '/configuration') || '{}'
    )

    // Handle to get weather data from OpenMetro
    try {
      const location = configuration?.location

      if (location) {
        const response = await getWeatherData(location.lat, location.lon)

        if (response.ok) {
          setModel(new DataModel(monitoringData, (await response.json()).hourly))
          return
        }
        else
        {
          setMessages([
            ...messages,
            {
              severity: 'error',
              text: 'Failed to retreive weather data'
            }
          ])
        }
      }
    }
    catch {
      setMessages([
        ...messages,
        {
          severity: 'error',
          text: 'Failed to retreive weather data'
        }
      ])
    }

    setModel(new DataModel(monitoringData))
  }

  // Handle to process data and show any alerts
  const refreshAlertData = async () => {
    setMessages([
      ...messages.filter(message => {
        return message.type !== 'alert'
      }),
      ...await getAlerts(device.configuration, model)
    ])
  }

  // Interval hooks to periodically refresh data
  useInterval(refreshMonitoringData, 660000)
  useInterval(refreshAlertData, 10000)

  // Effect hook to set the window title and import data from localstorage
  useEffect(() => {
    windowContext.setWindow({ title: 'Greenhouse Monitor' })

    setDevice({
      configuration: JSON.parse(
        localStorage.getItem(identifier + '/configuration') || '{}'
      ),
      ID: identifier
    })

    refreshMonitoringData()
  }, [identifier])

  // Effect hook to process data from localstorage
  useEffect(() => {
    windowContext.setWindow({
      ...windowContext.window,
      message: `Last Transmission: ${model?.getFormattedTimestamp() || '-'}`
    })

    if (device?.configuration && model) {
      refreshAlertData()
    }
  }, [model])

  // Only show the dashboard once the model is loaded
  if (!device?.configuration || !model) {
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

        {messages.length > 0 && (
          <Flex direction={isMobileView ? 'column' : 'row'} sx={{ gap: '0.7rem' }}>
            {messages.slice(0, Math.min(messages.length, 5)).map(message => (
              <Grow in key={message.text}>
                <Alert severity={message.severity} sx={{ flexGrow: 1 }}>
                  {message.text}
                </Alert>
              </Grow>
            ))}
          </Flex>
        )}

        {!isMobileView && (
          <>
            <CurrentData model={model} configuration={device.configuration} />
            <Divider />
            <HistoricalData
              model={model}
              configuration={device.configuration}
            />
          </>
        )}

        {isMobileView &&
          (tab ? (
            <HistoricalData
              model={model}
              configuration={device.configuration}
            />
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
