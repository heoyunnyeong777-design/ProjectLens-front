import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import styles from './AnalyzingPage.module.css'

const STEPS = ['\uC800\uC7A5\uC18C \uC218\uC9D1 \uC911', '\uCF54\uB4DC \uCCAD\uD0B9 \uC911', '\uC784\uBCA0\uB529 \uC0DD\uC131 \uC911', 'DB \uC800\uC7A5 \uC911', '\uBCF4\uACE0\uC11C \uC0DD\uC131 \uC911']
const STATUS_TO_STEP = { COLLECTING: 0, CHUNKING: 1, EMBEDDING: 2, SAVING: 3, EMBEDDED: 4, ANALYZING: 4 }
const STATUS_MIN_PROGRESS = { PENDING: 5, COLLECTING: 15, CHUNKING: 45, EMBEDDING: 55, SAVING: 92, EMBEDDED: 100 }

export default function AnalyzingPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [currentFile, setCurrentFile] = useState('\uBD84\uC11D \uC900\uBE44 \uC911...')
  const [fileCount, setFileCount] = useState(0)
  const [done, setDone] = useState(false)

  const targetRef = useRef(5)
  const animRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    animRef.current = setInterval(() => {
      setProgress(prev => prev < targetRef.current ? prev + 1 : prev)
    }, 100)

    pollRef.current = setInterval(poll, 2000)

    return () => {
      clearInterval(animRef.current)
      clearInterval(pollRef.current)
    }
  }, [])

  const poll = async () => {
    try {
      const res = await api.get('/api/projects')
      const project = res.data.find(p => p.id === Number(projectId))
      if (!project) return

      const { status, progress: svrProgress, current_file, file_count } = project

      const minP = STATUS_MIN_PROGRESS[status] ?? 0
      targetRef.current = Math.max(targetRef.current, svrProgress || 0, minP)

      if (STATUS_TO_STEP[status] !== undefined)
        setCurrentStep(prev => Math.max(prev, STATUS_TO_STEP[status]))

      if (current_file) setCurrentFile(current_file)
      if (file_count) setFileCount(file_count)

      if (status === 'EMBEDDED') {
        clearInterval(pollRef.current)
        targetRef.current = 100
        setCurrentStep(4)
        setCurrentFile('\uBD84\uC11D \uBCF4\uACE0\uC11C \uC0DD\uC131 \uC911...')
        const waitAnalysis = setInterval(async () => {
          try {
            const r = await api.get(`/api/projects/${projectId}/analysis`)
            if (r.data.analysis_status === 'DONE') {
              clearInterval(waitAnalysis)
              clearInterval(animRef.current)
              setProgress(100)
              setCurrentStep(5)
              setDone(true)
              setTimeout(() => navigate(`/report/${projectId}`), 800)
            } else if (r.data.analysis_status === 'ERROR') {
              clearInterval(waitAnalysis)
              alert('\uBD84\uC11D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC5B4\uC694.')
              navigate('/')
            }
          } catch (e) { console.error(e) }
        }, 2000)
      } else if (status === 'ERROR') {
        clearInterval(pollRef.current)
        clearInterval(animRef.current)
        alert('\uBD84\uC11D \uC911 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC5B4\uC694. \uB2E4\uC2DC \uC2DC\uB3C4\uD574\uC8FC\uC138\uC694.')
        navigate('/')
      }
    } catch (e) {
      console.error('polling error:', e)
    }
  }

  const circumference = 2 * Math.PI * 54
  const offset = circumference * (1 - progress / 100)

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>ProjectLens</span>
        </div>
      </nav>

      <main className={styles.main}>
        <div className={styles.ringWrap}>
          <svg width="160" height="160" viewBox="0 0 160 160">
            <circle className={styles.ringTrack} cx="80" cy="80" r="54" />
            <circle className={styles.ringProgress} cx="80" cy="80" r="54"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.2s ease' }}
            />
          </svg>
          <div className={styles.ringLabel}>
            <div className={styles.ringPct}>{Math.round(progress)}%</div>
            <div className={styles.ringText}>PROGRESS</div>
          </div>
        </div>

        <h1 className={styles.title}>{done ? '\uBD84\uC11D \uC644\uB8CC!' : '\uBD84\uC11D \uC9C4\uD589 \uC911'}</h1>
        <p className={styles.desc}>\uC7A0\uC2DC\uB9CC \uAE30\uB2E4\uB824 \uC8FC\uC138\uC694. \uCF54\uB4DC\uBCA0\uC774\uC2A4\uB97C \uBD84\uC11D\uD558\uACE0 \uC788\uC5B4\uC694.</p>

        <div className={styles.steps}>
          {STEPS.map((step, i) => {
            const isDone = i < currentStep
            const isActive = i === currentStep && !done
            return (
              <div key={i} className={`${styles.step} ${isDone ? styles.done : ''} ${isActive ? styles.active : ''}`}>
                <div className={styles.stepIcon}>
                  {isDone
                    ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    : isActive ? <div className={styles.spinner} />
                    : <div className={styles.emptyDot} />}
                </div>
                <span>{step}</span>
              </div>
            )
          })}
        </div>

        <div className={styles.logBox}>
          <span className={styles.logDot} />
          <span className={styles.logText}>{currentFile}</span>
          {fileCount > 0 && <span className={styles.logBadge}>\uCD1D {fileCount}\uAC1C</span>}
        </div>
      </main>
    </div>
  )
}
