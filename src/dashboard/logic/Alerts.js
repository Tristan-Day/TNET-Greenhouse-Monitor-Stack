import { getSolarData } from "./Data"

export async function getAlerts(configuration, model)
{
  let alerts = []

  // Check if the device has ceased transmision
  if (new Date() - model.getTimestamp() > 110 * 60 * 1000)
  {
    alerts.push({
      type: 'alert', severity: 'error',
      text: 'Your device has not transmitted data in the last hour'
    })
    return alerts
  }

  if (configuration.alerts) {
    alerts = alerts.concat(handleParameterAlarms(configuration, model))
  }

  if (configuration.reminders) {
    alerts = alerts.concat(await handleSunsetReminders(configuration, model))
  }

  // Add a type to each alert
  return alerts.map(alert => {
    return {type: 'alert', ...alert}
  })
}

function handleParameterAlarms(configuration, model)
{
  let alerts = []

  for (const [name, properties] of Object.entries(configuration.alerts))
  {
    if (!properties.enabled)
    {
      continue
    }

    if (name === 'moisture')
    {      
      const A = model.getLatestValue('SoilMoisturePrimary')
      const B = model.getLatestValue('SoilMoistureSecondary')

      if (properties.min)
      {
        const minimum = parseFloat(properties.min)

        if (A < minimum) {
          const label =
            configuration?.nicknames?.sensors?.A &&
            `Moisture Sensor '${configuration.nicknames.sensors.A}'`

          const text = `${label || 'Soil Sensor A'} has fallen below the minimum moisture target`
          alerts.push({ severity: 'warning', text: text })
        }

        if (B < minimum) {
          const label =
            configuration?.nicknames?.sensors?.B &&
            `Moisture Sensor '${configuration.nicknames.sensors.B}'`

          const text = `${label || 'Soil Sensor B'} has fallen below the minimum moisture target`
          alerts.push({ severity: 'warning', text: text })
        }
      }
      else if (properties.max) 
      {
        const maximum = parseFloat(properties.max)

        if (A > maximum) {
          const label =
            configuration?.nicknames?.sensors?.A &&
            `Moisture Sensor '${configuration.nicknames.sensors.A}'`

          const text = `${label || 'Soil Sensor A'} has exceeded the maximum moisture target`
          alerts.push({ severity: 'warning', text: text })
        }

        if (B > maximum) {
          const label =
            configuration?.nicknames?.sensors?.B &&
            `Moisture Sensor '${configuration.nicknames.sensors.B}'`

          const text = `${label || 'Soil Sensor B'} has exceeded the maximum moisture target`
          alerts.push({ severity: 'warning', text: text })
        }
      }
      continue
    }

    else if (properties.min)
    {
      const minimum = parseFloat(properties.min)
      const value = model.getLatestValue(name)

      if (minimum > value)
      {
        const difference = (minimum - value).toPrecision(2)

        const text = `${name.charAt(0).toUpperCase() + name.slice(1)}
           is ${difference} ${properties.units && properties.units} below target`

        alerts.push({ severity: 'warning', text: text })
        continue
      }
    } 
    
    else if (properties.max)
    {
      const maximum = parseFloat(properties.max)
      const value = model.getLatestValue(name)

      if (maximum < value)
      {
        const difference = (value - maximum).toPrecision(2)

        const text = `${name.charAt(0).toUpperCase() + name.slice(1)}
          is ${difference}${properties.units && properties.units} above target`

        alerts.push({ severity: 'warning', text: text })
        continue
      }
    }
  }

  return alerts
}

async function handleSunsetReminders(configuration, model)
{
  let alerts = []

  const isWithinRange = (date) => {
    return new Date().getHours() === date.getHours()
  }

  let solar = {}

  if (configuration.location)
  {
    const location = configuration.location
    try 
    {
      const response = await getSolarData(location.lat, location.lon)
      if (response.ok) {
        const data = (await response.json()).daily
        solar = {
          sunrise: data.sunrise[0],
          sunset: data.sunset[0]
        }
      } 
      else {
        alerts.push({
          severity: 'error',
          text: 'Failed to retreive solar data'
        })
      }
    } 
    catch 
    {
      alerts.push({
        severity: 'error',
        text: 'Failed to retreive solar data'
      })
    }
  }

  // Sunrise reminder
  if (configuration.reminders.sunrise && solar) {
    if (
      isWithinRange(new Date(solar.sunrise))
    ) {
      alerts.push({
        severity: 'info', text: 'Sunrise Reminder: Water your plants'
      })
      return alerts
    }
  }

  // Sunset reminder
  if (configuration.reminders.sunset && solar) {
    if (
      isWithinRange(new Date(solar.sunset))
    ) {
      alerts.push({
        severity: 'info', text: 'Sunset Reminder: Water your plants'
      })
      return alerts
    }
  }

  // Custom watering reminder
  if (configuration.reminders.custom?.enabled) {
    if (
      isWithinRange(new Date(configuration.reminders.custom.time))
    ) {
      alerts.push({
        severity: 'info', text: 'Custom Reminder: Water your plants'
      })
      return alerts
    }
  }

  return alerts
}
