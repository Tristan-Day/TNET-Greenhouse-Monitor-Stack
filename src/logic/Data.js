import { get } from 'aws-amplify/api'

function getResponseCode(error) {
  return error.$metadata.httpStatusCode
}

export const getWeatherData = async (latitude, longitude) => {
  let URL = 'https://api.open-meteo.com/v1/forecast?'

  URL += `latitude=${latitude}&longitude=${longitude}`
  URL += '&temperature_2m,relative_humidity_2m&hourly=temperature_2m,relative_humidity_2m'

  const convert = number => {
    const string = String(number)
    return string.padStart(2, '0')
  }

  const date = new Date()

  const end = `${date.getFullYear()}-${convert(date.getMonth() + 1)}-${convert(
    date.getDate() + 1
  )}`

  const start = `${date.getFullYear()}-${convert(
    date.getMonth() + 1
  )}-${convert(date.getDate() - 1)}`

  URL += `&start_date=${start}&end_date=${end}`
  return fetch(URL)
}

export const getMonitoringData = async (device) => {
  const operation = get({
    apiName: 'GreenhouseMonitorDataHandler',
    path: `/data/${device}`
  })

  var response
  try {
    response = await operation.response
    return await response.body.json()
  } 
  catch (error) {
    switch (getResponseCode(error)) {
      case 500:
        throw new Error(
          'No data available, please ensure your device is charged'
        )

      default:
        throw new Error(
          'Failed to retreive monitoring data, please try again later'
        )
    }
  }
}
function findNearestNeighbor(timestamp, dataset, range) {
  const target = new Date(timestamp)

  target.setMinutes(0)
  target.setMilliseconds(0)
  target.setSeconds(0)

  for (const datapoint of dataset) {
    if (Math.abs(target - new Date(datapoint.timestamp)) <= range) {
      return datapoint
    }
  }
  return null
}

export class DataModel 
{
  #monitoringData
  #weatherData

  constructor(monitoringData, weatherData) {
    this.#monitoringData = monitoringData
    this.#weatherData = weatherData
  }

  #extractMonitoringDataset(attribute, length, factor) {
    let datapoints = this.#monitoringData.map(packet => {
      return {
        timestamp: packet.TIMESTAMP,
        value: parseFloat(packet.DATA[attribute])
      }
    })

    if (factor) {
      datapoints = datapoints.map(datapoint => {
        return {
          ...datapoint,
          value: datapoint.value * factor
        }
      })
    }

    if (datapoints.length > length) {
      return datapoints.slice(0, length).reverse()
    }
    return datapoints.reverse()
  }

  #extractWeatherDataset(attribute) {
    return this.#weatherData[attribute]
      .map((packet, index) => {
        return {
          timestamp: new Date(this.#weatherData.time[index]).getTime(),
          value: packet
        }
      })
      .reverse()
  }

  #extractDualDataset(a, b, length) {
    const weatherData =
      this.#extractWeatherDataset(b)

    const monitoringData =
      this.#extractMonitoringDataset(a, length)

    return monitoringData.map(datapoint => {
      const outdoor = findNearestNeighbor(
        datapoint.timestamp, weatherData, 3600000)
      return {
        outdoor: outdoor.value, indoor: datapoint.value,
        timestamp: datapoint.timestamp
      }
    })
  }

  includesWeatherData() {
    return Boolean(this.#weatherData)
  }

  getLatestValue(property) {
    return this.#monitoringData[0].DATA[property]
  }

  getDataset(property, length) {
    switch (property) {
      case 'Temperature':
        if (!this.includesWeatherData()) {
          return this.#extractMonitoringDataset('Temperature', length)
        }
        return this.#extractDualDataset('Temperature', 'temperature_2m', length)

      case 'Humidity':
        if (!this.includesWeatherData()) {
          return this.#extractMonitoringDataset('Humidity', length)
        }
        return this.#extractDualDataset('Humidity', 'relative_humidity_2m', length)

      default:
        return this.#extractMonitoringDataset(property, length)
    }
  }
}
