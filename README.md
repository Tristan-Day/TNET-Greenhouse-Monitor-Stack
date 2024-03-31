# TNET - Greenhouse Monitoring Services

TNET - Greenhouse Monitoring Services provides gardeners to manage the conditions in their greenhouse on their smartphone, tablet or computer. Providing a dashboard for viewing current and historical temperature, humidity, pressure and soil moisture data.

This version of the application is designed for AWS Amplify, with Lambda, DynamoDB and API Gateway suporting operations. Currently, the master branch is configured with continuous deployment and integration.

## Licence

Copright Tristan Day (2024)

This project is Licenced Under the GNU General Public Licence. For more information please see `LICENCE.txt`

## Features

* Manage your Monitoring Devices
* View Current Greenhouse Conditions
* View Historical Analytics Data

## Code Formatting

This project was formatted using [Prettier - The Opinionated Code Formatter](https://github.com/prettier/prettier)

*Please see the included `.prettierrc` file for more information*

## Deploying the Application on the Cloud

To deploy this application, you will require the following:

* Node Package Manager v10.2.4 or later
* Amplify Node Package v12.8.2 or later
* An Amazon Web Services IAM role with appropriate Amplify Access Permissions

To deploy the application 

1. Use `amplify configure` to setup your AWS profile configuration
2. Use `amplify publish` to push the stack defined in the repository to your AWS account.


## Running the Application Locally

In the project directory, you can run:

`npm start`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

To run the application locally, you must first install project dependencies with

`npm install`

Then run the application using

`npm start`

This will run the application in the development mode.\