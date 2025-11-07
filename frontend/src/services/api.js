import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

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

export default api

