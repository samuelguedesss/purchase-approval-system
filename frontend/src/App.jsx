import { useState } from 'react'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'

function App() {
  const [page, setPage] = useState('login')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setPage('login')
  }

  if (page === 'dashboard') return <Dashboard onLogout={handleLogout} />
  return <Login onSuccess={() => setPage('dashboard')} />
}

export default App
