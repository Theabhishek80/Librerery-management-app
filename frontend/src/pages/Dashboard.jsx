import { useEffect, useState, useCallback } from 'react'
import api from '../api/axiosConfig'
import BookCard from '../components/BookCard'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

// Global shared catalog: every book added by every user shows up here
// for everyone — this is the single "shared folder" of all books.
export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [books, setBooks] = useState([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const loadBooks = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/books', { params: { search, page, size: 8 } })
      setBooks(data.content)
      setTotalPages(data.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => { loadBooks() }, [loadBooks])

  async function handleBorrow(bookId) {
    if (!user) { navigate('/login'); return }
    try {
      await api.post(`/borrow/${bookId}`)
      setMessage('Book borrowed successfully! Check "My Borrowed Books".')
      loadBooks()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not borrow book')
    }
  }

  async function handleDelete(bookId) {
    if (!confirm('Delete this book permanently?')) return
    try {
      await api.delete(`/books/${bookId}`)
      loadBooks()
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not delete book')
    }
  }

  function handleEdit(book) {
    navigate('/add-book', { state: { book } })
  }

  return (
    <div className="page">
      <h1>Global Book Catalog</h1>
      <p className="subtitle">Every book added by every user appears here for everyone to browse and borrow.</p>

      <input
        className="search-input"
        placeholder="Search by title, author or category..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0) }}
      />

      {message && <div className="alert alert-info">{message}</div>}

      {loading ? (
        <p>Loading books...</p>
      ) : books.length === 0 ? (
        <p>No books found. {user && 'Be the first to add one!'}</p>
      ) : (
        <div className="book-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onBorrow={handleBorrow} onDelete={handleDelete} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Prev</button>
          <span>Page {page + 1} of {totalPages}</span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  )
}
