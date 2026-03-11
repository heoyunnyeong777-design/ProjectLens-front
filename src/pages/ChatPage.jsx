import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { sendChat } from '../api/client'
import styles from './ChatPage.module.css'

export default function ChatPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      content: `프로젝트 #${projectId} 인덱싱이 완료됐어요. 코드베이스에 대해 무엇이든 질문해보세요 🚀`,
      sources: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    const question = input.trim()
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const res = await sendChat(Number(projectId), question)
      setMessages(prev => [...prev, {
        role: 'ai',
        content: res.data.answer,
        sources: res.data.sources || []
      }])
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: '오류가 발생했어요. 서버 상태를 확인해주세요.',
        sources: []
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  return (
    <div className={styles.page}>
      {/* 네비 */}
      <nav className={styles.nav}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          ← ProjectLens
        </button>
        <div className={styles.navCenter}>
          <span className={styles.projectBadge}>Project #{projectId}</span>
          <span className={styles.modelBadge}>GPT-4o-mini</span>
        </div>
        <div className={styles.navRight}>
          <button className={styles.iconBtn}>⚙️</button>
          <button className={styles.iconBtn}>👤</button>
        </div>
      </nav>

      {/* 메시지 */}
      <div className={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} className={`${styles.msgRow} ${msg.role === 'user' ? styles.user : ''}`}>
            {msg.role === 'ai' && (
              <div className={styles.aiAvatar}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div className={styles.msgBody}>
              <div className={styles.msgName}>
                {msg.role === 'ai' ? 'ProjectLens AI' : 'You'}
              </div>
              <div className={`${styles.bubble} ${msg.role === 'ai' ? styles.aiBubble : styles.userBubble}`}>
                {msg.content}
                {msg.sources && msg.sources.length > 0 && (
                  <div className={styles.sources}>
                    {msg.sources.slice(0, 4).map((s, j) => (
                      <span key={j} className={styles.sourceTag}>
                        {s.file_path?.split('/').pop() || s.file_path}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className={styles.msgRow}>
            <div className={styles.aiAvatar}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className={styles.msgBody}>
              <div className={styles.msgName}>ProjectLens AI</div>
              <div className={`${styles.bubble} ${styles.aiBubble}`}>
                <div className={styles.loadingDots}>
                  <span /><span /><span />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className={styles.inputWrap}>
        <div className={styles.inputBox}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            placeholder="코드베이스에 대해 질문해보세요..."
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button className={styles.sendBtn} onClick={handleSend} disabled={loading || !input.trim()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.hint}>ProjectLens는 실수를 할 수 있어요. 중요한 코드는 꼭 직접 확인하세요.</div>
      </div>
    </div>
  )
}
