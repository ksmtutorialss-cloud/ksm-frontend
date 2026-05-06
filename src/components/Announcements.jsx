import React, { useState, useEffect } from 'react'
import { FaBullhorn, FaCalendarAlt } from 'react-icons/fa'
import axios from 'axios'
import { API_URL } from '../config'

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/announcements`)
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="announcements">
        <div className="container">
          <h2 className="section-title">Latest Announcements</h2>
          <div className="announcements-grid">
            {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '100px', borderRadius: '16px' }}></div>)}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="announcements">
      <div className="container">
        <h2 className="section-title">Latest Announcements</h2>
        <p className="section-subtitle">Stay updated with important news and updates</p>
        <div className="announcements-grid">
          {announcements.map(ann => (
            <div key={ann.id} className={`announcement-card ${ann.type}`}>
              <div className="announcement-icon"><FaBullhorn /></div>
              <div className="announcement-content">
                <h3>{ann.title}</h3>
                <p>{ann.content}</p>
                <div className="announcement-date"><FaCalendarAlt /> {new Date(ann.date).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .announcements {
          padding: 80px 0;
          background: var(--gray-light);
        }
        
        body.dark .announcements {
          background: var(--citsa-navy-light);
        }
        
        .announcements-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .announcement-card {
          display: flex;
          gap: 1rem;
          padding: 1.5rem;
          background: var(--white);
          border-radius: 16px;
          box-shadow: var(--shadow-md);
          border-left: 4px solid var(--citsa-gold);
          transition: all 0.3s;
        }
        
        body.dark .announcement-card {
          background: var(--citsa-navy);
        }
        
        .announcement-card:hover {
          transform: translateX(5px);
        }
        
        .announcement-card.important {
          border-left-color: #ef4444;
        }
        
        .announcement-card.promo {
          border-left-color: #10b981;
        }
        
        .announcement-icon {
          font-size: 1.5rem;
          color: var(--citsa-gold);
        }
        
        .announcement-content {
          flex: 1;
        }
        
        .announcement-content h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: var(--citsa-navy);
        }
        
        body.dark .announcement-content h3 {
          color: white;
        }
        
        .announcement-content p {
          color: var(--text-light);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }
        
        .announcement-date {
          font-size: 0.7rem;
          color: var(--text-light);
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        @media (max-width: 768px) {
          .announcements {
            padding: 50px 0;
          }
          .announcement-card {
            flex-direction: column;
          }
        }
      `}</style>
    </section>
  )
}

export default Announcements