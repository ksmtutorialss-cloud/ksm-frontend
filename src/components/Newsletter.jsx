import React, { useState } from 'react'
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (email) {
      console.log('Newsletter subscription:', email)
      setSubscribed(true)
      setEmail('')
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <section className="newsletter">
      <div className="container">
        <div className="newsletter-card">
          <FaEnvelope className="newsletter-icon" />
          <h2>Stay Updated</h2>
          <p>Subscribe to our newsletter for the latest updates, course announcements, and special offers.</p>
          <form onSubmit={handleSubmit} className="newsletter-form">
            <input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <button type="submit"><FaPaperPlane /> Subscribe</button>
          </form>
          {subscribed && <div className="success-message">✅ Successfully subscribed!</div>}
        </div>
      </div>

      <style>{`
        .newsletter {
          padding: 80px 0;
          background: linear-gradient(135deg, var(--citsa-navy), var(--citsa-navy-light));
        }
        
        .newsletter-card {
          text-align: center;
          max-width: 600px;
          margin: 0 auto;
          padding: 3rem;
          background: rgba(255,255,255,0.1);
          border-radius: 30px;
          backdrop-filter: blur(10px);
        }
        
        .newsletter-icon {
          font-size: 3rem;
          color: var(--citsa-gold);
          margin-bottom: 1rem;
        }
        
        .newsletter-card h2 {
          color: white;
          margin-bottom: 1rem;
        }
        
        .newsletter-card p {
          color: rgba(255,255,255,0.8);
          margin-bottom: 2rem;
        }
        
        .newsletter-form {
          display: flex;
          gap: 1rem;
        }
        
        .newsletter-form input {
          flex: 1;
          padding: 14px 20px;
          border: none;
          border-radius: 50px;
          font-size: 1rem;
        }
        
        .newsletter-form input:focus {
          outline: none;
        }
        
        .newsletter-form button {
          background: var(--citsa-gold);
          border: none;
          padding: 14px 28px;
          border-radius: 50px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        
        .newsletter-form button:hover {
          background: var(--citsa-gold-dark);
          transform: translateY(-2px);
        }
        
        .success-message {
          margin-top: 1rem;
          color: #10b981;
          background: rgba(255,255,255,0.9);
          padding: 8px;
          border-radius: 8px;
        }
        
        @media (max-width: 768px) {
          .newsletter {
            padding: 50px 0;
          }
          .newsletter-card {
            padding: 2rem;
            margin: 0 1rem;
          }
          .newsletter-form {
            flex-direction: column;
          }
          .newsletter-form button {
            justify-content: center;
          }
        }
      `}</style>
    </section>
  )
}

export default Newsletter