import React, { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import './TrendsChart.css'

function TrendsChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Agrupar por hora
    const hourlyData = {}
    
    data.forEach(item => {
      try {
        const date = new Date(item.timestamp)
        const hour = format(date, 'yyyy-MM-dd HH:00:00')
        
        if (!hourlyData[hour]) {
          hourlyData[hour] = {
            hour: format(date, 'HH:mm'),
            PASS: 0,
            FAIL: 0,
          }
        }
        
        hourlyData[hour][item.resultado_final] = (hourlyData[hour][item.resultado_final] || 0) + 1
      } catch (e) {
        console.error('Error processing timestamp:', item.timestamp, e)
      }
    })
    
    // Asegurar que los valores sean al menos 0.1 para la escala logarítmica
    Object.values(hourlyData).forEach(data => {
      if (data.PASS === 0) data.PASS = 0.1
      if (data.FAIL === 0) data.FAIL = 0.1
    })

    return Object.values(hourlyData).sort((a, b) => a.hour.localeCompare(b.hour))
  }, [data])

  if (chartData.length === 0) {
    return <div className="no-data">No se pudieron cargar las tendencias</div>
  }

  return (
    <div className="trends-chart">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="hour" 
            label={{ value: 'Hora', position: 'insideBottom', offset: -5 }}
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <YAxis 
            label={{ value: 'Cantidad de Tests', angle: -90, position: 'insideLeft' }}
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
            scale="log"
            domain={['auto', 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(30, 30, 30, 0.95)', 
              border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '8px',
              color: '#FFFFFF'
            }}
          />
          <Legend 
            wrapperStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
          />
          <Line 
            type="monotone" 
            dataKey="PASS" 
            stroke="#10b981" 
            strokeWidth={2}
            name="PASS"
            dot={{ r: 4, fill: '#10b981' }}
          />
          <Line 
            type="monotone" 
            dataKey="FAIL" 
            stroke="#FF6B00" 
            strokeWidth={2}
            name="FAIL"
            dot={{ r: 4, fill: '#FF6B00' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default TrendsChart

