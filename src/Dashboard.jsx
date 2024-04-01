import { useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'

import { WindowContext } from './Navigation'

function Dashboard() {
  const windowContext = useContext(WindowContext)
  const { device } = useParams()

  useEffect(() => {
    windowContext.setWindow({ title: `Greenhouse Monitor` })
  }, [])

  return (
    <h1>Data for Device - {device}</h1>
  )
}

export default Dashboard
