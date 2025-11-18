import axios from 'axios'

// Detectar si estamos en producción
const isProduction = import.meta.env.PROD || window.location.hostname !== 'localhost'

// Obtener la URL de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Advertir si estamos en producción sin la variable de entorno configurada
if (isProduction && !import.meta.env.VITE_API_URL) {
  console.error('⚠️ VITE_API_URL no está configurada. El frontend está intentando conectarse a localhost.')
  console.error('Por favor, configura la variable de entorno VITE_API_URL en Vercel:')
  console.error('Settings > Environment Variables > Add New')
  console.error('Name: VITE_API_URL')
  console.error('Value: https://tu-backend.railway.app')
}

// Log de la URL que se está usando (solo en desarrollo)
if (!isProduction) {
  console.log('🔗 API URL:', API_URL)
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const getSummary = async (params = {}) => {
  const response = await api.get('/api/summary', { params })
  return response.data
}

export const getStatistics = async (params = {}) => {
  const response = await api.get('/api/statistics', { params })
  return response.data
}

export const getResults = async (params = {}) => {
  const response = await api.get('/api/results', { params })
  return response.data
}

export const getRecentResults = async (hours = 24) => {
  const response = await api.get(`/api/results/recent/${hours}`)
  return response.data
}

export const getTestBases = async () => {
  const response = await api.get('/api/tests/bases')
  return response.data
}

export const runTest = async (testType) => {
  const response = await api.post('/api/tests/run', { test_type: testType })
  return response.data
}

export const getTestStatus = async (testId) => {
  const response = await api.get(`/api/tests/status/${testId}`)
  return response.data
}

export const getRunningTests = async () => {
  const response = await api.get('/api/tests/running')
  return response.data
}

export const cancelTest = async (testId) => {
  const response = await api.post(`/api/tests/cancel/${testId}`)
  return response.data
}

export default api

