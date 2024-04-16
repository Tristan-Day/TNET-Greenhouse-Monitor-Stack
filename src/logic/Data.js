import {get} from 'aws-amplify/api'

export const getWeatherData =
    async (latitude, longitude) => {
  let URL = "https://api.open-meteo.com/v1/forecast?"

  URL += `latitude=${latitude}&longitude=${longitude}`
  URL += "&temperature_2m,relative_humidity_2m&hourly=temperature_2m,relative_humidity_2m"

  const convert =
      number => {
        const string = String(number)
        return string.padStart(2, '0')
      }

  let date = new Date()
  const end = `${date.getFullYear()}-${convert(date.getMonth())}-${convert(
    date.getDate()
  )}`

  // Subtract 1 day from the current date
  date = new Date(date.getTime() - 86400000)
  const start = `${date.getFullYear()}-${convert(date.getMonth())}-${convert(
    date.getDate()
  )}`

  URL += `&start_date=${start}&end_date=${end}`

  return fetch(URL)
}

function getResponseCode(error) {
  return error.$metadata.httpStatusCode
}

export const getMonitoringData = async (device, period) => {
  const operation = get({apiName : 'GreenhouseMonitorDataHandler', path : `/data/${device}`})

  var response
  try
  {
    response = await operation.response
    return (await response.body.json())
  }
  catch (error)
  {
    switch (getResponseCode(error))
    {
    case 500:
      throw new Error('No data available, please ensure your device is charged')

    default: 
      throw new Error('Failed to retreive monitoring data, please try again later')
    }
  }
}

export const extractDataset = (packets, attribute, length, factor) => {
  let datapoints = packets.map(packet => {
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
