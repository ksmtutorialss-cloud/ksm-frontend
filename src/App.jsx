import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HeroSection from './components/HeroSection'
import CourseSection from './components/CourseSection'
import CommentSection from './components/CommentSection'
import RegistrationForm from './components/RegistrationForm'
import AdminLogin from './components/AdminLogin'
import AdminPanel from './components/AdminPanel'
import StudentPortal from './components/StudentPortal'
import DirectorMessage from './components/DirectorMessage'
import MeetTutors from './components/MeetTutors'
import Announcements from './components/Announcements'
import Partners from './components/Partners'
import Newsletter from './components/Newsletter'
import FAQ from './components/FAQ'
import SocialStats from './components/SocialStats'
import Footer from './components/Footer'
import BackToHome from './components/BackToHome'
import { useSocket } from './contexts/SocketContext'
import axios from 'axios'
import { API_URL } from './config'
import './App.css'

function App() {
  const [showRegister, setShowRegister] = useState(false)
  const [showPortal, setShowPortal] = useState(false)
  const [registrationClosed, setRegistrationClosed] = useState(false)
  const [deadline, setDeadline] = useState(null)
  const { onlineCount, socket } = useSocket()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const currentView = localStorage.getItem('current_view')
    if (currentView === 'student_portal' && !showPortal && location.pathname === '/') {
      setShowPortal(true)
    } else if (currentView === 'registration' && !showRegister && location.pathname === '/') {
      setShowRegister(true)
    }
  }, [])

  useEffect(() => {
    if (showPortal) {
      localStorage.setItem('current_view', 'student_portal')
    } else if (showRegister) {
      localStorage.setItem('current_view', 'registration')
    } else if (location.pathname === '/admin/dashboard') {
      localStorage.setItem('current_view', 'admin_panel')
    } else if (location.pathname === '/') {
      localStorage.setItem('current_view', 'homepage')
    }
  }, [showPortal, showRegister, location.pathname])

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/settings`)
        const data = res.data
        if (data.deadline) {
          setDeadline(data.deadline)
          const now = new Date()
          const deadlineDate = new Date(data.deadline)
          if (now > deadlineDate) {
            setRegistrationClosed(true)
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const handleNavigateHome = () => {
    setShowRegister(false)
    setShowPortal(false)
    localStorage.setItem('current_view', 'homepage')
    if (location.pathname !== '/') {
      navigate('/')
    }
  }

  if (showRegister) {
    if (registrationClosed) {
      return (
        <div className="registration-closed">
          <BackToHome onBack={handleNavigateHome} />
          <div className="container">
            <div className="closed-card">
              <h2>🔒 Registration Closed</h2>
              <p>The registration deadline has passed. Please contact admin for assistance.</p>
              <button className="btn-primary" onClick={handleNavigateHome}>Back to Home</button>
            </div>
          </div>
        </div>
      )
    }
    return <RegistrationForm onBack={handleNavigateHome} deadline={deadline} />
  }

  if (showPortal) {
    return <StudentPortal onBack={handleNavigateHome} />
  }

  return (
    <Routes>
      <Route path="/" element={
        <div className="app">
          <Navbar 
            onRegister={() => setShowRegister(true)} 
            onPortal={() => setShowPortal(true)} 
            onHome={handleNavigateHome}
          />
          <HeroSection onRegister={() => setShowRegister(true)} onlineCount={onlineCount} />
          <SocialStats />
          <CourseSection onRegister={() => setShowRegister(true)} />
          <DirectorMessage />
          <MeetTutors />
          <Announcements />
          <Partners />
          <Newsletter />
          <FAQ />
          <CommentSection />
          <Footer />
        </div>
      } />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminPanel />} />
    </Routes>
  )
}

export default App