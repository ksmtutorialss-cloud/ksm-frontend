import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../config'

const SocketContext = createContext()

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const [onlineCount, setOnlineCount] = useState(0)
  const [typingUsers, setTypingUsers] = useState([])
  const socketRef = useRef(null)

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        path: '/socket.io'
      })
    }

    const socket = socketRef.current

    const handleConnect = () => {
      console.log('✅ Socket connected to', SOCKET_URL)
    }

    const handleConnectError = (error) => {
      console.error('Socket error:', error?.message)
    }

    const handleOnlineCount = (data) => {
      setOnlineCount(data.count)
    }

    const handleUserTyping = (data) => {
      setTypingUsers(data.users || [])
      setTimeout(() => setTypingUsers([]), 3000)
    }

    const handleNewComment = (comment) => {
      window.dispatchEvent(new CustomEvent('newComment', { detail: comment }))
    }

    const handleCommentLiked = (data) => {
      window.dispatchEvent(new CustomEvent('commentLiked', { detail: data }))
    }

    const handleNewRegistration = (data) => {
      window.dispatchEvent(new CustomEvent('newRegistration', { detail: data }))
    }

    socket.on('connect', handleConnect)
    socket.on('connect_error', handleConnectError)
    socket.on('online_count', handleOnlineCount)
    socket.on('user_typing', handleUserTyping)
    socket.on('new_comment', handleNewComment)
    socket.on('comment_liked', handleCommentLiked)
    socket.on('new_registration', handleNewRegistration)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('connect_error', handleConnectError)
      socket.off('online_count', handleOnlineCount)
      socket.off('user_typing', handleUserTyping)
      socket.off('new_comment', handleNewComment)
      socket.off('comment_liked', handleCommentLiked)
      socket.off('new_registration', handleNewRegistration)
    }
  }, [])

  const emitTyping = (userName) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('typing', { user_name: userName })
    }
  }

  const value = React.useMemo(() => ({
    socket: socketRef.current,
    onlineCount,
    typingUsers,
    emitTyping
  }), [onlineCount, typingUsers])

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}