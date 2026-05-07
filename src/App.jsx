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
  const [registrationClosed, setRegistrationClosed] = useState(false)
  const [deadline, setDeadline] = useState(null)
  const { onlineCount, socket } = useSocket()
  const navigate = useNavigate()
  const location = useLocation()

  // Check registration deadline
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

  // Handle registration closed page
  if (location.pathname === '/register' && registrationClosed) {
    return (
      <div className="registration-closed">
        <BackToHome onBack={() => navigate('/')} />
        <div className="container">
          <div className="closed-card">
            <h2>🔒 Registration Closed</h2>
            <p>The registration deadline has passed. Please contact admin for assistance.</p>
            <button className="btn-primary" onClick={() => navigate('/')}>Back to Home</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Homepage */}
      <Route path="/" element={
        <div className="app">
          <Navbar 
            onRegister={() => navigate('/register')} 
            onPortal={() => navigate('/portal')} 
            onHome={() => navigate('/')}
          />
          <HeroSection onRegister={() => navigate('/register')} onlineCount={onlineCount} />
          <SocialStats />
          <CourseSection onRegister={() => navigate('/register')} />
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
      
      {/* Registration */}
      <Route path="/register" element={<RegistrationForm onBack={() => navigate('/')} deadline={deadline} />} />
      
      {/* Student Portal */}
      <Route path="/portal" element={<StudentPortal onBack={() => navigate('/')} />} />
      
      {/* Admin */}
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminPanel />} />
    </Routes>
  )
}

export default App
