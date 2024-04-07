import { get } from 'aws-amplify/api'

export const getWeatherData = async (latitude, longitude) => {
  let URL = "https://api.open-meteo.com/v1/forecast?"

  URL += `latitude=${latitude}&longitude=${longitude}`
  URL += "&temperature_2m,relative_humidity_2m&hourly=temperature_2m,relative_humidity_2m"

  const convert = number => {
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


export const getMonitoringData = async (device, period) => {
  const operation = get({
    apiName: 'GreenhouseMonitorDataHandler',
    path: `/data/${device}`,
    options: {
      body: { range: period }
    }
  })

  var response
  try {
    response = await operation.response
  } catch (error) {
    throw new Error('Failed to perform DynamoDB operation')
  }

  return (await response.body.json()).Items
}
