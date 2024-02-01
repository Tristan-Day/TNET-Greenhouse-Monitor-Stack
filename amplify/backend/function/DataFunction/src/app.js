/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/

const express = require('express')

// Declare a new express app
const app = express()
app.use(require('body-parser').json())
app.use(require('aws-serverless-express/middleware').eventContext())

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient, ScanCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)

// Units in Millisecconds
const CHRONOS_MIN = 60000
const CHRONOS_HOUR = CHRONOS_MIN * 60
const CHRONOS_DAY = CHRONOS_HOUR * 24

app.get('/data/:device', function (req, res) {
  // #swagger.description = 'Retreives data for a specified device within a given range'

  /* #swagger.parameters['range'] = {
        in: 'body',                            
        description: 'Range in milliseconds (eg. 60000 for 1 Minute)',
        required: false                   
  } */

  // Set the default range
  const range = CHRONOS_DAY
  if (req.query.range) {
    range = req.query.range
  }

  const filterExpression = {
    FilterExpression:
      '#deviceAttribute = :device AND #timeAttribute BETWEEN :start AND :end ',
    ExpressionAttributeNames: {
      '#timeAttribute': 'TIMESTAMP',
      '#deviceAttribute': 'DEVICE',
      '#dataAttribute': 'DATA'
    },
    ExpressionAttributeValues: {
      ':device': req.params.device,
      ':start': new Date().getTime() - range,
      ':end': new Date().getTime()
    },
    ProjectionExpression: '#timeAttribute, #dataAttribute'
  }

  dynamo
    .send(
      new ScanCommand({ TableName: 'GreenhouseData-dev', ...filterExpression })
    )
    .then(result => {
      console.log('Scan complete')
      res.status(200).json(result)
    })
    .catch(error => {
      console.log(error)
      res.status(500).json(error)
    })
})

app.listen(3000, function () {
  console.log('App started')
})

module.exports = app
