import { Box } from '@mui/material'

export default function Flex({ children, direction, grow, sx, ...props }) 
{
  return (
    <Box sx={{ display: 'flex', flexDirection: direction, flexGrow: grow, ...sx }} {...props}>
      {children}
    </Box>
  )
}
