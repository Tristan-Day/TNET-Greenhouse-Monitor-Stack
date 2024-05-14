import { useState, useContext, useEffect } from 'react'

import dayjs from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'


import {
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  Grow,
  Alert,
  InputAdornment,
  Divider,
  Switch,
  FormControlLabel,
  Link
} from '@mui/material'
import { MobileTimePicker, LocalizationProvider } from '@mui/x-date-pickers'

import { Flex } from '../../common/component'
import { isFloat } from '../../common/logic/Validation'
import { ConfigurationContext } from './Configuration'

function ThresholdAlerts({ configuration, setConfiguration })
{
  const [alerts, setAlerts] = useState(
    configuration.alerts || {
      temperature: { enabled: false, min: '', max: '', units: "°C" }, 
      humidity:    { enabled: false, min: '', max: '', units: "%" },
      moisture:    { enabled: false, min: '', max: '', units: "" }
    }
  )
  
  const [selection, setSelection] = useState('temperature')
  const [message, setMessage] = useState()

  const handleSubmit = () => {
    if (
      configuration.alerts &&
      configuration.alerts === alerts
    ) {
      return
    }

    setConfiguration({
      ...configuration,
      alerts: alerts
    })
  }

  const handleSetMinimum = value => {
    if (!value) {
      setAlerts({
        ...alerts,
        [selection]: { ...alerts[selection], max: value }
      })
      setMessage(undefined)
    }

    if (!isFloat(value)) {
      setMessage({ 
        severity: 'warning', 
        text: 'Minimum value must be decimal' 
      })
    } 
    else if (alerts[selection].max && value > parseFloat(alerts[selection].max)) {
      setMessage({
        severity: 'warning',
        text: 'Minimum value cannot exceed maximum value'
      })
    }

    setAlerts({
      ...alerts,
      [selection]: { ...alerts[selection], min: value }
    })
  }

  const handleSetMaximum = value => {
    if (!value) {
      setAlerts({
        ...alerts,
        [selection]: { ...alerts[selection], max: value }
      })
      setMessage(undefined)
    }

    if (!isFloat(value)) {
      setMessage({
        severity: 'warning',
        text: 'Maximum value must be decimal'
      })
    } 
    else if (alerts[selection].min && value < parseFloat(alerts[selection].min)) {
      setMessage({
        severity: 'warning',
        text: 'Maximum value canot be lower than the minimum value'
      })
    } else {
      setMessage(undefined)
    }

    setAlerts({
      ...alerts,
      [selection]: { ...alerts[selection], max: value }
    })
  }

  useEffect(() => {
    handleSubmit()
  }, [alerts])

  return (
    <Flex direction="column">
      <Box sx={{ marginBottom: '1.5rem' }}>
        <Typography variant="h6">Threshold Alerts</Typography>
        <Typography>Create optimal environmental conditions</Typography>
      </Box>

      {message && (
        <Box sx={{ marginBottom: '1.5rem' }}>
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        </Box>
      )}

      <Flex sx={{ alignItems: 'center', gap: '1rem' }}>
        <Select
          value={selection}
          onChange={event => {
            setSelection(event.target.value)
          }}
          sx={{ flexGrow: 1 }}
        >
          {Object.keys(alerts).map(key => {
            return (
              <MenuItem key={key} value={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </MenuItem>
            )
          })}
        </Select>
        <Switch
          checked={alerts[selection]?.enabled || false}
          onChange={event => {
            const updatedAlerts = {
              ...alerts,
              [selection]: {
                ...alerts[selection],
                enabled: event.target.checked
              }
            }
            setAlerts(updatedAlerts)
          }}
        />
      </Flex>

      <Flex sx={{ marginTop: '1rem', gap: '1rem' }}>
        <TextField
          label="Minimum Value"
          onChange={event => {
            handleSetMinimum(event.target.value)
          }}
          sx={{ flexGrow: 1 }}
          value={
            selection && alerts[selection].min ? alerts[selection].min : ''
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {selection && alerts[selection].units}
              </InputAdornment>
            )
          }}
        />
        <TextField
          label="Maximum Value"
          onChange={event => {
            handleSetMaximum(event.target.value)
          }}
          sx={{ flexGrow: 1 }}
          value={
            selection && alerts[selection].max ? alerts[selection].max : ''
          }
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {selection ? alerts[selection].units : ''}
              </InputAdornment>
            )
          }}
        />
      </Flex>

      <Flex sx={{ marginTop: '1.4rem' }}>
        <Typography>
          To find more information on how to care for your plants, please click{' '}
          <Link href="https://www.bhg.com/gardening/plant-dictionary/">
            here.
          </Link>
        </Typography>
      </Flex>
    </Flex>
  )
}

function SunsetIntegration({ configuration, setConfiguration })
{
  const [reminders, setReminders] = useState(configuration.reminders || {
    sunset: false, sunrise: false, custom: {enabled: false, time: '2022-04-17T17:30'}
  })

  const handleSetCustom = (property, value) => {
    setReminders({ ...reminders, custom: {...reminders.custom, [property]: value }})
  }

  const handleSubmit = () => {
    if (
      configuration.reminders &&
      configuration.reminders === reminders
    ) {
      return
    }

    setConfiguration({
      ...configuration,
      reminders: reminders
    })
  }

  useEffect(() => {
    handleSubmit()
  }, [reminders])

  return (
    <Flex direction="column">
      <Box sx={{ marginBottom: '1.5rem' }}>
        <Typography variant="h6">Watering Reminders</Typography>
        <Typography>Set a reminder to water your plants</Typography>
      </Box>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Flex sx={{ alignItems: 'center', gap: '1rem' }}>
          <MobileTimePicker
            onChange={event => {
              handleSetCustom('time', event.toISOString())
            }}
            value={dayjs(new Date(reminders.custom.time))}
            sx={{ flexGrow: 1 }}
          />
          <Switch
            onChange={event => {
              handleSetCustom('enabled', event.target.checked)
            }}
            checked={reminders.custom.enabled}
          />
        </Flex>
      </LocalizationProvider>

      <Flex sx={{ marginTop: '1.4rem' }}>
        {configuration.postcode ? (
          <Typography>Enable Automatic Reminders</Typography>
        ) : (
          <Typography>
            * Set a Postcode to unlock Automatic Reminders.
          </Typography>
        )}
      </Flex>

      {configuration.postcode && (
        <Flex direction="row" sx={{ marginTop: '0.7rem', gap: '1.5rem' }}>
          <FormControlLabel
            control={<Switch disabled={Boolean(!configuration.postcode)} />}
            onChange={event => {
              setReminders({
                ...reminders,
                sunrise: event.target.checked
              })
            }}
            checked={reminders.sunrise}
            label="At Sunrise"
          />
          <FormControlLabel
            control={<Switch disabled={Boolean(!configuration.postcode)} />}
            onChange={event => {
              setReminders({
                ...reminders,
                sunset: event.target.checked
              })
            }}
            checked={reminders.sunset}
            label="At Sunset"
          />
        </Flex>
      )}
    </Flex>
  )
}

export default function AlertConfiguration()
{
  const { configuration, setConfiguration } = useContext(ConfigurationContext)

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const padding = isMobileView ? '1rem' : '2rem'

  return (
    <Flex direction="column" grow={1} sx={{ padding: padding, gap: '1.5rem' }}>
      <ThresholdAlerts
        configuration={configuration || {}}
        setConfiguration={setConfiguration}
      />
      <Divider />
      <SunsetIntegration
        configuration={configuration || {}}
        setConfiguration={setConfiguration}
      />
    </Flex>
  )
}
