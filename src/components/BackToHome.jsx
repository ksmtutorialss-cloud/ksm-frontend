import React from 'react'
import { FaGraduationCap, FaHome } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const BackToHome = ({ onBack, showIcon = true, showText = true }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (onBack) {
      onBack()
    } else {
      localStorage.removeItem('student_session')
      localStorage.removeItem('admin_token')
      localStorage.removeItem('current_view')
      navigate('/')
      setTimeout(() => {
        window.location.reload()
      }, 100)
    }
  }

  return (
    <button 
      onClick={handleClick}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1000,
        background: 'rgba(10, 25, 47, 0.9)',
        border: 'none',
        padding: showText ? '10px 20px' : '10px',
        borderRadius: '40px',
        color: '#f5a623',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem',
        fontWeight: '600',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#f5a623'
        e.currentTarget.style.color = '#0a192f'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(10, 25, 47, 0.9)'
        e.currentTarget.style.color = '#f5a623'
      }}
    >
      {showIcon && <FaHome size={14} />}
      {showText && <span>← Back to Homepage</span>}
      {!showIcon && !showText && <FaGraduationCap />}
    </button>
  )
}

export default BackToHome