import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axiosConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  async function login(username, password) {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { username, password })
      localStorage.setItem('token', data.token)
      const loggedInUser = {
        id: data.id,
        username: data.username,
        email: data.email,
        roles: data.roles,
      }
      setUser(loggedInUser)
      return true
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  async function register(payload) {
    setLoading(true)
    setError(null)
    try {
      await api.post('/auth/register', payload)
      return true
    } catch (err) {
      const data = err.response?.data
      setError(typeof data === 'object' ? (data.message || Object.values(data)[0]) : 'Registration failed')
      return false
    } finally {
      setLoading(false)
    }
  }

  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const isAdmin = !!user?.roles?.includes('ROLE_ADMIN')

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
