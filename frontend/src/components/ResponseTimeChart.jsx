import React, { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './ResponseTimeChart.css'

function ResponseTimeChart({ data }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    // Agrupar por tipo de test y calcular promedio de tiempo
    const timeData = {}
    
    data.forEach(item => {
      const testType = item.test_type
      if (!timeData[testType]) {
        timeData[testType] = {
          test_type: testType,
          total_time: 0,
          count: 0,
          max_time: 0,
          min_time: Infinity
        }
      }
      
      const tiempo = item.tiempo_segundos || 0
      timeData[testType].total_time += tiempo
      timeData[testType].count += 1
      timeData[testType].max_time = Math.max(timeData[testType].max_time, tiempo)
      timeData[testType].min_time = Math.min(timeData[testType].min_time, tiempo)
    })

    // Calcular promedios y formatear
    return Object.values(timeData).map(item => ({
      test_type: item.test_type,
      promedio: item.count > 0 ? parseFloat((item.total_time / item.count).toFixed(2)) : 0,
      maximo: parseFloat(item.max_time.toFixed(2)),
      minimo: item.min_time === Infinity ? 0 : parseFloat(item.min_time.toFixed(2))
    }))
  }, [data])

  if (chartData.length === 0) {
    return <div className="no-data">No hay datos de tiempo de respuesta disponibles</div>
  }

  return (
    <div className="response-time-chart">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="test_type" 
            label={{ value: 'Tipo de Test', position: 'insideBottom', offset: -5 }}
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <YAxis 
            label={{ value: 'Tiempo (segundos)', angle: -90, position: 'insideLeft' }}
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(30, 30, 30, 0.95)', 
              border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '8px',
              color: '#FFFFFF'
            }}
            formatter={(value, name) => {
              if (name === 'promedio') return [`${value}s`, 'Promedio']
              if (name === 'maximo') return [`${value}s`, 'Máximo']
              if (name === 'minimo') return [`${value}s`, 'Mínimo']
              return value
            }}
          />
          <Legend 
            wrapperStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
            formatter={(value) => {
              if (value === 'promedio') return 'Promedio'
              if (value === 'maximo') return 'Máximo'
              if (value === 'minimo') return 'Mínimo'
              return value
            }}
          />
          <Bar dataKey="promedio" fill="#FF6B00" name="promedio" />
          <Bar dataKey="maximo" fill="#ff8c42" name="maximo" />
          <Bar dataKey="minimo" fill="#10b981" name="minimo" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default ResponseTimeChart

