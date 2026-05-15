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
  
  // State for courses fetched from API
  const [availableCourses, setAvailableCourses] = useState([])
  const [coursesLoading, setCoursesLoading] = useState(false)

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

  // Fetch WhatsApp link and courses on mount, and refetch when level changes
  useEffect(() => {
    axios.get(`${API_URL}/api/settings`)
      .then(res => {
        if (res.data.whatsapp_link) {
          setWhatsappLink(res.data.whatsapp_link)
        }
      })
      .catch(err => console.error('Error fetching WhatsApp link:', err))
  }, [])

  // Fetch courses when level changes
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true)
      try {
        const response = await axios.get(`${API_URL}/api/courses?level=${formData.level}`)
        setAvailableCourses(response.data)
      } catch (err) {
        console.error('Error fetching courses:', err)
        setAvailableCourses([])
      } finally {
        setCoursesLoading(false)
      }
    }
    fetchCourses()
  }, [formData.level])  // Re-fetch when level changes

  // The hard-coded coursesByLevel is REMOVED – we now use availableCourses

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

  const handleCourseToggle = (courseId, courseName) => {
    const selectedCourses = [...formData.courses]
    if (selectedCourses.includes(courseName)) {
      setFormData({ ...formData, courses: selectedCourses.filter(c => c !== courseName) })
    } else {
      setFormData({ ...formData, courses: [...selectedCourses, courseName] })
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

  // Success page (unchanged, but keep as is)
  if (submitted && registrationData) {
    return (
      <div className="success-page">
        <BackToHome onBack={onBack} />
        <div className="container">
          <div className="success-card">
            <FaCheckCircle className="success-icon" />
            <h1>Registration Successful!</h1>
            <p>Congratulations {registrationData.full_name}!</p>
            
            <div className="email-notice" style={{ textAlign: 'left' }}>
              <FaEnvelope style={{ marginRight: '8px' }} />
              <strong>Check your email!</strong> A confirmation email with your Registration ID and login credentials has been sent to <strong>{registrationData.email}</strong>
              <br />
              📧 <strong>Didn't receive the email?</strong> Please check your <strong>Spam/Junk folder</strong>. If not found, contact us at <strong>ksm.tutorials@ucc.edu.gh</strong>.
            </div>
            
            <div className="spam-notice" style={{
              background: '#fff3e0',
              padding: '12px',
              borderRadius: '10px',
              margin: '15px 0',
              fontSize: '0.85rem',
              textAlign: 'center'
            }}>
              📧 <strong>Didn't receive the email?</strong> Please check your <strong>Spam/Junk folder</strong>. 
              If not found, contact us at <strong>ksm.tutorials@ucc.edu.gh</strong>.
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
              <button className="whatsapp-btn" onClick={joinWhatsApp}>
                Join WhatsApp Group →
              </button>
            </div>
            <button className="back-home" onClick={onBack}>Back to Homepage</button>
          </div>
        </div>
        <style>{`
          /* Keep all existing styles for success page – unchanged */
        `}</style>
      </div>
    )
  }

  // Registration form steps
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
                    <li>Open to IT and CS students only (Level 100-400)</li>
                    <li>Tutorial Duration: 1 month</li>
                    <li>No payment required for application</li>
                    <li>Each course: GHS 120</li>
                    <li>Full payment at first class meeting</li>
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
                  {coursesLoading ? (
                    <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }}></div>
                  ) : availableCourses.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                      No courses available for this level yet. Please contact admin.
                    </div>
                  ) : (
                    availableCourses.map(course => (
                      <label key={course.id} className={`course-option ${formData.courses.includes(course.name) ? 'selected' : ''}`}>
                        <input type="checkbox" checked={formData.courses.includes(course.name)} onChange={() => handleCourseToggle(course.id, course.name)} />
                        <span>{course.name}</span>
                        <span className="price">GHS {course.price}</span>
                      </label>
                    ))
                  )}
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
        /* Keep all existing styles for registration page – unchanged */
        .registration-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a192f, #112240);
          padding: 100px 0;
        }
        /* ... (rest of your styles – copy from your original file) ... */
      `}</style>
    </div>
  )
}

export default RegistrationForm
