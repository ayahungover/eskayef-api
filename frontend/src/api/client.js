import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000'

const client = axios.create({ baseURL: API_BASE })

client.interceptors.request.use(config => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

client.interceptors.response.use(
    res => res,
    err => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(err)
    }
)

export default client

// Auth
export const login = (username, password) => {
    const form = new URLSearchParams()
    form.append('username', username)
    form.append('password', password)
    return client.post('/auth/login', form, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
}

// Users
export const getUsers = () => client.get('/admin/users')
export const createUser = (data) => client.post('/admin/users', data)
export const updateUser = (id, data) => client.patch(`/admin/users/${id}`, data)
export const deleteUser = (id) => client.delete(`/admin/users/${id}`)

// Groups
export const getGroups = () => client.get('/admin/groups')
export const createGroup = (data) => client.post('/admin/groups', data)
export const updateGroup = (id, data) => client.patch(`/admin/groups/${id}`, data)
export const deleteGroup = (id) => client.delete(`/admin/groups/${id}`)
export const addUserToGroup = (groupId, userId) => client.post(`/admin/groups/${groupId}/users`, { user_id: userId })
export const removeUserFromGroup = (groupId, userId) => client.delete(`/admin/groups/${groupId}/users/${userId}`)
export const getGroupPermissions = (groupId) => client.get(`/admin/groups/${groupId}/permissions`)
export const addPermission = (groupId, data) => client.post(`/admin/groups/${groupId}/permissions`, data)
export const deletePermission = (id) => client.delete(`/admin/permissions/${id}`)
export const getEndpoints = () => client.get('/admin/endpoints')