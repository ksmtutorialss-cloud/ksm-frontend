import React, { useState, useEffect } from 'react'
import { FaArrowRight, FaUsers, FaBookOpen, FaChalkboardTeacher } from 'react-icons/fa'
import axios from 'axios'
import { API_URL } from '../config'

const HeroSection = ({ onRegister, onlineCount }) => {
  const [timeLeft, setTimeLeft] = useState(null)
  const [deadline, setDeadline] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/api/settings`)
      .then(res => {
        if (res.data.deadline) {
          setDeadline(res.data.deadline)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!deadline) return
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(deadline).getTime()
      const distance = target - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [deadline])

  return (
    <section className="hero" id="home">
      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">🎓 UCC's #1 Tutorial Program</div>
          <h1 className="hero-title">Excel in <span className="highlight">Information Technology</span> & <span className="highlight">Computer Science</span></h1>
          <p className="hero-description">Join the premier tutorial program at University of Cape Coast designed to help you secure straight A's through practical training and expert guidance.</p>
          <div className="hero-buttons">
            <button className="hero-btn-primary" onClick={onRegister}>Register Now <FaArrowRight /></button>
            <a href="#courses" className="hero-btn-secondary" onClick={(e) => { e.preventDefault(); document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }); }}>Explore Courses</a>
          </div>
          <div className="hero-stats">
            <div className="stat"><FaUsers className="stat-icon" /><div><h3>{onlineCount || 0}+</h3><p>Online Now</p></div></div>
            <div className="stat"><FaBookOpen className="stat-icon" /><div><h3>12+</h3><p>Courses</p></div></div>
            <div className="stat"><FaChalkboardTeacher className="stat-icon" /><div><h3>10+</h3><p>Expert Tutors</p></div></div>
          </div>
        </div>
        <div className="hero-right">
          <div className="deadline-card">
            <h4>⏰ Registration Closes In</h4>
            <div className="countdown">
              <div className="countdown-item"><span>{loading ? '--' : (timeLeft?.days ?? 0)}</span><small>Days</small></div>
              <div className="countdown-item"><span>{loading ? '--' : String(timeLeft?.hours ?? 0).padStart(2, '0')}</span><small>Hours</small></div>
              <div className="countdown-item"><span>{loading ? '--' : String(timeLeft?.minutes ?? 0).padStart(2, '0')}</span><small>Mins</small></div>
              <div className="countdown-item"><span>{loading ? '--' : String(timeLeft?.seconds ?? 0).padStart(2, '0')}</span><small>Secs</small></div>
            </div>
            <div className="deadline-features">
              <div className="feature"> No upfront payment</div>
              <div className="feature"> GHS 120 per course</div>
              <div className="feature"> WhatsApp support group</div>
              <div className="feature"> 1-month intensive</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .hero {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--gray-light) 0%, var(--white) 100%);
          display: flex;
          align-items: center;
          padding-top: 80px;
        }
        
        body.dark .hero {
          background: linear-gradient(135deg, var(--citsa-navy) 0%, var(--citsa-navy-light) 100%);
        }
        
        .hero-container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 4rem 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        
        .hero-badge {
          display: inline-block;
          background: rgba(245, 166, 35, 0.1);
          padding: 8px 20px;
          border-radius: 40px;
          color: var(--citsa-gold);
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        
        .hero-title {
          font-size: 3rem;
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
          color: var(--citsa-navy);
        }
        
        body.dark .hero-title {
          color: white;
        }
        
        .hero-title .highlight {
          color: var(--citsa-gold);
        }
        
        .hero-description {
          font-size: 1.1rem;
          color: var(--text-light);
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        
        .hero-buttons {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }
        
        .hero-btn-primary {
          background: linear-gradient(135deg, var(--citsa-gold), var(--citsa-gold-dark));
          border: none;
          padding: 14px 32px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }
        
        .hero-btn-secondary {
          background: transparent;
          border: 2px solid var(--citsa-gold);
          padding: 12px 28px;
          border-radius: 40px;
          color: var(--citsa-gold);
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.3s;
        }
        
        .hero-btn-secondary:hover {
          background: var(--citsa-gold);
          color: white;
        }
        
        .hero-stats {
          display: flex;
          gap: 2rem;
          flex-wrap: wrap;
        }
        
        .stat {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .stat-icon {
          font-size: 2rem;
          color: var(--citsa-gold);
        }
        
        .stat h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--citsa-navy);
        }
        
        body.dark .stat h3 {
          color: white;
        }
        
        .stat p {
          font-size: 0.8rem;
          color: var(--text-light);
        }
        
        .deadline-card {
          background: var(--white);
          border-radius: 30px;
          padding: 2rem;
          box-shadow: var(--shadow-xl);
        }
        
        body.dark .deadline-card {
          background: var(--citsa-navy-light);
        }
        
        .deadline-card h4 {
          text-align: center;
          color: var(--citsa-gold);
          margin-bottom: 1.5rem;
          font-size: 1.2rem;
        }
        
        .countdown {
          display: flex;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }
        
        .countdown-item {
          background: var(--citsa-navy);
          padding: 15px;
          border-radius: 16px;
          text-align: center;
          min-width: 75px;
        }
        
        body.dark .countdown-item {
          background: var(--citsa-navy-lighter);
        }
        
        .countdown-item span {
          display: block;
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--citsa-gold);
        }
        
        .countdown-item small {
          font-size: 0.7rem;
          color: rgba(255,255,255,0.7);
        }
        
        .deadline-features {
          margin-top: 1rem;
        }
        
        .feature {
          padding: 8px 0;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-dark);
          border-bottom: 1px dashed var(--gray);
        }
        
        .feature:last-child {
          border-bottom: none;
        }
        
        body.dark .feature {
          color: #ddd;
        }
        
        @media (max-width: 968px) {
          .hero-container {
            grid-template-columns: 1fr;
            text-align: center;
            padding: 2rem 1rem;
          }
          
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-buttons {
            justify-content: center;
          }
          
          .hero-stats {
            justify-content: center;
          }
        }
        
        @media (max-width: 480px) {
          .hero-container {
            padding: 1.5rem 1rem;
          }
          
          .countdown-item {
            min-width: 60px;
            padding: 10px;
          }
          
          .countdown-item span {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </section>
  )
}

export default HeroSection
