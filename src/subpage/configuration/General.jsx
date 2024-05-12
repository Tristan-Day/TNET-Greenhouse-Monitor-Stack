import { useState, useContext } from 'react'

import {
  Typography,
  Box,
  TextField,
  Grow,
  Alert,
  Divider,
  InputAdornment,
} from '@mui/material'

import { Flex } from '../../component'
import { isValidPostcode, isPositiveFloat, isFloat } from '../../logic/Validation'
import { ConfigurationContext } from './Configuration'

function NicknameConfiguration({ configuration, setConfiguration })
{
  const [nicknames, setNicknames] = useState(configuration.nicknames || {})
  const [message, setMessage] = useState()

  const handleSubmit = () => {
    if (
      configuration.nicknames &&
      configuration.nicknames === nicknames
    ) {
      return
    }

    if (nicknames.device && nicknames.device.length > 30) {
      setMessage({
        severity: 'error',
        text: 'Device nickname cannot exceed 30 characters'
      })
      return
    }

    if (!nicknames.sensors) {
      setConfiguration({
        ...configuration,
        nicknames: nicknames
      })
      return
    }

    if (nicknames.sensors.A && nicknames.sensors.A.length > 30) {
      setMessage({
        severity: 'error',
        text: 'Sensor nickname cannot exceed 30 characters'
      })
      return
    }

    if (nicknames.sensors.B && nicknames.sensors.B.length > 30) {
      setMessage({
        severity: 'error',
        text: 'Sensor nickname cannot exceed 30 characters'
      })
      return
    }

    setConfiguration({
      ...configuration,
      nicknames: nicknames
    })
  }

  return (
    <Flex direction="column">
      <Box sx={{ marginBottom: '1.5rem' }}>
        <Typography variant="h5">Nicknames</Typography>
        <Typography>Set device and sensor nicknames</Typography>
      </Box>

      {message && (
        <Box sx={{ marginBottom: '1.5rem' }}>
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        </Box>
      )}

      <Flex direction="column" sx={{ gap: '1rem' }}>
        <TextField
          label="Device Name"
          onChange={event => {
            setNicknames({ ...nicknames, device: event.target.value })
          }}
          onBlur={() => {
            handleSubmit()
          }}
          value={nicknames.device ? nicknames.device : ''}
        />
        <TextField
          label="Moisture Sensor A"
          onChange={event => {
            setNicknames({
              ...nicknames,
              sensors: { ...nicknames.sensors, A: event.target.value }
            })
          }}
          onBlur={() => {
            handleSubmit()
          }}
          value={nicknames.sensors ? nicknames.sensors.A : ''}
        />
        <TextField
          label="Moisture Sensor B"
          onChange={event => {
            setNicknames({
              ...nicknames,
              sensors: { ...nicknames.sensors, B: event.target.value }
            })
          }}
          onBlur={() => {
            handleSubmit()
          }}
          value={nicknames.sensors ? nicknames.sensors.B : ''}
        />
      </Flex>
    </Flex>
  )
}

function ForecastIntegration({ configuration, setConfiguration })
{
  const [postcode, setPostcode] = useState(configuration.postcode || '')
  const [message, setMessage] = useState()

  const handleSubmit = () => {
    if (postcode === configuration.postcode) {
      return
    }

    if (!postcode) {
      setMessage({ severity: 'warning', text: 'You must enter a postcode' })
      return
    }

    if (!isValidPostcode(postcode)) {
      setMessage({ severity: 'error', text: 'Please enter a valid postcode' })
      return
    }

    fetch(`https://api.postcodes.io/postcodes/${postcode}`)
      .then(async response => {
        if (response.ok) {
          const result = (await response.json()).result
          setConfiguration({
            ...configuration,
            location: {
              lon: result.longitude,
              lat: result.latitude
            },
            postcode: postcode
          })
          setMessage(undefined)
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

  return (
    <Flex direction="column">
      <Box sx={{ marginBottom: '1.5rem' }}>
        <Typography variant="h5">Weather Integration</Typography>
        <Typography>Set a location to enable forecast integration</Typography>
      </Box>

      {message && (
        <Box sx={{ marginBottom: '1.5rem' }}>
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        </Box>
      )}

      <Flex direction="column" sx={{ gap: '1rem' }}>
        <TextField
          label="Postcode"
          onChange={event => {
            setPostcode(event.target.value)
          }}
          onBlur={() => {
            handleSubmit()
          }}
          value={postcode}
        />
      </Flex>
    </Flex>
  )
}

function DisplayCalibration({ configuration, setConfiguration })
{
  const [calibrations, setCalibrations] = useState(configuration.calibrations || {})
  const [message, setMessage] = useState()

  const handleSubmit = () => {
    if (
      configuration.calibrations &&
      configuration.calibrations === calibrations
    ) {
      return
    }

    if (calibrations.temperature && !isFloat(calibrations.temperature)) {
      setMessage({
        severity: 'error',
        text: 'Temperature calibration value must be decimal'
      })
      return
    }

    if (!calibrations.moisture) {
      setConfiguration({
        ...configuration,
        calibrations: calibrations
      })
      return
    }

    if (calibrations.moisture.min && !isPositiveFloat(calibrations.moisture.min)) {
      setMessage({
        severity: 'error',
        text: 'Moisture calibration values must be a positive decimal'
      })
      return
    }

    if (calibrations.moisture.max && !isPositiveFloat(calibrations.moisture.max)) {
      setMessage({
        severity: 'error',
        text: 'Moisture calibration values must be a positive decimal'
      })
      return
    }

    setConfiguration({
      ...configuration,
      calibrations: calibrations
    })
  }

  return (
    <Flex direction="column">
      <Box sx={{ marginBottom: '1.5rem' }}>
        <Typography variant="h5">Display Calibration</Typography>
        <Typography>Dashboard calibration options</Typography>
      </Box>

      {message && (
        <Box sx={{ marginBottom: '1.5rem' }}>
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        </Box>
      )}

      <Flex direction="column" sx={{ gap: '1rem' }}>
        <TextField
          label="Temperature Colour Offset"
          onChange={event => {
            setCalibrations({
              ...calibrations,
              temperature: event.target.value
            })
          }}
          onBlur={() => {
            handleSubmit()
          }}
          value={calibrations.temperature ? calibrations.temperature : ''}
          InputProps={{
            endAdornment: <InputAdornment position="end">°C</InputAdornment>
          }}
        />

        <Typography sx={{ marginTop: '0.4rem', marginBottom: '0.4rem' }}>
          Soil Sensor Calibration
        </Typography>

        <Flex sx={{ gap: '1rem' }}>
          <TextField
            label="Minimum Value"
            onChange={event => {
              setCalibrations({
                ...calibrations,
                moisture: { ...calibrations.moisture, min: event.target.value }
              })
            }}
            sx={{ flexGrow: 1 }}
            onBlur={() => {
              handleSubmit()
            }}
            value={calibrations.moisture ? calibrations.moisture.min : ''}
          />
          <TextField
            label="Maximum Value"
            onChange={event => {
              setCalibrations({
                ...calibrations,
                moisture: { ...calibrations.moisture, max: event.target.value }
              })
            }}
            sx={{ flexGrow: 1 }}
            onBlur={() => {
              handleSubmit()
            }}
            value={calibrations.moisture ? calibrations.moisture.max : ''}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

export default function GeneralConfiguration()
{
  const { configuration, setConfiguration } = useContext(ConfigurationContext)

  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const padding = isMobileView ? '1rem' : '2rem'

  return (
    <Flex direction="column" grow={1} sx={{ padding: padding, gap: '1.2rem' }}>
      <NicknameConfiguration
        configuration={configuration || {}}
        setConfiguration={setConfiguration}
      />
      <Divider />
      <ForecastIntegration
        configuration={configuration || {}}
        setConfiguration={setConfiguration}
      />
      <Divider />
      <DisplayCalibration
        configuration={configuration || {}}
        setConfiguration={setConfiguration}
      />
    </Flex>
  )
}
