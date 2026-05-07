import React, { useState, useEffect } from 'react'
import { 
  FaSearch, FaDownload, FaCheckCircle, FaClock, FaPrint, FaSpinner, 
  FaEye, FaEyeSlash, FaCertificate, FaEdit, FaSave, FaTimes, FaUser, 
  FaEnvelope, FaPhone, FaIdCard, FaBookOpen, FaMoneyBillWave, FaTicketAlt, 
  FaPaperPlane, FaComments, FaReply, FaPhoneAlt, FaWhatsapp, FaKey
} from 'react-icons/fa'
import axios from 'axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { API_URL } from '../config'
import BackToHome from './BackToHome'

const StudentPortal = ({ onBack }) => {
  const [registrationId, setRegistrationId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loggedIn, setLoggedIn] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [certificateLoading, setCertificateLoading] = useState(false)
  const [receiptLoading, setReceiptLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [tickets, setTickets] = useState([])
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' })
  const [ticketLoading, setTicketLoading] = useState(false)
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' })
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    const savedStudent = localStorage.getItem('student_session')
    if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent)
        setStudent(parsed)
        setEditForm(parsed)
        setLoggedIn(true)
        fetchTickets(parsed.id)
      } catch (e) {
        console.error('Error loading session:', e)
      }
    }
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/contact`)
      setContactInfo(response.data)
    } catch (error) {
      console.error('Error fetching contact info:', error)
    }
  }

  const fetchTickets = async (studentId) => {
    try {
      const response = await axios.get(`${API_URL}/api/student/tickets/${studentId}`)
      setTickets(response.data)
    } catch (error) {
      console.error('Error fetching tickets:', error)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!registrationId || !password) {
      setError('Please enter both Registration ID and Password')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post(`${API_URL}/api/student/login`, {
        registration_id: registrationId,
        password: password
      })
      setStudent(response.data)
      setEditForm(response.data)
      setLoggedIn(true)
      localStorage.setItem('student_session', JSON.stringify(response.data))
      fetchTickets(response.data.id)
    } catch (err) {
      console.error('Login error:', err)
      setError(err.response?.data?.detail || 'Invalid Registration ID or Password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('student_session')
    setLoggedIn(false)
    setStudent(null)
    setRegistrationId('')
    setPassword('')
    setEditing(false)
    setActiveTab('dashboard')
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const requestedData = {
        full_name: editForm.full_name,
        student_id: editForm.student_id,
        email: editForm.email,
        phone: editForm.phone,
        programme: editForm.programme,
        level: editForm.level
      }
      
      await axios.post(`${API_URL}/api/student/request-edit/${student.id}`, {
        requested_data: requestedData
      })
      
      alert('Profile edit request sent to admin. You will be notified when approved.')
      setEditing(false)
    } catch (err) {
      setError('Failed to send edit request')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('New passwords do not match')
      return
    }
    if (passwordForm.new_password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }
    
    setPasswordLoading(true)
    try {
      await axios.post(`${API_URL}/api/student/change-password`, {
        student_id: student.id,
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      })
      alert('Password changed successfully! Please login again.')
      setShowChangePassword(false)
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
      handleLogout()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  const generateReceiptPDF = () => {
    const doc = new jsPDF()
    const now = new Date()
    
    doc.setDrawColor(245, 166, 35)
    doc.setLineWidth(1)
    doc.rect(10, 10, 190, 277)
    
    doc.setFillColor(10, 25, 47)
    doc.rect(10, 10, 190, 50, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('KSM TUTORIALS', 105, 30, { align: 'center' })
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('University of Cape Coast', 105, 42, { align: 'center' })
    doc.text('PAYMENT RECEIPT', 105, 54, { align: 'center' })
    
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('STUDENT INFORMATION', 20, 75)
    doc.setDrawColor(245, 166, 35)
    doc.line(20, 80, 100, 80)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Registration ID: ${student.reg_id}`, 20, 92)
    doc.text(`Name: ${student.full_name}`, 20, 102)
    doc.text(`Student ID: ${student.student_id}`, 20, 112)
    doc.text(`Programme: ${student.programme}`, 20, 122)
    doc.text(`Level: ${student.level}`, 20, 132)
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('PAYMENT INFORMATION', 110, 75)
    doc.line(110, 80, 190, 80)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Payment Date: ${now.toLocaleDateString()}`, 110, 92)
    doc.text(`Status: PAID`, 110, 102)
    doc.setTextColor(16, 185, 129)
    doc.text(`✓ Payment Confirmed`, 110, 112)
    doc.setTextColor(0, 0, 0)
    doc.text(`Email: ${student.email}`, 110, 122)
    doc.text(`Phone: ${student.phone}`, 110, 132)
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('REGISTERED COURSES', 20, 155)
    doc.setDrawColor(245, 166, 35)
    doc.line(20, 160, 190, 160)
    
    const tableData = student.courses.map(course => [course, 'GHS 120.00'])
    
    autoTable(doc, {
      startY: 165,
      head: [['Course Name', 'Fee (GHS)']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [245, 166, 35], textColor: [255, 255, 255], fontStyle: 'bold' },
      margin: { left: 20 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 50, halign: 'right' }
      }
    })
    
    const finalY = doc.lastAutoTable.finalY + 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(245, 166, 35)
    doc.text(`TOTAL AMOUNT: GHS ${student.total_amount}.00`, 190, finalY, { align: 'right' })
    
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(`Generated on: ${now.toLocaleString()}`, 105, 275, { align: 'center' })
    doc.text(`For inquiries: ${contactInfo.email} | ${contactInfo.phone}`, 105, 282, { align: 'center' })
    
    doc.save(`Receipt_${student.reg_id}.pdf`)
  }

  const generateCertificatePDF = () => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    const now = new Date()
    
    doc.setFillColor(255, 248, 240)
    doc.rect(0, 0, 297, 210, 'F')
    
    doc.setDrawColor(212, 175, 55)
    doc.setLineWidth(2)
    doc.rect(8, 8, 281, 194)
    
    doc.setDrawColor(212, 175, 55)
    doc.setLineWidth(0.5)
    doc.rect(12, 12, 273, 186)
    
    doc.setFillColor(212, 175, 55)
    doc.rect(8, 8, 20, 3, 'F')
    doc.rect(8, 8, 3, 20, 'F')
    doc.rect(269, 8, 20, 3, 'F')
    doc.rect(286, 8, 3, 20, 'F')
    doc.rect(8, 199, 20, 3, 'F')
    doc.rect(8, 182, 3, 20, 'F')
    doc.rect(269, 199, 20, 3, 'F')
    doc.rect(286, 182, 3, 20, 'F')
    
    doc.setFillColor(212, 175, 55)
    doc.circle(148.5, 28, 8, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('KSM', 148.5, 32, { align: 'center' })
    
    doc.setTextColor(10, 25, 47)
    doc.setFontSize(38)
    doc.setFont('helvetica', 'bold')
    doc.text('KSM TUTORIALS', 148.5, 48, { align: 'center' })
    
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('University of Cape Coast - IT & Computer Science Department', 148.5, 58, { align: 'center' })
    
    doc.setTextColor(212, 175, 55)
    doc.setFontSize(22)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICATE OF COMPLETION', 148.5, 82, { align: 'center' })
    
    doc.setTextColor(80, 80, 80)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.text('This certificate is proudly presented to', 148.5, 100, { align: 'center' })
    
    doc.setTextColor(212, 175, 55)
    doc.setFontSize(32)
    doc.setFont('helvetica', 'bold')
    doc.text(student.full_name.toUpperCase(), 148.5, 120, { align: 'center' })
    
    doc.setTextColor(80, 80, 80)
    doc.setFontSize(10.5)
    doc.setFont('helvetica', 'normal')
    doc.text('For successfully completing the KSM Tutorials program', 148.5, 138, { align: 'center' })
    doc.text('with outstanding performance and dedication to academic excellence.', 148.5, 148, { align: 'center' })
    
    doc.setTextColor(10, 25, 47)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('COURSES COMPLETED', 148.5, 160, { align: 'center' })
    
    let startX = 148.5 - ((student.courses.length * 38) / 2)
    student.courses.forEach((course, idx) => {
      doc.setFillColor(212, 175, 55)
      doc.roundedRect(startX + (idx * 38), 164, 34, 7, 3.5, 3.5, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      let courseText = course.length > 14 ? course.substring(0, 12) + '..' : course
      doc.text(courseText, startX + (idx * 38) + 17, 169, { align: 'center' })
    })
    
    doc.setTextColor(80, 80, 80)
    doc.setFontSize(8)
    doc.text('ISSUED DATE', 65, 182, { align: 'center' })
    doc.text(now.toLocaleDateString(), 65, 188, { align: 'center' })
    
    doc.text('CERTIFICATE ID', 232, 182, { align: 'center' })
    doc.text(`KSM-CERT-${student.reg_id}-${now.getFullYear()}`, 232, 188, { align: 'center' })
    
    doc.setDrawColor(212, 175, 55)
    doc.setFillColor(255, 248, 240)
    doc.circle(148.5, 192, 12, 'FD')
    doc.setFontSize(6)
    doc.setTextColor(212, 175, 55)
    doc.setFont('helvetica', 'bold')
    doc.text('KSM', 148.5, 190, { align: 'center' })
    doc.text('OFFICIAL', 148.5, 194, { align: 'center' })
    doc.text('SEAL', 148.5, 198, { align: 'center' })
    
    doc.save(`Certificate_${student.reg_id}.pdf`)
  }

  const downloadReceipt = () => {
    if (student.payment_status !== 'paid') {
      alert('Receipt is only available after payment confirmation. Please pay GHS ' + student.total_amount + ' at the first class meeting.')
      return
    }
    
    setReceiptLoading(true)
    try {
      generateReceiptPDF()
    } catch (err) {
      console.error('Receipt error:', err)
      alert('Failed to generate receipt. Please try again.')
    } finally {
      setReceiptLoading(false)
    }
  }

  const downloadCertificate = async () => {
    if (!student.certificate_released) {
      alert('Certificate not released yet. Please ensure payment is confirmed and contact admin if payment was made.')
      return
    }
    
    setCertificateLoading(true)
    try {
      const response = await axios.get(`${API_URL}/api/student/certificate/${student.reg_id}`)
      if (response.data) {
        generateCertificatePDF()
      }
    } catch (err) {
      console.error('Certificate error:', err)
      if (err.response?.status === 403) {
        alert('Certificate not released yet. Please contact admin after payment is confirmed.')
      } else {
        alert('Failed to download certificate. Please try again later.')
      }
    } finally {
      setCertificateLoading(false)
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
      <head>
        <title>Student Details - ${student.full_name}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          h1 { color: #f5a623; }
          .info { margin: 20px 0; }
          .course { margin: 5px 0; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>KSM Tutorials - Student Details</h1>
        <div class="info">
          <p><strong>Registration ID:</strong> ${student.reg_id}</p>
          <p><strong>Name:</strong> ${student.full_name}</p>
          <p><strong>Student ID:</strong> ${student.student_id}</p>
          <p><strong>Email:</strong> ${student.email}</p>
          <p><strong>Phone:</strong> ${student.phone}</p>
          <p><strong>Programme:</strong> ${student.programme}</p>
          <p><strong>Level:</strong> Level ${student.level}</p>
          <p><strong>Payment Status:</strong> ${student.payment_status}</p>
          <p><strong>Courses:</strong></p>
          <ul>
            ${student.courses.map(c => `<li>${c} - GHS 120</li>`).join('')}
          </ul>
          <p><strong>Total Amount:</strong> GHS ${student.total_amount}</p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    if (!newTicket.subject || !newTicket.message) {
      alert('Please enter both subject and message')
      return
    }
    
    setTicketLoading(true)
    try {
      await axios.post(`${API_URL}/api/student/ticket`, {
        student_id: student.id,
        student_name: student.full_name,
        student_email: student.email,
        subject: newTicket.subject,
        message: newTicket.message
      })
      alert('Your message has been sent to admin. You will receive a response soon.')
      setNewTicket({ subject: '', message: '' })
      fetchTickets(student.id)
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setTicketLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleString()
  }

  const handleRegisterNow = (e) => {
    e.preventDefault()
    if (onBack) {
      onBack()
      setTimeout(() => {
        const registerBtn = document.querySelector('[data-register-btn="true"]')
        if (registerBtn) {
          registerBtn.click()
        }
      }, 100)
    }
  }

  if (loggedIn && student) {
    const isReceiptAvailable = student.payment_status === 'paid'
    const isCertificateAvailable = student.certificate_released === true && student.payment_status === 'paid'

    return (
      <div className="student-portal-dashboard" style={{ background: '#0f172a', color: '#f1f5f9' }}>
        <div className="container">
          <div className="dashboard-card">
            <div className="dashboard-header">
              <div className="welcome-section">
                <div className="welcome-icon">🎓</div>
                <div>
                  <h2>Welcome, {student.full_name}!</h2>
                  <p className="reg-id-badge">Reg ID: {student.reg_id}</p>
                </div>
              </div>
              <div className="header-buttons">
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
              </div>
            </div>

            <div className="portal-tabs">
              <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                <FaUser /> Dashboard
              </button>
              <button className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`} onClick={() => setActiveTab('tickets')}>
                <FaTicketAlt /> Support
              </button>
              <button className={`tab-btn ${activeTab === 'contact' ? 'active' : ''}`} onClick={() => setActiveTab('contact')}>
                <FaPhoneAlt /> Contact
              </button>
              <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
                <FaKey /> Security
              </button>
            </div>

            {activeTab === 'dashboard' && (
              <>
                <div className={`status-badge ${student.payment_status === 'paid' ? 'paid' : 'pending'}`}>
                  {student.payment_status === 'paid' ? (
                    <><FaCheckCircle /> Payment Confirmed ✓</>
                  ) : (
                    <><FaClock /> Payment Pending - Pay GHS {student.total_amount} at First Class</>
                  )}
                </div>
                
                {editing ? (
                  <div className="edit-form">
                    <h3>Request Profile Change</h3>
                    <p className="edit-note">Note: Changes will be reviewed by admin. Password changes are handled in Security tab.</p>
                    <div className="edit-grid">
                      <div className="form-group">
                        <label><FaUser /> Full Name</label>
                        <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label><FaIdCard /> Student ID</label>
                        <input type="text" value={editForm.student_id} onChange={(e) => setEditForm({...editForm, student_id: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label><FaEnvelope /> Email</label>
                        <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label><FaPhone /> Phone</label>
                        <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Programme</label>
                        <select value={editForm.programme} onChange={(e) => setEditForm({...editForm, programme: e.target.value})}>
                          <option>Information Technology</option>
                          <option>Computer Science</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Level</label>
                        <select value={editForm.level} onChange={(e) => setEditForm({...editForm, level: parseInt(e.target.value)})}>
                          <option value={100}>Level 100</option>
                          <option value={200}>Level 200</option>
                          <option value={300}>Level 300</option>
                          <option value={400}>Level 400</option>
                        </select>
                      </div>
                    </div>
                    <div className="edit-actions">
                      <button className="save-btn" onClick={handleUpdateProfile} disabled={loading}>
                        {loading ? <FaSpinner className="spinning" /> : <FaSave />} Submit Request
                      </button>
                      <button className="cancel-btn" onClick={() => { setEditing(false); setEditForm(student); }}>
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="info-grid">
                    <div className="info-card">
                      <h3>📋 Registration Information</h3>
                      <div className="info-row"><strong>Registration ID:</strong> {student.reg_id}</div>
                      <div className="info-row"><strong>Registration Date:</strong> {new Date(student.registered_at).toLocaleString()}</div>
                      <div className="info-row"><strong>Payment Status:</strong> <span className={`status-text ${student.payment_status}`}>{student.payment_status || 'Pending'}</span></div>
                      <div className="info-row"><strong>Certificate:</strong> {student.certificate_released ? '✅ Released' : '⏳ Pending'}</div>
                    </div>
                    
                    <div className="info-card">
                      <h3>👤 Personal Information</h3>
                      <div className="info-row"><strong>Full Name:</strong> {student.full_name}</div>
                      <div className="info-row"><strong>Student ID:</strong> {student.student_id}</div>
                      <div className="info-row"><strong>Email:</strong> {student.email}</div>
                      <div className="info-row"><strong>Phone:</strong> {student.phone}</div>
                      <div className="info-row"><strong>Programme:</strong> {student.programme}</div>
                      <div className="info-row"><strong>Level:</strong> Level {student.level}</div>
                      <button className="edit-profile-btn" onClick={() => setEditing(true)}>
                        <FaEdit /> Request Profile Change
                      </button>
                    </div>
                    
                    <div className="info-card">
                      <h3><FaBookOpen /> Registered Courses</h3>
                      {Array.isArray(student.courses) && student.courses.map((course, i) => (
                        <div key={i} className="course-row">
                          <span>{course}</span>
                          <span className="course-price">GHS 120</span>
                        </div>
                      ))}
                      <div className="total-row">
                        <strong><FaMoneyBillWave /> Total Amount:</strong> GHS {student.total_amount}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="action-buttons">
                  <button 
                    onClick={downloadReceipt} 
                    className={`btn-download ${!isReceiptAvailable ? 'disabled' : ''}`}
                    disabled={!isReceiptAvailable || receiptLoading}
                  >
                    {receiptLoading ? <FaSpinner className="spinning" /> : <FaDownload />} 
                    Download Receipt (PDF)
                  </button>
                  
                  <button onClick={handlePrint} className="btn-print">
                    <FaPrint /> Print Details
                  </button>
                  
                  <button 
                    onClick={downloadCertificate} 
                    className={`btn-certificate ${!isCertificateAvailable ? 'disabled' : ''}`}
                    disabled={!isCertificateAvailable || certificateLoading}
                  >
                    {certificateLoading ? <FaSpinner className="spinning" /> : <FaCertificate />} 
                    {isCertificateAvailable ? 'Download Certificate (PDF)' : 'Certificate Pending'}
                  </button>
                </div>
                
                {!isReceiptAvailable && (
                  <div className="warning-message">
                    ⚠️ Receipt will be available after payment is confirmed. Please pay GHS {student.total_amount} at the first class meeting.
                  </div>
                )}
                
                {student.payment_status === 'paid' && !student.certificate_released && (
                  <div className="info-message">
                    <FaClock /> Your payment is confirmed! The certificate will be released within 24 hours.
                  </div>
                )}
                
                {!student.certificate_released && student.payment_status !== 'paid' && (
                  <div className="warning-message">
                    ⚠️ Certificate will be available after payment is confirmed. Please pay GHS {student.total_amount} at the first class.
                  </div>
                )}
              </>
            )}

            {activeTab === 'tickets' && (
              <div className="tickets-section">
                <div className="new-ticket-form">
                  <h3><FaPaperPlane /> Send Message to Admin</h3>
                  <form onSubmit={handleCreateTicket}>
                    <input
                      type="text"
                      placeholder="Subject"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                      required
                    />
                    <textarea
                      placeholder="Your message..."
                      rows="4"
                      value={newTicket.message}
                      onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                      required
                    />
                    <button type="submit" disabled={ticketLoading}>
                      {ticketLoading ? <FaSpinner className="spinning" /> : <FaPaperPlane />} Send Message
                    </button>
                  </form>
                </div>
                
                <div className="tickets-list">
                  <h3><FaComments /> Your Conversations</h3>
                  {tickets.length === 0 ? (
                    <div className="no-tickets">No messages yet. Send a message to admin above.</div>
                  ) : (
                    tickets.map(ticket => (
                      <div key={ticket.id} className={`ticket-item ${ticket.status}`}>
                        <div className="ticket-header">
                          <strong>{ticket.subject}</strong>
                          <span className={`ticket-status ${ticket.status}`}>
                            {ticket.status === 'open' ? '🟡 Open' : '✅ Closed'}
                          </span>
                        </div>
                        <div className="ticket-message">
                          <p><strong>You:</strong> {ticket.message}</p>
                        </div>
                        {ticket.admin_reply && (
                          <div className="ticket-reply">
                            <p><strong>Admin Reply:</strong> {ticket.admin_reply}</p>
                          </div>
                        )}
                        <div className="ticket-date">{formatDate(ticket.created_at)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="contact-section">
                <div className="contact-card">
                  <h3><FaPhoneAlt /> Need Help?</h3>
                  <p>If you need to request changes to your profile or have any urgent issues, please contact us directly:</p>
                  
                  <div className="contact-details">
                    <div className="contact-item">
                      <FaEnvelope />
                      <div>
                        <strong>Email</strong>
                        <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                      </div>
                    </div>
                    <div className="contact-item">
                      <FaPhone />
                      <div>
                        <strong>Phone</strong>
                        <span>{contactInfo.phone}</span>
                      </div>
                    </div>
                    <div className="contact-item">
                      <FaWhatsapp />
                      <div>
                        <strong>WhatsApp</strong>
                        <span>Same as phone number</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="contact-note">
                    <p>For profile changes (name, student ID, email, phone, programme, level), please go to Dashboard tab and click "Request Profile Change".</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="security-section">
                <div className="security-card">
                  <h3><FaKey /> Change Password</h3>
                  <div className="security-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input 
                        type="password" 
                        placeholder="Enter current password"
                        value={passwordForm.old_password}
                        onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input 
                        type="password" 
                        placeholder="Minimum 6 characters"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input 
                        type="password" 
                        placeholder="Re-enter new password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      />
                    </div>
                    <button 
                      className="change-password-btn" 
                      onClick={handleChangePassword}
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? <FaSpinner className="spinning" /> : <FaKey />} Change Password
                    </button>
                  </div>
                  <div className="security-note">
                    <p>⚠️ After changing your password, you will need to login again.</p>
                  </div>
                </div>
              </div>
            )}
            
            <button className="back-home" onClick={onBack}>← Back to Homepage</button>
          </div>
        </div>

        <style>{`
          .student-portal-dashboard {
            min-height: 100vh;
            background: linear-gradient(135deg, #0a192f, #112240);
            padding: 100px 0;
          }
          .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
          .dashboard-card {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 30px;
            padding: 2rem;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          }
          body.dark .dashboard-card { background: #1a365d; color: white; }
          .dashboard-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 2px solid #f5a623;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .welcome-section { display: flex; align-items: center; gap: 1rem; }
          .welcome-icon { font-size: 3rem; }
          .dashboard-header h2 { color: #0a192f; margin: 0; }
          body.dark .dashboard-header h2 { color: white; }
          .reg-id-badge {
            background: #f5a623;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            display: inline-block;
            margin-top: 5px;
          }
          .logout-btn {
            background: #ef4444;
            border: none;
            padding: 10px 24px;
            border-radius: 40px;
            color: white;
            cursor: pointer;
            font-weight: 600;
          }
          .portal-tabs {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 0.5rem;
            flex-wrap: wrap;
          }
          .tab-btn {
            background: none;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
            color: #64748b;
            transition: all 0.3s;
          }
          .tab-btn:hover { background: rgba(245, 166, 35, 0.1); color: #f5a623; }
          .tab-btn.active { background: #f5a623; color: white; }
          .status-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 12px 24px;
            border-radius: 40px;
            margin-bottom: 2rem;
            font-weight: 600;
          }
          .status-badge.paid { background: #e8f5e9; color: #2e7d32; }
          .status-badge.pending { background: #fff3e0; color: #ef6c00; }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          .info-card {
            background: #f8f9fa;
            border-radius: 20px;
            padding: 1.5rem;
          }
          body.dark .info-card { background: #0a192f; }
          .info-card h3 { color: #f5a623; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e2e8f0; }
          .info-row { padding: 8px 0; border-bottom: 1px dashed #e2e8f0; }
          .edit-profile-btn {
            margin-top: 15px;
            background: #f5a623;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.8rem;
          }
          .status-text.paid { color: #2e7d32; font-weight: bold; }
          .status-text.pending { color: #ef6c00; font-weight: bold; }
          .course-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
          .course-price { color: #f5a623; font-weight: 600; }
          .total-row { margin-top: 1rem; padding-top: 1rem; text-align: right; font-size: 1.1rem; border-top: 2px solid #f5a623; color: #f5a623; }
          .action-buttons { display: flex; gap: 1rem; margin: 2rem 0; flex-wrap: wrap; }
          .btn-download, .btn-print, .btn-certificate {
            background: transparent;
            border: 2px solid #f5a623;
            padding: 12px 24px;
            border-radius: 40px;
            color: #f5a623;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s;
          }
          .btn-download:hover:not(:disabled), .btn-print:hover, .btn-certificate:hover:not(:disabled) { background: #f5a623; color: white; }
          .btn-download.disabled, .btn-certificate.disabled { opacity: 0.5; cursor: not-allowed; border-color: #999; color: #999; }
          .edit-form {
            background: #f8f9fa;
            padding: 1.5rem;
            border-radius: 20px;
            margin-bottom: 2rem;
          }
          body.dark .edit-form { background: #0a192f; }
          .edit-form h3 { margin-bottom: 0.5rem; color: #f5a623; }
          .edit-note { font-size: 0.8rem; color: #ef6c00; margin-bottom: 1rem; }
          .edit-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
          .form-group { display: flex; flex-direction: column; gap: 5px; }
          .form-group label { font-weight: 600; display: flex; align-items: center; gap: 8px; }
          .form-group input, .form-group select { padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 1rem; }
          .edit-actions { display: flex; gap: 1rem; justify-content: flex-end; }
          .save-btn { background: #10b981; border: none; padding: 10px 24px; border-radius: 40px; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
          .cancel-btn { background: #e2e8f0; border: none; padding: 10px 24px; border-radius: 40px; color: #333; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
          .info-message { background: #e3f2fd; padding: 1rem; border-radius: 12px; color: #1565c0; margin: 1rem 0; text-align: center; }
          .warning-message { background: #fff3e0; padding: 1rem; border-radius: 12px; color: #ef6c00; margin: 1rem 0; text-align: center; }
          .tickets-section { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
          @media (max-width: 768px) { .tickets-section { grid-template-columns: 1fr; } }
          .new-ticket-form { background: #f8f9fa; padding: 1.5rem; border-radius: 20px; }
          body.dark .new-ticket-form { background: #0a192f; }
          .new-ticket-form h3 { margin-bottom: 1rem; color: #f5a623; }
          .new-ticket-form input, .new-ticket-form textarea { width: 100%; padding: 12px; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 10px; font-size: 1rem; }
          .new-ticket-form button { background: #f5a623; border: none; padding: 12px 24px; border-radius: 40px; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center; }
          .tickets-list { background: #f8f9fa; padding: 1.5rem; border-radius: 20px; }
          body.dark .tickets-list { background: #0a192f; }
          .tickets-list h3 { margin-bottom: 1rem; color: #f5a623; }
          .ticket-item { background: white; padding: 1rem; border-radius: 12px; margin-bottom: 1rem; border-left: 4px solid #f5a623; }
          body.dark .ticket-item { background: #112240; }
          .ticket-item.closed { border-left-color: #10b981; opacity: 0.8; }
          .ticket-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; }
          .ticket-status { font-size: 0.7rem; padding: 4px 8px; border-radius: 20px; }
          .ticket-status.open { background: #fff3e0; color: #ef6c00; }
          .ticket-status.closed { background: #e8f5e9; color: #2e7d32; }
          .ticket-message, .ticket-reply { margin: 0.5rem 0; padding: 0.5rem; background: #f8f9fa; border-radius: 8px; }
          body.dark .ticket-message, body.dark .ticket-reply { background: #0a192f; }
          .ticket-reply { background: #e8f5e9; }
          .ticket-date { font-size: 0.7rem; color: #999; margin-top: 0.5rem; }
          .no-tickets { text-align: center; padding: 2rem; color: #999; }
          .contact-section { display: flex; justify-content: center; }
          .contact-card { background: #f8f9fa; padding: 2rem; border-radius: 20px; max-width: 500px; width: 100%; text-align: center; }
          body.dark .contact-card { background: #0a192f; }
          .contact-card h3 { color: #f5a623; margin-bottom: 1rem; }
          .contact-details { margin: 1.5rem 0; }
          .contact-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #e2e8f0; }
          .contact-item svg { font-size: 1.5rem; color: #f5a623; }
          .contact-item a { color: #f5a623; text-decoration: none; }
          .contact-note { margin-top: 1.5rem; padding: 1rem; background: #fff3e0; border-radius: 12px; font-size: 0.9rem; }
          .security-section { display: flex; justify-content: center; }
          .security-card { background: #f8f9fa; padding: 2rem; border-radius: 20px; max-width: 500px; width: 100%; }
          body.dark .security-card { background: #0a192f; }
          .security-card h3 { color: #f5a623; margin-bottom: 1rem; }
          .security-form .form-group { margin-bottom: 1rem; }
          .change-password-btn {
            background: #f5a623;
            border: none;
            padding: 12px 24px;
            border-radius: 40px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            justify-content: center;
            margin-top: 1rem;
          }
          .security-note { margin-top: 1rem; padding: 0.5rem; background: #fff3e0; border-radius: 8px; font-size: 0.8rem; text-align: center; }
          .back-home { background: transparent; border: none; color: #f5a623; cursor: pointer; display: block; width: 100%; text-align: center; margin-top: 1.5rem; font-size: 1rem; font-weight: 600; }
          .spinning { animation: spin 1s linear infinite; }
          @keyframes spin { to { transform: rotate(360deg); } }
          @media (max-width: 768px) {
            .dashboard-card { padding: 1rem; }
            .info-grid { grid-template-columns: 1fr; }
            .action-buttons { flex-direction: column; }
            .btn-download, .btn-print, .btn-certificate { justify-content: center; }
            .edit-grid { grid-template-columns: 1fr; }
            .portal-tabs { justify-content: center; }
            .tab-btn { padding: 6px 12px; font-size: 0.8rem; }
          }
          @media print {
            .dashboard-card { padding: 0; margin: 0; box-shadow: none; }
            .action-buttons, .logout-btn, .edit-profile-btn, .back-home, .portal-tabs, .tickets-section, .contact-section, .edit-form, .info-message, .warning-message, .header-buttons, .security-section { display: none !important; }
          }
        `}</style>
      </div>
    )
  }

  return (
   <div className="student-portal" style={{ background: '#0f172a', color: '#f1f5f9' }}>
      <BackToHome onBack={onBack} />   {/* <-- ADD THIS LINE */}
      <div className="container">
        <div className="portal-card">
          <div className="portal-icon">🎓</div>
          <h2>Student Portal</h2>
          <p>Enter your Registration ID and Password to view your registration details</p>
          
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Registration ID</label>
              <input 
                type="text" 
                placeholder="Enter your Registration ID (e.g., KSM-ABC12345)" 
                value={registrationId} 
                onChange={(e) => setRegistrationId(e.target.value)} 
                required 
              />
              <small>Your Registration ID was sent to your email after registration</small>
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <div className="password-input-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter your password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              <small>The password you created during registration</small>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? <><FaSpinner className="spinning" /> Logging in...</> : <><FaSearch /> Login to Portal</>}
            </button>
          </form>
          
          <div className="portal-help">
            <p>Don't have a Registration ID? <a href="#" onClick={handleRegisterNow}>Register now</a></p>
            <p>Lost your password? Contact admin at <strong>{contactInfo.email}</strong></p>
          </div>
          
          <button className="back-home" onClick={onBack}>← Back to Homepage</button>
        </div>
      </div>

      <style>{`
        .student-portal {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a192f, #112240);
          padding: 100px 0;
        }
        .container { max-width: 500px; margin: 0 auto; padding: 0 20px; }
        .portal-card {
          background: white;
          border-radius: 30px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          text-align: center;
        }
        body.dark .portal-card { background: #1a365d; color: white; }
        .portal-icon { font-size: 4rem; margin-bottom: 1rem; }
        .portal-card h2 { color: #0a192f; margin-bottom: 0.5rem; }
        body.dark .portal-card h2 { color: white; }
        .login-form { margin: 2rem 0; text-align: left; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: 600; }
        .form-group input {
          width: 100%;
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          background: white;
        }
        body.dark .form-group input { background: #0a192f; border-color: #334155; color: white; }
        .form-group small { display: block; margin-top: 5px; color: #94a3b8; font-size: 0.7rem; }
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
          font-size: 1.1rem;
        }
        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 12px;
          border-radius: 12px;
          margin: 1rem 0;
          text-align: center;
        }
        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #f5a623, #e69500);
          border: none;
          padding: 14px;
          border-radius: 40px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.3s;
        }
        .login-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .login-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .portal-help { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #e2e8f0; font-size: 0.9rem; }
        .portal-help a { color: #f5a623; text-decoration: none; cursor: pointer; }
        .back-home { background: transparent; border: none; color: #f5a623; cursor: pointer; margin-top: 1rem; font-size: 0.9rem; }
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          .student-portal { padding: 80px 0; }
          .portal-card { padding: 1.5rem; }
        }
      `}</style>
    </div>
  )
}

export default StudentPortal
