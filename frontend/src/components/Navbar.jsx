import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
         <Link to="/"><strong>Library Management</strong> <span className="brand-accent">— Abhishek</span></Link>
      </div>
      <div className="navbar-links">
        <Link to="/">All Books</Link>
        {user && <Link to="/add-book">Add Book</Link>}
        {user && <Link to="/my-books">My Borrowed Books</Link>}
        {isAdmin && <Link to="/admin">Admin Panel</Link>}
      </div>
      <div className="navbar-auth">
        {user ? (
          <>
            <span className="navbar-user">Hi, {user.username}</span>
            <button onClick={handleLogout} className="btn btn-outline">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  )
}
