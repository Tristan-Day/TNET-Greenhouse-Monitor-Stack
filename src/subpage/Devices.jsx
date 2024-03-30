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

import { MonitoringIcon } from './component/icon/MonitoringIcon'
import { DeviceContext } from '../App'

const CardProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  padding: '1rem'
}

function DeviceRegistration({ dialogState }) {
  const [form, setForm] = useState({})
  const [message, setMessage] = useState()

  const handleValidation = () => {
    if (!form.identifier) {
      setMessage({ severity: 'warning', text: 'Enter a Device ID' })
      return
    }

    if (
      !form.identifier.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      )
    ) {
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
      <Card sx={{ display: 'flex', flexGrow: 1, flexDirection: 'column', gap: '1.2rem', padding: '1.5rem', minWidth: 'fit-content', maxWidth: '50vw' }}>
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

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '1rem'
          }}
        >
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
        </Box>
      </Card>
    </Backdrop>
  )
}

function DeviceCard({ identifier }) {
  return (
    <Card sx={CardProperties}>
      <MonitoringIcon size={35} />
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ userSelect: false }}>
          Greenhouse Monitor
        </Typography>
        <Typography variant="p1">{identifier}</Typography>
      </Box>
    </Card>
  )
}

export default function Devices() {
  const deviceContext = useContext(DeviceContext)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <DeviceRegistration
        dialogState={{ open: dialogOpen, set: setDialogOpen }}
      />

      <Typography variant="h4" marginBottom="0.75rem">
        My Devices
      </Typography>

      {!deviceContext.devices.length && !dialogOpen && (
        <Grow in>
          <Alert severity="info" sx={{ marginBottom: '1.2rem' }}>
            Click 'Add New Device' to Setup a New Device
          </Alert>
        </Grow>
      )}

      <Box sx={{ display: 'flex', gap: '1rem' }}>
        {deviceContext.devices.map(device => (
          <DeviceCard key={device.identifier} identifier={device.identifier} />
        ))}
      </Box>

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
    </Box>
  )
}
