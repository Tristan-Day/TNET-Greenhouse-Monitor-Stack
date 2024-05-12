import { Typography, Card } from '@mui/material'
import { Gauge, LineChart } from '@mui/x-charts'

import { Flex } from '.'

export function ValueCard({ name, units, value, colour })
{
  return (
    <Card className="ValueCard">
      <Flex sx={{ gap: '4px' }}>
        <Typography variant="h5">{value}</Typography>
        <Typography variant="overline">{units}</Typography>
      </Flex>
      <Typography variant="caption">{name}</Typography>
      {colour && (
        <div
          style={{ width: 40, height: 5, borderRadius: 2, backgroundColor: colour }}
        />
      )}
    </Card>
  )
}

export function GaugeCard({ name, value, min, max })
{
  return (
    <Card className="GaugeCard">
      <Gauge
        width={110} height={60} startAngle={-90} endAngle={90}
        valueMin={min || 1000} valueMax={max || 4000} value={value}
      />
      <Typography variant="caption">{name}</Typography>
    </Card>
  )
}

export function ChartCard({ dataset, series, legend })
{
  const props = legend
    ? {
        legend: {
          padding: { top: -10 },
          itemGap: 20,
          markGap: 10
        }
      }
    : {
        legend: {
          hidden: true
        }
      }

  return (
    <LineChart
      slotProps={props}
      sx={{ paddingTop: legend ? '0.6rem' : 0 }}
      xAxis={[
        {
          dataKey: 'timestamp',
          valueFormatter: value => {
            const date = new Date(value)
            return `${date.getHours()}:${String(date.getMinutes()).padStart(
              2, '0'
            )}`
          }
        }
      ]}
      series={series} dataset={dataset}
      margin={{ bottom: 30, top: legend ? 42 : 20 }}
      skipAnimation
    />
  )
}
