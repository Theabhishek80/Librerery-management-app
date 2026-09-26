import { useEffect, useState } from 'react'
import api from '../api/axiosConfig'

export default function MyBorrowedBooks() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function load() {
    setLoading(true)
    const { data } = await api.get('/borrow/my')
    setRecords(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleReturn(recordId) {
    try {
      await api.put(`/borrow/return/${recordId}`)
      setMessage('Book returned. Thanks!')
      load()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not return book')
    }
  }

  return (
    <div className="page">
      <h1>My Borrowed Books</h1>
      {message && <div className="alert alert-info">{message}</div>}
      {loading ? <p>Loading...</p> : records.length === 0 ? (
        <p>You haven't borrowed any books yet.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Book</th><th>Borrowed On</th><th>Due Date</th><th>Status</th><th>Returned On</th><th></th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.bookTitle}</td>
                <td>{r.borrowDate}</td>
                <td>{r.dueDate}</td>
                <td><span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                <td>{r.returnDate || '-'}</td>
                <td>
                  {r.status === 'BORROWED' && (
                    <button className="btn btn-outline" onClick={() => handleReturn(r.id)}>Return</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
