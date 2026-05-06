import React, { useState, useEffect } from 'react'
import { FaGraduationCap, FaBars, FaTimes, FaMoon, FaSun, FaUser } from 'react-icons/fa'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'

const Navbar = ({ onRegister, onPortal, onHome, showRegisterBtn = true }) => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { darkMode, toggleDarkMode } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 968 && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mobileMenuOpen])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [mobileMenuOpen])

  const handleNavigation = (e, path) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    
    if (location.pathname !== '/') {
      if (onHome) {
        onHome()
      } else {
        navigate('/')
      }
      setTimeout(() => {
        const element = document.getElementById(path.replace('#', ''))
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 150)
    } else {
      const element = document.getElementById(path.replace('#', ''))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const handleRegisterClick = (e) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    if (onRegister) onRegister()
  }

  const handlePortalClick = (e) => {
    e.preventDefault()
    setMobileMenuOpen(false)
    if (onPortal) onPortal()
  }

  const handleLogoClick = () => {
    setMobileMenuOpen(false)
    if (location.pathname !== '/') {
      if (onHome) onHome()
      else navigate('/')
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: darkMode ? '#0a192f' : 'rgba(255, 255, 255, 0.98)',
        backdropFilter: 'blur(10px)',
        zIndex: 1000,
        transition: 'all 0.3s ease',
        boxShadow: scrolled ? '0 4px 6px -1px rgba(0,0,0,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
        padding: '0.75rem 1rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <FaGraduationCap style={{ fontSize: '1.75rem', color: '#f5a623' }} />
            <span style={{ fontSize: '1.3rem', fontWeight: '700', color: darkMode ? 'white' : '#0a192f' }}>
              KSM <span style={{ color: '#f5a623' }}>Tutorials</span>
            </span>
          </div>

          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div className="nav-links-desktop" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <a href="#home" onClick={(e) => handleNavigation(e, '#home')} style={{ textDecoration: 'none', color: darkMode ? '#ddd' : '#1e293b', fontWeight: '500', cursor: 'pointer' }}>Home</a>
              <a href="#courses" onClick={(e) => handleNavigation(e, '#courses')} style={{ textDecoration: 'none', color: darkMode ? '#ddd' : '#1e293b', fontWeight: '500', cursor: 'pointer' }}>Courses</a>
              <a href="#tutors" onClick={(e) => handleNavigation(e, '#tutors')} style={{ textDecoration: 'none', color: darkMode ? '#ddd' : '#1e293b', fontWeight: '500', cursor: 'pointer' }}>Tutors</a>
              <a href="#reviews" onClick={(e) => handleNavigation(e, '#reviews')} style={{ textDecoration: 'none', color: darkMode ? '#ddd' : '#1e293b', fontWeight: '500', cursor: 'pointer' }}>Reviews</a>
              <a href="#faq" onClick={(e) => handleNavigation(e, '#faq')} style={{ textDecoration: 'none', color: darkMode ? '#ddd' : '#1e293b', fontWeight: '500', cursor: 'pointer' }}>FAQ</a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button onClick={handlePortalClick} style={{
                background: 'transparent',
                border: '1px solid #f5a623',
                padding: '8px 18px',
                borderRadius: '40px',
                color: '#f5a623',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#f5a623'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f5a623'; }}>
                <FaUser /> Student Portal
              </button>
              
              <button onClick={toggleDarkMode} style={{
                background: 'transparent',
                border: 'none',
                fontSize: '1.2rem',
                cursor: 'pointer',
                color: darkMode ? 'white' : '#1e293b',
                padding: '8px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center'
              }}>
                {darkMode ? <FaSun /> : <FaMoon />}
              </button>
              
              {showRegisterBtn && (
                <button 
                  data-register-btn="true"
                  onClick={handleRegisterClick} 
                  style={{
                    background: 'linear-gradient(135deg, #f5a623, #e69500)',
                    border: 'none',
                    padding: '8px 24px',
                    borderRadius: '40px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                    Register Now
                  </button>
              )}
            </div>
          </div>

          <div onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="mobile-menu-icon" style={{
            display: 'none',
            fontSize: '1.5rem',
            cursor: 'pointer',
            color: darkMode ? 'white' : '#0a192f',
            zIndex: 1001
          }}>
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>
        </div>
      </nav>

      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        zIndex: 998,
        opacity: mobileMenuOpen ? 1 : 0,
        visibility: mobileMenuOpen ? 'visible' : 'hidden',
        transition: 'all 0.3s ease'
      }} onClick={() => setMobileMenuOpen(false)} />

      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} style={{
        position: 'fixed',
        top: 0,
        right: mobileMenuOpen ? '0' : '-100%',
        width: '80%',
        maxWidth: '350px',
        height: '100vh',
        background: darkMode ? '#0a192f' : 'white',
        transition: 'right 0.3s ease',
        padding: '80px 1.5rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        overflowY: 'auto',
        zIndex: 999,
        boxShadow: '-5px 0 20px rgba(0,0,0,0.1)'
      }}>
        <a href="#home" onClick={(e) => handleNavigation(e, '#home')} style={{ textDecoration: 'none', color: darkMode ? '#ddd' : '#1e293b', fontWeight: '500', padding: '12px', textAlign: 'center', borderRadius: '12px', transition: 'all 0.3s' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#112240' : '#f0f2f5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>Home</a>
        <a href="#courses" onClick={(e) => handleNavigation(e, '#courses')} style={{ textDecoration: 'none', color: darkMode ? '#ddd' : '#1e293b', fontWeight: '500', padding: '12px', textAlign: 'center', borderRadius: '12px' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#112240' : '#f0f2f5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>Courses</a>
        <a href="#tutors" onClick={(e) => handleNavigation(e, '#tutors')} style={{ textDecoration: 'none', color: darkMode ? '#ddd' : '#1e293b', fontWeight: '500', padding: '12px', textAlign: 'center', borderRadius: '12px' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#112240' : '#f0f2f5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>Tutors</a>
        <a href="#reviews" onClick={(e) => handleNavigation(e, '#reviews')} style={{ textDecoration: 'none', color: darkMode ? '#ddd' : '#1e293b', fontWeight: '500', padding: '12px', textAlign: 'center', borderRadius: '12px' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#112240' : '#f0f2f5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>Reviews</a>
        <a href="#faq" onClick={(e) => handleNavigation(e, '#faq')} style={{ textDecoration: 'none', color: darkMode ? '#ddd' : '#1e293b', fontWeight: '500', padding: '12px', textAlign: 'center', borderRadius: '12px' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = darkMode ? '#112240' : '#f0f2f5'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>FAQ</a>
        
        <div style={{ height: '1px', background: darkMode ? '#1a365d' : '#e2e8f0', margin: '0.5rem 0' }} />
        
        <button onClick={handlePortalClick} style={{ background: 'transparent', border: '1px solid #f5a623', padding: '12px', borderRadius: '40px', color: '#f5a623', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }}>
          <FaUser /> Student Portal
        </button>
        <button onClick={toggleDarkMode} style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '40px', color: darkMode ? '#ccc' : '#1e293b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          {darkMode ? <FaSun /> : <FaMoon />} {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        {showRegisterBtn && (
          <button 
            data-register-btn="true"
            onClick={handleRegisterClick} 
            style={{ background: 'linear-gradient(135deg, #f5a623, #e69500)', border: 'none', padding: '12px', borderRadius: '40px', color: 'white', fontWeight: '600', cursor: 'pointer' }}>
            Register Now
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 968px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-icon { display: block !important; }
        }
        @media (min-width: 969px) {
          .mobile-menu-icon { display: none !important; }
          .mobile-menu, .mobile-menu-overlay { display: none !important; }
        }
      `}</style>
    </>
  )
}

export default Navbar