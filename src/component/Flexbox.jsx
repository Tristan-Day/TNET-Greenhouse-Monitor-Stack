import { Box } from '@mui/material'

export default function Flex({ children, direction, grow, sx }) 
{
  return (
    <Box sx={{ display: 'flex', flexDirection: direction, flexGrow: grow, ...sx}}>
      {children}
    </Box>
  )
}
