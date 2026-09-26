import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/axiosConfig'

// Any logged-in user can add a book. Once saved, it becomes part of the
// single shared catalog that every user (globally) can see immediately.
export default function AddBook() {
  const navigate = useNavigate()
  const location = useLocation()
  const editingBook = location.state?.book || null

  const [form, setForm] = useState(editingBook ? {
    title: editingBook.title,
    author: editingBook.author,
    isbn: editingBook.isbn || '',
    category: editingBook.category || '',
    description: editingBook.description || '',
    totalCopies: editingBook.totalCopies,
    coverImageUrl: editingBook.coverImageUrl || '',
  } : {
    title: '', author: '', isbn: '', category: '', description: '', totalCopies: 1, coverImageUrl: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, totalCopies: Number(form.totalCopies) }
      if (editingBook) {
        await api.put(`/books/${editingBook.id}`, payload)
      } else {
        await api.post('/books', payload)
      }
      setSuccess(true)
      setTimeout(() => navigate('/'), 900)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save book')
    }
  }

  return (
    <div className="page">
      <div className="form-container">
        <h2>{editingBook ? 'Edit Book' : 'Add a New Book to the Library'}</h2>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Saved! This book is now visible to every user.</div>}
        <form onSubmit={handleSubmit} className="book-form">
          <label>Title *</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

          <label>Author *</label>
          <input required value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />

          <label>ISBN</label>
          <input value={form.isbn} onChange={(e) => setForm({ ...form, isbn: e.target.value })} />

          <label>Category</label>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />

          <label>Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />

          <label>Total Copies *</label>
          <input type="number" min={1} required value={form.totalCopies}
                 onChange={(e) => setForm({ ...form, totalCopies: e.target.value })} />

          <label>Cover Image URL</label>
          <input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} />

          <button className="btn btn-primary" type="submit">{editingBook ? 'Update Book' : 'Add Book'}</button>
        </form>
      </div>
    </div>
  )
}
