import React, { useState, useEffect, useRef } from 'react'
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaReply, FaTimes } from 'react-icons/fa'
import axios from 'axios'
import { useSocket } from '../contexts/SocketContext'

const CommentSection = () => {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState({ user_name: '', rating: 5, content: '', parent_id: null })
  const [replyingTo, setReplyingTo] = useState(null)
  const [loading, setLoading] = useState(true)
  const { socket, typingUsers, emitTyping } = useSocket()
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    fetchComments()
    
    const handleNewComment = () => fetchComments()
    const handleCommentLiked = () => fetchComments()
    
    window.addEventListener('newComment', handleNewComment)
    window.addEventListener('commentLiked', handleCommentLiked)
    
    return () => {
      window.removeEventListener('newComment', handleNewComment)
      window.removeEventListener('commentLiked', handleCommentLiked)
    }
  }, [])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/comments')
      setComments(response.data)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (id) => {
    try {
      await axios.post(`/api/comments/${id}/like`)
      if (socket) socket.emit('like_comment', { comment_id: id })
      fetchComments()
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!newComment.user_name || !newComment.content) return
    try {
      await axios.post('/api/comments', newComment)
      if (socket) socket.emit('new_comment', newComment)
      setNewComment({ user_name: '', rating: 5, content: '', parent_id: null })
      setReplyingTo(null)
      fetchComments()
    } catch (error) {
      console.error('Error posting comment:', error)
    }
  }

  const handleReply = (commentId, userName) => {
    setReplyingTo({ id: commentId, name: userName })
    setNewComment({ ...newComment, parent_id: commentId })
    document.getElementById('comment-input')?.scrollIntoView({ behavior: 'smooth' })
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setNewComment({ ...newComment, parent_id: null, content: '' })
  }

  const handleTyping = () => {
    if (newComment.user_name) {
      emitTyping(newComment.user_name)
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = setTimeout(() => emitTyping(''), 2000)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now - date) / 1000 / 60)
    if (diff < 60) return `${diff} minutes ago`
    if (diff < 1440) return `${Math.floor(diff / 60)} hours ago`
    return `${Math.floor(diff / 1440)} days ago`
  }

  const emojis = ['😊', '😂', '❤️', '🔥', '👍', '🎉', '🙏', '🚀', '💯', '⭐']

  const CommentItem = ({ comment, depth = 0 }) => {
    const [showReplies, setShowReplies] = useState(true)
    return (
      <div className={`comment-item depth-${Math.min(depth, 2)}`}>
        <div className="comment-avatar"><div className="avatar">{comment.user_name?.charAt(0) || 'U'}</div></div>
        <div className="comment-content">
          <div className="comment-header">
            <span className="comment-user">{comment.user_name}</span>
            <div className="comment-rating">
              {[...Array(5)].map((_, i) => i < comment.rating ? <FaStar key={i} className="star filled" /> : <FaRegStar key={i} className="star" />)}
            </div>
            <span className="comment-date">{formatDate(comment.created_at)}</span>
          </div>
          <p className="comment-text">{comment.content}</p>
          <div className="comment-actions">
            <button onClick={() => handleLike(comment.id)} className="action-btn like-btn">
              {comment.likes > 0 ? <FaHeart className="liked" /> : <FaRegHeart />}
              <span>{comment.likes}</span>
            </button>
            <button onClick={() => handleReply(comment.id, comment.user_name)} className="action-btn reply-btn">
              <FaReply /> Reply
            </button>
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="replies-section">
              <button className="toggle-replies" onClick={() => setShowReplies(!showReplies)}>
                {showReplies ? '▼' : '▶'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
              {showReplies && comment.replies.map(reply => <CommentItem key={reply.id} comment={reply} depth={depth + 1} />)}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <section className="comments" id="reviews">
        <div className="container">
          <h2 className="section-title">What Our Students Say</h2>
          <div className="comments-grid">
            <div className="comments-list">
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: '150px', borderRadius: '20px' }}></div>)}
            </div>
            <div className="skeleton" style={{ height: '400px', borderRadius: '20px' }}></div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="comments" id="reviews">
      <div className="container">
        <h2 className="section-title">What Our Students Say</h2>
        <p className="section-subtitle">Join thousands of successful students who transformed their grades</p>

        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
          </div>
        )}

        <div className="comments-grid">
          <div className="comments-list">
            {comments.map(comment => <CommentItem key={comment.id} comment={comment} />)}
            {comments.length === 0 && <div className="no-comments">No comments yet. Be the first to share your experience!</div>}
          </div>

          <div className="comment-form-container" id="comment-input">
            <h3>Share Your Experience</h3>
            {replyingTo && (
              <div className="replying-to">
                Replying to <strong>{replyingTo.name}</strong>
                <button onClick={cancelReply} className="cancel-reply"><FaTimes /></button>
              </div>
            )}
            <form onSubmit={handleSubmit} className="comment-form">
              <div className="emoji-bar">
                {emojis.map(emoji => (
                  <span key={emoji} className="emoji" onClick={() => setNewComment({ ...newComment, content: newComment.content + emoji })}>
                    {emoji}
                  </span>
                ))}
              </div>
              <input 
                type="text" 
                placeholder="Your Name" 
                value={newComment.user_name} 
                onChange={(e) => setNewComment({ ...newComment, user_name: e.target.value })} 
                onKeyUp={handleTyping} 
                required 
              />
              <div className="rating-input">
                <label>Rating:</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <FaStar 
                      key={star} 
                      className={star <= newComment.rating ? 'star filled' : 'star'} 
                      onClick={() => setNewComment({ ...newComment, rating: star })} 
                    />
                  ))}
                </div>
              </div>
              <textarea 
                placeholder={replyingTo ? `Reply to ${replyingTo.name}...` : "Write your review here..."} 
                value={newComment.content} 
                onChange={(e) => setNewComment({ ...newComment, content: e.target.value })} 
                onKeyUp={handleTyping} 
                rows="4" 
                required 
              />
              <button type="submit" className="submit-btn">
                {replyingTo ? 'Post Reply' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .comments { padding: 80px 0; background: var(--white); }
        body.dark .comments { background: var(--citsa-navy); }
        .typing-indicator {
          background: #e3f2fd;
          padding: 8px 16px;
          border-radius: 20px;
          margin-bottom: 20px;
          font-size: 12px;
          color: #1565c0;
          animation: pulse 1s infinite;
          display: inline-block;
        }
        body.dark .typing-indicator { background: #1e3a5f; color: #90caf9; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        .comments-grid { display: grid; grid-template-columns: 1fr 400px; gap: 3rem; }
        @media (max-width: 968px) { .comments-grid { grid-template-columns: 1fr; } }
        .comments-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .comment-item { display: flex; gap: 1rem; padding: 1.5rem; background: var(--gray-light); border-radius: 20px; transition: all 0.3s; }
        body.dark .comment-item { background: var(--citsa-navy-light); }
        .comment-item:hover { transform: translateX(5px); }
        .depth-1 { margin-left: 50px; }
        .depth-2 { margin-left: 100px; }
        @media (max-width: 640px) {
          .depth-1 { margin-left: 30px; }
          .depth-2 { margin-left: 60px; }
        }
        .avatar {
          width: 45px;
          height: 45px;
          background: linear-gradient(135deg, var(--citsa-gold), var(--citsa-gold-dark));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 1.2rem;
        }
        .comment-header { display: flex; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.5rem; }
        .comment-user { font-weight: 700; color: var(--citsa-navy); }
        body.dark .comment-user { color: var(--citsa-gold); }
        .star { color: #ffc107; font-size: 0.8rem; }
        .comment-date { font-size: 0.7rem; color: #999; }
        .comment-text { color: var(--text-dark); line-height: 1.5; margin-bottom: 0.75rem; }
        .comment-actions { display: flex; gap: 1rem; }
        .action-btn { background: none; border: none; display: flex; align-items: center; gap: 5px; cursor: pointer; color: #888; font-size: 0.8rem; }
        .like-btn:hover { color: #ff4444; }
        .reply-btn:hover { color: var(--citsa-gold); }
        .liked { color: #ff4444; }
        .replies-section { margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray); }
        .toggle-replies { background: none; border: none; color: var(--citsa-gold); cursor: pointer; font-size: 0.8rem; margin-bottom: 0.5rem; }
        .comment-form-container { background: var(--gray-light); padding: 1.5rem; border-radius: 20px; position: sticky; top: 100px; }
        @media (max-width: 968px) { .comment-form-container { position: static; } }
        body.dark .comment-form-container { background: var(--citsa-navy-light); }
        .comment-form-container h3 { margin-bottom: 1rem; color: var(--citsa-navy); }
        body.dark .comment-form-container h3 { color: white; }
        .replying-to { background: #e3f2fd; padding: 8px 12px; border-radius: 10px; margin-bottom: 1rem; font-size: 0.8rem; display: flex; justify-content: space-between; align-items: center; }
        .cancel-reply { background: none; border: none; cursor: pointer; color: #999; }
        .emoji-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 1rem; padding: 10px; background: var(--white); border-radius: 12px; }
        body.dark .emoji-bar { background: var(--citsa-navy); }
        .emoji { font-size: 1.5rem; cursor: pointer; transition: transform 0.2s; }
        .emoji:hover { transform: scale(1.2); }
        .comment-form input, .comment-form textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--gray);
          border-radius: 12px;
          margin-bottom: 1rem;
          font-family: inherit;
          background: var(--white);
          color: var(--text-dark);
        }
        body.dark .comment-form input, body.dark .comment-form textarea { background: var(--citsa-navy); border-color: #444; color: white; }
        .comment-form input:focus, .comment-form textarea:focus { outline: none; border-color: var(--citsa-gold); }
        .rating-input { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
        .stars { display: flex; gap: 5px; }
        .stars .star { font-size: 1.2rem; cursor: pointer; transition: transform 0.2s; }
        .stars .star:hover { transform: scale(1.1); }
        .submit-btn { width: 100%; background: linear-gradient(135deg, var(--citsa-gold), var(--citsa-gold-dark)); border: none; padding: 12px; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; transition: all 0.3s; }
        .submit-btn:hover { transform: translateY(-2px); }
        .no-comments { text-align: center; padding: 2rem; color: #999; }
      `}</style>
    </section>
  )
}

export default CommentSection