import React from 'react'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaWhatsapp, FaGraduationCap } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <footer className="footer" id="contact">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-section">
            <div className="footer-logo">
              <FaGraduationCap />
              <span>KSM Tutorials</span>
            </div>
            <p>Empowering UCC IT & CS students to achieve straight A's through quality tutorial sessions and practical training.</p>
            <div className="social-links">
              <a href="#" aria-label="Facebook"><FaFacebook /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="WhatsApp"><FaWhatsapp /></a>
            </div>
          </div>
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Home</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('courses'); }}>Courses</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('tutors'); }}>Tutors</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('reviews'); }}>Reviews</a></li>
              <li><a href="#" onClick={(e) => { e.preventDefault(); scrollToSection('faq'); }}>FAQ</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3>Contact Info</h3>
            <p><FaEnvelope /> ksm.tutorials@ucc.edu.gh</p>
            <p><FaPhone /> +233 24 123 4567</p>
            <p><FaMapMarkerAlt /> UCC IT Department, Room 305</p>
          </div>
          <div className="footer-section">
            <h3>Office Hours</h3>
            <p>Monday - Friday: 9AM - 5PM</p>
            <p>Saturday: 9AM - 2PM</p>
            <p>Sunday: Closed</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {currentYear} KSM Tutorials. All rights reserved. | University of Cape Coast</p>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--citsa-navy);
          color: white;
          padding: 3rem 0 1rem;
        }
        
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }
        
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        
        .footer-logo svg {
          color: var(--citsa-gold);
          font-size: 1.8rem;
        }
        
        .footer-section p {
          line-height: 1.6;
          opacity: 0.8;
        }
        
        .footer-section p svg {
          margin-right: 8px;
          color: var(--citsa-gold);
        }
        
        .social-links {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .social-links a {
          color: white;
          font-size: 1.2rem;
          transition: color 0.3s;
        }
        
        .social-links a:hover {
          color: var(--citsa-gold);
        }
        
        .footer-section h3 {
          margin-bottom: 1rem;
          font-size: 1.1rem;
          position: relative;
          display: inline-block;
        }
        
        .footer-section h3::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 40px;
          height: 2px;
          background: var(--citsa-gold);
        }
        
        .footer-section ul {
          list-style: none;
        }
        
        .footer-section ul li {
          margin-bottom: 0.5rem;
        }
        
        .footer-section ul li a {
          color: white;
          text-decoration: none;
          opacity: 0.8;
          transition: opacity 0.3s;
          cursor: pointer;
        }
        
        .footer-section ul li a:hover {
          opacity: 1;
          color: var(--citsa-gold);
        }
        
        .footer-bottom {
          text-align: center;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255,255,255,0.1);
          font-size: 0.8rem;
          opacity: 0.7;
        }
        
        @media (max-width: 768px) {
          .footer {
            padding: 2rem 0 1rem;
          }
          .footer-grid {
            text-align: center;
            gap: 1.5rem;
          }
          .social-links {
            justify-content: center;
          }
          .footer-section h3::after {
            left: 50%;
            transform: translateX(-50%);
          }
          .footer-section p svg {
            margin-right: 5px;
          }
        }
      `}</style>
    </footer>
  )
}

export default Footer