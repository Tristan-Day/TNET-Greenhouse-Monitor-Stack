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

import { Flex } from './component'
import { MonitoringIcon } from './component/icon/MonitoringIcon'
import { DeviceContext } from '../App'

function DeviceRegistration({ dialogState }) {
  const [form, setForm] = useState({})
  const [message, setMessage] = useState()

  const handleValidation = () => 
  {
    if (!form.identifier) {
      setMessage({ severity: 'warning', text: 'Enter a Device ID' })
      return
    }

    if (!form.identifier.match(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
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
    setMessage({ severity: 'info', text: 'Registering your Device' })
  }

  useEffect(() => {
    handleValidation()
  }, [form])

  return (
    <Backdrop open={dialogState.open}>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          gap: '1.2rem',
          padding: '1.5rem',
          minWidth: 'fit-content',
          maxWidth: '50vw'
        }}
      >
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
          <Button
            variant="outlined"
            onClick={() => {
              dialogState.set(false)
            }}
          >
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

function DeviceCard({ label, identifier }) {
  label = label ? label : 'Greenhouse Monitor'

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem'
      }}
    >
      <MonitoringIcon size={35} />
      <Flex direction="column">
        <Typography variant="h6">{label}</Typography>
        <Typography variant="p1">{identifier}</Typography>
      </Flex>
    </Card>
  )
}

export default function Devices() {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Flex direction="column" grow={1}>
      <DeviceRegistration
        dialogState={{ open: dialogOpen, set: setDialogOpen }}
      />

      <Typography variant="h4" marginBottom="0.75rem">
        My Devices
      </Typography>

      {!useContext(DeviceContext).devices.length && !dialogOpen && (
        <Grow in>
          <Alert severity="info" sx={{ marginBottom: '1.2rem' }}>
            You Currently have no Registered Devices
          </Alert>
        </Grow>
      )}

      <Flex sx={{ gap: '1rem' }}>
        {useContext(DeviceContext).devices.map(device => (
          <DeviceCard key={device.identifier} identifier={device.identifier} />
        ))}
      </Flex>

      <Box sx={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem' }}>
        <Fab
          disabled={dialogOpen}
          onClick={() => {
            setDialogOpen(true)
          }}
          color="primary"
        >
          <Add />
        </Fab>
      </Box>
    </Flex>
  )
}
