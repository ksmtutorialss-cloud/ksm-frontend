import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { FaUserShield, FaLock, FaSpinner, FaEye, FaEyeSlash, FaHome } from 'react-icons/fa'
import { API_URL } from '../config'

const AdminLogin = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? <><FaSpinner className="spinning" /> Logging in...</> : 'Login'}
            </button>
          </form>
        </div>
      </div>

      {/* Home button at bottom */}
      <button onClick={() => navigate('/')} className="home-button">
        <FaHome /> Back to Homepage
      </button>

      <style>{`
        .admin-login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a192f, #112240);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .login-container { 
          width: 100%; 
          max-width: 400px; 
        }
        
        .login-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
        
        body.dark .login-card { 
          background: #1a365d; 
          color: white; 
        }
        
        .login-icon { 
          font-size: 3rem; 
          color: #f5a623; 
          margin-bottom: 1rem; 
        }
        
        .login-card h1 { 
          margin-bottom: 0.5rem; 
          color: #0a192f;
          font-size: 1.6rem;
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
          background: #ffebee; 
          color: #c62828; 
          padding: 10px; 
          border-radius: 10px; 
          margin: 1rem 0;
          font-size: 0.85rem;
        }
        
        body.dark .error-message {
          background: rgba(239, 68, 68, 0.2);
          color: #f87171;
        }
        
        .input-group { 
          position: relative; 
          margin-bottom: 1.25rem; 
        }
        
        .input-icon { 
          position: absolute; 
          left: 12px; 
          top: 50%; 
          transform: translateY(-50%); 
          color: #999; 
          font-size: 0.9rem;
        }
        
        .input-group input {
          width: 100%;
          padding: 12px 12px 12px 38px;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          background: white;
        }
        
        .input-group input:focus {
          outline: none;
          border-color: #f5a623;
        }
        
        body.dark .input-group input { 
          background: #0a192f; 
          border-color: #334155; 
          color: white; 
        }
        
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          font-size: 1rem;
          width: auto;
          padding: 0;
        }
        
        .password-toggle:hover {
          color: #f5a623;
          background: none;
        }
        
        button[type="submit"] {
          width: 100%;
          background: linear-gradient(135deg, #f5a623, #e69500);
          border: none;
          padding: 12px;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        button[type="submit"]:hover:not(:disabled) { 
          transform: translateY(-2px); 
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
        
        .home-button {
          margin-top: 24px;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 12px 24px;
          border-radius: 40px;
          color: white;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
          width: auto;
          font-size: 0.9rem;
        }
        
        .home-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
        
        @media (max-width: 480px) { 
          .login-card { 
            padding: 1.5rem; 
          }
          .login-card h1 {
            font-size: 1.4rem;
          }
          .home-button {
            padding: 10px 20px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  )
}

export default AdminLogin
