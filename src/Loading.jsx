import {
  Typography,
  Backdrop,
  CircularProgress,
} from '@mui/material'

import { Flex } from './component'
import { MonitoringIcon } from './component/icon/MonitoringIcon'

export default function Loading() {
  return (
    <Backdrop open sx={{zIndex: 9999}}>
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
          <Typography variant="h3">Loading Monitoring Data</Typography>
        </Flex>
        <CircularProgress />
      </Flex>
    </Backdrop>
  )
}
