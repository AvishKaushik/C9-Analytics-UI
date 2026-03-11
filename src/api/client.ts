import axios from 'axios'

// const INSIGHTS_API = 'https://c9-assistant-api.onrender.com/api/v1'
const INSIGHTS_API = 'http://localhost:8000/api/v1'

export const insightsApi = axios.create({ baseURL: INSIGHTS_API })

// Log requests
insightsApi.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data || config.params)
    return config
  }
)

// Log responses
insightsApi.interceptors.response.use(
  (res) => {
    console.log(`[API Response] ${res.config.url}`, res.data)
    return res
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)
