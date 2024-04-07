import React from 'react'
import ReactDOM from 'react-dom/client'

import { Amplify } from 'aws-amplify'
import '@aws-amplify/ui-react/styles.css'
import { Authenticator } from '@aws-amplify/ui-react'

import './App.css'
import App from './App'

import awsExports from './aws-exports'
Amplify.configure(awsExports)

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <Authenticator>
      <App />
    </Authenticator>
  </React.StrictMode>
)
