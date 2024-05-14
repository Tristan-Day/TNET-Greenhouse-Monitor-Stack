import { getCurrentUser } from 'aws-amplify/auth'
import { get, put } from 'aws-amplify/api'

function getResponseCode(error)
{
  return error.$metadata.httpStatusCode
}

export async function getUserData()
{
  const user = await getCurrentUser()

  const operation = get({
    apiName: 'GreenhouseMonitorUserHandler',
    path: `/user/${user.userId}`
  })

  try {
    const response = await operation.response
    return (await response.body.json())
  } 
  catch (error)
  {
    switch (getResponseCode(error)) 
    {
      case 404:
        throw new Error('User Not Found')

      default:
        throw new Error('Unhandled Error')
    }
  }
}

export async function registerDevice(identifier, code)
{
  const user = await getCurrentUser()

  const operation = put({
    apiName: 'GreenhouseMonitorUserHandler',
    path: `/user/${user.userId}/devices`,
    options: { body: { identifier: identifier, code: code } }
  })

  try {
    await operation.response
  }
  catch (error)
  {
    switch (getResponseCode(error)) 
    {
      case 409:
        throw new Error('Device already Registered')

      case 404:
        throw new Error('Invalid Device Identifier')

      case 403:
        throw new Error('Activation Code is Incorrect')

      case 500:
        throw new Error('Internal Server Error')

      default:
        throw new Error('Unhandled Error')
    }
  }
}
