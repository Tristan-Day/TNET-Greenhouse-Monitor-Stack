/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

exports.handler = async event => {
  console.log(`EVENT: ${JSON.stringify(event)}`)

  const pruneRecords = require('./tasks/pruneRecords')
  const updateTimestamps = require('./tasks/updateTimestamps')

  try {
    await Promise.all([pruneRecords(), updateTimestamps()])
    console.log('Exectuion Complete')
  } catch (error) {
    console.log(`Failed to Complete Tasks: ${error}`)
  }
}
