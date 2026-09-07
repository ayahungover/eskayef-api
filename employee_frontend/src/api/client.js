import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000',
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('employee_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('employee_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export function login(username, password) {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  return client.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
}

export const getRequisitions = (params) => client.get('/requisitions', { params })
export const getItems = (params) => client.get('/items', { params })
export const getPurchaseOrder = (pono) => client.get('/bme/purchase-order', { params: { pono } })
export const getVendorBids = (params) => client.get('/vendor-bids', { params })
export const getLcItems = (params) => client.get('/commercial/lc-items', { params })

export default client
