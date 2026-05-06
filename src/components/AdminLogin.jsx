import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaUserShield, FaLock, FaSpinner } from 'react-icons/fa'
import BackToHome from './BackToHome'
import { API_URL } from '../config'

const AdminLogin = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(`${API_URL}/api/admin/login`, { username, password })
      localStorage.setItem('admin_token', response.data.token)
      localStorage.setItem('admin_username', response.data.username)
      navigate('/admin/dashboard')
    } catch (error) {
      setError('Invalid username or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-page">
      <BackToHome showText={false} showIcon={true} />
      <div className="login-container">
        <div className="login-card">
          <div className="login-icon"><FaUserShield /></div>
          <h1>Admin Login</h1>
          <p>Enter your credentials to access the dashboard</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input 
                type="text" 
                placeholder="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? <FaSpinner className="spinning" /> : 'Login'}
            </button>
          </form>
          <div className="login-info">
            <p>Default: <strong>admin</strong> / <strong>admin123</strong></p>
          </div>
        </div>
      </div>

      <style>{`
        .admin-login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a192f, #112240);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .login-container { width: 100%; max-width: 450px; }
        .login-card {
          background: white;
          border-radius: 30px;
          padding: 3rem;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        body.dark .login-card { background: #1a365d; color: white; }
        .login-icon { font-size: 4rem; color: #f5a623; margin-bottom: 1rem; }
        .login-card h1 { margin-bottom: 0.5rem; color: #0a192f; }
        body.dark .login-card h1 { color: white; }
        .error-message { background: #ffebee; color: #c62828; padding: 10px; border-radius: 10px; margin: 1rem 0; }
        .input-group { position: relative; margin-bottom: 1.5rem; }
        .input-icon { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #999; }
        .input-group input {
          width: 100%;
          padding: 14px 15px 14px 45px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          background: white;
        }
        body.dark .input-group input { background: #0a192f; border-color: #334155; color: white; }
        button {
          width: 100%;
          background: linear-gradient(135deg, #f5a623, #e69500);
          border: none;
          padding: 14px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        button:hover:not(:disabled) { transform: translateY(-2px); }
        button:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-info { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.8rem; }
        @media (max-width: 480px) { .login-card { padding: 2rem; } }
      `}</style>
    </div>
  )
}

export default AdminLogin