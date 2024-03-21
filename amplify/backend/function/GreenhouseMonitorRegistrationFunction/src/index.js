/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)

exports.handler = async event => {
  // #swagger.description = 'Inserts a new user record into the database upon registration'

  const expression = {
    TableName: 'GreenhouseMonitor-Users',
    Item: {
      "UUID" : event.userName,
      "EMAIL" : event.request.userAttributes.email
    }
  }

  await dynamo.send(new PutCommand(expression))
  return event
}
