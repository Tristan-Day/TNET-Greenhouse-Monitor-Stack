import {get} from 'aws-amplify/api'
import strftime from 'strftime'

export class DataModel 
{
  #monitoringData
  #weatherData

  constructor(monitoringData, weatherData)
  {
    this.#monitoringData = monitoringData
    this.#weatherData = weatherData
  }

  #getMonitoringData(attribute, length, factor)
  {
    let datapoints = this.#monitoringData.map(packet => {
      return {
        timestamp: packet.TIMESTAMP,
        value: parseFloat(packet.DATA[attribute])
      }
    })

    if (factor)
      {
      datapoints = datapoints.map(datapoint => {
        return {
          ...datapoint,
          value: datapoint.value * factor
        }
      })
    }

    if (datapoints.length > length)
      {
      return datapoints.slice(0, length).reverse()
    }
    return datapoints.reverse()
  }

  #getWeatherData(attribute)
  {
    return this.#weatherData[attribute]
      .map((packet, index) => {
        return {
          timestamp: new Date(this.#weatherData.time[index]).getTime(),
          value: packet
        }
      })
      .reverse()
  }

  #getDualDataset(a, b, length)
  {
    const weatherData = this.#getWeatherData(b)
    const monitoringData = this.#getMonitoringData(a, length)

    return monitoringData.map(datapoint => {
      const outdoor = findNearestDatapoint(
        datapoint.timestamp, weatherData, 3600000
      )

      if (outdoor && outdoor.value)
        {
        return {
          outdoor: outdoor.value,
          indoor: datapoint.value,
          timestamp: datapoint.timestamp
        }
      }
      else
      {
        return {
          indoor: datapoint.value,
          timestamp: datapoint.timestamp
        }
      }
    })
  }

  includesWeatherData()
  {
    return Boolean(this.#weatherData)
  }

  getTimestamp()
  {
    return new Date(this.#monitoringData[0].TIMESTAMP)
  }

  getFormattedTimestamp()
  {
    return strftime('%F at %H:%M', this.getTimestamp())
  }

  getLatestValue(property)
  {
    property = property.charAt(0).toUpperCase() + property.slice(1)
    return parseFloat(this.#monitoringData[0].DATA[property])
  }

  getHighestValue(property)
  {
    let value = this.#monitoringData[0].DATA[property]

    this.#monitoringData.forEach(datapoint => {
      if (datapoint.DATA[property] > value) 
      {
        value = datapoint.DATA[property]
      }
    })

    return parseFloat(value)
  }

  getLowestValue(property) {
    let value = this.#monitoringData[0].DATA[property]

    this.#monitoringData.forEach(datapoint => {
      if (datapoint.DATA[property] < value)
        {
        value = datapoint.DATA[property]
      }
    })
    
    return parseFloat(value)
  }

  getDataset(property, length)
  {
    if (property === 'Temperature')
      {
      if (!this.includesWeatherData())
        {
        return this.#getMonitoringData('Temperature', length)
      }
      return this.#getDualDataset('Temperature', 'temperature_2m', length)
    }

    if (property === 'Humidity')
      {
      if (!this.includesWeatherData())
        {
        return this.#getMonitoringData('Humidity', length)
      }
      return this.#getDualDataset('Humidity', 'relative_humidity_2m', length)
    }

    return this.#getMonitoringData(property, length)
  }
}

function getResponseCode(error)
{
  return error.$metadata.httpStatusCode
}

function findNearestDatapoint(timestamp, dataset, range) 
{
  const target = new Date(timestamp)

  target.setMinutes(0)
  target.setMilliseconds(0)
  target.setSeconds(0)

  for (const datapoint of dataset)
  {
    if (Math.abs(target - new Date(datapoint.timestamp)) <= range)
    {
      return datapoint
    }
  }
  return null
}

export async function getWeatherData(latitude, longitude)
{
  let URL = 'https://api.open-meteo.com/v1/forecast?'

  URL += `latitude=${latitude}&longitude=${longitude}`
  URL += '&temperature_2m,relative_humidity_2m&hourly=temperature_2m,relative_humidity_2m'

  const convert = number => 
  {
    const string = String(number)
    return string.padStart(2, '0')
  }

  const date = new Date()

  const end = `${date.getFullYear()}-${convert(date.getMonth() + 1)}-${
      convert(date.getDate() + 1)}`

  const start = `${date.getFullYear()}-${convert(date.getMonth() + 1)}-${
      convert(date.getDate() - 1)}`

  URL += `&start_date=${start}&end_date=${end}`
  return fetch(URL)
}

export async function getMonitoringData(device)
{
  const operation =
      get({apiName : 'GreenhouseMonitorDataHandler', path : `/data/${device}`})

  var response
  try {
    response = await operation.response
    return await response.body.json()
  }
  catch (error)
  {
    switch (getResponseCode(error))
    {
    case 500:
      throw new Error('Failed to retreive monitoring data due to a server error, please try again later')
    
    case 404:
      throw new Error('No monitoring data found for the last 24-hours')

    default: throw new Error(
        'Failed to retreive monitoring data, please try again later')
    }
  }
}

export async function getSolarData(latitude, longitude)
{
  let URL = 'https://api.open-meteo.com/v1/forecast?'

  URL += `latitude=${latitude}&longitude=${longitude}`
  URL += '&daily=sunrise,sunset'

  return fetch(URL)
}

export function getColourCode(value)
{
  // https://blog.metoffice.gov.uk/2023/07/27/no-need-to-see-red-over-met-office-colour-scale/

  if (value > 50) {
    return '#100002'
  }
  else if (value > 45) {
    return '#1F0007'
  }
  else if (value > 40) {
    return '#3A000E'
  }
  else if (value > 35) {
    return '#70001C'
  }
  else if (value > 30) {
    return '#C30031'
  }
  else if (value > 27) {
    return '#E13D32'
  }
  else if (value > 24) {
    return '#F67639'
  }
  else if (value > 22) {
    return '#FC9F46'
  }
  else if (value > 20) {
    return '#FFB34C'
  }
  else if (value > 18) {
    return '#FFC261'
  }
  else if (value > 16) {
    return '#FFC96C'
  }
  else if (value > 14) {
    return '#FFD881'
  }
  else if (value > 12) {
    return '#FFE796'
  }
  else if (value > 10) {
    return '#FFEEA1'
  }
  else if (value > 8) {
    return '#E3ECAB'
  }
  else if (value > 6) {
    return '#CFEBB2'
  }
  else if (value > 4) {
    return '#B6E3BB7'
  }
  else if (value > 2) {
    return '#91D5BA'
  }
  else if (value > 0) {
    return '#7FCEBC'
  }
  else if (value > -2) {
    return '#60C3C1'
  }
  else if (value > -4) {
    return '#38AEC4'
  }
  else if (value > -6) {
    return '#1D92C1'
  }
  else if (value > -8) {
    return '#3075AC'
  }
  else if (value > -10) {
    return '#435897'
  }
  else if (value > -15) {
    return '#082376'
  }
  else if (value > -20) {
    return '#02154F'
  }
  else if (value > -30) {
    return '#020F39'
  }
  else if (value < -40) {
    return '#01081E'
  }
}
