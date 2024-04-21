import { useEffect, useContext, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

import {
  Button,
  Typography,
  Divider,
  Box,
  TextField,
  Grow,
  Alert,
  useTheme,
  InputAdornment
} from '@mui/material'

import { Flex } from '../component'
import { TransmitterIcon } from '../component/icon/TransmitterIcon'

import { WindowContext } from '../Navigation'
import Loading from '../Loading'

import { isValidFloat, isValidPostcode } from '../logic/Validation'

function Header({ device }) {
  const navigate = useNavigate()

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
              <Typography variant="h6">Device Configuration</Typography>
              <Typography noWrap>{device.ID || 'Loading...'}</Typography>
            </Box>
          </Flex>
        ) : (
          <Flex sx={{ alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">Device Configuration</Typography>
              <Typography>{device.ID || 'Loading...'}</Typography>
            </Box>
          </Flex>
        )}
      </Flex>
      <Button
        variant="outlined"
        onClick={() => {
          navigate(-1)
        }}
      >
        Return
      </Button>
    </Flex>
  )
}

function LocationConfiguration({ configuration, setConfiguration }) 
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

    setMessage({ severity: 'info', text: 'Checking postcode', loading: true })

    fetch(`https://api.postcodes.io/postcodes/${postcode}`)
      .then(async response => {
        setMessage({
          severity: 'success',
          text: 'Location sucessfully updated'
        })

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
    <Flex direction="column" sx={{ gap: '2rem' }}>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5">Device Location</Typography>
          <Typography>Set a location to enable forecast integration</Typography>
        </Box>
      </Flex>

      {message && (
        <Grow in>
          <Alert severity={message.severity}>{message.text}</Alert>
        </Grow>
      )}

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
  )
}

function ThresholdConfiguration({ configuration, setConfiguration }) 
{
  const [thresholds, setThreshold] = useState(configuration.thresholds || {})
  const [message, setMessage] = useState()

  const handleSubmit = () => {
    if (configuration.thresholds === thresholds) {
      return
    }

    for (const value of Object.values(thresholds)) {
      if (value.length && (!isValidFloat(value))) {
        setMessage({
          severity: 'error',
          text: 'Thresholds must be decimal'
        })
        return
      }
    }

    setConfiguration({
      ...configuration,
      thresholds: thresholds
    })
    setMessage({
      severity: 'success',
      text: 'Thresholds sucessfully Updated'
    })
  }

  return (
    <Flex direction="column" sx={{ gap: '2rem' }}>
      <Flex sx={{ justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h5">Threshold Alerts</Typography>
          <Typography>Set optimal environmental conditions</Typography>
        </Box>
      </Flex>

      {message && (
        <Grow in>
          <Alert severity={message.severity}>{message.text}</Alert>
        </Grow>
      )}

      <TextField
        label="Temperature Limit"
        onChange={event => {
          setThreshold({ ...thresholds, temperature: event.target.value })
        }}
        onBlur={() => {
          handleSubmit()
        }}
        value={thresholds.temperature || ''}
        InputProps={{
          endAdornment: <InputAdornment position="end">°C</InputAdornment>
        }}
      />
      <TextField
        label="Humidity Limit"
        onChange={event => {
          setThreshold({ ...thresholds, humidity: event.target.value })
        }}
        onBlur={() => {
          handleSubmit()
        }}
        value={thresholds.humidity || ''}
        InputProps={{
          endAdornment: <InputAdornment position="end">%</InputAdornment>
        }}
      />
    </Flex>
  )
}

export default function Configuration() 
{
  const windowContext = useContext(WindowContext)
  let { identifier } = useParams()

  const [device, setDevice] = useState({})

  // Update local storage with a new configuration
  const setConfiguration = configuration => {
    setDevice({ ...device, configuration: configuration })
    localStorage.setItem(
      identifier,
      JSON.stringify({ ...device, configuration: configuration })
    )
  }

  // Set the window title
  useEffect(() => {
    windowContext.setWindow({ title: 'Device Configuration' })
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

  if (!device.ID) {
    return <Loading />
  }

  return (
    <Flex direction="column" grow={1}>
      <Header device={device} />
      <Divider />

      <Flex direction="column" grow={1} sx={{ margin: '2rem', gap: '2rem' }}>
        <LocationConfiguration
          configuration={device.configuration || {}}
          setConfiguration={setConfiguration}
        />
        <Divider />
        <ThresholdConfiguration
          configuration={device.configuration || {}}
          setConfiguration={setConfiguration}
        />
      </Flex>
    </Flex>
  )
}
