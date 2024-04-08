import { useContext, useEffect, useState } from 'react'

import {
  Box,
  Grow,
  Alert,
  Card,
  Typography,
  Backdrop,
  TextField,
  Button,
  Divider,
  Fab
} from '@mui/material'
import { Add } from '@mui/icons-material'

import { Flex } from '../component'
import { MonitoringIcon } from '../component/icon/MonitoringIcon'

import { isValidIdentifier } from '../logic/Validation'
import { registerDevice } from '../logic/User'

import { AccountContext } from '../App'

function RegistrationDialog({ dialogState }) 
{
  const [form, setForm] = useState({})
  const [message, setMessage] = useState()

  const handleValidation = () => {
    // Validate the form and display an appropriate message
    if (!form.identifier) {
      setMessage({ severity: 'warning', text: 'Enter a Device ID' })
      return
    }

    if (!isValidIdentifier(form.identifier)) {
      setMessage({ severity: 'error', text: 'Device ID is Not Valid' })
      return
    }

    if (!form.code) {
      setMessage({ severity: 'warning', text: 'Enter an Activation Code' })
      return
    }

    if (!form.code.match(/[0-9]{4}$/i)) {
      setMessage({ severity: 'error', text: 'Activation Code is Not Valid' })
      return
    }

    setMessage(undefined)
  }

  const handleSubmit = () => {
    // Submit the form and handle any errors
    setMessage({ severity: 'info', text: 'Registering your Device'})

    registerDevice(form.identifier, form.code)
      .then(() => {
        setMessage({severity: 'success', text: 'Device Registered' })
      })
      .catch(error => {
        setMessage({ severity: 'error', text: error.message })
      })
  }

  useEffect(() => {
    handleValidation()
  }, [form])

  return (
    <Backdrop open={dialogState.open}>
      <Card className='Popup'>
        <Typography variant="h5">Register a Device</Typography>

        {message && (
          <Grow in>
            <Alert severity={message.severity}>{message.text}</Alert>
          </Grow>
        )}
        <Divider sx={{ marginBottom: '0.8rem' }} />

        <TextField
          label="Device ID"
          onChange={event => {
            setForm({ ...form, identifier: event.target.value })
          }}
          onBlur={event => {
            setForm({ ...form, identifier: event.target.value })
          }}
        />
        <TextField
          label="Activation Code"
          onChange={event => {
            setForm({ ...form, code: event.target.value })
          }}
          onBlur={event => {
            setForm({ ...form, code: event.target.value })
          }}
        />

        <Flex sx={{ justifyContent: 'space-between', marginTop: '1rem' }}>
          <Button variant="outlined" onClick={() => dialogState.set(false)}>
            Cancel
          </Button>
          <Button
            variant={!message ? 'contained' : 'disabled'}
            onClick={() => {
              handleSubmit()
            }}
          >
            Add Device
          </Button>
        </Flex>
      </Card>
    </Backdrop>
  )
}

function DeviceCard({ label, identifier }) 
{
  label = label ? label : 'Greenhouse Monitor'

  return (
    <Card className='Card'>
      <MonitoringIcon size={35} />
      <Flex direction="column">
        <Typography variant="h6">{label}</Typography>
        <Typography>{identifier}</Typography>
      </Flex>
    </Card>
  )
}

export default function Devices() 
{
  const accountContext = useContext(AccountContext)
  const [dialog, setDialog] = useState(false)

  return (
    <Flex direction="column" grow={1}>
      <RegistrationDialog dialogState={{ open: dialog, set: setDialog }} />

      <Typography variant="h4" marginBottom="1rem">
        My Devices
      </Typography>

      {accountContext.DEVICES && !accountContext.DEVICES.length && !dialog && (
        <Grow in>
          <Alert severity="info" sx={{ marginBottom: '1.2rem' }}>
            You Currently have no Registered Devices
          </Alert>
        </Grow>
      )}

      <Flex sx={{ gap: '1rem' }}>
        {accountContext.DEVICES && accountContext.DEVICES.map(device => (
          <DeviceCard key={device} identifier={device} />
        ))}
      </Flex>

      <Box sx={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}>
        <Fab
          disabled={dialog}
          onClick={() => {
            setDialog(true)
          }}
          color="primary"
        >
          <Add />
        </Fab>
      </Box>
    </Flex>
  )
}
