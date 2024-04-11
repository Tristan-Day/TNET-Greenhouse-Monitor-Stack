import { Typography, Backdrop, CircularProgress } from '@mui/material'

import { Flex } from './component'
import { MonitoringIcon } from './component/icon/MonitoringIcon'

export default function Loading() 
{
  const isMobileView = /iPhone|iPod|Android/i.test(navigator.userAgent)
  const headerSize = isMobileView ? 'h5' : 'h3'

  return (
    <Backdrop open sx={{ zIndex: 9999 }}>
      <Flex
        direction="column"
        grow={1}
        sx={{ alignItems: 'center', justifyContent: 'center', gap: '4rem' }}
      >
        <Flex
          direction="column"
          sx={{ alignItems: 'center', justifyContent: 'center', gap: '2rem' }}
        >
          <MonitoringIcon size={120} />
          <Typography textAlign="center" variant={headerSize}>
            Loading Monitoring Data
          </Typography>
        </Flex>
        <CircularProgress />
      </Flex>
    </Backdrop>
  )
}
