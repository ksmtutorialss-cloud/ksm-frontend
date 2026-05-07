import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaUserShield, FaLock, FaSpinner, FaArrowLeft } from 'react-icons/fa'
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

  const handleBackToHome = () => {
    navigate('/')
  }

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <button onClick={handleBackToHome} className="back-home-btn">
            <FaArrowLeft /> Back to Home
          </button>
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
              {loading ? <><FaSpinner className="spinning" /> Logging in...</> : 'Login'}
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .login-container { 
          width: 100%; 
          max-width: 450px; 
        }
        .login-card {
          background: white;
          border-radius: 30px;
          padding: 2.5rem;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          position: relative;
        }
        body.dark .login-card { 
          background: #1a365d; 
          color: white; 
        }
        .back-home-btn {
          position: absolute;
          top: 20px;
          left: 20px;
          background: #f3f4f6;
          border: none;
          padding: 8px 16px;
          border-radius: 40px;
          font-size: 0.8rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4b5563;
          transition: all 0.3s;
          width: auto;
        }
        body.dark .back-home-btn {
          background: #0a192f;
          color: #e2e8f0;
        }
        .back-home-btn:hover {
          background: #e5e7eb;
          transform: translateX(-3px);
        }
        body.dark .back-home-btn:hover {
          background: #112240;
        }
        .login-icon { 
          font-size: 3.5rem; 
          color: #f5a623; 
          margin-bottom: 1rem;
          margin-top: 1rem;
        }
        .login-card h1 { 
          margin-bottom: 0.5rem; 
          color: #0a192f;
          font-size: 1.8rem;
        }
        body.dark .login-card h1 { 
          color: white; 
        }
        .login-card p {
          color: #6b7280;
          margin-bottom: 2rem;
          font-size: 0.9rem;
        }
        body.dark .login-card p {
          color: #94a3b8;
        }
        .error-message { 
          background: #fee2e2; 
          color: #dc2626; 
          padding: 12px; 
          border-radius: 12px; 
          margin: 1rem 0;
          font-size: 0.85rem;
        }
        body.dark .error-message {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        .input-group { 
          position: relative; 
          margin-bottom: 1.5rem; 
        }
        .input-icon { 
          position: absolute; 
          left: 15px; 
          top: 50%; 
          transform: translateY(-50%); 
          color: #9ca3af; 
          font-size: 1rem;
        }
        .input-group input {
          width: 100%;
          padding: 14px 15px 14px 45px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          background: white;
          transition: all 0.3s;
        }
        .input-group input:focus {
          outline: none;
          border-color: #f5a623;
          box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1);
        }
        body.dark .input-group input { 
          background: #0a192f; 
          border-color: #334155; 
          color: white; 
        }
        body.dark .input-group input:focus {
          border-color: #f5a623;
        }
        button {
          width: 100%;
          background: linear-gradient(135deg, #f5a623, #e69500);
          border: none;
          padding: 14px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s;
        }
        button:hover:not(:disabled) { 
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -5px rgba(245, 166, 35, 0.4);
        }
        button:disabled { 
          opacity: 0.6; 
          cursor: not-allowed; 
        }
        .spinning { 
          animation: spin 1s linear infinite; 
        }
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        .login-info { 
          margin-top: 2rem; 
          padding-top: 1.5rem; 
          border-top: 1px solid #e5e7eb; 
          font-size: 0.8rem;
          color: #6b7280;
        }
        body.dark .login-info {
          border-top-color: #334155;
          color: #94a3b8;
        }
        .login-info strong {
          color: #f5a623;
        }
        @media (max-width: 480px) { 
          .login-card { 
            padding: 1.8rem; 
          }
          .login-card h1 {
            font-size: 1.5rem;
          }
          .back-home-btn {
            padding: 6px 12px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  )
}

export default AdminLogin
