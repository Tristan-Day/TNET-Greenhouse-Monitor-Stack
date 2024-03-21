const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')

const {
  DynamoDBDocumentClient,
  ScanCommand,
  UpdateCommand
} = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)

async function timestampDevices(range) {
  // #swagger.description = 'Update the transmission timestamps for devices wtihin a given range'

  const expression = {
    TableName: 'GreenhouseMonitor-Data',
    FilterExpression: '#timestampAttribute > :limit',
    ExpressionAttributeNames: {
      '#timestampAttribute': 'TIMESTAMP'
    },
    ExpressionAttributeValues: {
      ':limit': new Date().getTime() - range
    }
  }

  const result = await dynamo.send(new ScanCommand(expression))

  // Group devices by identifier
  const devices = result.Items.reduce(
    (groups, item) => ({
      ...groups,
      [item.DEVICE]: [...(groups[item.DEVICE] || []), item.TIMESTAMP]
    }),
    {}
  )

  // Find the largest timestamp for each device
  const timestamps = Object.fromEntries(
    Object.entries(devices).map(([device, timestamps]) => [
      device,
      Math.max(...timestamps)
    ])
  )

  // For each device update its last transmission time
  let promises = Object.entries(timestamps).map(item => {
    const expression = {
      TableName: 'GreenhouseMonitor-Devices',
      Key: {
        DEVICE: item[0]
      },
      UpdateExpression: 'set LAST_TRANSMISSION = :timestamp',
      ExpressionAttributeValues: {
        ':timestamp': item[1]
      }
    }

    return dynamo.send(new UpdateCommand(expression)).catch(error => {
      console.log(`Error Updating Timestamp for Device ${item[0]} - ${error}`)
    })
  })

  return Promise.all(promises)
}

module.exports = timestampDevices
