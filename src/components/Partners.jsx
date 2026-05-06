import React, { useState, useEffect } from 'react'
import { FaGoogle, FaMicrosoft, FaAmazon, FaApple, FaFacebook, FaTwitter, FaCode } from 'react-icons/fa'
import axios from 'axios'
import { API_URL } from '../config'

const iconMap = {
  FaGoogle: <FaGoogle />,
  FaMicrosoft: <FaMicrosoft />,
  FaAmazon: <FaAmazon />,
  FaApple: <FaApple />,
  FaFacebook: <FaFacebook />,
  FaTwitter: <FaTwitter />,
  FaCode: <FaCode />
}

const Partners = () => {
  const [partners, setPartners] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPartners()
  }, [])

  const fetchPartners = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/partners`)
      setPartners(response.data)
    } catch (error) {
      console.error('Error fetching partners:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="partners">
        <div className="container">
          <h2 className="section-title">Trusted By Industry Leaders</h2>
          <div className="partners-grid">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ width: '80px', height: '80px', borderRadius: '50%' }}></div>)}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="partners">
      <div className="container">
        <h2 className="section-title">Trusted By Industry Leaders</h2>
        <p className="section-subtitle">Our students are recruited by top technology companies</p>
        <div className="partners-grid">
          {partners.map((partner, index) => (
            <a key={index} href={partner.link} target="_blank" rel="noopener noreferrer" className="partner-logo" style={{ '--partner-color': partner.color }}>
              {iconMap[partner.icon] || <FaCode />}
              <span>{partner.name}</span>
            </a>
          ))}
        </div>
      </div>

      <style>{`
        .partners {
          padding: 60px 0;
          background: var(--white);
        }
        
        body.dark .partners {
          background: var(--citsa-navy);
        }
        
        .partners-grid {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-wrap: wrap;
          gap: 3rem;
        }
        
        .partner-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          font-size: 2rem;
          color: var(--text-light);
          transition: all 0.3s;
          cursor: pointer;
          text-decoration: none;
        }
        
        .partner-logo:hover {
          color: var(--partner-color, var(--citsa-gold));
          transform: translateY(-3px);
        }
        
        .partner-logo span {
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        @media (max-width: 768px) {
          .partners {
            padding: 40px 0;
          }
          .partners-grid {
            gap: 1.5rem;
          }
          .partner-logo {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </section>
  )
}

export default Partners