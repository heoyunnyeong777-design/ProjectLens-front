import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api/client'
import styles from './ReportPage.module.css'

const MENU = [
  { id: 'overview',     label: 'Overview',       icon: 'ð' },
  { id: 'structure',    label: 'Architecture',   icon: 'ðï¸' },
  { id: 'features',     label: 'Key Components', icon: 'â¡' },
  { id: 'improvements', label: 'Improvements',   icon: 'ð§' },
  { id: 'report',       label: 'Full Report',    icon: 'ð' },
]

export default function ReportPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [active, setActive] = useState('overview')
  const [project, setProject] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [projects, analysisRes] = await Promise.all([
          api.get('/api/projects'),
          api.get(`/api/projects/${projectId}/analysis`)
        ])
        setProject(projects.data.find(p => p.id === Number(projectId)))
        setAnalysis(analysisRes.data)
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [projectId])

  if (loading) return (
    <div className={styles.loadingPage}>
      <div className={styles.loadingSpinner} />
      <p>ë¶ë¬ì¤ë ì¤...</p>
    </div>
  )

  const activeLabel = MENU.find(m => m.id === active)?.label

  return (
    <div className={styles.page}>
      {/* ìë¨ ë¤ë¹ */}
      <nav className={styles.topNav}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <div className={styles.logoIcon}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>ProjectLens</span>
        </div>
        <div className={styles.topLinks}>
          <span>Docs</span><span>Updates</span><span>Community</span>
        </div>
        <div className={styles.topRight}>
          <div className={styles.searchWrap}>
            <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#484f58" strokeWidth="2"/>
              <path d="M21 21l-4.35-4.35" stroke="#484f58" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <input className={styles.search} placeholder="Search documentation..." />
          </div>
        </div>
      </nav>

      <div className={styles.layout}>
        {/* ì¢ì¸¡ ì¬ì´ëë° */}
        <aside className={styles.sidebar}>
          <div className={styles.sideSection}>
            <div className={styles.sideTitle}>ANALYSIS RESULT</div>
            {MENU.map(m => (
              <div key={m.id}
                className={`${styles.sideItem} ${active === m.id ? styles.sideActive : ''}`}
                onClick={() => setActive(m.id)}>
                {active === m.id
                  ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#58a6ff" strokeWidth="2" strokeLinecap="round"/></svg>
                  : <div className={styles.sideDot} />}
                {m.label}
              </div>
            ))}
          </div>

          <div className={styles.sideSection}>
            <div className={styles.sideTitle}>INSIGHTS</div>
            <div className={styles.sideItem} onClick={() => setActive('improvements')}>
              <div className={styles.sideDot} />Security Patterns
            </div>
            <div className={styles.sideItem}>
              <div className={styles.sideDot} />Performance
            </div>
          </div>

          <div className={styles.projectCard}>
            <div className={styles.projectCardLabel}>Project</div>
            <div className={styles.projectCardName}>
              <span className={styles.projectDot} />
              <span>{project?.name || 'ì ì ìì'}</span>
            </div>
          </div>
        </aside>

        {/* ë©ì¸ */}
        <main className={styles.main}>
          <div className={styles.breadcrumb}>
            <span onClick={() => navigate('/')} className={styles.breadLink}>Home</span>
            <span className={styles.breadSep}>/</span>
            <span className={styles.breadLink} onClick={() => setActive('overview')}>Analysis</span>
            <span className={styles.breadSep}>/</span>
            <span className={styles.breadCurrent}>{activeLabel}</span>
          </div>

          <Content active={active} project={project} analysis={analysis} />
        </main>

        {/* ì°ì¸¡ ëª©ì°¨ */}
        <aside className={styles.toc}>
          <div className={styles.tocTitle}>ON THIS PAGE</div>
          <TocItems active={active} />
        </aside>
      </div>

      {/* ì±í ë°ë¡ê°ê¸° ë²í¼ */}
      <button className={styles.chatBtn} onClick={() => navigate(`/chat/${projectId}`)}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Ask a Question
      </button>
    </div>
  )
}

/* ëª©ì°¨ ì»´í¬ëí¸ */
function TocItems({ active }) {
  const map = {
    overview:     ['Overview', 'Architecture', 'Key Features', 'Improvements'],
    structure:    ['Structure Overview', 'Package Layout', 'Design Pattern'],
    features:     ['Core Features', 'Business Logic', 'Entry Points'],
    improvements: ['Code Quality', 'Error Handling', 'Performance'],
    report:       ['Executive Summary', 'Full Analysis'],
  }
  return (map[active] || []).map(t => (
    <div key={t} className={styles.tocItem}>{t}</div>
  ))
}

/* ì»¨íì¸  ë ëë¬ */
function Content({ active, project, analysis }) {
  if (!analysis) return <div className={styles.empty}>ë¶ì ê²°ê³¼ê° ìì´ì.</div>

  if (active === 'overview') return <OverviewContent project={project} analysis={analysis} />
  if (active === 'structure') return <SingleContent title="Architecture" emoji="ðï¸" content={analysis.structure} />
  if (active === 'features')  return <SingleContent title="Key Components" emoji="â¡" content={analysis.features} />
  if (active === 'improvements') return <SingleContent title="Improvements" emoji="ð§" content={analysis.improvements} />
  if (active === 'report')    return <ReportContent content={analysis.report} />
  return null
}

function OverviewContent({ project, analysis }) {
  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>System Analysis Overview</h1>
        <p className={styles.pageDesc}>
          {project?.name} íë¡ì í¸ì êµ¬ì¡°, íµì¬ ê¸°ë¥, ê°ì ì ì ë´ì ë¶ìì ê²°ê³¼ìì.
        </p>
        <div className={styles.metaRow}>
          <div className={styles.metaBadge}>
            <span className={styles.metaDot} />ìë ë¶ì ìë£
          </div>
          <div className={styles.metaBadge}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke="#8b949e" strokeWidth="2"/>
            </svg>
            íì¼ {project?.file_count}ê°
          </div>
        </div>
      </div>

      <AnalysisCard
        emoji="ðï¸" title="Architecture"
        content={analysis.structure}
        color="blue"
      />
      <AnalysisCard
        emoji="â¡" title="Key Features"
        content={analysis.features}
        color="purple"
      />
      <AnalysisCard
        emoji="ð§" title="Improvements"
        content={analysis.improvements}
        color="orange"
      />
    </div>
  )
}

function SingleContent({ title, emoji, content }) {
  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{title}</h1>
      </div>
      <AnalysisCard emoji={emoji} title={title} content={content} color="blue" />
    </div>
  )
}

function ReportContent({ content }) {
  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Full Report</h1>
        <p className={styles.pageDesc}>ì ì²´ ë¶ì ê²°ê³¼ë¥¼ ë´ì ì¢í© ë³´ê³ ììì.</p>
      </div>
      <div className={styles.reportBox}>
        {(content || '').split('\n').map((line, i) => {
          if (line.startsWith('##')) return <h3 key={i} className={styles.reportH3}>{line.replace(/^#+\s*/, '')}</h3>
          if (line.startsWith('#'))  return <h2 key={i} className={styles.reportH2}>{line.replace(/^#+\s*/, '')}</h2>
          if (line.trim() === '')    return <div key={i} className={styles.reportBlank} />
          return <p key={i} className={styles.reportP}>{line}</p>
        })}
      </div>
    </div>
  )
}

/* ë¶ì ì¹´ë */
function AnalysisCard({ emoji, title, content, color }) {
  const paragraphs = (content || 'ë¶ì ì¤...').split('\n').filter(l => l.trim())

  return (
    <div className={`${styles.card} ${styles['card_' + color]}`}>
      <div className={styles.cardHeader}>
        <span className={styles.cardEmoji}>{emoji}</span>
        <h2 className={styles.cardTitle}>{title}</h2>
      </div>
      <div className={styles.cardDivider} />
      <div className={styles.cardBody}>
        {paragraphs.map((p, i) => (
          <p key={i} className={styles.cardPara}>{p}</p>
        ))}
      </div>
    </div>
  )
}
