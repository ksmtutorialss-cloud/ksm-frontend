import React, { useState, useEffect } from 'react'
import { FaEnvelope, FaLinkedin, FaUserTie } from 'react-icons/fa'
import axios from 'axios'
import { API_URL } from '../config'

const MeetTutors = () => {
  const [tutors, setTutors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTutors()
  }, [])

  const fetchTutors = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/tutors`)
      setTutors(response.data)
    } catch (error) {
      console.error('Error fetching tutors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="meet-tutors" id="tutors">
        <div className="container">
          <h2 className="section-title">Meet Our Expert Tutors</h2>
          <div className="tutors-grid">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '300px', borderRadius: '20px' }}></div>)}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="meet-tutors" id="tutors">
      <div className="container">
        <h2 className="section-title">Meet Our Expert Tutors</h2>
        <p className="section-subtitle">Learn from industry professionals with years of teaching experience</p>
        <div className="tutors-grid">
          {tutors.map((tutor, index) => (
            <div key={index} className="tutor-card">
              <div className="tutor-image">
                {tutor.image_url && tutor.image_url.trim() !== '' ? (
                  <img src={tutor.image_url} alt={tutor.name} onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.parentElement.querySelector('.fallback-avatar').style.display = 'flex'
                  }} />
                ) : null}
                <div className="fallback-avatar" style={{ display: tutor.image_url ? 'none' : 'flex' }}>
                  <FaUserTie />
                </div>
              </div>
              <h3 className="tutor-name">{tutor.name}</h3>
              <p className="tutor-specialization">{tutor.specialization}</p>
              <p className="tutor-experience">📅 {tutor.experience}</p>
              <div className="tutor-social">
                <a href={`mailto:${tutor.email}`} aria-label="Email"><FaEnvelope /></a>
                <a href={tutor.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .meet-tutors {
          padding: 80px 0;
          background: var(--white);
        }
        
        body.dark .meet-tutors {
          background: var(--citsa-navy);
        }
        
        .tutors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }
        
        .tutor-card {
          background: var(--white);
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s;
          box-shadow: var(--shadow-md);
        }
        
        body.dark .tutor-card {
          background: var(--citsa-navy-light);
        }
        
        .tutor-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-xl);
        }
        
        .tutor-image {
          width: 120px;
          height: 120px;
          margin: 0 auto 1rem;
          border-radius: 50%;
          overflow: hidden;
          background: linear-gradient(135deg, var(--citsa-gold), var(--citsa-gold-dark));
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .tutor-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .fallback-avatar {
          font-size: 3rem;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          color: white;
        }
        
        .tutor-name {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--citsa-navy);
          margin-bottom: 0.5rem;
        }
        
        body.dark .tutor-name {
          color: white;
        }
        
        .tutor-specialization {
          color: var(--citsa-gold);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        
        .tutor-experience {
          font-size: 0.8rem;
          color: var(--text-light);
          margin-bottom: 1rem;
        }
        
        .tutor-social {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }
        
        .tutor-social a {
          color: var(--text-light);
          font-size: 1.2rem;
          transition: color 0.3s;
        }
        
        .tutor-social a:hover {
          color: var(--citsa-gold);
        }
        
        @media (max-width: 768px) {
          .meet-tutors {
            padding: 50px 0;
          }
          .tutors-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }
        }
      `}</style>
    </section>
  )
}

export default MeetTutors