import React from 'react'
import './Metrics.css'

function Metrics({ summary, loading }) {
  if (loading || !summary) {
    return (
      <div className="metrics">
        <div className="metric-card loading">Cargando...</div>
        <div className="metric-card loading">Cargando...</div>
        <div className="metric-card loading">Cargando...</div>
        <div className="metric-card loading">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="metrics">
      <div className="metric-card">
        <div className="metric-label">Total Tests</div>
        <div className="metric-value">{summary.total}</div>
      </div>
      
      <div className="metric-card success">
        <div className="metric-label">✅ PASS</div>
        <div className="metric-value">{summary.passed}</div>
        <div className="metric-delta">+{summary.success_rate}%</div>
      </div>
      
      <div className="metric-card error">
        <div className="metric-label">❌ FAIL</div>
        <div className="metric-value">{summary.failed}</div>
      </div>
      
      <div className="metric-card">
        <div className="metric-label">Tasa de Éxito</div>
        <div className="metric-value">{summary.success_rate}%</div>
      </div>
    </div>
  )
}

export default Metrics

