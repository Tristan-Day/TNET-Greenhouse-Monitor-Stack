import { getCurrentUser } from 'aws-amplify/auth'
import { get } from 'aws-amplify/api'

export const getData = async (device, period) => {
  const operation = get({
    apiName: 'GreenhouseMonitorDataHandler',
    path: `/data/${device}`
  })

  var response
  try {
    response = await operation.response
  } catch (error) {
    console.log(error)

    throw new Error('Failed to perform DynamoDB operation')
  }

  return (await response.body.json()).Items
}
