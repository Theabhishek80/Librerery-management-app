import { useEffect, useState } from 'react'
import api from '../api/axiosConfig'

export default function AdminPanel() {
  const [tab, setTab] = useState('users')
  const [users, setUsers] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  async function loadUsers() {
    const { data } = await api.get('/users')
    setUsers(data)
  }
  async function loadRecords() {
    const { data } = await api.get('/borrow/all')
    setRecords(data)
  }

  useEffect(() => {
    setLoading(true)
    Promise.all([loadUsers(), loadRecords()]).finally(() => setLoading(false))
  }, [])

  async function toggleEnabled(u) {
    await api.patch(`/users/${u.id}/enabled`, null, { params: { enabled: !u.enabled } })
    loadUsers()
  }

  if (loading) return <div className="page"><p>Loading admin data...</p></div>

  return (
    <div className="page">
      <h1>Admin Panel</h1>
      <div className="tabs">
        <button className={tab === 'users' ? 'tab active' : 'tab'} onClick={() => setTab('users')}>Users ({users.length})</button>
        <button className={tab === 'records' ? 'tab active' : 'tab'} onClick={() => setTab('records')}>All Borrow Records ({records.length})</button>
      </div>

      {tab === 'users' && (
        <table className="table">
          <thead><tr><th>Username</th><th>Email</th><th>Full Name</th><th>Roles</th><th>Enabled</th><th></th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>{u.fullName}</td>
                <td>{u.roles.join(', ')}</td>
                <td>{u.enabled ? 'Yes' : 'No'}</td>
                <td><button className="btn btn-outline" onClick={() => toggleEnabled(u)}>{u.enabled ? 'Disable' : 'Enable'}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'records' && (
        <table className="table">
          <thead><tr><th>Book</th><th>Borrower</th><th>Borrowed On</th><th>Due</th><th>Status</th><th>Returned</th></tr></thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.bookTitle}</td>
                <td>{r.borrowerUsername}</td>
                <td>{r.borrowDate}</td>
                <td>{r.dueDate}</td>
                <td><span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                <td>{r.returnDate || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
