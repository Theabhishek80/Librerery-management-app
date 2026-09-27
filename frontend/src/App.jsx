import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import PrivateRoute from './components/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AddBook from './pages/AddBook'
import MyBorrowedBooks from './pages/MyBorrowedBooks'
import AdminPanel from './pages/AdminPanel'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/add-book" element={<PrivateRoute><AddBook /></PrivateRoute>} />
        <Route path="/my-books" element={<PrivateRoute><MyBorrowedBooks /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly><AdminPanel /></PrivateRoute>} />
      </Routes>
    </>
  )
}
