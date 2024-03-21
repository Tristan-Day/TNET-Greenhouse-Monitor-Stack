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
const { DynamoDBDocumentClient, QueryCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)

// Units in Millisecconds
const CHRONOS_DAY = 1000 * 60 * 60 * 24

app.get('/data/:device', function (req, res) {
  // #swagger.description = 'Retreives data for a specified device within a given range'

  /* #swagger.parameters['range'] = {
        in: 'body',                            
        description: 'Range in milliseconds (eg. 60000 for 1 Minute)',
        required: false                   
  } */

  // Set the default range
  let range = CHRONOS_DAY
  if (req.query.range) {
    range = req.query.range
  }

  const expression = {
    TableName: 'GreenhouseMonitor-Data',
    KeyConditionExpression:
      '#deviceAttribute = :deviceName AND #timestampAttribute BETWEEN :start AND :end',
    ExpressionAttributeNames: {
      '#timestampAttribute': 'TIMESTAMP',
      '#deviceAttribute': 'DEVICE'
    },
    ExpressionAttributeValues: {
      ':deviceName': req.params.device,
      ':start': new Date().getTime() - range,
      ':end': new Date().getTime()
    }
  }

  dynamo
    .send(new QueryCommand(expression))
    .then(result => {
      if (result.Count === 0) {
        res.status(404).json(new Error('No items found'))
        return
      }

      result.Items.sort((a, b) => {
        // Since the timestamps will never be equal we only perform a single check
        if (parseInt(a.TIMESTAMP) > parseInt(b.TIMESTAMP)) {
          return 1
        }
        return -1
      })

      res.status(200).json(result)
    })
    .catch(() => {
      res.status(500)
    })
})

app.listen(3000, function () {
  console.log('App started')
})

module.exports = app
