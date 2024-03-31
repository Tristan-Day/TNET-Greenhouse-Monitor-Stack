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
app.use(function (req, res, next) 
{
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  next()
})

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb')
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb')
const { GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb')

const client = new DynamoDBClient({})
const dynamo = DynamoDBDocumentClient.from(client)

function getUserIdentifier(req)
{
  return (req.apiGateway.event.requestContext.identity.cognitoIdentityId || 'NOAUTH')
}

async function getUser(identifier)
{
  // Retreives data for a given user

  const command = new GetCommand(
      {TableName : 'GreenhouseMonitor-Users', Key : {UUID : identifier}})

  const result = await dynamo.send(command)

  if (result.Count === 0)
  {
    throw new Error('User Not Found')
  }

  return result.Item
}

app.get('/user/:identifier', async function(req, res) 
{
  // #swagger.description = 'Retreives data for a given user'

  /* #swagger.parameters['identifier'] = {
        in: 'path',
        description: 'Identifier issued by Cognito',
        required: true
  } */

  if (getUserIdentifier(req) !== req.params.identifier)
  {
    res.status(401)
    return
  }

  try
  {
    const user = await getUser(req.params.identifier)
    res.status(200).json(user)
  }
  catch
  {
    res.status(404).json({error : 'User not found'})
  }
})

app.put('/user/:identifier/devices', async function(req, res)
{
  // #swagger.description = 'Register a new device'

  /* #swagger.parameters['identifier'] = {
        in: 'path',
        description: 'Identifier issued by Cognito',
        required: true
  } */
  /* #swagger.parameters['identifier'] = {
        in: 'body',
        description: 'Device identifier',
        required: true
  } */
  /* #swagger.parameters['code'] = {
        in: 'body',
        description: 'Device activation code',
        required: true
  } */

  if (getUserIdentifier(req) !== req.params.identifier)
  {
    res.status(401)
    return
  }

  if (!req.body.identifier)
  {
    res.status(400).json({error : 'A device identifier is required'})
    return
  }

  if (!req.body.code)
  {
    res.status(400).json({error : 'A activation code is required'})
    return
  }

  try
  {
    const result = await dynamo.send(new GetCommand(
        {TableName : 'GreenhouseMonitor-Devices', Key : {DEVICE : req.body.identifier}}))

    if (result.Count === 0)
    {
      res.status(404).json({error : 'Invalid device identifier'})
      return
    }

    if (req.body.code === result.Item.code)
    {
      res.status(403).json({error : 'Invalid activation code'})
      return
    }
  }
  catch
  {
    res.status(500).json({error : 'Error executing device lookup'})
    return
  }

  let user

  try
  {
    user = await getUser(req.params.identifier)

    console.log(user)

    // Check if the device is already registered
    if (user.DEVICES && user.DEVICES.includes(req.body.identifier))
    {
      res.status(409).json({error : 'Device already registered'})
      return
    }

    // Create the attribute if it does not exist
    if (!user.DEVICES) 
    {
      user["DEVICES"] = []
    }

    // Add the new device
    user.DEVICES.push(req.body.identifier)
  }
  catch
  {
    res.status(500).json({error : 'Failed to retreive user details'})
    return
  }

  try 
  {
    const expression = 
    {
      TableName: 
        'GreenhouseMonitor-Users',
      UpdateExpression: 
        'set DEVICES = :devices',
      ExpressionAttributeValues: 
        {
          ':devices' : user.DEVICES
        },
      Key:
        {
          UUID: req.params.identifier
        }
    }

    await dynamo.send(new UpdateCommand(expression))
    res.status(200).json({success : 'Device sucessfully added'})
  }
  catch
  {
    res.status(500).json({error : 'Error executing update'})
  }
})

app.listen(3000, function() {
  console.log('App started')
})

module.exports = app
