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

  return (
    <div className="admin-login-page">
      <div className="login-container">
        <div className="login-card">
          <button onClick={() => navigate('/')} className="back-home-btn">
            <FaArrowLeft /> Back
          </button>
          <div className="login-icon"><FaUserShield /></div>
          <h1>Admin Login</h1>
          <p>Enter your credentials to access the dashboard</p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <FaUserShield className="input-icon" />
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
          max-width: 420px; 
        }
        
        .login-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          position: relative;
        }
        
        body.dark .login-card { 
          background: #1e293b; 
          color: white; 
        }
        
        .back-home-btn {
          position: absolute;
          top: 16px;
          left: 16px;
          background: #f1f5f9;
          border: none;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          color: #475569;
          transition: all 0.2s;
          width: auto;
          min-width: auto;
        }
        
        body.dark .back-home-btn {
          background: #334155;
          color: #e2e8f0;
        }
        
        .back-home-btn:hover {
          background: #e2e8f0;
          transform: translateX(-2px);
        }
        
        body.dark .back-home-btn:hover {
          background: #475569;
        }
        
        .login-icon { 
          font-size: 3rem; 
          color: #f5a623; 
          margin-bottom: 0.75rem;
          margin-top: 0.5rem;
        }
        
        .login-card h1 { 
          margin-bottom: 0.5rem; 
          color: #0f172a;
          font-size: 1.6rem;
          font-weight: 700;
        }
        
        body.dark .login-card h1 { 
          color: white; 
        }
        
        .login-card p {
          color: #64748b;
          margin-bottom: 1.5rem;
          font-size: 0.85rem;
        }
        
        body.dark .login-card p {
          color: #94a3b8;
        }
        
        .error-message { 
          background: #fee2e2; 
          color: #dc2626; 
          padding: 10px; 
          border-radius: 10px; 
          margin: 1rem 0;
          font-size: 0.8rem;
        }
        
        body.dark .error-message {
          background: rgba(239, 68, 68, 0.15);
          color: #f87171;
        }
        
        .input-group { 
          position: relative; 
          margin-bottom: 1.25rem; 
        }
        
        .input-icon { 
          position: absolute; 
          left: 14px; 
          top: 50%; 
          transform: translateY(-50%); 
          color: #94a3b8; 
          font-size: 0.9rem;
        }
        
        .input-group input {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.9rem;
          background: white;
          transition: all 0.2s;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #f5a623;
          box-shadow: 0 0 0 3px rgba(245, 166, 35, 0.1);
        }
        
        body.dark .input-group input { 
          background: #0f172a; 
          border-color: #334155; 
          color: white; 
        }
        
        button[type="submit"] {
          width: 100%;
          background: linear-gradient(135deg, #f5a623, #e69500);
          border: none;
          padding: 12px;
          border-radius: 12px;
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        button[type="submit"]:hover:not(:disabled) { 
          transform: translateY(-1px);
          box-shadow: 0 8px 16px -4px rgba(245, 166, 35, 0.3);
        }
        
        button[type="submit"]:disabled { 
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
          margin-top: 1.5rem; 
          padding-top: 1rem; 
          border-top: 1px solid #e2e8f0; 
          font-size: 0.75rem;
          color: #64748b;
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
            padding: 1.5rem; 
          }
          .login-card h1 {
            font-size: 1.4rem;
          }
          .back-home-btn {
            top: 12px;
            left: 12px;
            padding: 4px 10px;
            font-size: 0.7rem;
          }
          .login-icon {
            font-size: 2.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default AdminLogin
