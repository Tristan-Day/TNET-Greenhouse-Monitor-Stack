const middleware = require('aws-serverless-express')
const app = require('./app')

/**
 * @type {import('http').Server}
 */
const server = middleware.createServer(app)

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = (event, context) => {
  console.log(`EVENT: ${JSON.stringify(event)}`)
  return middleware.proxy(server, event, context, 'PROMISE').promise
}
