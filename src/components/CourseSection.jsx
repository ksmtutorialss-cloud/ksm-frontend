import React, { useState, useEffect } from 'react'
import { FaCode, FaLaptopCode, FaDatabase, FaNetworkWired, FaCloud, FaShieldAlt, FaMobileAlt, FaBrain, FaLinux, FaChartBar, FaBook } from 'react-icons/fa'
import axios from 'axios'
import { API_URL } from '../config'

const CourseSection = ({ onRegister }) => {
  const [activeLevel, setActiveLevel] = useState(100)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  const levels = [
    { id: 100, name: 'Level 100', icon: '📘' },
    { id: 200, name: 'Level 200', icon: '☕' },
    { id: 300, name: 'Level 300', icon: '🐧' },
    { id: 400, name: 'Level 400', icon: '📱' }
  ]

  const getCourseIconByName = (iconName) => {
    const iconMap = {
      'FaCode': <FaCode />,
      'FaLaptopCode': <FaLaptopCode />,
      'FaDatabase': <FaDatabase />,
      'FaNetworkWired': <FaNetworkWired />,
      'FaCloud': <FaCloud />,
      'FaShieldAlt': <FaShieldAlt />,
      'FaMobileAlt': <FaMobileAlt />,
      'FaBrain': <FaBrain />,
      'FaLinux': <FaLinux />,
      'FaChartBar': <FaChartBar />,
      'FaBook': <FaBook />
    }
    return iconMap[iconName] || <FaCode />
  }

  useEffect(() => {
    fetchCourses(activeLevel)
  }, [activeLevel])

  const fetchCourses = async (level) => {
    setLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/courses?level=${level}`)
      setCourses(response.data)
    } catch (error) {
      console.error('Error fetching courses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyNow = () => {
    if (onRegister) {
      onRegister()
    } else {
      const registerBtn = document.querySelector('[data-register-btn="true"]')
      if (registerBtn) {
        registerBtn.click()
      }
    }
  }

  if (loading) {
    return (
      <section className="courses" id="courses">
        <div className="container">
          <h2 className="section-title">Explore Our Courses</h2>
          <p className="section-subtitle">Choose your level and start your journey to straight A's</p>
          <div className="courses-grid">
            {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: '280px', borderRadius: '20px' }}></div>)}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="courses" id="courses">
      <div className="container">
        <h2 className="section-title">Explore Our Courses</h2>
        <p className="section-subtitle">Choose your level and start your journey to straight A's</p>

        <div className="level-tabs">
          {levels.map(level => (
            <button
              key={level.id}
              className={`level-tab ${activeLevel === level.id ? 'active' : ''}`}
              onClick={() => setActiveLevel(level.id)}
            >
              <span className="level-name">{level.name}</span>
            </button>
          ))}
        </div>

        <div className="courses-grid">
          {courses.map((course, index) => (
            <div key={index} className="course-card">
              <div className="course-level-badge">Level {course.level}</div>
              <div className="course-icon">{getCourseIconByName(course.icon || 'FaCode')}</div>
              <h3 className="course-title">{course.name}</h3>
              <div className="course-instructor">👨‍🏫 {course.instructor}</div>
              <p className="course-description">{course.description || 'Comprehensive course covering all essential topics for this subject area.'}</p>
              <div className="course-footer">
                <div className="course-price">💰 GHS {course.price}</div>
                <button className="course-btn" onClick={handleApplyNow}>Apply Now →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .courses { padding: 80px 0; background: var(--white); }
        body.dark .courses { background: var(--citsa-navy); }
        .level-tabs { display: flex; justify-content: center; gap: 1rem; margin-bottom: 3rem; flex-wrap: wrap; }
        .level-tab {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          border: none;
          background: var(--gray-light);
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          color: var(--text-dark);
        }
        body.dark .level-tab {
          background: #1e293b;
          color: #64748b;
          border: 1px solid #334155;
        }
        body.dark .level-tab:hover {
          background: #334155;
          color: #cbd5e1;
          border-color: #475569;
        }
        .level-tab.active {
          background: linear-gradient(135deg, #f5a623, #e69500);
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(245, 166, 35, 0.4);
          border: none;
        }
        body.dark .level-tab.active {
          background: linear-gradient(135deg, #f5a623, #e69500);
          color: #0a192f;
          font-weight: 700;
          transform: translateY(-3px);
          box-shadow: 0 0 0 2px rgba(245, 166, 35, 0.5), 0 8px 20px rgba(245, 166, 35, 0.5);
          text-shadow: 0 1px 0 rgba(255,255,255,0.3);
        }
        .courses-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
        .course-card {
          background: var(--white);
          border-radius: 20px;
          padding: 1.5rem;
          transition: all 0.3s;
          box-shadow: var(--shadow-md);
          position: relative;
          border: 1px solid rgba(0,0,0,0.05);
        }
        body.dark .course-card { background: var(--citsa-navy-light); border-color: rgba(255,255,255,0.05); }
        .course-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-xl); }
        .course-level-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--citsa-gold);
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .course-icon { font-size: 2rem; color: var(--citsa-gold); margin-bottom: 1rem; }
        .course-title { font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--citsa-navy); }
        body.dark .course-title { color: white; }
        .course-instructor { font-size: 0.8rem; color: var(--text-light); margin-bottom: 1rem; }
        .course-description { font-size: 0.85rem; color: var(--text-light); line-height: 1.5; margin-bottom: 1rem; }
        .course-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--gray); }
        .course-price { font-weight: 700; color: var(--citsa-gold); }
        .course-btn {
          background: transparent;
          border: 2px solid var(--citsa-gold);
          padding: 8px 20px;
          border-radius: 40px;
          color: var(--citsa-gold);
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }
        .course-btn:hover { background: var(--citsa-gold); color: white; }
        @media (max-width: 768px) {
          .courses { padding: 50px 0; }
          .courses-grid { grid-template-columns: 1fr; }
          .level-tab { padding: 8px 20px; font-size: 0.9rem; }
        }
      `}</style>
    </section>
  )
}

export default CourseSection