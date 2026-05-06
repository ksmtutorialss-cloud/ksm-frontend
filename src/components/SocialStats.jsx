import React, { useState, useEffect } from 'react'
import { FaUsers, FaGraduationCap, FaChalkboardTeacher, FaTrophy } from 'react-icons/fa'
import axios from 'axios'
import { API_URL } from '../config'

const SocialStats = () => {
  const [stats, setStats] = useState({ students: 0, courses: 12, tutors: 10, successRate: 95 })

  useEffect(() => {
    axios.get(`${API_URL}/api/stats`)
      .then(res => {
        if (res.data && res.data.total_students !== undefined) {
          setStats(prev => ({ ...prev, students: res.data.total_students || 0 }))
        }
      })
      .catch(err => console.error('Error fetching stats:', err))
  }, [])

  const statItems = [
    { icon: <FaUsers />, number: stats.students, label: 'Students Trained', suffix: '+' },
    { icon: <FaGraduationCap />, number: stats.courses, label: 'Courses Available', suffix: '+' },
    { icon: <FaChalkboardTeacher />, number: stats.tutors, label: 'Expert Tutors', suffix: '+' },
    { icon: <FaTrophy />, number: stats.successRate, label: 'Success Rate', suffix: '%' }
  ]

  return (
    <section className="social-stats">
      <div className="container">
        <div className="stats-grid">
          {statItems.map((item, index) => (
            <div key={index} className="stat-card">
              <div className="stat-icon">{item.icon}</div>
              <div className="stat-number">{item.number.toLocaleString()}{item.suffix}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .social-stats {
          padding: 60px 0;
          background: var(--citsa-navy);
        }
        
        body.dark .social-stats {
          background: var(--citsa-navy-light);
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 2rem;
        }
        
        .stat-card {
          text-align: center;
          padding: 2rem;
          background: rgba(255,255,255,0.05);
          border-radius: 20px;
          backdrop-filter: blur(10px);
          transition: all 0.3s;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          background: rgba(255,255,255,0.1);
        }
        
        .stat-icon {
          font-size: 2.5rem;
          color: var(--citsa-gold);
          margin-bottom: 1rem;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: 0.5rem;
        }
        
        .stat-label {
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
        }
        
        @media (max-width: 768px) {
          .social-stats {
            padding: 40px 0;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .stat-card {
            padding: 1.5rem;
          }
          .stat-number {
            font-size: 1.5rem;
          }
          .stat-icon {
            font-size: 2rem;
          }
        }
        
        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  )
}

export default SocialStats