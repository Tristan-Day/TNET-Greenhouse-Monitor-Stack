const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')

const {
  DynamoDBDocumentClient,
  ScanCommand,
  DeleteCommand
} = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)

// Units in Millisecconds
const CHRONOS_DAY = 1000 * 60 * 60 * 24
const EXPIRY = CHRONOS_DAY * 7

async function pruneRecords() {
  // #swagger.description = 'Removes records that exceed the specified timeframe'

  const expression = {
    TableName: 'GreenhouseMonitor-Data',
    FilterExpression: '#timestampAttribute < :limit',
    ExpressionAttributeNames: {
      '#timestampAttribute': 'TIMESTAMP'
    },
    ExpressionAttributeValues: {
      ':limit': new Date().getTime() - EXPIRY
    }
  }

  const result = await dynamo.send(new ScanCommand(expression))

  let promises = result.Items.map(item => {
    const expression = {
      TableName: 'GreenhouseMonitor-Data',
      Key: {
        DEVICE: item.DEVICE,
        TIMESTAMP: item.TIMESTAMP
      }
    }

    return dynamo.send(new DeleteCommand(expression)).catch(error => {
      console.log(
        `Error Deleting: ${item.DEVICE} at ${item.TIMESTAMP} - ${error}`
      )
    })
  })

  return Promise.all(promises)
}

module.exports = pruneRecords
