import { useState, useEffect, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { WindowContext } from './Navigation'

function Dashboard() {
 const windowContext = useContext(WindowContext)

  useEffect(() => {
    windowContext.setWindow({ title: 'Greenhouse Monitor' })
  }, [])
}

export default Dashboard
