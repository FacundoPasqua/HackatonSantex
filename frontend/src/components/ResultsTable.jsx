import React, { useState } from 'react'
import './ResultsTable.css'

function ResultsTable({ results, loading, pagination, onPageChange }) {
  const [showAllColumns, setShowAllColumns] = useState(false)
  const [expandedRespuestas, setExpandedRespuestas] = useState(new Set())

  if (loading) {
    return <div className="loading">Cargando resultados...</div>
  }

  if (!results || results.length === 0) {
    return <div className="no-data">No hay resultados con los filtros seleccionados</div>
  }

  const displayColumns = showAllColumns
    ? Object.keys(results[0]).filter(col => col !== 'test_type' && col !== 'timestamp')
    : ['test_id', 'categoria', 'pregunta', 'respuesta_bot', 'resultado_final', 'tiempo_segundos']

  const formatResultado = (resultado) => {
    return resultado === 'PASS' ? `✅ ${resultado}` : `❌ ${resultado}`
  }

  const formatRespuestaBot = (respuesta, resultId, isExpanded) => {
    if (!respuesta) return '-'
    // Si está expandida, mostrar toda la respuesta
    if (isExpanded) {
      return respuesta
    }
    // Truncar respuestas muy largas para mejor visualización
    const maxLength = 150
    if (respuesta.length > maxLength) {
      return respuesta.substring(0, maxLength) + '...'
    }
    return respuesta
  }

  const toggleRespuesta = (resultId) => {
    const newExpanded = new Set(expandedRespuestas)
    if (newExpanded.has(resultId)) {
      newExpanded.delete(resultId)
    } else {
      newExpanded.add(resultId)
    }
    setExpandedRespuestas(newExpanded)
  }

  const totalPages = Math.ceil(results.length / pagination.limit)

  return (
    <div className="results-table-container">
      <div className="table-controls">
        <label>
          <input
            type="checkbox"
            checked={showAllColumns}
            onChange={(e) => setShowAllColumns(e.target.checked)}
          />
          Mostrar todas las columnas
        </label>
      </div>

      <div className="table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              {displayColumns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((result, idx) => {
              const resultId = result.id || idx
              const isExpanded = expandedRespuestas.has(resultId)
              const respuesta = result.respuesta_bot
              const needsExpansion = respuesta && respuesta.length > 150
              
              return (
                <React.Fragment key={resultId}>
                  <tr>
                    {displayColumns.map((col) => {
                      let cellContent
                      if (col === 'resultado_final') {
                        cellContent = formatResultado(result[col])
                      } else if (col === 'tiempo_segundos') {
                        cellContent = `${result[col]}s`
                      } else if (col === 'respuesta_bot') {
                        cellContent = (
                          <div className="respuesta-bot-container">
                            <span className={needsExpansion ? 'respuesta-bot-text' : ''}>
                              {formatRespuestaBot(result[col], resultId, isExpanded)}
                            </span>
                            {needsExpansion && (
                              <button
                                className="respuesta-bot-toggle"
                                onClick={() => toggleRespuesta(resultId)}
                                title={isExpanded ? 'Colapsar' : 'Expandir'}
                              >
                                {isExpanded ? '−' : '+'}
                              </button>
                            )}
                          </div>
                        )
                      } else {
                        cellContent = result[col]
                      }
                      
                      return (
                        <td key={col} className={col === 'respuesta_bot' ? 'respuesta-bot-cell' : ''}>
                          {cellContent}
                        </td>
                      )
                    })}
                  </tr>
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 0}
        >
          Anterior
        </button>
        <span>
          Página {pagination.page + 1}
        </span>
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={results.length < pagination.limit}
        >
          Siguiente
        </button>
      </div>
    </div>
  )
}

export default ResultsTable

