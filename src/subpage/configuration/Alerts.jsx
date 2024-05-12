import { useState, useContext } from 'react'

import {
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  Grow,
  Alert,
  InputAdornment,
  Switch,
  Link
} from '@mui/material'

import { Flex } from '../../component'
import { isFloat } from '../../logic/Validation'
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
    } else {
      setMessage(undefined)
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

  return (
    <Flex direction="column">
      <Box sx={{ marginBottom: '1.5rem' }}>
        <Typography variant="h5">Threshold Alerts</Typography>
        <Typography>Create optimal environmental conditions</Typography>
      </Box>

      {message && (
        <Box sx={{ marginBottom: '1.5rem' }}>
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        </Box>
      )}

      <Flex
        sx={{
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
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
            setConfiguration({ ...configuration, alerts: updatedAlerts })
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
          onBlur={() => {
            handleSubmit()
          }}
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
          onBlur={() => {
            handleSubmit()
          }}
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
        <Typography variant="body">
          To find more information on how to care for your plants, please click{' '}
          <Link href="https://www.bhg.com/gardening/plant-dictionary/">
            here.
          </Link>
        </Typography>
      </Flex>
    </Flex>
  )
}

// function SunsetReminders({ configuration, setConfiguration })
// {
//   const [reminders, setReminder] = useState(configuration.reminders || {})
//   const [message, setMessage] = useState()

//   return (
//     <Flex direction="column">
//       <Box sx={{ marginBottom: '1.5rem' }}>
//         <Typography variant="h5">Sunset Watering Reminders</Typography>
//         <Typography>Remind me to water my plants</Typography>
//       </Box>

//       {message && (
//         <Box sx={{ marginBottom: '1.5rem' }}>
//           <Grow in>
//             <Alert severity={message.severity}>{message.text}</Alert>
//           </Grow>
//         </Box>
//       )}
//     </Flex>
//   )
// }

export default function AlertConfiguration()
{
  const { configuration, setConfiguration } = useContext(ConfigurationContext)

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const padding = isMobileView ? '1rem' : '2rem'

  return (
    <Flex direction="column" grow={1} sx={{ padding: padding, gap: '1.2rem' }}>
      <ThresholdAlerts
        configuration={configuration || {}}
        setConfiguration={setConfiguration}
      />
    </Flex>
  )
}
