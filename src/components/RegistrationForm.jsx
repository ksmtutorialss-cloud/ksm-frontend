import React, { useState, useEffect } from 'react'
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaSpinner, FaEye, FaEyeSlash, FaEnvelope } from 'react-icons/fa'
import axios from 'axios'
import { API_URL } from '../config'
import BackToHome from './BackToHome'

const RegistrationForm = ({ onBack, deadline }) => {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [registrationData, setRegistrationData] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [whatsappLink, setWhatsappLink] = useState('')
  const [formData, setFormData] = useState({
    full_name: '',
    student_id: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    programme: 'Information Technology',
    level: '100',
    courses: []
  })
  
  const [errors, setErrors] = useState({
    full_name: '',
    student_id: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    courses: ''
  })

  // Fetch WhatsApp link from settings
  useEffect(() => {
    axios.get(`${API_URL}/api/settings`)
      .then(res => {
        if (res.data.whatsapp_link) {
          setWhatsappLink(res.data.whatsapp_link)
        }
      })
      .catch(err => console.error('Error fetching WhatsApp link:', err))
  }, [])

  const coursesByLevel = {
    100: ['Programming (C++)', 'Web Design', 'Database (MySQL)', 'Computer Fundamentals'],
    200: ['Java OOP', 'Networking', 'Data Structures', 'Software Engineering'],
    300: ['Unix Programming', 'AI & Machine Learning', 'Cybersecurity', 'Cloud Computing'],
    400: ['Mobile Development', 'Project Management', 'Research Methods', 'IT Entrepreneurship']
  }

  const validateFullName = (value) => {
    if (!value) return 'Full name is required'
    if (value.length < 3) return 'Name must be at least 3 characters'
    return ''
  }

  const validateStudentId = (value) => {
    if (!value) return 'Student ID is required'
    if (value.length < 5) return 'Valid Student ID is required'
    return ''
  }

  const validateEmail = (value) => {
    if (!value) return 'Email is required'
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/
    if (!emailRegex.test(value)) return 'Enter a valid email address'
    return ''
  }

  const validatePhone = (value) => {
    if (!value) return 'Phone number is required'
    const phoneRegex = /^[0-9+\s-]{10,15}$/
    if (!phoneRegex.test(value)) return 'Enter a valid phone number (e.g., 0241234567)'
    return ''
  }

  const validatePassword = (value) => {
    if (!value) return 'Password is required'
    if (value.length < 6) return 'Password must be at least 6 characters'
    return ''
  }

  const validateConfirmPassword = (value) => {
    if (!value) return 'Please confirm your password'
    if (value !== formData.password) return 'Passwords do not match'
    return ''
  }

  const validateStep = (currentStep) => {
    let isValid = true
    const newErrors = { ...errors }

    if (currentStep === 2) {
      const nameError = validateFullName(formData.full_name)
      const studentIdError = validateStudentId(formData.student_id)
      const emailError = validateEmail(formData.email)
      const phoneError = validatePhone(formData.phone)
      const passwordError = validatePassword(formData.password)
      const confirmError = validateConfirmPassword(formData.confirm_password)

      newErrors.full_name = nameError
      newErrors.student_id = studentIdError
      newErrors.email = emailError
      newErrors.phone = phoneError
      newErrors.password = passwordError
      newErrors.confirm_password = confirmError
      setErrors(newErrors)

      isValid = !nameError && !studentIdError && !emailError && !phoneError && !passwordError && !confirmError
    }

    if (currentStep === 3) {
      const coursesError = formData.courses.length === 0 ? 'Please select at least one course' : ''
      newErrors.courses = coursesError
      setErrors(newErrors)
      isValid = !coursesError
    }

    if (currentStep === 4) {
      const agreementCheckbox = document.getElementById('agree')
      isValid = agreementCheckbox ? agreementCheckbox.checked : false
      if (!isValid) {
        setError('Please agree to the terms and conditions')
      } else {
        setError('')
      }
    }

    return isValid
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
      setError('')
    }
  }

  const handleBack = () => {
    setStep(step - 1)
    setError('')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    
    let errorMessage = ''
    if (name === 'full_name') errorMessage = validateFullName(value)
    if (name === 'student_id') errorMessage = validateStudentId(value)
    if (name === 'email') errorMessage = validateEmail(value)
    if (name === 'phone') errorMessage = validatePhone(value)
    if (name === 'password') errorMessage = validatePassword(value)
    if (name === 'confirm_password') errorMessage = validateConfirmPassword(value)
    
    setErrors({ ...errors, [name]: errorMessage })
  }

  const handleCourseToggle = (course) => {
    const selected = [...formData.courses]
    if (selected.includes(course)) {
      setFormData({ ...formData, courses: selected.filter(c => c !== course) })
    } else {
      setFormData({ ...formData, courses: [...selected, course] })
    }
    setErrors({ ...errors, courses: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(2) || !validateStep(3)) {
      setError('Please fix all errors before submitting')
      setStep(2)
      return
    }
    
    if (formData.courses.length === 0) {
      setError('Please select at least one course')
      setStep(3)
      return
    }
    
    const agreeCheckbox = document.getElementById('agree')
    if (!agreeCheckbox || !agreeCheckbox.checked) {
      setError('Please agree to the terms and conditions')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(`${API_URL}/api/register`, {
        full_name: formData.full_name,
        student_id: formData.student_id,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        programme: formData.programme,
        level: parseInt(formData.level),
        courses: formData.courses
      })
      
      const data = {
        ...response.data,
        student_id: formData.student_id,
        programme: formData.programme,
        level: formData.level,
        phone: formData.phone,
        full_name: formData.full_name
      }
      
      setRegistrationData(data)
      setSubmitted(true)
    } catch (error) {
      console.error('Registration error:', error)
      if (error.response?.data?.detail === 'Student already registered') {
        setError('This Student ID is already registered. Please contact admin.')
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail)
      } else {
        setError('Registration failed. Please check your connection and try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = formData.courses.length * 120

  const joinWhatsApp = () => {
    if (whatsappLink) {
      window.open(whatsappLink, '_blank')
    } else {
      axios.get(`${API_URL}/api/settings`).then(res => {
        if (res.data.whatsapp_link) {
          window.open(res.data.whatsapp_link, '_blank')
        } else {
          alert('WhatsApp link not available. Please check your email for the invite link.')
        }
      }).catch(() => alert('Unable to load WhatsApp link. Please check your email.'))
    }
  }

  if (submitted && registrationData) {
    return (
      <div className="success-page">
        <BackToHome onBack={onBack} />
        <div className="container">
          <div className="success-card">
            <FaCheckCircle className="success-icon" />
            <h1>Registration Successful!</h1>
            <p>Congratulations {registrationData.full_name}!</p>
            
            <div className="email-notice">
              <FaEnvelope style={{ marginRight: '8px' }} />
              <strong>Check your email!</strong> A confirmation email with your Registration ID and login credentials has been sent to <strong>{registrationData.email}</strong>
              <br></br>
              📧 <strong>Didn't receive the email?</strong> Please check your <strong>Spam/Junk folder</strong>. If not found, contact us at <strong>ksm.tutorials@ucc.edu.gh</strong>.
            </div>
            
            <p className="info-note">📋 You can download your receipt from the Student Portal after payment is confirmed.</p>
            
            <div className="success-details">
              <div className="detail-item"><strong>Registration ID:</strong> {registrationData.registration_id}</div>
              <div className="detail-item"><strong>Email:</strong> {registrationData.email}</div>
              <div className="detail-item"><strong>Courses:</strong> {registrationData.courses.length}</div>
              <div className="detail-item"><strong>Total:</strong> GHS {registrationData.total}</div>
            </div>
            <div className="whatsapp-box">
              <div className="whatsapp-icon">💬</div>
              <h3>Join Our WhatsApp Group!</h3>
              <p>The WhatsApp group invite link has been sent to your <strong>email address</strong>. Please check your inbox (and spam folder).</p>
              <p className="warning">⚠️ ALL tutorial dates and venues will be announced in the WhatsApp group only!</p>
              <button 
                className="whatsapp-btn" 
                onClick={joinWhatsApp}
                style={{ 
                  color: '#000000 !important', 
                  backgroundColor: '#ffffff !important',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '40px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Join WhatsApp Group →
              </button>
            </div>
            <button className="back-home" onClick={onBack}>Back to Homepage</button>
          </div>
        </div>
        <style>{`
          .success-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a192f, #112240);
            padding: 100px 0;
          }
          .container { max-width: 600px; margin: 0 auto; padding: 0 20px; }
          .success-card {
            background: white;
            border-radius: 30px;
            padding: 3rem;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            position: relative;
          }
          body.dark .success-card { background: #1a365d; color: white; }
          .success-icon { font-size: 4rem; color: #10b981; margin-bottom: 1rem; margin-top: 20px; }
          .info-note { font-size: 0.8rem; color: #f5a623; margin-top: 5px; }
          .success-card h1 { color: #0a192f; margin-bottom: 0.5rem; }
          body.dark .success-card h1 { color: white; }
          .email-notice {
            background: #e3f2fd;
            padding: 12px;
            border-radius: 12px;
            margin: 15px 0;
            color: #1565c0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.9rem;
            flex-wrap: wrap;
            gap: 5px;
          }
          body.dark .email-notice { background: #0a192f; color: #90caf9; }
          .success-details {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 20px;
            margin: 1.5rem 0;
            text-align: left;
          }
          body.dark .success-details { background: #0a192f; }
          .detail-item { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .whatsapp-box {
            background: linear-gradient(135deg, #25D366, #128C7E);
            padding: 1.5rem;
            border-radius: 20px;
            margin: 1.5rem 0;
            color: #1a1a1a !important;
          }
          .whatsapp-box * {
            color: #1a1a1a !important;
          }
          .whatsapp-icon { font-size: 3rem; margin-bottom: 0.5rem; }
          .warning {
            font-size: 0.8rem;
            margin: 1rem 0;
            background: rgba(0,0,0,0.1);
            padding: 8px;
            border-radius: 8px;
          }
          .whatsapp-btn {
            background: white;
            border: none;
            padding: 10px 24px;
            border-radius: 40px;
            color: #000000 !important;
            font-weight: bold;
            cursor: pointer;
          }
          .whatsapp-btn:hover { transform: scale(1.05); }
          body.dark .whatsapp-box {
            color: #f1f5f9 !important;
          }
          body.dark .whatsapp-box * {
            color: #f1f5f9 !important;
          }
          body.dark .whatsapp-btn {
            color: #000000 !important;
            background: #ffffff;
          }
          .back-home {
            background: transparent;
            border: 2px solid #f5a623;
            padding: 12px 24px;
            border-radius: 40px;
            color: #f5a623;
            font-weight: 600;
            cursor: pointer;
          }
          .back-home:hover { background: #f5a623; color: white; }
          @media (max-width: 768px) {
            .success-card { padding: 1.5rem; }
            .success-icon { margin-top: 40px; }
            .email-notice { font-size: 0.8rem; }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="registration-page">
      <BackToHome onBack={onBack} />
      <div className="container">
        <div className="form-card">
          <div className="progress-bar">
            <div className="progress" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>
          <div className="step-indicators">
            <span className={step >= 1 ? 'active' : ''}>1. Welcome</span>
            <span className={step >= 2 ? 'active' : ''}>2. Personal Info</span>
            <span className={step >= 3 ? 'active' : ''}>3. Courses</span>
            <span className={step >= 4 ? 'active' : ''}>4. Confirm</span>
          </div>

          {error && <div className="error-alert">{error}</div>}

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="form-step">
                <h2>Welcome to KSM Tutorials</h2>
                <p>Designed to help UCC IT & CS students excel and secure straight A's.</p>
                <div className="info-box">
                  <h3>📌 Important Information</h3>
                  <ul>
                    <li> Open to IT and CS students only (Level 100-400)</li>
                    <li> Tutorial Duration: 1 month</li>
                    <li> No payment required for application</li>
                    <li> Each course: GHS 120</li>
                    <li> Full payment at first class meeting</li>
                  </ul>
                </div>
                <div className="deadline-notice">
                  ⚠️ Registration closes: {deadline ? new Date(deadline).toLocaleString() : 'Loading...'}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-step">
                <h2>Personal Information</h2>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleInputChange} className={errors.full_name ? 'error' : ''} placeholder="Enter your full name" />
                  {errors.full_name && <span className="error-text">{errors.full_name}</span>}
                </div>
                
                <div className="form-group">
                  <label>Student ID Number *</label>
                  <input type="text" name="student_id" value={formData.student_id} onChange={handleInputChange} className={errors.student_id ? 'error' : ''} placeholder="e.g., UCC/IT/24/0001" />
                  {errors.student_id && <span className="error-text">{errors.student_id}</span>}
                </div>
                
                <div className="form-group">
                  <label>Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleInputChange} className={errors.email ? 'error' : ''} placeholder="example@stu.ucc.edu.gh" />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label>Phone/WhatsApp Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className={errors.phone ? 'error' : ''} placeholder="e.g., 0241234567" />
                  <small>This number will receive the WhatsApp group invite!</small>
                  {errors.phone && <span className="error-text">{errors.phone}</span>}
                </div>
                
                <div className="form-group">
                  <label>Create Password *</label>
                  <div className="password-input-wrapper">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} className={errors.password ? 'error' : ''} placeholder="Minimum 6 characters" />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.password && <span className="error-text">{errors.password}</span>}
                </div>
                
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <div className="password-input-wrapper">
                    <input type={showConfirmPassword ? 'text' : 'password'} name="confirm_password" value={formData.confirm_password} onChange={handleInputChange} className={errors.confirm_password ? 'error' : ''} placeholder="Re-enter your password" />
                    <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Programme *</label>
                    <select name="programme" value={formData.programme} onChange={handleInputChange}>
                      <option>Information Technology</option>
                      <option>Computer Science</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Level *</label>
                    <select name="level" value={formData.level} onChange={handleInputChange}>
                      <option value="100">Level 100</option>
                      <option value="200">Level 200</option>
                      <option value="300">Level 300</option>
                      <option value="400">Level 400</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="form-step">
                <h2>Select Your Courses</h2>
                <p>Choose the courses you want to register for (you can select multiple)</p>
                <div className="courses-list">
                  {coursesByLevel[formData.level].map(course => (
                    <label key={course} className={`course-option ${formData.courses.includes(course) ? 'selected' : ''}`}>
                      <input type="checkbox" checked={formData.courses.includes(course)} onChange={() => handleCourseToggle(course)} />
                      <span>{course}</span>
                      <span className="price">GHS 120</span>
                    </label>
                  ))}
                </div>
                {errors.courses && <div className="error-text courses-error">{errors.courses}</div>}
                {formData.courses.length > 0 && (
                  <div className="total-amount">
                    <strong>Total: GHS {totalAmount}</strong> ({formData.courses.length} courses)
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="form-step">
                <h2>Confirm Your Registration</h2>
                <div className="summary-box">
                  <h3>Personal Details</h3>
                  <p><strong>Name:</strong> {formData.full_name}</p>
                  <p><strong>Student ID:</strong> {formData.student_id}</p>
                  <p><strong>Email:</strong> {formData.email}</p>
                  <p><strong>Phone:</strong> {formData.phone}</p>
                  <p><strong>Programme:</strong> {formData.programme}</p>
                  <p><strong>Level:</strong> {formData.level}</p>
                  
                  <h3>Selected Courses</h3>
                  {formData.courses.map(course => (
                    <p key={course}>• {course} - GHS 120</p>
                  ))}
                  <p className="total"><strong>Total: GHS {totalAmount}</strong></p>
                </div>
                <div className="agreement">
                  <input type="checkbox" id="agree" required />
                  <label htmlFor="agree">
                    I confirm that all information is accurate and I agree to pay GHS {totalAmount} at the first class meeting.
                  </label>
                </div>
              </div>
            )}

            <div className="form-buttons">
              {step > 1 && (
                <button type="button" className="btn-back" onClick={handleBack}>
                  <FaArrowLeft /> Back
                </button>
              )}
              {step < 4 ? (
                <button type="button" className="btn-next" onClick={handleNext}>
                  Next <FaArrowRight />
                </button>
              ) : (
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? <><FaSpinner className="spinning" /> Submitting...</> : 'Submit Registration'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .registration-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a192f, #112240);
          padding: 100px 0;
        }
        .container { max-width: 800px; margin: 0 auto; padding: 0 20px; }
        .form-card {
          background: white;
          border-radius: 30px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          position: relative;
        }
        body.dark .form-card { background: #1a365d; color: white; }
        .progress-bar { height: 4px; background: #e2e8f0; border-radius: 2px; margin-bottom: 1rem; }
        .progress { height: 100%; background: #f5a623; border-radius: 2px; transition: width 0.3s; }
        .step-indicators { display: flex; justify-content: space-between; margin-bottom: 2rem; }
        .step-indicators span { color: #94a3b8; font-size: 0.8rem; }
        .step-indicators span.active { color: #f5a623; font-weight: bold; }
        .error-alert { background: #ffebee; color: #c62828; padding: 12px; border-radius: 12px; margin-bottom: 1rem; text-align: center; }
        .form-step h2 { color: #0a192f; margin-bottom: 1rem; }
        body.dark .form-step h2 { color: white; }
        .info-box, .summary-box { background: #f8f9fa; padding: 1.5rem; border-radius: 20px; margin: 1.5rem 0; }
        body.dark .info-box, body.dark .summary-box { background: #0a192f; }
        .info-box ul { margin-top: 1rem; padding-left: 1.5rem; }
        .info-box li { margin: 8px 0; }
        .deadline-notice { background: #ffebee; padding: 1rem; border-radius: 12px; text-align: center; color: #c62828; font-weight: bold; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
        .form-group input, .form-group select {
          width: 100%;
          padding: 12px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          color: #1e293b;
          font-size: 1rem;
        }
        .form-group input.error { border-color: #ef4444; background: #ffebee; }
        body.dark .form-group input, body.dark .form-group select { background: #0a192f; border-color: #334155; color: white; }
        .error-text { display: block; color: #ef4444; font-size: 0.75rem; margin-top: 5px; }
        .password-input-wrapper { position: relative; }
        .password-input-wrapper input { padding-right: 45px; }
        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          font-size: 1rem;
        }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .courses-list { display: flex; flex-direction: column; gap: 10px; margin: 1.5rem 0; }
        .course-option {
          display: flex;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
        }
        .course-option:hover { border-color: #f5a623; background: rgba(245, 166, 35, 0.05); }
        .course-option.selected { border-color: #f5a623; background: rgba(245, 166, 35, 0.1); }
        .course-option input { margin-right: 1rem; width: auto; }
        .course-option span { flex: 1; }
        .price { color: #f5a623; font-weight: bold; }
        .total-amount { text-align: right; font-size: 1.2rem; padding-top: 1rem; border-top: 2px solid #e2e8f0; color: #f5a623; }
        .summary-box h3 { margin: 1rem 0 0.5rem; color: #0a192f; }
        body.dark .summary-box h3 { color: white; }
        .summary-box h3:first-child { margin-top: 0; }
        .summary-box p { margin: 5px 0; }
        .summary-box .total { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 1.1rem; }
        .agreement { margin: 1.5rem 0; display: flex; align-items: center; gap: 10px; }
        .form-buttons { display: flex; justify-content: space-between; margin-top: 2rem; }
        .btn-back, .btn-next, .btn-submit {
          padding: 12px 28px;
          border: none;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s;
        }
        .btn-back { background: #e2e8f0; color: #333; }
        .btn-next, .btn-submit { background: linear-gradient(135deg, #f5a623, #e69500); color: white; }
        .btn-next:hover, .btn-submit:hover { transform: translateY(-2px); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .registration-page { padding: 80px 0; }
          .form-card { padding: 1.5rem; margin: 1rem; }
          .form-row { grid-template-columns: 1fr; }
          .step-indicators span { font-size: 0.65rem; }
          .form-buttons { flex-direction: column; gap: 1rem; }
          .btn-back, .btn-next, .btn-submit { justify-content: center; }
        }
      `}</style>
    </div>
  )
}

export default RegistrationForm
