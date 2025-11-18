import React, { useState, useEffect } from 'react'
import Filters from './Filters'
import Metrics from './Metrics'
import StatisticsChart from './StatisticsChart'
import ResultsTable from './ResultsTable'
import TrendsChart from './TrendsChart'
import ResponseTimeChart from './ResponseTimeChart'
import TestExecutor from './TestExecutor'
import { getSummary, getStatistics, getResults, getRecentResults } from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const [filters, setFilters] = useState({
    test_type: '',
    environment: '',
    resultado_final: '',
  })
  const [summary, setSummary] = useState(null)
  const [statistics, setStatistics] = useState([])
  const [results, setResults] = useState([])
  const [recentResults, setRecentResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    page: 0,
  })

  useEffect(() => {
    loadData()
  }, [filters, pagination.page, pagination.limit])

  useEffect(() => {
    loadRecentResults()
  }, [])

  // Actualización automática cada 4 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      loadData()
      loadRecentResults()
    }, 240000) // Actualizar cada 4 minutos (240000ms)

    return () => clearInterval(interval)
  }, [filters, pagination.page, pagination.limit])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const params = {
        ...filters,
        limit: pagination.limit,
        offset: pagination.page * pagination.limit,
      }
      
      // Remover filtros vacíos
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key]
        }
      })

      const [summaryData, statisticsData, resultsData] = await Promise.all([
        getSummary(filters),
        getStatistics(filters),
        getResults(params),
      ])

      setSummary(summaryData)
      setStatistics(statisticsData)
      setResults(resultsData)
    } catch (err) {
      setError(err.message || 'Error al cargar los datos')
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRecentResults = async () => {
    try {
      const data = await getRecentResults(24)
      setRecentResults(data)
    } catch (err) {
      console.error('Error loading recent results:', err)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    setPagination({ ...pagination, page: 0 })
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  const handleLimitChange = (newLimit) => {
    setPagination({ ...pagination, limit: newLimit, page: 0 })
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard de Resultados de Tests</h1>
      </header>

      <div className="dashboard-content">
        <aside className="dashboard-sidebar">
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            pagination={pagination}
            onLimitChange={handleLimitChange}
          />
        </aside>

        <main className="dashboard-main">
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {loading && !summary ? (
            <div className="loading">Cargando...</div>
          ) : (
            <>
              <TestExecutor />
              
              <Metrics summary={summary} loading={loading} />
              
              <section className="dashboard-section">
                <h2>📈 Estadísticas por Tipo y Entorno</h2>
                <StatisticsChart data={statistics} />
              </section>

              <section className="dashboard-section">
                <h2>📋 Resultados Detallados</h2>
                <ResultsTable
                  results={results}
                  loading={loading}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </section>

              <section className="dashboard-section">
                <h2>⏱️ Tiempos de Respuesta</h2>
                <ResponseTimeChart data={results} />
              </section>

              <section className="dashboard-section">
                <h2>📉 Tendencia (Últimas 24 horas)</h2>
                <TrendsChart data={recentResults} />
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default Dashboard

