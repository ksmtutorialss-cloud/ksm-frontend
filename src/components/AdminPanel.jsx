import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  FaUsers, FaMoneyBillWave, FaComments, FaStar, FaTrash, FaPlus, FaSignOutAlt, 
  FaChartLine, FaBook, FaEnvelope, FaSearch, FaCheckCircle, FaWhatsapp, 
  FaCalendarAlt, FaDownload, FaSync, FaSpinner, FaEdit, FaBullhorn, FaChalkboardTeacher, 
  FaHandshake, FaTimes, FaCode, FaLaptopCode, FaDatabase, FaNetworkWired, 
  FaCloud, FaShieldAlt, FaMobileAlt, FaBrain, FaLinux, FaChartBar,
  FaUserGraduate, FaCog, FaBars, FaCertificate, FaTrashAlt, FaExclamationTriangle,
  FaHistory, FaKey, FaUserShield, FaGoogle, FaMicrosoft, FaAmazon, FaApple, 
  FaFacebook, FaTwitter, FaUpload, FaTicketAlt, FaReply, FaCheck, FaBan
} from 'react-icons/fa'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import axios from 'axios'
import { useSocket } from '../contexts/SocketContext'
import { API_URL } from '../config'  // <--- CHANGE 1: ADDED THIS IMPORT
import BackToHome from './BackToHome'


const Modal = ({ isOpen, onClose, title, children, maxWidth = '550px' }) => {
  if (!isOpen) return null
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '20px', width: '90%', maxWidth: maxWidth, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}><FaTimes /></button>
        </div>
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}


const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, danger = false }) => {
  if (!isOpen) return null
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', borderRadius: '20px', width: '90%', maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '20px', borderBottom: '1px solid #eee', textAlign: 'center' }}>
          {danger && <div style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '10px' }}><FaExclamationTriangle /></div>}
          <h2 style={{ margin: 0 }}>{title}</h2>
        </div>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p>{message}</p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
            <button onClick={onClose} style={{ background: '#ddd', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={onConfirm} style={{ background: danger ? '#ef4444' : '#f5a623', border: 'none', padding: '10px 24px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  )
}

const AdminPanel = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [visitedTabs, setVisitedTabs] = useState({})
  const [stats, setStats] = useState({ totalStudents: 0, totalRevenue: 0, totalComments: 0, avgRating: 0, pendingPayments: 0, certificatesReleased: 0, openTickets: 0, pendingEditRequests: 0 })
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [courses, setCourses] = useState([])
  const [comments, setComments] = useState([])
  const [tutors, setTutors] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [partners, setPartners] = useState([])
  const [tickets, setTickets] = useState([])
  const [editRequests, setEditRequests] = useState([])
  const [directorMessage, setDirectorMessage] = useState({ content: '', signature: '' })
  const [activityLogs, setActivityLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)
  const [deadline, setDeadline] = useState('2026-05-30T23:59')
  const [whatsappLink, setWhatsappLink] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [searchTermDebounced, setSearchTermDebounced] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [registrationTrend, setRegistrationTrend] = useState([])
  const [coursePopularity, setCoursePopularity] = useState([])
  const [uploadingImage, setUploadingImage] = useState(false)
  const [showAdminCredModal, setShowAdminCredModal] = useState(false)
  const [adminCredForm, setAdminCredForm] = useState({ current_password: '', new_username: '', new_password: '', confirm_password: '' })
  const [pendingCounts, setPendingCounts] = useState({ tickets: 0, editRequests: 0, comments: 0 })
  const searchTermRef = useRef('')
  const [filterVersion, setFilterVersion] = useState(0)
  const { socket } = useSocket()
  const navigate = useNavigate()

  const getBadgeCount = (tabId) => {
    if (visitedTabs[tabId]) return 0
    if (tabId === 'tickets') return stats.openTickets
    if (tabId === 'editRequests') return stats.pendingEditRequests
    if (tabId === 'comments') return stats.totalComments
    return 0
  }

  const handleTabClick = (tabId) => {
    setActiveTab(tabId)
    setVisitedTabs(prev => ({ ...prev, [tabId]: true }))
  }

  useEffect(() => {
    setVisitedTabs({})
  }, [stats.openTickets, stats.pendingEditRequests, stats.totalComments])

  const instructorOptions = [
    "Dr. Mensah",
    "Prof. Abena",
    "Dr. Esi",
    "Prof. Kwame",
    "Dr. Grace",
    "Mr. Yaw",
    "Dr. Owusu",
    "Prof. Atta",
    "Mr. Danso",
    "Prof. Adwoa"
  ]

  const courseIconOptions = [
    { name: 'FaCode', icon: <FaCode />, label: 'Code/Programming' },
    { name: 'FaLaptopCode', icon: <FaLaptopCode />, label: 'Web Development' },
    { name: 'FaDatabase', icon: <FaDatabase />, label: 'Database' },
    { name: 'FaNetworkWired', icon: <FaNetworkWired />, label: 'Networking' },
    { name: 'FaCloud', icon: <FaCloud />, label: 'Cloud Computing' },
    { name: 'FaShieldAlt', icon: <FaShieldAlt />, label: 'Cybersecurity' },
    { name: 'FaMobileAlt', icon: <FaMobileAlt />, label: 'Mobile Development' },
    { name: 'FaBrain', icon: <FaBrain />, label: 'AI/ML' },
    { name: 'FaLinux', icon: <FaLinux />, label: 'Linux/Unix' },
    { name: 'FaChartBar', icon: <FaChartBar />, label: 'Data Science' }
  ]

  const getCourseIconComponent = (iconName) => {
    const found = courseIconOptions.find(opt => opt.name === iconName)
    return found ? found.icon : <FaCode />
  }

  const [showAddCourseModal, setShowAddCourseModal] = useState(false)
  const [showEditCourseModal, setShowEditCourseModal] = useState(false)
  const [showDeleteCourseModal, setShowDeleteCourseModal] = useState(false)
  const [showAddTutorModal, setShowAddTutorModal] = useState(false)
  const [showEditTutorModal, setShowEditTutorModal] = useState(false)
  const [showDeleteTutorModal, setShowDeleteTutorModal] = useState(false)
  const [showAddAnnouncementModal, setShowAddAnnouncementModal] = useState(false)
  const [showEditAnnouncementModal, setShowEditAnnouncementModal] = useState(false)
  const [showDeleteAnnouncementModal, setShowDeleteAnnouncementModal] = useState(false)
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false)
  const [showEditPartnerModal, setShowEditPartnerModal] = useState(false)
  const [showDeletePartnerModal, setShowDeletePartnerModal] = useState(false)
  const [showEditStudentModal, setShowEditStudentModal] = useState(false)
  const [showDeleteStudentModal, setShowDeleteStudentModal] = useState(false)
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false)
  const [showReleaseCertModal, setShowReleaseCertModal] = useState(false)
  const [showBulkReleaseModal, setShowBulkReleaseModal] = useState(false)
  const [showDirectorModal, setShowDirectorModal] = useState(false)
  const [showDeadlineModal, setShowDeadlineModal] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showDeleteCommentModal, setShowDeleteCommentModal] = useState(false)
  const [showReplyTicketModal, setShowReplyTicketModal] = useState(false)
  const [showEditRequestDetailsModal, setShowEditRequestDetailsModal] = useState(false)
  const [selectedEditRequest, setSelectedEditRequest] = useState(null)
  const [originalStudentData, setOriginalStudentData] = useState(null)

  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedTutor, setSelectedTutor] = useState(null)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null)
  const [selectedPartner, setSelectedPartner] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [selectedComment, setSelectedComment] = useState(null)
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')

  const [newCourse, setNewCourse] = useState({ 
    name: '', level: 100, price: 120, instructor: 'Dr. Mensah', 
    schedule_day: 'Saturday', schedule_time: '9:00 AM', 
    venue: 'UCC Lab', description: '', icon: 'FaCode'
  })
  const [editCourse, setEditCourse] = useState(null)
  const [newTutor, setNewTutor] = useState({ 
    name: '', specialization: '', experience: '', 
    image: '', email: '', linkedin: '#', image_url: '' 
  })
  const [editTutor, setEditTutor] = useState(null)
  const [newAnnouncement, setNewAnnouncement] = useState({ 
    title: '', content: '', type: 'info', 
    date: new Date().toISOString().split('T')[0] 
  })
  const [editAnnouncement, setEditAnnouncement] = useState(null)
  const [newPartner, setNewPartner] = useState({ 
    name: '', icon: 'FaGoogle', link: '#', color: '#4285f4' 
  })
  const [editPartner, setEditPartner] = useState(null)
  const [editStudent, setEditStudent] = useState(null)

  const iconOptions = [
    { name: 'FaGoogle', icon: <FaGoogle />, color: '#4285f4' },
    { name: 'FaMicrosoft', icon: <FaMicrosoft />, color: '#00a4ef' },
    { name: 'FaAmazon', icon: <FaAmazon />, color: '#ff9900' },
    { name: 'FaApple', icon: <FaApple />, color: '#999999' },
    { name: 'FaFacebook', icon: <FaFacebook />, color: '#1877f2' },
    { name: 'FaTwitter', icon: <FaTwitter />, color: '#1da1f2' },
    { name: 'FaCode', icon: <FaCode />, color: '#f5a623' },
    { name: 'FaLaptopCode', icon: <FaLaptopCode />, color: '#10b981' },
    { name: 'FaDatabase', icon: <FaDatabase />, color: '#6366f1' },
    { name: 'FaNetworkWired', icon: <FaNetworkWired />, color: '#8b5cf6' },
    { name: 'FaCloud', icon: <FaCloud />, color: '#06b6d4' },
    { name: 'FaShieldAlt', icon: <FaShieldAlt />, color: '#ef4444' }
  ]

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    fetchAllData()
    
    if (socket) {
      socket.on('new_registration', () => fetchAllData())
      socket.on('new_comment', () => fetchAllData())
      socket.on('comment_liked', () => fetchAllData())
    }
    return () => {
      if (socket) {
        socket.off('new_registration')
        socket.off('new_comment')
        socket.off('comment_liked')
      }
    }
  }, [socket])

  useEffect(() => {
    const token = localStorage.getItem('admin_token')
    if (!token) { 
      navigate('/admin')
      return
    }
  }, [navigate])

  const fetchAllData = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('admin_token')
      const headers = { Authorization: `Bearer ${token}` }
      
      const [statsRes, studentsRes, coursesRes, commentsRes, settingsRes, tutorsRes, announcementsRes, partnersRes, directorRes, logsRes, ticketsRes, editRequestsRes] = await Promise.all([
        axios.get(`${API_URL}/api/stats`),  // <--- CHANGE 2: Added ${API_URL}
        axios.get(`${API_URL}/api/students`, { headers }).catch(() => ({ data: [] })),  // <--- CHANGE 2
        axios.get(`${API_URL}/api/courses`),  // <--- CHANGE 2
        axios.get(`${API_URL}/api/comments`),  // <--- CHANGE 2
        axios.get(`${API_URL}/api/settings`),  // <--- CHANGE 2
        axios.get(`${API_URL}/api/tutors`),  // <--- CHANGE 2
        axios.get(`${API_URL}/api/announcements`),  // <--- CHANGE 2
        axios.get(`${API_URL}/api/partners`),  // <--- CHANGE 2
        axios.get(`${API_URL}/api/director-message`),  // <--- CHANGE 2
        axios.get(`${API_URL}/api/activity-logs`, { headers }).catch(() => ({ data: [] })),  // <--- CHANGE 2
        axios.get(`${API_URL}/api/admin/tickets`, { headers }).catch(() => ({ data: [] })),  // <--- CHANGE 2
        axios.get(`${API_URL}/api/admin/edit-requests`, { headers }).catch(() => ({ data: [] }))  // <--- CHANGE 2
      ])
      
      const newStats = {
        totalStudents: statsRes.data?.total_students || 0,
        totalRevenue: statsRes.data?.total_revenue || 0,
        totalComments: statsRes.data?.total_comments || 0,
        avgRating: statsRes.data?.avg_rating || 0,
        pendingPayments: statsRes.data?.pending_payments || 0,
        certificatesReleased: statsRes.data?.certificates_released || 0,
        openTickets: statsRes.data?.open_tickets || 0,
        pendingEditRequests: statsRes.data?.pending_edit_requests || 0
      }
      
      setStats(newStats)
      setPendingCounts({
        tickets: newStats.openTickets,
        editRequests: newStats.pendingEditRequests,
        comments: newStats.totalComments
      })
      setStudents(studentsRes.data || [])
      setFilteredStudents(studentsRes.data || [])
      setCourses(coursesRes.data || [])
      setComments(commentsRes.data || [])
      setTutors(tutorsRes.data || [])
      setAnnouncements(announcementsRes.data || [])
      setPartners(partnersRes.data || [])
      setTickets(ticketsRes.data || [])
      setEditRequests(editRequestsRes.data || [])
      setDirectorMessage(directorRes.data || { content: '', signature: '' })
      setActivityLogs(logsRes.data || [])
      setDeadline(settingsRes.data?.deadline || '2026-05-30T23:59')
      setWhatsappLink(settingsRes.data?.whatsapp_link || 'https://chat.whatsapp.com/KSM2026')
      
      const trend = generateTrendData(studentsRes.data || [])
      setRegistrationTrend(trend)
      
      const popularity = (coursesRes.data || []).map(c => ({ 
        name: c.name.length > 15 ? c.name.slice(0, 12) + '...' : c.name, 
        registered: c.registered_count || 0 
      }))
      setCoursePopularity(popularity)
    } catch (error) {
      console.error('Error fetching data:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token')
        navigate('/admin')
      }
    } finally {
      setLoading(false)
    }
  }, [navigate])

  const handleViewEditRequest = async (request) => {
    setSelectedEditRequest(request)
    try {
      const token = localStorage.getItem('admin_token')
      const response = await axios.get(`${API_URL}/api/students`, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      const student = response.data.find(s => s.id === request.student_id)
      if (student) {
        setOriginalStudentData(student)
      }
    } catch (error) {
      console.error('Error fetching student data:', error)
    }
    setShowEditRequestDetailsModal(true)
  }

  const handleChangeAdminCredentials = async () => {
    if (adminCredForm.new_password && adminCredForm.new_password !== adminCredForm.confirm_password) {
      showToast("New passwords do not match", "error")
      return
    }
    if (adminCredForm.new_password && adminCredForm.new_password.length < 6) {
      showToast("Password must be at least 6 characters", "error")
      return
    }
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/change-credentials`, {  // <--- CHANGE 2
        current_password: adminCredForm.current_password,
        new_username: adminCredForm.new_username,
        new_password: adminCredForm.new_password
      }, { headers: { Authorization: `Bearer ${token}` } })
      showToast("Credentials updated! Please login again.")
      setTimeout(() => handleLogout(), 2000)
    } catch (error) {
      showToast(error.response?.data?.detail || "Failed to update credentials", "error")
    }
  }

  const handleApproveEditRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/edit-requests/${requestId}/approve`, {}, {  // <--- CHANGE 2
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Edit request approved!')
      setShowEditRequestDetailsModal(false)
      fetchAllData()
    } catch (error) {
      showToast('Failed to approve request', 'error')
    }
  }

  const handleRejectEditRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/edit-requests/${requestId}/reject`, {}, {  // <--- CHANGE 2
        headers: { Authorization: `Bearer ${token}` }
      })
      showToast('Edit request rejected.')
      setShowEditRequestDetailsModal(false)
      fetchAllData()
    } catch (error) {
      showToast('Failed to reject request', 'error')
    }
  }

  const generateTrendData = (studentsData) => {
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const count = studentsData.filter(s => {
        try { return new Date(s.registered_at).toDateString() === date.toDateString() }
        catch { return false }
      }).length
      last7Days.push({ date: `${date.getMonth()+1}/${date.getDate()}`, registrations: count })
    }
    return last7Days
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTermDebounced(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  const applyFilters = () => {
    let filtered = [...students]
    if (searchTermDebounced) {
      const term = searchTermDebounced.toLowerCase()
      filtered = filtered.filter(s => 
        (s.full_name || '').toLowerCase().includes(term) || 
        (s.student_id || '').toLowerCase().includes(term) ||
        (s.reg_id || '').toLowerCase().includes(term) ||
        (s.email || '').toLowerCase().includes(term)
      )
    }
    if (levelFilter !== 'all') filtered = filtered.filter(s => s.level === parseInt(levelFilter))
    if (paymentFilter !== 'all') filtered = filtered.filter(s => (s.payment_status || 'pending') === paymentFilter)
    setFilteredStudents(filtered)
  }

  useEffect(() => { applyFilters() }, [searchTermDebounced, levelFilter, paymentFilter, students])
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const token = localStorage.getItem('admin_token')
      const response = await axios.post(`${API_URL}/api/upload/tutor-image`, formData, {  // <--- CHANGE 2
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
      const imageUrl = response.data.image_url
      setNewTutor({ ...newTutor, image_url: imageUrl })
      showToast('Image uploaded successfully!')
    } catch (error) {
      showToast('Failed to upload image', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleEditImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    setUploadingImage(true)
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const token = localStorage.getItem('admin_token')
      const response = await axios.post(`${API_URL}/api/upload/tutor-image`, formData, {  // <--- CHANGE 2
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      })
      const imageUrl = response.data.image_url
      setEditTutor({ ...editTutor, image_url: imageUrl })
      showToast('Image uploaded successfully!')
    } catch (error) {
      showToast('Failed to upload image', 'error')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleAddCourse = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      await axios.post(`${API_URL}/api/admin/courses`, newCourse, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Course added successfully!')
      setShowAddCourseModal(false)
      setNewCourse({ name: '', level: 100, price: 120, instructor: 'Dr. Mensah', schedule_day: 'Saturday', schedule_time: '9:00 AM', venue: 'UCC Lab', description: '', icon: 'FaCode' })
      fetchAllData()
    } catch (error) { 
      showToast('Failed to add course', 'error') 
    }
  }

  const handleEditCourseSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/courses/${editCourse.id}`, editCourse, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Course updated successfully!')
      setShowEditCourseModal(false)
      setEditCourse(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to update course', 'error') 
    }
  }

  const handleDeleteCourseConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.delete(`${API_URL}/api/admin/courses/${selectedCourse.id}`, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Course deleted successfully!')
      setShowDeleteCourseModal(false)
      setSelectedCourse(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to delete course', 'error') 
    }
  }

  const handleAddTutor = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      await axios.post(`${API_URL}/api/admin/tutors`, newTutor, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Tutor added successfully!')
      setShowAddTutorModal(false)
      setNewTutor({ name: '', specialization: '', experience: '', image: '', email: '', linkedin: '#', image_url: '' })
      fetchAllData()
    } catch (error) { 
      showToast('Failed to add tutor', 'error') 
    }
  }

  const handleEditTutorSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/tutors/${editTutor.id}`, editTutor, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Tutor updated successfully!')
      setShowEditTutorModal(false)
      setEditTutor(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to update tutor', 'error') 
    }
  }

  const handleDeleteTutorConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.delete(`${API_URL}/api/admin/tutors/${selectedTutor.id}`, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Tutor deleted successfully!')
      setShowDeleteTutorModal(false)
      setSelectedTutor(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to delete tutor', 'error') 
    }
  }

  const handleAddAnnouncement = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      await axios.post(`${API_URL}/api/admin/announcements`, newAnnouncement, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Announcement added successfully!')
      setShowAddAnnouncementModal(false)
      setNewAnnouncement({ title: '', content: '', type: 'info', date: new Date().toISOString().split('T')[0] })
      fetchAllData()
    } catch (error) { 
      showToast('Failed to add announcement', 'error') 
    }
  }

  const handleEditAnnouncementSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/announcements/${editAnnouncement.id}`, editAnnouncement, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Announcement updated successfully!')
      setShowEditAnnouncementModal(false)
      setEditAnnouncement(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to update announcement', 'error') 
    }
  }

  const handleDeleteAnnouncementConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.delete(`${API_URL}/api/admin/announcements/${selectedAnnouncement.id}`, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Announcement deleted successfully!')
      setShowDeleteAnnouncementModal(false)
      setSelectedAnnouncement(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to delete announcement', 'error') 
    }
  }

  const handleAddPartner = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      await axios.post(`${API_URL}/api/admin/partners`, newPartner, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Partner added successfully!')
      setShowAddPartnerModal(false)
      setNewPartner({ name: '', icon: 'FaGoogle', link: '#', color: '#4285f4' })
      fetchAllData()
    } catch (error) { 
      showToast('Failed to add partner', 'error') 
    }
  }

  const handleEditPartnerSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/partners/${editPartner.id}`, editPartner, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Partner updated successfully!')
      setShowEditPartnerModal(false)
      setEditPartner(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to update partner', 'error') 
    }
  }

  const handleDeletePartnerConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.delete(`${API_URL}/api/admin/partners/${selectedPartner.id}`, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Partner deleted successfully!')
      setShowDeletePartnerModal(false)
      setSelectedPartner(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to delete partner', 'error') 
    }
  }

  const handleEditStudentSubmit = async (e) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/students/${editStudent.id}`, editStudent, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Student updated successfully!')
      setShowEditStudentModal(false)
      setEditStudent(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to update student', 'error') 
    }
  }

  const handleDeleteStudentConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.delete(`${API_URL}/api/admin/students/${selectedStudent.id}`, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast(`Student ${selectedStudent.full_name} deleted successfully!`)
      setShowDeleteStudentModal(false)
      setSelectedStudent(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to delete student', 'error') 
    }
  }

  const handleMarkPaidConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/students/${selectedStudent.id}/payment`, {}, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast(`Payment marked as paid for ${selectedStudent.full_name}!`)
      setShowMarkPaidModal(false)
      setSelectedStudent(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to mark payment', 'error') 
    }
  }

  const handleReleaseCertificateConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.post(`${API_URL}/api/admin/certificates/${selectedStudent.id}/release`, {}, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast(`Certificate released for ${selectedStudent.full_name}!`)
      setShowReleaseCertModal(false)
      setSelectedStudent(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to release certificate', 'error') 
    }
  }

  const handleBulkReleaseConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.post(`${API_URL}/api/admin/certificates/bulk-release`, {}, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Certificates released for all paid students!')
      setShowBulkReleaseModal(false)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to release certificates', 'error') 
    }
  }

  const handleReplyTicket = async () => {
    if (!replyMessage.trim()) {
      showToast('Please enter a reply message', 'error')
      return
    }
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/tickets/${selectedTicket.id}/reply`,   // <--- CHANGE 2
        { reply: replyMessage }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      showToast('Reply sent successfully!')
      setShowReplyTicketModal(false)
      setSelectedTicket(null)
      setReplyMessage('')
      fetchAllData()
    } catch (error) {
      showToast('Failed to send reply', 'error')
    }
  }

  const handleDeleteCommentConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.delete(`${API_URL}/api/admin/comments/${selectedComment.id}`, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Comment deleted successfully!')
      setShowDeleteCommentModal(false)
      setSelectedComment(null)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to delete comment', 'error') 
    }
  }

  const handleUpdateDeadline = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/settings`, { deadline }, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Deadline updated successfully!')
      setShowDeadlineModal(false)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to update deadline', 'error') 
    }
  }

  const handleUpdateWhatsApp = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/settings`, { whatsapp_link: whatsappLink }, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('WhatsApp link updated!')
      setShowWhatsAppModal(false)
    } catch (error) { 
      showToast('Failed to update WhatsApp link', 'error') 
    }
  }

  const handleUpdateDirectorMessage = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.put(`${API_URL}/api/admin/director-message`, directorMessage, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Director message updated!')
      setShowDirectorModal(false)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to update director message', 'error') 
    }
  }

  const handleSendBroadcast = async () => {
    if (!broadcastMessage) return
    try {
      const token = localStorage.getItem('admin_token')
      await axios.post(`${API_URL}/api/admin/broadcast/whatsapp`, { message: broadcastMessage }, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Broadcast sent to all students!')
      setBroadcastMessage('')
      setShowBroadcastModal(false)
    } catch (error) { 
      showToast('Failed to send broadcast', 'error') 
    }
  }

  const handleResetDatabaseConfirm = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      await axios.delete(`${API_URL}/api/admin/database/reset`, { headers: { Authorization: `Bearer ${token}` } })  // <--- CHANGE 2
      showToast('Database reset successfully! All student data cleared.')
      setShowResetModal(false)
      fetchAllData()
    } catch (error) { 
      showToast('Failed to reset database', 'error') 
    }
  }

  const exportToCSV = () => {
    const headers = ['Reg ID', 'Name', 'Student ID', 'Email', 'Phone', 'Programme', 'Level', 'Courses', 'Amount', 'Payment Status', 'Certificate Released', 'Date']
    const rows = filteredStudents.map(s => [
      s.reg_id || '', s.full_name || '', s.student_id || '', s.email || '', s.phone || '', 
      s.programme || '', s.level || '', (s.courses || []).join(', '), 
      s.total_amount || 0, s.payment_status || 'pending', 
      s.certificate_released ? 'Yes' : 'No',
      s.registered_at ? new Date(s.registered_at).toLocaleDateString() : ''
    ])
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `students_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Export complete!')
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    navigate('/admin')
  }

  const pieData = [
    { name: 'Paid', value: Math.max(0, stats.totalStudents - stats.pendingPayments), color: '#10b981' },
    { name: 'Pending', value: stats.pendingPayments, color: '#f59e0b' }
  ]

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
        <div style={{ width: '50px', height: '50px', border: '4px solid #e0e0e0', borderTopColor: '#f5a623', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px' }}>Loading dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0f172a', color: '#f1f5f9', fontFamily: 'Inter, sans-serif' }}>
      
      {toast && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px', background: 'white', padding: '12px 24px',
          borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)', zIndex: 2000, animation: 'slideIn 0.3s ease',
          borderLeft: `4px solid ${toast.type === 'success' ? '#10b981' : '#ef4444'}`,
          color: '#333'
        }}>{toast.message}</div>
      )}

      <div style={{
        width: sidebarOpen ? '280px' : '80px', background: 'linear-gradient(180deg, #0a192f 0%, #0d2137 100%)',
        color: 'white', transition: 'all 0.3s ease', display: 'flex', flexDirection: 'column',
        position: 'fixed', height: '100vh', overflowY: 'auto', zIndex: 100
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.2rem', fontWeight: '700' }}>
            <FaChartLine style={{ color: '#f5a623', fontSize: '1.5rem' }} />
            {sidebarOpen && <span>KSM Admin</span>}
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.2rem' }}><FaBars /></button>
        </div>
        <nav style={{ flex: 1, padding: '20px 0' }}>
          {[
            { id: 'dashboard', icon: <FaChartLine />, label: 'Dashboard', badge: null },
            { id: 'students', icon: <FaUserGraduate />, label: 'Students', badge: stats.totalStudents },
            { id: 'certificates', icon: <FaCertificate />, label: 'Certificates', badge: stats.certificatesReleased },
            { id: 'tickets', icon: <FaTicketAlt />, label: 'Support', badge: getBadgeCount('tickets') },
            { id: 'editRequests', icon: <FaEdit />, label: 'Edit Requests', badge: getBadgeCount('editRequests') },
            { id: 'courses', icon: <FaBook />, label: 'Courses', badge: null },
            { id: 'tutors', icon: <FaChalkboardTeacher />, label: 'Tutors', badge: null },
            { id: 'announcements', icon: <FaBullhorn />, label: 'Announcements', badge: null },
            { id: 'partners', icon: <FaHandshake />, label: 'Partners', badge: null },
            { id: 'comments', icon: <FaComments />, label: 'Comments', badge: getBadgeCount('comments') },
            { id: 'settings', icon: <FaCog />, label: 'Settings', badge: null },
            { id: 'activity', icon: <FaHistory />, label: 'Activity Logs', badge: null }
          ].map(item => (
            <button key={item.id} onClick={() => handleTabClick(item.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 20px',
              background: activeTab === item.id ? '#f5a623' : 'none', border: 'none',
              color: activeTab === item.id ? 'white' : 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.3s', fontSize: '0.95rem'
            }}>
              {item.icon} {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && item.badge !== null && item.badge > 0 && (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '20px' }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', borderRadius: '8px' }}>
            <FaSignOutAlt /> {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, marginLeft: sidebarOpen ? '280px' : '80px', transition: 'margin-left 0.3s ease', width: sidebarOpen ? 'calc(100% - 280px)' : 'calc(100% - 80px)' }}>
        <div style={{ background: 'white', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '600', margin: 0 }}>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={() => setShowDeadlineModal(true)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><FaCalendarAlt /> Deadline</button>
            <button onClick={() => setShowWhatsAppModal(true)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><FaWhatsapp /> WhatsApp</button>
            <button onClick={() => setShowBroadcastModal(true)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><FaEnvelope /> Broadcast</button>
            <button onClick={() => setShowDirectorModal(true)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><FaEdit /> Director</button>
            <button onClick={() => setShowAdminCredModal(true)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#f5a623' }}><FaKey /> Change Credentials</button>
            <button onClick={() => setShowResetModal(true)} style={{ background: 'none', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444' }}><FaExclamationTriangle /> Clear DB</button>
          </div>
        </div>

        <div style={{ padding: '30px' }}>
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <FaUsers style={{ fontSize: '2.2rem', color: '#f5a623' }} />
                  <div><h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' }}>{stats.totalStudents}</h3><p>Total Students</p></div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <FaMoneyBillWave style={{ fontSize: '2.2rem', color: '#f5a623' }} />
                  <div><h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' }}>GHS {stats.totalRevenue.toLocaleString()}</h3><p>Revenue</p></div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <FaComments style={{ fontSize: '2.2rem', color: '#f5a623' }} />
                  <div><h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' }}>{stats.totalComments}</h3><p>Comments</p></div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <FaStar style={{ fontSize: '2.2rem', color: '#f5a623' }} />
                  <div><h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' }}>{stats.avgRating}/5</h3><p>Avg Rating</p></div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <FaCertificate style={{ fontSize: '2.2rem', color: '#f5a623' }} />
                  <div><h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' }}>{stats.certificatesReleased}</h3><p>Certificates</p></div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <FaTicketAlt style={{ fontSize: '2.2rem', color: '#f5a623' }} />
                  <div><h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' }}>{stats.openTickets}</h3><p>Open Tickets</p></div>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <FaEdit style={{ fontSize: '2.2rem', color: '#f5a623' }} />
                  <div><h3 style={{ fontSize: '1.8rem', fontWeight: '700', marginBottom: '5px' }}>{stats.pendingEditRequests}</h3><p>Edit Requests</p></div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '15px' }}>Registration Trend (Last 7 Days)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={registrationTrend}>
                      <XAxis dataKey="date" /><YAxis /><Tooltip /><Legend />
                      <Line type="monotone" dataKey="registrations" stroke="#f5a623" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '15px' }}>Course Popularity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={coursePopularity}>
                      <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                      <YAxis /><Tooltip /><Bar dataKey="registered" fill="#f5a623" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '15px' }}>Payment Status</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} dataKey="value">
                        {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: '40px', padding: '8px 16px', gap: '8px', flex: '1', maxWidth: '350px', border: '1px solid #ddd' }}>
                  <FaSearch />
                  <input type="text" placeholder="Search by Reg ID, Name, Student ID or Email..." defaultValue={searchTerm} onChange={(e) => { const val = e.target.value; const timer = setTimeout(() => setSearchTerm(val), 300); return () => clearTimeout(timer); }} style={{ border: 'none', outline: 'none', flex: 1, background: 'transparent' }} />
                </div>
                <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}>
                  <option value="all">All Levels</option>
                  <option value="100">Level 100</option><option value="200">Level 200</option>
                  <option value="300">Level 300</option><option value="400">Level 400</option>
                </select>
                <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #ddd', background: 'white' }}>
                  <option value="all">All Payment</option><option value="pending">Pending</option><option value="paid">Paid</option>
                </select>
                <button onClick={exportToCSV} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><FaDownload /> Export CSV</button>
                <button onClick={fetchAllData} style={{ background: '#f5a623', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><FaSync /> Refresh</button>
              </div>
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                    <thead><tr style={{ background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Reg ID</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Student ID</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Level</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Courses</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Amount</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Payment</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Cert</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                    </tr></thead>
                    <tbody>
                      {filteredStudents.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px 15px', fontFamily: 'monospace', fontWeight: 'bold', color: '#f5a623' }}>{s.reg_id}</td>
                          <td style={{ padding: '12px 15px' }}>{s.full_name}</td>
                          <td style={{ padding: '12px 15px' }}>{s.student_id}</td>
                          <td style={{ padding: '12px 15px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</td>
                          <td style={{ padding: '12px 15px' }}>L{s.level}</td>
                          <td style={{ padding: '12px 15px' }}>{s.courses?.length || 0}</td>
                          <td style={{ padding: '12px 15px' }}>GHS {s.total_amount}</td>
                          <td style={{ padding: '12px 15px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600', background: s.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0', color: s.payment_status === 'paid' ? '#2e7d32' : '#ef6c00' }}>{s.payment_status || 'pending'}</span></td>
                          <td style={{ padding: '12px 15px' }}>{s.certificate_released ? '✅' : '❌'}</td>
                          <td style={{ padding: '12px 15px', whiteSpace: 'nowrap' }}>
                            <button onClick={() => { setEditStudent(s); setShowEditStudentModal(true); }} style={{ background: '#2196f3', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer', marginRight: '5px' }}><FaEdit /></button>
                            <button onClick={() => { setSelectedStudent(s); setShowMarkPaidModal(true); }} style={{ background: '#10b981', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer', marginRight: '5px' }}><FaCheckCircle /></button>
                            <button onClick={() => { setSelectedStudent(s); setShowDeleteStudentModal(true); }} style={{ background: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><FaTrashAlt /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredStudents.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No students found</div>}
              </div>
            </div>
          )}

          {/* Certificates Tab */}
          {activeTab === 'certificates' && (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <button onClick={() => setShowBulkReleaseModal(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}><FaCertificate /> Bulk Release (Paid Students)</button>
              </div>
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead><tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Reg ID</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Student ID</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Payment</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Certificate</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                    </tr></thead>
                    
                    <tbody>
                      {students.map(s => (
                        <tr key={s.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px 15px', fontFamily: 'monospace', fontWeight: 'bold', color: '#f5a623' }}>{s.reg_id}</td>
                          <td style={{ padding: '12px 15px' }}>{s.full_name}</td>
                          <td style={{ padding: '12px 15px' }}>{s.student_id}</td>
                          <td style={{ padding: '12px 15px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600', background: s.payment_status === 'paid' ? '#e8f5e9' : '#fff3e0', color: s.payment_status === 'paid' ? '#2e7d32' : '#ef6c00' }}>{s.payment_status}</span></td>
                          <td style={{ padding: '12px 15px' }}>{s.certificate_released ? '✅ Released' : '⏳ Pending'}</td>
                          <td style={{ padding: '12px 15px' }}>
                            {!s.certificate_released && s.payment_status === 'paid' && (
                              <button onClick={() => { setSelectedStudent(s); setShowReleaseCertModal(true); }} style={{ background: '#8b5cf6', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}><FaCertificate /> Release</button>
                            )}
                            {s.certificate_released && <span style={{ background: '#10b981', padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', color: 'white' }}>Released</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Support Tickets Tab */}
          {activeTab === 'tickets' && (
            <div>
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead><tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Student</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Subject</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Message</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Admin Reply</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                      {tickets.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px 15px' }}>#{t.id}</td>
                          <td style={{ padding: '12px 15px' }}><strong>{t.student_name}</strong><br/><small style={{ color: '#666' }}>{t.student_email}</small></td>
                          <td style={{ padding: '12px 15px' }}>{t.subject}</td>
                          <td style={{ padding: '12px 15px', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.message}</td>
                          <td style={{ padding: '12px 15px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: t.admin_reply ? '#10b981' : '#999' }}>{t.admin_reply || 'No reply yet'}</td>
                          <td style={{ padding: '12px 15px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600', background: t.status === 'open' ? '#fff3e0' : '#e8f5e9', color: t.status === 'open' ? '#ef6c00' : '#2e7d32' }}>{t.status === 'open' ? '🟡 Open' : '✅ Closed'}</span></td>
                          <td style={{ padding: '12px 15px', fontSize: '0.8rem' }}>{new Date(t.created_at).toLocaleDateString()}</td>
                          <td style={{ padding: '12px 15px' }}>
                            {t.status === 'open' && (
                              <button onClick={() => { setSelectedTicket(t); setShowReplyTicketModal(true); }} style={{ background: '#f5a623', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><FaReply /> Reply</button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {tickets.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No support tickets yet</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Edit Requests Tab */}
          {activeTab === 'editRequests' && (
            <div>
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead><tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Student</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Requested Changes</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                    </tr></thead>
                    <tbody>
                      {editRequests.map(req => {
                        let requestedData = {}
                        try { requestedData = JSON.parse(req.requested_data || '{}') } catch(e) {}
                        return (
                          <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '12px 15px' }}>#{req.id}</td>
                            <td style={{ padding: '12px 15px' }}><strong>{req.student_name}</strong></td>
                            <td style={{ padding: '12px 15px' }}>
                              <button 
                                onClick={() => handleViewEditRequest(req)}
                                style={{ background: '#f5a623', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}
                              >
                                View Changes
                              </button>
                            </td>
                            <td style={{ padding: '12px 15px' }}>
                              <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', background: req.status === 'pending' ? '#fff3e0' : req.status === 'approved' ? '#e8f5e9' : '#ffebee', color: req.status === 'pending' ? '#ef6c00' : req.status === 'approved' ? '#2e7d32' : '#c62828' }}>
                                {req.status === 'pending' ? '🟡 Pending' : req.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 15px', fontSize: '0.8rem' }}>{new Date(req.created_at).toLocaleString()}</td>
                            <td style={{ padding: '12px 15px' }}>
                              {req.status === 'pending' && (
                                <>
                                  <button onClick={() => handleApproveEditRequest(req.id)} style={{ background: '#10b981', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer', marginRight: '5px' }}><FaCheck /> Approve</button>
                                  <button onClick={() => handleRejectEditRequest(req.id)} style={{ background: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><FaBan /> Reject</button>
                                </>
                              )}
                              {req.status !== 'pending' && <span style={{ fontSize: '0.8rem', color: '#666' }}>Processed</span>}
                            </td>
                          </tr>
                        )
                      })}
                      {editRequests.length === 0 && <tr><td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No edit requests</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Courses Tab */}
          {activeTab === 'courses' && (
            <div>
              <button onClick={() => setShowAddCourseModal(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><FaPlus /> Add Course</button>
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '750px' }}>
                    <thead><tr style={{ background: '#f8f9fa' }}>
                      <th style={{ padding: '15px', textAlign: 'left' }} width="60">Icon</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Course</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Level</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Price</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Instructor</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Registered</th>
                      <th style={{ padding: '15px', textAlign: 'left' }}>Actions</th>
                    </tr></thead>
                    <tbody>
                      {courses.map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px 15px', fontSize: '1.5rem', color: '#f5a623', textAlign: 'center' }}>
                            {getCourseIconComponent(c.icon || 'FaCode')}
                          </td>
                          <td style={{ padding: '12px 15px', fontWeight: '500' }}>{c.name}</td>
                          <td style={{ padding: '12px 15px' }}>Level {c.level}</td>
                          <td style={{ padding: '12px 15px' }}>GHS {c.price}</td>
                          <td style={{ padding: '12px 15px' }}>{c.instructor}</td>
                          <td style={{ padding: '12px 15px' }}>{c.registered_count || 0}</td>
                          <td style={{ padding: '12px 15px', whiteSpace: 'nowrap' }}>
                            <button onClick={() => { setEditCourse(c); setShowEditCourseModal(true); }} style={{ background: '#2196f3', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer', marginRight: '5px' }}><FaEdit /></button>
                            <button onClick={() => { setSelectedCourse(c); setShowDeleteCourseModal(true); }} style={{ background: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><FaTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Tutors Tab */}
          {activeTab === 'tutors' && (
            <div>
              <button onClick={() => setShowAddTutorModal(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><FaPlus /> Add Tutor</button>
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead><tr style={{ background: '#f8f9fa' }}><th style={{ padding: '15px', textAlign: 'left' }}>Image</th><th>Name</th><th>Specialization</th><th>Experience</th><th>Email</th><th>Actions</th></tr></thead>
                    <tbody>
                      {tutors.map(t => (
                        <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px 15px' }}>
                            {t.image_url ? <img src={t.image_url} alt={t.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f5a623', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: 'white' }}><FaUserGraduate /></div>}
                          </td>
                          <td style={{ padding: '12px 15px' }}>{t.name}</td>
                          <td style={{ padding: '12px 15px' }}>{t.specialization}</td>
                          <td style={{ padding: '12px 15px' }}>{t.experience}</td>
                          <td style={{ padding: '12px 15px' }}>{t.email}</td>
                          <td style={{ padding: '12px 15px' }}>
                            <button onClick={() => { setEditTutor(t); setShowEditTutorModal(true); }} style={{ background: '#2196f3', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer', marginRight: '5px' }}><FaEdit /></button>
                            <button onClick={() => { setSelectedTutor(t); setShowDeleteTutorModal(true); }} style={{ background: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><FaTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Announcements Tab */}
          {activeTab === 'announcements' && (
            <div>
              <button onClick={() => setShowAddAnnouncementModal(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><FaPlus /> Add Announcement</button>
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead><tr style={{ background: '#f8f9fa' }}><th style={{ padding: '15px', textAlign: 'left' }}>Title</th><th>Content</th><th>Type</th><th>Date</th><th>Actions</th></tr></thead>
                    <tbody>
                      {announcements.map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px 15px' }}>{a.title}</td>
                          <td style={{ padding: '12px 15px' }}>{a.content.substring(0, 50)}...</td>
                          <td style={{ padding: '12px 15px' }}><span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: '600', background: a.type === 'important' ? '#ffebee' : a.type === 'promo' ? '#e8f5e9' : '#e3f2fd', color: a.type === 'important' ? '#c62828' : a.type === 'promo' ? '#2e7d32' : '#1565c0' }}>{a.type}</span></td>
                          <td style={{ padding: '12px 15px' }}>{a.date}</td>
                          <td style={{ padding: '12px 15px' }}>
                            <button onClick={() => { setEditAnnouncement(a); setShowEditAnnouncementModal(true); }} style={{ background: '#2196f3', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer', marginRight: '5px' }}><FaEdit /></button>
                            <button onClick={() => { setSelectedAnnouncement(a); setShowDeleteAnnouncementModal(true); }} style={{ background: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><FaTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Partners Tab */}
          {activeTab === 'partners' && (
            <div>
              <button onClick={() => setShowAddPartnerModal(true)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}><FaPlus /> Add Partner</button>
              <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                    <thead><tr style={{ background: '#f8f9fa' }}><th style={{ padding: '15px', textAlign: 'left' }}>Name</th><th>Icon</th><th>Link</th><th>Color</th><th>Actions</th></tr></thead>
                    <tbody>
                      {partners.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px 15px' }}>{p.name}</td>
                          <td style={{ padding: '12px 15px', fontSize: '1.5rem', color: p.color }}>{iconOptions.find(i => i.name === p.icon)?.icon || <FaCode />}</td>
                          <td style={{ padding: '12px 15px' }}><a href={p.link} target="_blank" rel="noopener noreferrer">Visit</a></td>
                          <td style={{ padding: '12px 15px' }}><span style={{ background: p.color, width: '20px', height: '20px', display: 'inline-block', borderRadius: '4px' }}></span></td>
                          <td style={{ padding: '12px 15px' }}>
                            <button onClick={() => { setEditPartner(p); setShowEditPartnerModal(true); }} style={{ background: '#2196f3', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer', marginRight: '5px' }}><FaEdit /></button>
                            <button onClick={() => { setSelectedPartner(p); setShowDeletePartnerModal(true); }} style={{ background: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><FaTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <div>
              {comments.map(c => (
                <div key={c.id} style={{ background: 'white', padding: '15px', borderRadius: '12px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div><strong>{c.user_name}</strong> <span>{'⭐'.repeat(c.rating)}</span><br/><small style={{ color: '#999' }}>{c.content}</small></div>
                  <button onClick={() => { setSelectedComment(c); setShowDeleteCommentModal(true); }} style={{ background: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}><FaTrash /> Delete</button>
                </div>
              ))}
              {comments.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No comments yet</div>}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '10px' }}>Registration Deadline</h3>
                <p>Current: {new Date(deadline).toLocaleString()}</p>
                <button onClick={() => setShowDeadlineModal(true)} style={{ marginTop: '15px', background: '#f5a623', border: 'none', padding: '8px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Change Deadline</button>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3>WhatsApp Group Link</h3>
                <p style={{ wordBreak: 'break-all', fontSize: '0.8rem', color: '#666' }}>{whatsappLink}</p>
                <button onClick={() => setShowWhatsAppModal(true)} style={{ marginTop: '15px', background: '#f5a623', border: 'none', padding: '8px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Update Link</button>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3>Director's Message</h3>
                <button onClick={() => setShowDirectorModal(true)} style={{ marginTop: '15px', background: '#f5a623', border: 'none', padding: '8px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Edit Message</button>
              </div>
            </div>
          )}

          {/* Activity Logs Tab */}
          {activeTab === 'activity' && (
            <div style={{ background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                  <thead><tr style={{ background: '#f8f9fa' }}><th style={{ padding: '15px', textAlign: 'left' }}>Time</th><th>Action</th><th>Details</th></tr></thead>
                  <tbody>
                    {activityLogs.map(log => (
                      <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px 15px' }}>{new Date(log.created_at).toLocaleString()}</td>
                        <td style={{ padding: '12px 15px' }}><span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '12px', fontSize: '0.7rem' }}>{log.action}</span></td>
                        <td style={{ padding: '12px 15px' }}>{log.details}</td>
                      </tr>
                    ))}
                    {activityLogs.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No activity logs found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODALS - ALL ORIGINAL MODALS INTACT */}
      <Modal isOpen={showAddCourseModal} onClose={() => setShowAddCourseModal(false)} title="Add New Course" maxWidth="650px">
        <form onSubmit={handleAddCourse}>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Course Icon *</label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <select value={newCourse.icon} onChange={(e) => setNewCourse({...newCourse, icon: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}>
                {courseIconOptions.map(opt => (<option key={opt.name} value={opt.name}>{opt.label}</option>))}
              </select>
              <div style={{ width: '60px', height: '60px', background: '#f8f9fa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#f5a623', border: '1px solid #e2e8f0' }}>
                {getCourseIconComponent(newCourse.icon)}
              </div>
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Course Name *</label>
            <input type="text" value={newCourse.name} onChange={(e) => setNewCourse({...newCourse, name: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Level *</label>
              <select value={newCourse.level} onChange={(e) => setNewCourse({...newCourse, level: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <option value={100}>Level 100</option><option value={200}>Level 200</option><option value={300}>Level 300</option><option value={400}>Level 400</option>
              </select>
            </div>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Price (GHS) *</label>
              <input type="number" value={newCourse.price} onChange={(e) => setNewCourse({...newCourse, price: parseFloat(e.target.value)})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Instructor *</label>
            <select value={newCourse.instructor} onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
              {instructorOptions.map(inst => (<option key={inst} value={inst}>{inst}</option>))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Venue</label>
            <input type="text" value={newCourse.venue} onChange={(e) => setNewCourse({...newCourse, venue: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
          </div>
          <div className="form-group" style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Description</label>
            <textarea value={newCourse.description} onChange={(e) => setNewCourse({...newCourse, description: e.target.value})} rows="3" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}></textarea>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddCourseModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Add Course</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditCourseModal} onClose={() => setShowEditCourseModal(false)} title="Edit Course" maxWidth="650px">
        {editCourse && (
          <form onSubmit={handleEditCourseSubmit}>
            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Course Icon *</label>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                <select value={editCourse.icon || 'FaCode'} onChange={(e) => setEditCourse({...editCourse, icon: e.target.value})} style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '1rem' }}>
                  {courseIconOptions.map(opt => (<option key={opt.name} value={opt.name}>{opt.label}</option>))}
                </select>
                <div style={{ width: '60px', height: '60px', background: '#f8f9fa', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: '#f5a623', border: '1px solid #e2e8f0' }}>
                  {getCourseIconComponent(editCourse.icon || 'FaCode')}
                </div>
              </div>
            </div>
            <input type="text" placeholder="Course Name" value={editCourse.name} onChange={(e) => setEditCourse({...editCourse, name: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <select value={editCourse.level} onChange={(e) => setEditCourse({...editCourse, level: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <option value={100}>Level 100</option><option value={200}>Level 200</option><option value={300}>Level 300</option><option value={400}>Level 400</option>
              </select>
              <input type="number" placeholder="Price" value={editCourse.price} onChange={(e) => setEditCourse({...editCourse, price: parseFloat(e.target.value)})} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '8px' }} />
            </div>
            <select value={editCourse.instructor} onChange={(e) => setEditCourse({...editCourse, instructor: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
              {instructorOptions.map(inst => (<option key={inst} value={inst}>{inst}</option>))}
            </select>
            <textarea placeholder="Description" value={editCourse.description} onChange={(e) => setEditCourse({...editCourse, description: e.target.value})} rows="3" style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}></textarea>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowEditCourseModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showEditRequestDetailsModal} onClose={() => setShowEditRequestDetailsModal(false)} title="Edit Request Details" maxWidth="700px">
        {selectedEditRequest && (() => {
          let requestedData = {}
          try { requestedData = JSON.parse(selectedEditRequest.requested_data || '{}') } catch(e) {}
          return (
            <div>
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ color: '#f5a623', marginBottom: '10px' }}>Student: {selectedEditRequest.student_name}</h4>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>Requested on: {new Date(selectedEditRequest.created_at).toLocaleString()}</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '12px' }}>
                  <h4 style={{ color: '#0a192f', marginBottom: '15px', borderBottom: '2px solid #f5a623', paddingBottom: '5px' }}>📋 Current Data</h4>
                  <div style={{ fontSize: '0.9rem' }}>
                    <p><strong>Full Name:</strong> {originalStudentData?.full_name || 'N/A'}</p>
                    <p><strong>Student ID:</strong> {originalStudentData?.student_id || 'N/A'}</p>
                    <p><strong>Email:</strong> {originalStudentData?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {originalStudentData?.phone || 'N/A'}</p>
                    <p><strong>Programme:</strong> {originalStudentData?.programme || 'N/A'}</p>
                    <p><strong>Level:</strong> {originalStudentData?.level ? `Level ${originalStudentData.level}` : 'N/A'}</p>
                  </div>
                </div>
                <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '12px' }}>
                  <h4 style={{ color: '#f5a623', marginBottom: '15px', borderBottom: '2px solid #f5a623', paddingBottom: '5px' }}>✏️ Requested Changes</h4>
                  <div style={{ fontSize: '0.9rem' }}>
                    <p><strong>Full Name:</strong> {requestedData.full_name || <span style={{ color: '#999' }}>No change</span>}</p>
                    <p><strong>Student ID:</strong> {requestedData.student_id || <span style={{ color: '#999' }}>No change</span>}</p>
                    <p><strong>Email:</strong> {requestedData.email || <span style={{ color: '#999' }}>No change</span>}</p>
                    <p><strong>Phone:</strong> {requestedData.phone || <span style={{ color: '#999' }}>No change</span>}</p>
                    <p><strong>Programme:</strong> {requestedData.programme || <span style={{ color: '#999' }}>No change</span>}</p>
                    <p><strong>Level:</strong> {requestedData.level ? `Level ${requestedData.level}` : <span style={{ color: '#999' }}>No change</span>}</p>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: '20px', padding: '10px', background: '#e8f5e9', borderRadius: '8px' }}>
                <h4 style={{ color: '#2e7d32', marginBottom: '10px' }}>📝 Summary of Changes</h4>
                <ul style={{ fontSize: '0.85rem', paddingLeft: '20px' }}>
                  {requestedData.full_name && requestedData.full_name !== originalStudentData?.full_name && <li>Name: <span style={{ textDecoration: 'line-through', color: '#999' }}>{originalStudentData?.full_name}</span> → <span style={{ color: '#2e7d32' }}>{requestedData.full_name}</span></li>}
                  {requestedData.student_id && requestedData.student_id !== originalStudentData?.student_id && <li>Student ID: <span style={{ textDecoration: 'line-through', color: '#999' }}>{originalStudentData?.student_id}</span> → <span style={{ color: '#2e7d32' }}>{requestedData.student_id}</span></li>}
                  {requestedData.email && requestedData.email !== originalStudentData?.email && <li>Email: <span style={{ textDecoration: 'line-through', color: '#999' }}>{originalStudentData?.email}</span> → <span style={{ color: '#2e7d32' }}>{requestedData.email}</span></li>}
                  {requestedData.phone && requestedData.phone !== originalStudentData?.phone && <li>Phone: <span style={{ textDecoration: 'line-through', color: '#999' }}>{originalStudentData?.phone}</span> → <span style={{ color: '#2e7d32' }}>{requestedData.phone}</span></li>}
                  {requestedData.programme && requestedData.programme !== originalStudentData?.programme && <li>Programme: <span style={{ textDecoration: 'line-through', color: '#999' }}>{originalStudentData?.programme}</span> → <span style={{ color: '#2e7d32' }}>{requestedData.programme}</span></li>}
                  {requestedData.level && requestedData.level !== originalStudentData?.level && <li>Level: <span style={{ textDecoration: 'line-through', color: '#999' }}>Level {originalStudentData?.level}</span> → <span style={{ color: '#2e7d32' }}>Level {requestedData.level}</span></li>}
                </ul>
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button onClick={() => setShowEditRequestDetailsModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Close</button>
                {selectedEditRequest.status === 'pending' && (
                  <>
                    <button onClick={() => { handleApproveEditRequest(selectedEditRequest.id); }} style={{ background: '#10b981', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}><FaCheck /> Approve</button>
                    <button onClick={() => { handleRejectEditRequest(selectedEditRequest.id); }} style={{ background: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}><FaBan /> Reject</button>
                  </>
                )}
              </div>
            </div>
          )
        })()}
      </Modal>

      <Modal isOpen={showAddTutorModal} onClose={() => setShowAddTutorModal(false)} title="Add New Tutor" maxWidth="600px">
        <form onSubmit={handleAddTutor}>
          <input type="text" placeholder="Name" value={newTutor.name} onChange={(e) => setNewTutor({...newTutor, name: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <input type="text" placeholder="Specialization" value={newTutor.specialization} onChange={(e) => setNewTutor({...newTutor, specialization: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <input type="text" placeholder="Experience" value={newTutor.experience} onChange={(e) => setNewTutor({...newTutor, experience: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <input type="email" placeholder="Email" value={newTutor.email} onChange={(e) => setNewTutor({...newTutor, email: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <div style={{ margin: '15px 0' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Profile Image</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {newTutor.image_url ? <img src={newTutor.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUserGraduate style={{ fontSize: '2rem', color: '#ccc' }} />}
              </div>
              <div>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginBottom: '5px' }} />
                <small style={{ display: 'block', color: '#666' }}>Upload JPG, PNG (max 2MB)</small>
                {uploadingImage && <FaSpinner className="spinning" style={{ marginTop: '5px' }} />}
              </div>
            </div>
          </div>
          <input type="text" placeholder="LinkedIn URL" value={newTutor.linkedin} onChange={(e) => setNewTutor({...newTutor, linkedin: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddTutorModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Add Tutor</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditTutorModal} onClose={() => setShowEditTutorModal(false)} title="Edit Tutor" maxWidth="600px">
        {editTutor && (
          <form onSubmit={handleEditTutorSubmit}>
            <input type="text" placeholder="Name" value={editTutor.name} onChange={(e) => setEditTutor({...editTutor, name: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <input type="text" placeholder="Specialization" value={editTutor.specialization} onChange={(e) => setEditTutor({...editTutor, specialization: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <input type="text" placeholder="Experience" value={editTutor.experience} onChange={(e) => setEditTutor({...editTutor, experience: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <input type="email" placeholder="Email" value={editTutor.email} onChange={(e) => setEditTutor({...editTutor, email: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <div style={{ margin: '15px 0' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Profile Image</label>
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {editTutor.image_url ? <img src={editTutor.image_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <FaUserGraduate style={{ fontSize: '2rem', color: '#ccc' }} />}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={handleEditImageUpload} style={{ marginBottom: '5px' }} />
                  <small style={{ display: 'block', color: '#666' }}>Upload new image to replace current</small>
                  {uploadingImage && <FaSpinner className="spinning" style={{ marginTop: '5px' }} />}
                </div>
              </div>
            </div>
            <input type="text" placeholder="LinkedIn URL" value={editTutor.linkedin} onChange={(e) => setEditTutor({...editTutor, linkedin: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowEditTutorModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showAddAnnouncementModal} onClose={() => setShowAddAnnouncementModal(false)} title="Add Announcement">
        <form onSubmit={handleAddAnnouncement}>
          <input type="text" placeholder="Title" value={newAnnouncement.title} onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <textarea placeholder="Content" value={newAnnouncement.content} onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})} rows="3" required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}></textarea>
          <select value={newAnnouncement.type} onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
            <option value="info">Info</option><option value="important">Important</option><option value="promo">Promo</option>
          </select>
          <input type="date" value={newAnnouncement.date} onChange={(e) => setNewAnnouncement({...newAnnouncement, date: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddAnnouncementModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Add Announcement</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditAnnouncementModal} onClose={() => setShowEditAnnouncementModal(false)} title="Edit Announcement">
        {editAnnouncement && (
          <form onSubmit={handleEditAnnouncementSubmit}>
            <input type="text" placeholder="Title" value={editAnnouncement.title} onChange={(e) => setEditAnnouncement({...editAnnouncement, title: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <textarea placeholder="Content" value={editAnnouncement.content} onChange={(e) => setEditAnnouncement({...editAnnouncement, content: e.target.value})} rows="3" required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}></textarea>
            <select value={editAnnouncement.type} onChange={(e) => setEditAnnouncement({...editAnnouncement, type: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
              <option value="info">Info</option><option value="important">Important</option><option value="promo">Promo</option>
            </select>
            <input type="date" value={editAnnouncement.date} onChange={(e) => setEditAnnouncement({...editAnnouncement, date: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowEditAnnouncementModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showAddPartnerModal} onClose={() => setShowAddPartnerModal(false)} title="Add Partner">
        <form onSubmit={handleAddPartner}>
          <input type="text" placeholder="Name" value={newPartner.name} onChange={(e) => setNewPartner({...newPartner, name: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <select value={newPartner.icon} onChange={(e) => setNewPartner({...newPartner, icon: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
            {iconOptions.map(opt => (<option key={opt.name} value={opt.name}>{opt.name}</option>))}
          </select>
          <input type="text" placeholder="Link" value={newPartner.link} onChange={(e) => setNewPartner({...newPartner, link: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <input type="color" value={newPartner.color} onChange={(e) => setNewPartner({...newPartner, color: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setShowAddPartnerModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Add Partner</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showEditPartnerModal} onClose={() => setShowEditPartnerModal(false)} title="Edit Partner">
        {editPartner && (
          <form onSubmit={handleEditPartnerSubmit}>
            <input type="text" placeholder="Name" value={editPartner.name} onChange={(e) => setEditPartner({...editPartner, name: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <select value={editPartner.icon} onChange={(e) => setEditPartner({...editPartner, icon: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
              {iconOptions.map(opt => (<option key={opt.name} value={opt.name}>{opt.name}</option>))}
            </select>
            <input type="text" placeholder="Link" value={editPartner.link} onChange={(e) => setEditPartner({...editPartner, link: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <input type="color" value={editPartner.color} onChange={(e) => setEditPartner({...editPartner, color: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowEditPartnerModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showEditStudentModal} onClose={() => setShowEditStudentModal(false)} title={`Edit Student: ${editStudent?.reg_id || ''}`}>
        {editStudent && (
          <form onSubmit={handleEditStudentSubmit}>
            <input type="text" placeholder="Full Name" value={editStudent.full_name} onChange={(e) => setEditStudent({...editStudent, full_name: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <input type="text" placeholder="Student ID" value={editStudent.student_id} onChange={(e) => setEditStudent({...editStudent, student_id: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <input type="email" placeholder="Email" value={editStudent.email} onChange={(e) => setEditStudent({...editStudent, email: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <input type="tel" placeholder="Phone" value={editStudent.phone} onChange={(e) => setEditStudent({...editStudent, phone: e.target.value})} required style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
            <select value={editStudent.programme} onChange={(e) => setEditStudent({...editStudent, programme: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
              <option>Information Technology</option><option>Computer Science</option><option>Other</option>
            </select>
            <select value={editStudent.level} onChange={(e) => setEditStudent({...editStudent, level: parseInt(e.target.value)})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
              <option value={100}>Level 100</option><option value={200}>Level 200</option>
              <option value={300}>Level 300</option><option value={400}>Level 400</option>
            </select>
            <select value={editStudent.payment_status} onChange={(e) => setEditStudent({...editStudent, payment_status: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}>
              <option value="pending">Pending</option><option value="paid">Paid</option>
            </select>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowEditStudentModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Save Changes</button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={showReplyTicketModal} onClose={() => setShowReplyTicketModal(false)} title={`Reply to Ticket #${selectedTicket?.id}`}>
        <div style={{ marginBottom: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
          <p><strong>From:</strong> {selectedTicket?.student_name}</p>
          <p><strong>Subject:</strong> {selectedTicket?.subject}</p>
          <p><strong>Message:</strong> {selectedTicket?.message}</p>
        </div>
        <textarea rows="5" placeholder="Type your reply here..." value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowReplyTicketModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleReplyTicket} style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}><FaReply /> Send Reply</button>
        </div>
      </Modal>

      <Modal isOpen={showDeadlineModal} onClose={() => setShowDeadlineModal(false)} title="Set Registration Deadline">
        <input type="datetime-local" value={deadline.slice(0, 16)} onChange={(e) => setDeadline(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowDeadlineModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleUpdateDeadline} style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Save Deadline</button>
        </div>
      </Modal>

      <Modal isOpen={showWhatsAppModal} onClose={() => setShowWhatsAppModal(false)} title="Update WhatsApp Link">
        <input type="text" value={whatsappLink} onChange={(e) => setWhatsappLink(e.target.value)} placeholder="WhatsApp invite link" style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowWhatsAppModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleUpdateWhatsApp} style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Save Link</button>
        </div>
      </Modal>

      <Modal isOpen={showDirectorModal} onClose={() => setShowDirectorModal(false)} title="Edit Director's Message" maxWidth="650px">
        <textarea placeholder="Message Content" value={directorMessage.content} onChange={(e) => setDirectorMessage({...directorMessage, content: e.target.value})} rows="10" style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }}></textarea>
        <input type="text" placeholder="Signature" value={directorMessage.signature} onChange={(e) => setDirectorMessage({...directorMessage, signature: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowDirectorModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleUpdateDirectorMessage} style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Save Message</button>
        </div>
      </Modal>

      <Modal isOpen={showBroadcastModal} onClose={() => setShowBroadcastModal(false)} title="Broadcast Message" maxWidth="550px">
        <textarea rows="5" placeholder="Enter your message to all students..." value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowBroadcastModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSendBroadcast} style={{ background: '#25D366', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}><FaWhatsapp /> Send via WhatsApp</button>
        </div>
      </Modal>

      <Modal isOpen={showAdminCredModal} onClose={() => setShowAdminCredModal(false)} title="Change Admin Credentials">
        <div className="form-group">
          <label>Current Password</label>
          <input type="password" placeholder="Enter current password" value={adminCredForm.current_password} onChange={(e) => setAdminCredForm({...adminCredForm, current_password: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        </div>
        <div className="form-group">
          <label>New Username (optional)</label>
          <input type="text" placeholder="Enter new username" value={adminCredForm.new_username} onChange={(e) => setAdminCredForm({...adminCredForm, new_username: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        </div>
        <div className="form-group">
          <label>New Password (optional, min 6 chars)</label>
          <input type="password" placeholder="Enter new password" value={adminCredForm.new_password} onChange={(e) => setAdminCredForm({...adminCredForm, new_password: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        </div>
        <div className="form-group">
          <label>Confirm New Password</label>
          <input type="password" placeholder="Confirm new password" value={adminCredForm.confirm_password} onChange={(e) => setAdminCredForm({...adminCredForm, confirm_password: e.target.value})} style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '8px' }} />
        </div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
          <button onClick={() => setShowAdminCredModal(false)} style={{ background: '#ddd', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleChangeAdminCredentials} style={{ background: '#f5a623', border: 'none', padding: '10px 20px', borderRadius: '8px', color: 'white', cursor: 'pointer' }}>Update Credentials</button>
        </div>
      </Modal>

      <ConfirmModal isOpen={showDeleteCourseModal} onClose={() => setShowDeleteCourseModal(false)} onConfirm={handleDeleteCourseConfirm} title="Delete Course" message={`Are you sure you want to delete "${selectedCourse?.name}"? This action cannot be undone.`} danger={true} />
      <ConfirmModal isOpen={showDeleteTutorModal} onClose={() => setShowDeleteTutorModal(false)} onConfirm={handleDeleteTutorConfirm} title="Delete Tutor" message={`Are you sure you want to delete "${selectedTutor?.name}"?`} danger={true} />
      <ConfirmModal isOpen={showDeleteAnnouncementModal} onClose={() => setShowDeleteAnnouncementModal(false)} onConfirm={handleDeleteAnnouncementConfirm} title="Delete Announcement" message={`Are you sure you want to delete "${selectedAnnouncement?.title}"?`} danger={true} />
      <ConfirmModal isOpen={showDeletePartnerModal} onClose={() => setShowDeletePartnerModal(false)} onConfirm={handleDeletePartnerConfirm} title="Delete Partner" message={`Are you sure you want to delete "${selectedPartner?.name}"?`} danger={true} />
      <ConfirmModal isOpen={showDeleteStudentModal} onClose={() => setShowDeleteStudentModal(false)} onConfirm={handleDeleteStudentConfirm} title="Delete Student" message={`Are you sure you want to delete "${selectedStudent?.full_name}" (${selectedStudent?.reg_id})?`} danger={true} />
      <ConfirmModal isOpen={showMarkPaidModal} onClose={() => setShowMarkPaidModal(false)} onConfirm={handleMarkPaidConfirm} title="Mark Payment as Paid" message={`Mark ${selectedStudent?.full_name}'s payment as PAID?`} danger={false} />
      <ConfirmModal isOpen={showReleaseCertModal} onClose={() => setShowReleaseCertModal(false)} onConfirm={handleReleaseCertificateConfirm} title="Release Certificate" message={`Release certificate for ${selectedStudent?.full_name}?`} danger={false} />
      <ConfirmModal isOpen={showBulkReleaseModal} onClose={() => setShowBulkReleaseModal(false)} onConfirm={handleBulkReleaseConfirm} title="Bulk Release Certificates" message={`Release certificates for ALL students with PAID status?`} danger={true} />
      <ConfirmModal isOpen={showDeleteCommentModal} onClose={() => setShowDeleteCommentModal(false)} onConfirm={handleDeleteCommentConfirm} title="Delete Comment" message={`Are you sure you want to delete this comment?`} danger={true} />
      <ConfirmModal isOpen={showResetModal} onClose={() => setShowResetModal(false)} onConfirm={handleResetDatabaseConfirm} title="⚠️ DANGER: Clear All Database" message="This will permanently delete ALL student registrations, comments, support tickets, edit requests, and activity logs. This action CANNOT be undone!" danger={true} />
      
      <style>{`
        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default React.memo(AdminPanel)
