import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register, loading, error } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', fullName: '', password: '' })
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const ok = await register(form)
    if (ok) {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 1200)
    }
  }

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Registered! Redirecting to login...</div>}
        <label>Full Name</label>
        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
        <label>Username</label>
        <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </form>
    </div>
  )
}
