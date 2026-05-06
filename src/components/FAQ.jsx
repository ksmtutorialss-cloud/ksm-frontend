import React, { useState } from 'react'
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null)

  const faqs = [
    { question: 'How do I register for courses?', answer: 'Click the "Register Now" button on the homepage, fill in your personal information, select your desired courses, create a password, and submit the form. You will receive a confirmation email with your Registration ID.' },
    { question: 'How do I access the Student Portal?', answer: 'Click "Student Portal" in the navbar, then enter your Registration ID and the password you created during registration.' },
    { question: 'When do I need to pay?', answer: 'No payment is required during registration. You will pay GHS 120 per course at the first class meeting.' },
    { question: 'How long is the tutorial program?', answer: 'The tutorial program runs for 1 month, with sessions held on weekends (Saturdays and Sundays).' },
    { question: 'Will I get a WhatsApp group invite?', answer: 'Yes! After successful registration, you will receive a WhatsApp group invite link via SMS to the phone number you provided.' },
    { question: 'What if I miss a class?', answer: 'Recordings of sessions will be shared in the WhatsApp group. You can catch up at any time.' },
    { question: 'Are the courses recognized by UCC?', answer: 'KSM Tutorials is an independent tutorial program designed to complement UCC\'s curriculum and help students excel in their exams.' }
  ]

  return (
    <section className="faq" id="faq">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <p className="section-subtitle">Got questions? We've got answers</p>
        <div className="faq-grid">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button className="faq-question" onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                <span>{faq.question}</span>
                {openIndex === index ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .faq {
          padding: 80px 0;
          background: var(--white);
        }
        
        body.dark .faq {
          background: var(--citsa-navy);
        }
        
        .faq-grid {
          max-width: 800px;
          margin: 0 auto;
        }
        
        .faq-item {
          margin-bottom: 1rem;
          border: 1px solid var(--gray);
          border-radius: 16px;
          overflow: hidden;
        }
        
        body.dark .faq-item {
          border-color: rgba(255,255,255,0.1);
        }
        
        .faq-question {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.2rem 1.5rem;
          background: var(--white);
          border: none;
          font-size: 1rem;
          font-weight: 600;
          color: var(--citsa-navy);
          cursor: pointer;
          transition: all 0.3s;
        }
        
        body.dark .faq-question {
          background: var(--citsa-navy-light);
          color: white;
        }
        
        .faq-question:hover {
          background: var(--gray-light);
        }
        
        body.dark .faq-question:hover {
          background: var(--citsa-navy-lighter);
        }
        
        .faq-answer {
          padding: 1.2rem 1.5rem;
          background: var(--gray-light);
          border-top: 1px solid var(--gray);
        }
        
        body.dark .faq-answer {
          background: var(--citsa-navy-light);
          border-top-color: rgba(255,255,255,0.1);
        }
        
        .faq-answer p {
          color: var(--text-light);
          line-height: 1.6;
        }
        
        @media (max-width: 768px) {
          .faq {
            padding: 50px 0;
          }
          .faq-question {
            padding: 1rem;
            font-size: 0.9rem;
          }
        }
      `}</style>
    </section>
  )
}

export default FAQ