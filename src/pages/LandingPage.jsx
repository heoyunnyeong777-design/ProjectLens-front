import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject, getProjects } from '../api/client'
import styles from './LandingPage.module.css'

const RECENT_COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#f97316', '#10b981']

export default function LandingPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const navigate = useNavigate()

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const res = await getProjects()
      setProjects(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleAnalyze = async () => {
    if (!url.trim()) return
    setLoading(true)
    try {
      const res = await createProject(url.trim())
      const projectId = res.data.project_id
      navigate(`/analyzing/${projectId}`)
    } catch (e) {
      // 422: 이미 등록된 프로젝트 → 기존 프로젝트로 이동
      if (e.response?.status === 422 || e.response?.status === 409) {
        const existing = projects.find(p => p.github_url === url.trim())
        if (existing) {
          navigate(`/chat/${existing.id}`)
          return
        }
      }
      alert('등록 실패: ' + (e.response?.data?.detail || e.message))
      setLoading(false)
    }
  }

  const handleSelectProject = (id) => {
    navigate(`/chat/${id}`)
  }

  return (
    <div className={styles.page}>
      {/* 상단 네비 */}
      <nav className={styles.nav}>
        <div className={styles.navLogo}>
          <div className={styles.logoIcon}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>ProjectLens</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#">문서</a>
          <a href="#">요금제</a>
          <a href="#">기능</a>
        </div>
        <div className={styles.navRight}>
          <button className={styles.btnLogin}>로그인</button>
          <button className={styles.btnGetStarted}>시작하기 →</button>
        </div>
      </nav>

      {/* 히어로 섹션 */}
      <main className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.badgeDot} />
          신규: AI 온보딩 플로우
        </div>

        <h1 className={styles.heroTitle}>
          어떤 코드베이스도<br />
          <span className={styles.heroAccent}>몇 분 안에 이해하세요.</span>
        </h1>

        <p className={styles.heroDesc}>
          GitHub URL을 붙여넣으면 온보딩 문서, 아키텍처 다이어그램을 자동 생성하고<br />
          심층적인 기술 질문을 할 수 있어요.
        </p>

        {/* URL 입력 */}
        <div className={styles.inputWrap}>
          <div className={styles.inputBox}>
            <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              className={styles.input}
              type="text"
              placeholder="https://github.com/spring-projects/spring-petclinic"
              value={url}
              onChange={e => setUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              className={styles.btnAnalyze}
              onClick={handleAnalyze}
              disabled={loading}
            >
              {loading ? '로딩 중...' : '분석하기 →'}
            </button>
          </div>
        </div>

        {/* 최근 분석 프로젝트 */}
        {projects.length > 0 && (
          <div className={styles.recentWrap}>
            <div className={styles.recentLabel}>최근 분석한 프로젝트</div>
            <div className={styles.recentList}>
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  className={styles.recentItem}
                  onClick={() => handleSelectProject(p.id)}
                >
                  <span
                    className={styles.recentDot}
                    style={{ background: RECENT_COLORS[i % RECENT_COLORS.length] }}
                  />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 피처 카드 */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>✦</div>
          <h3>자동 문서화</h3>
          <p>소스 파일을 스캔해서 고수준 요약과 상세한 API 문서를 자동으로 생성해요.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>💬</div>
          <h3>코드베이스 Q&A</h3>
          <p>"인증 로직이 어디 있어?" 또는 "새 API 라우트를 어떻게 추가해?" 같은 기술 질문을 할 수 있어요.</p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>⬡</div>
          <h3>시각적 매핑</h3>
          <p>복잡한 폴더 구조를 탐색할 수 있도록 인터랙티브 의존성 그래프와 아키텍처 맵을 제공해요.</p>
        </div>
      </section>

      {/* 푸터 */}
      <footer className={styles.footer}>
        <div className={styles.footerLogo}>
          <div className={styles.logoIcon} style={{width:20,height:20,fontSize:10}}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>ProjectLens</span>
        </div>
        <div className={styles.footerLinks}>
          <a href="#">트위터</a>
          <a href="#">GitHub</a>
          <a href="#">개인정보처리방침</a>
          <a href="#">이용약관</a>
        </div>
        <div className={styles.footerRight}>© 2024 ProjectLens Inc.</div>
      </footer>
    </div>
  )
}
