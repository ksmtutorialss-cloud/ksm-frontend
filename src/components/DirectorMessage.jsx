import React, { useState, useEffect } from 'react'
import { FaQuoteLeft } from 'react-icons/fa'
import axios from 'axios'
import { API_URL } from '../config'

const DirectorMessage = () => {
  const [message, setMessage] = useState({ content: '', signature: '' })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessage()
  }, [])

  const fetchMessage = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/director-message`)
      setMessage(response.data)
    } catch (error) {
      console.error('Error fetching director message:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="skeleton" style={{ height: '300px', borderRadius: '30px', margin: '40px 0' }}></div>
  }

  return (
    <section className="director-message">
      <div className="container">
        <div className="message-card">
          <FaQuoteLeft className="quote-icon" />
          <h2 className="section-title">Director's Message</h2>
          <div className="title-underline"></div>
          <div className="message-content">
            <p>{message.content || 'Welcome to KSM Tutorials. We are committed to helping you achieve academic excellence.'}</p>
            <div className="signature">
              <strong>{message.signature || 'Mr. KSM'}</strong>
              <span>Founder & Lead Tutor, KSM Tutorials</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .director-message {
          padding: 80px 0;
          background: var(--gray-light);
        }
        
        body.dark .director-message {
          background: var(--citsa-navy-light);
        }
        
        .message-card {
          background: var(--white);
          border-radius: 30px;
          padding: 3rem;
          box-shadow: var(--shadow-xl);
          position: relative;
          overflow: hidden;
        }
        
        body.dark .message-card {
          background: var(--citsa-navy);
        }
        
        .quote-icon {
          font-size: 4rem;
          color: var(--citsa-gold);
          opacity: 0.3;
          position: absolute;
          top: 2rem;
          left: 2rem;
        }
        
        .message-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
        }
        
        .message-content p {
          font-size: 1.1rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          color: var(--text-dark);
        }
        
        body.dark .message-content p {
          color: var(--text-light);
        }
        
        .signature {
          margin-top: 2rem;
          padding-top: 1rem;
          border-top: 2px solid var(--citsa-gold);
          display: inline-block;
        }
        
        .signature strong {
          display: block;
          font-size: 1.2rem;
          color: var(--citsa-navy);
        }
        
        body.dark .signature strong {
          color: white;
        }
        
        .signature span {
          font-size: 0.9rem;
          color: var(--text-light);
        }
        
        @media (max-width: 768px) {
          .director-message {
            padding: 50px 0;
          }
          .message-card {
            padding: 2rem;
          }
          .quote-icon {
            font-size: 3rem;
            top: 1rem;
            left: 1rem;
          }
        }
      `}</style>
    </section>
  )
}

export default DirectorMessage