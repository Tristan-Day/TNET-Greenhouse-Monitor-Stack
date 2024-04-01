import { get } from 'aws-amplify/api'

export const getData = async (device, period) => {
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
