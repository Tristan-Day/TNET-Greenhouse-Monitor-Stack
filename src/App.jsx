import { Amplify } from 'aws-amplify'
import { Authenticator, withAuthenticator, Button } from '@aws-amplify/ui-react'

import { getData } from './logic/Data'

import awsExports from './aws-exports'
Amplify.configure(awsExports)

const DEVICE = '0bcc878f-61a3-4a15-8d57-b199c4ea3bc5'

function App() {
  return (
    <Authenticator>
      <div className="App">
        <h1>Greenhouse Monitor</h1>
        <Button
          onClick={async () => {
            getData(DEVICE)
              .then(result => {
                console.log(result)
              })
              .catch(error => {
                console.log(error)
              })
          }}
        >
          Get Data
        </Button>
      </div>
    </Authenticator>
  )
}

export default withAuthenticator(App)
