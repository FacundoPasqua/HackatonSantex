import React from 'react'
import './Filters.css'

function Filters({ filters, onFilterChange, pagination, onLimitChange }) {
  const handleChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value,
    })
  }

  return (
    <div className="filters">
      <h3>🔍 Filtros</h3>
      
      <div className="filter-group">
        <label htmlFor="test_type">Tipo de Test</label>
        <select
          id="test_type"
          value={filters.test_type}
          onChange={(e) => handleChange('test_type', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="automotor">Automotor</option>
          <option value="inmobiliario">Inmobiliario</option>
          <option value="embarcaciones">Embarcaciones</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="environment">Entorno</label>
        <select
          id="environment"
          value={filters.environment}
          onChange={(e) => handleChange('environment', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="test">Test</option>
          <option value="preprod">Preprod</option>
          <option value="localhost">Localhost</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="resultado_final">Resultado</label>
        <select
          id="resultado_final"
          value={filters.resultado_final}
          onChange={(e) => handleChange('resultado_final', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="PASS">PASS</option>
          <option value="FAIL">FAIL</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="limit">Resultados por página</label>
        <input
          id="limit"
          type="number"
          min="10"
          max="100"
          step="10"
          value={pagination.limit}
          onChange={(e) => onLimitChange(parseInt(e.target.value))}
        />
      </div>
    </div>
  )
}

export default Filters

