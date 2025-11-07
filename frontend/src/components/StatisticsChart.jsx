import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import './StatisticsChart.css'

function StatisticsChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="no-data">No hay estadísticas disponibles con los filtros seleccionados</div>
  }

  // Agrupar por tipo de test, sumando todos los entornos
  const chartData = {}
  
  data.forEach(item => {
    const testType = item.test_type
    if (!chartData[testType]) {
      chartData[testType] = {
        test_type: testType,
        PASS: 0,
        FAIL: 0,
      }
    }
    // Sumar los valores, no reemplazarlos
    if (item.resultado_final === 'PASS') {
      chartData[testType].PASS += item.count
    } else if (item.resultado_final === 'FAIL') {
      chartData[testType].FAIL += item.count
    }
  })

  const chartDataArray = Object.values(chartData)

  return (
    <div className="statistics-chart">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartDataArray} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="test_type" 
            label={{ value: 'Tipo de Test', position: 'insideBottom', offset: -5 }}
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)' }}
          />
          <YAxis 
            label={{ value: 'Cantidad', angle: -90, position: 'insideLeft' }}
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
          />
          <Legend 
            wrapperStyle={{ color: 'rgba(255, 255, 255, 0.9)' }}
          />
          <Bar dataKey="PASS" fill="#10b981" name="PASS" />
          <Bar dataKey="FAIL" fill="#FF6B00" name="FAIL" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default StatisticsChart

