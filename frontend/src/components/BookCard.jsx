import { useAuth } from '../context/AuthContext'

export default function BookCard({ book, onBorrow, onDelete, onEdit }) {
  const { user, isAdmin } = useAuth()
  const canManage = user && (isAdmin || user.username === book.addedByUsername)
  const available = book.availableCopies > 0

  return (
    <div className="book-card">
      <div className="book-cover">
        {book.coverImageUrl ? (
          <img src={book.coverImageUrl} alt={book.title} />
        ) : (
          <div className="book-cover-placeholder">{book.title?.charAt(0) || '?'}</div>
        )}
      </div>
      <div className="book-info">
        <h3>{book.title}</h3>
        <p className="book-author">by {book.author}</p>
        {book.category && <span className="book-badge">{book.category}</span>}
        <p className="book-desc">{book.description}</p>
        <p className="book-copies">
          {available ? (
            <span className="text-green">{book.availableCopies} / {book.totalCopies} available</span>
          ) : (
            <span className="text-red">All copies borrowed</span>
          )}
        </p>
        <p className="book-added-by">Added by: {book.addedByUsername}</p>

        <div className="book-actions">
          {user && (
            <button className="btn btn-primary" disabled={!available} onClick={() => onBorrow(book.id)}>
              {available ? 'Borrow' : 'Unavailable'}
            </button>
          )}
          {canManage && (
            <>
              <button className="btn btn-outline" onClick={() => onEdit(book)}>Edit</button>
              <button className="btn btn-danger" onClick={() => onDelete(book.id)}>Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
