import { useState, useEffect } from 'react'
import { getProjects, createProject, embedProject } from '../api/client'
import styles from './ProjectsPage.module.css'

export default function ProjectsPage() {
  const [projects, setProjects] = useState([])
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [embedLoading, setEmbedLoading] = useState(null)

  useEffect(() => { fetchProjects() }, [])

  const fetchProjects = async () => {
    try {
      const res = await getProjects()
      setProjects(res.data)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreate = async () => {
    if (!url.trim()) return
    setLoading(true)
    try {
      await createProject(url)
      setUrl('')
      fetchProjects()
    } catch (e) {
      alert('등록 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEmbed = async (id) => {
    setEmbedLoading(id)
    try {
      const res = await embedProject(id)
      alert(`임베딩 완료! ${res.data.chunk_count}개 청크 저장`)
      fetchProjects()
    } catch (e) {
      alert('임베딩 실패')
    } finally {
      setEmbedLoading(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.label}>// project management</div>
        <h1 className={styles.title}>프로젝트 관리</h1>
        <p className={styles.desc}>GitHub URL을 등록하면 소스코드를 수집하고 벡터 DB에 저장합니다.</p>
      </div>

      <div className={styles.card}>
        <label className={styles.fieldLabel}>GitHub Repository URL</label>
        <div className={styles.inputRow}>
          <input
            className={styles.input}
            type="text"
            placeholder="https://github.com/spring-projects/spring-petclinic"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <button className={styles.btnPrimary} onClick={handleCreate} disabled={loading}>
            {loading ? '수집 중...' : '등록'}
          </button>
        </div>
      </div>

      <div className={styles.listHeader}>
        <span className={styles.label}>// registered projects</span>
        <button className={styles.btnSecondary} onClick={fetchProjects}>새로고침</button>
      </div>

      <div className={styles.list}>
        {projects.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📭</div>
            <p>등록된 프로젝트가 없어요</p>
          </div>
        ) : (
          projects.map(p => (
            <div key={p.id} className={styles.projectRow}>
              <div className={styles.projectIcon}>📦</div>
              <div className={styles.projectInfo}>
                <div className={styles.projectName}>{p.name}</div>
                <div className={styles.projectUrl}>{p.github_url}</div>
              </div>
              <div className={styles.projectRight}>
                <span className={`${styles.badge} ${p.status === 'EMBEDDED' ? styles.badgeGreen : styles.badgeBlue}`}>
                  {p.status}
                </span>
                {p.status === 'COLLECTED' && (
                  <button className={styles.btnSecondary} onClick={() => handleEmbed(p.id)} disabled={embedLoading === p.id}>
                    {embedLoading === p.id ? '임베딩 중...' : '임베딩'}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
