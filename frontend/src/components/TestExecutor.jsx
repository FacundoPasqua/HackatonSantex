import React, { useState, useEffect } from 'react'
import { getTestBases, runTest, getTestStatus, getRunningTests, cancelTest } from '../services/api'
import './TestExecutor.css'

function TestExecutor() {
  const [bases, setBases] = useState([])
  const [loading, setLoading] = useState(true)
  const [runningTests, setRunningTests] = useState({}) // { test_type: { test_id, status, progress } }
  const [anyTestRunning, setAnyTestRunning] = useState(false)
  const [selectedEnvironment, setSelectedEnvironment] = useState('preprod') // 'test', 'dev', 'preprod'
  
  const environments = {
    test: { name: 'TEST', url: 'https://test.rentascordoba.gob.ar/bot-web' },
    dev: { name: 'DEV', url: 'https://desa.rentascordoba.gob.ar/bot-web' },
    preprod: { name: 'PreProd', url: 'https://preprod.rentascordoba.gob.ar/bot-web' }
  }

  useEffect(() => {
    loadBases()
    loadRunningTests()
  }, [])

  useEffect(() => {
    // Polling para actualizar estado de tests en ejecución
    const interval = setInterval(() => {
      Object.keys(runningTests).forEach(testType => {
        const testInfo = runningTests[testType]
        if (testInfo && testInfo.test_id && (testInfo.status === 'queued' || testInfo.status === 'running')) {
          updateTestStatus(testType, testInfo.test_id)
        }
      })
    }, 3000) // Actualizar cada 3 segundos

    return () => clearInterval(interval)
  }, [runningTests])

  const loadBases = async () => {
    try {
      setLoading(true)
      const response = await getTestBases()
      setBases(response.bases || [])
    } catch (err) {
      console.error('Error loading bases:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadRunningTests = async () => {
    try {
      const response = await getRunningTests()
      const running = response.running_tests || []
      
      if (running.length > 0) {
        setAnyTestRunning(true)
        // Cargar el estado de cada test corriendo
        for (const testId of running) {
          const status = await getTestStatus(testId)
          if (status) {
            const testType = status.test_type
            setRunningTests(prev => ({
              ...prev,
              [testType]: {
                ...status,
                progress: calculateProgress(status)
              }
            }))
          }
        }
      } else {
        setAnyTestRunning(false)
      }
    } catch (err) {
      console.error('Error loading running tests:', err)
    }
  }

  const handleRunTest = async (testType, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Verificar si hay algún test corriendo
    if (anyTestRunning) {
      alert('Ya hay un test en ejecución. Por favor espera a que termine antes de iniciar otro.')
      return
    }
    
    try {
      const result = await runTest(testType, selectedEnvironment)
      setAnyTestRunning(true)
      setRunningTests(prev => ({
        ...prev,
        [testType]: {
          test_id: result.test_id,
          status: result.status,
          started_at: result.started_at || new Date().toISOString(),
          progress: 0,
        }
      }))
    } catch (err) {
      console.error('Error running test:', err)
      alert(`Error al ejecutar test: ${err.message || 'Error desconocido'}`)
    }
  }

  const handleCancelTest = async (testType, testId, e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('¿Estás seguro de que quieres cancelar esta ejecución?')) {
      return
    }
    
    try {
      await cancelTest(testId)
      // Actualizar estado local
      setRunningTests(prev => ({
        ...prev,
        [testType]: {
          ...prev[testType],
          status: 'cancelled'
        }
      }))
      setAnyTestRunning(false)
      alert('Test cancelado exitosamente')
    } catch (err) {
      console.error('Error canceling test:', err)
      alert(`Error al cancelar test: ${err.message || 'Error desconocido'}`)
    }
  }

  const updateTestStatus = async (testType, testId) => {
    try {
      const status = await getTestStatus(testId)
      if (status) {
        setRunningTests(prev => ({
          ...prev,
          [testType]: {
            ...prev[testType],
            ...status,
            progress: calculateProgress(status),
          }
        }))

        // Si el test terminó, actualizar estado
        if (status.status === 'completed' || status.status === 'failed' || status.status === 'error' || status.status === 'timeout' || status.status === 'cancelled') {
          console.log(`Test ${testId} terminó con estado: ${status.status}`)
          // Verificar si hay otros tests corriendo
          const response = await getRunningTests()
          if (response.running_tests.length === 0) {
            setAnyTestRunning(false)
          }
        }
      }
    } catch (err) {
      console.error('Error updating test status:', err)
    }
  }

  const calculateProgress = (status) => {
    // Calcular progreso basado en logs o tiempo transcurrido
    if (!status) {
      return 0
    }
    
    // Si está en cola, mostrar 0%
    if (status.status === 'queued') {
      return 0
    }
    
    // Si está completado, falló, o cancelado, mostrar 100% o 0%
    if (status.status === 'completed') {
      return 100
    }
    if (status.status === 'failed' || status.status === 'error' || status.status === 'timeout' || status.status === 'cancelled') {
      return 0
    }
    
    // Si está corriendo, calcular basado en tiempo
    if (!status.started_at) {
      return 0
    }
    
    try {
      const started = new Date(status.started_at)
      const now = new Date()
      
      // Verificar que las fechas sean válidas
      if (isNaN(started.getTime()) || isNaN(now.getTime())) {
        console.warn('Fechas inválidas en calculateProgress:', { started_at: status.started_at, now })
        return 0
      }
      
      const elapsed = (now - started) / 1000 / 60 // minutos
      
      // Si el tiempo transcurrido es negativo, retornar 0
      if (elapsed < 0) {
        console.warn('Tiempo transcurrido negativo:', elapsed)
        return 0
      }
      
      // Progreso estimado basado en tiempo (máximo 95% hasta que termine)
      const base = bases.find(b => b.id === status.test_type)
      if (base && base.estimated_time_minutes) {
        const estimated = base.estimated_time_minutes
        // Calcular progreso: (tiempo transcurrido / tiempo estimado) * 100
        const progress = Math.min(95, (elapsed / estimated) * 100)
        const rounded = Math.max(0, Math.round(progress)) // Asegurar que no sea negativo
        console.log(`Progreso calculado: ${rounded}% (${elapsed.toFixed(2)} min / ${estimated} min)`)
        return rounded
      }
      
      // Si no hay base o tiempo estimado, usar progreso mínimo basado en tiempo
      // Asumir 20 minutos por defecto
      const defaultEstimated = 20
      const progress = Math.min(95, (elapsed / defaultEstimated) * 100)
      return Math.max(0, Math.round(progress))
    } catch (err) {
      console.error('Error calculando progreso:', err, status)
      return 0
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued': return '⏳'
      case 'running': return '🔄'
      case 'completed': return '✅'
      case 'failed': return '❌'
      case 'error': return '⚠️'
      case 'timeout': return '⏱️'
      case 'cancelled': return '🚫'
      default: return '⚪'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'queued': return 'En cola'
      case 'running': return 'Ejecutando'
      case 'completed': return 'Completado'
      case 'failed': return 'Falló'
      case 'error': return 'Error'
      case 'timeout': return 'Timeout'
      case 'cancelled': return 'Cancelado'
      default: return 'Desconocido'
    }
  }

  if (loading) {
    return (
      <section className="dashboard-section test-executor">
        <h2>🧪 Ejecutar Tests</h2>
        <div className="loading">Cargando bases disponibles...</div>
      </section>
    )
  }

  return (
    <section className="dashboard-section test-executor">
      <h2>🧪 Ejecutar Tests</h2>
      <p className="test-executor-description">
        Selecciona una base de datos y ejecuta las pruebas. Los resultados se guardarán automáticamente.
      </p>

      <div className="environment-selector">
        <label htmlFor="environment-select" className="environment-label">
          🌐 Ambiente:
        </label>
        <select
          id="environment-select"
          value={selectedEnvironment}
          onChange={(e) => setSelectedEnvironment(e.target.value)}
          disabled={anyTestRunning}
          className="environment-select"
        >
          {Object.entries(environments).map(([key, env]) => (
            <option key={key} value={key}>
              {env.name}
            </option>
          ))}
        </select>
        {environments[selectedEnvironment] && (
          <span className="environment-url">
            {environments[selectedEnvironment].url}
          </span>
        )}
      </div>

      <div className="test-bases-grid">
        {bases.map(base => {
          const testInfo = runningTests[base.id]
          const isRunning = testInfo && (testInfo.status === 'queued' || testInfo.status === 'running')
          
          return (
            <div key={base.id} className="test-base-card">
              <div className="test-base-header">
                <h3>{base.name}</h3>
                {base.questions_count && (
                  <span className="questions-count">{base.questions_count} preguntas</span>
                )}
              </div>

              <div className="test-base-info">
                <div className="info-item">
                  <span className="info-label">⏱️ Tiempo estimado:</span>
                  <span className="info-value">{base.estimated_time_minutes} minutos</span>
                </div>
                {base.questions_count && (
                  <div className="info-item">
                    <span className="info-label">📊 Preguntas:</span>
                    <span className="info-value">{base.questions_count}</span>
                  </div>
                )}
              </div>

              {isRunning && testInfo && (
                <div className="test-progress">
                  <div className="progress-header">
                    <span>{getStatusIcon(testInfo.status)} {getStatusText(testInfo.status)}</span>
                    <span className="progress-percent">{testInfo.progress || 0}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${testInfo.progress || 0}%` }}
                    />
                  </div>
                  {testInfo.status === 'running' && (
                    <div className="progress-note">
                      Ejecutando pruebas... Demora estimada: {base.estimated_time_minutes} minutos
                    </div>
                  )}
                </div>
              )}

              <div className="test-actions">
                {isRunning && testInfo && testInfo.status === 'running' && (
                  <button
                    onClick={(e) => handleCancelTest(base.id, testInfo.test_id, e)}
                    className="cancel-test-button"
                    type="button"
                    title="Cancelar ejecución"
                  >
                    ⛔ Cancelar
                  </button>
                )}
                <button
                  onClick={(e) => handleRunTest(base.id, e)}
                  disabled={isRunning || anyTestRunning}
                  className={`run-test-button ${isRunning ? 'running' : ''} ${anyTestRunning && !isRunning ? 'disabled' : ''}`}
                  type="button"
                  title={anyTestRunning && !isRunning ? 'Hay otro test en ejecución' : ''}
                >
                  {isRunning ? (
                    <>
                      {getStatusIcon(testInfo.status)} {getStatusText(testInfo.status)}
                    </>
                  ) : (
                    <>
                      ▶️ Ejecutar Tests
                    </>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default TestExecutor

