/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const CHRONOS_HOUR = 1000 * 60 * 60
const CHRONOS_DAY = CHRONOS_HOUR * 24

exports.handler = async event => {
  console.log(`EVENT: ${JSON.stringify(event)}`)

  const pruneRecords = require('./tasks/pruneRecords')
  const updateTimestamps = require('./tasks/updateTimestamps')

  try {
    await Promise.all([pruneRecords(), updateTimestamps(CHRONOS_HOUR * 2)])
    console.log('Exectuion Complete')
  } catch (error) {
    console.log(`Failed to Complete Tasks: ${error}`)
  }
}
