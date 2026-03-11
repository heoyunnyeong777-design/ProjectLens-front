import { useState } from 'react'
import { analyzeProject } from '../api/client'
import styles from './AnalysisPage.module.css'

const STEPS = [
  '노드 1: 프로젝트 구조 분석',
  '노드 2: 핵심 기능 분석',
  '노드 3: 개선점 분석',
  '노드 4: 최종 보고서 생성',
]

export default function AnalysisPage() {
  const [projectId, setProjectId] = useState(1)
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(-1)
  const [result, setResult] = useState(null)

  const handleAnalyze = async () => {
    setLoading(true)
    setResult(null)
    setCurrentStep(0)

    // 진행 상황 애니메이션
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < STEPS.length - 1) return prev + 1
        clearInterval(timer)
        return prev
      })
    }, 9000)

    try {
      const res = await analyzeProject(projectId)
      clearInterval(timer)
      setCurrentStep(STEPS.length)
      setResult(res.data)
    } catch (e) {
      clearInterval(timer)
      alert('분석 실패: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.label}>// langgraph multi-agent</div>
        <h1 className={styles.title}>프로젝트 자동 분석</h1>
        <p className={styles.desc}>LangGraph 4개 노드가 순서대로 실행되어 구조, 기능, 개선점, 보고서를 자동 생성합니다.</p>
      </div>

      {/* 실행 버튼 */}
      <div className={styles.controls}>
        <div className={styles.projectSelect}>
          <label>Project ID</label>
          <input
            type="number"
            value={projectId}
            onChange={e => setProjectId(Number(e.target.value))}
            min={1}
          />
        </div>
        <button className={styles.btnPrimary} onClick={handleAnalyze} disabled={loading}>
          {loading ? '분석 중...' : '🔍 분석 시작'}
        </button>
      </div>

      {/* 진행 상황 */}
      {loading && (
        <div className={styles.progress}>
          <div className={styles.progressCard}>
            <div className={styles.progressTitle}>분석 진행 중...</div>
            <div className={styles.stepList}>
              {STEPS.map((step, i) => (
                <div key={i} className={`${styles.stepItem} ${
                  i < currentStep ? styles.done :
                  i === currentStep ? styles.active : ''
                }`}>
                  <div className={styles.stepIcon}>
                    {i < currentStep ? '✅' : i === currentStep ? '⚙️' : '⬜'}
                  </div>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 결과 */}
      {result && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <h2 className={styles.resultTitle}>분석 완료</h2>
            <span className={styles.badge}>✓ GPT-4o-mini</span>
          </div>

          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={`${styles.cardIcon} ${styles.blue}`}>🏗️</div>
                <div>
                  <div className={styles.cardTitle}>프로젝트 구조</div>
                  <div className={styles.cardSub}>Architecture overview</div>
                </div>
              </div>
              <p className={styles.cardContent}>{result.structure}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={`${styles.cardIcon} ${styles.green}`}>⚡</div>
                <div>
                  <div className={styles.cardTitle}>핵심 기능</div>
                  <div className={styles.cardSub}>Core features</div>
                </div>
              </div>
              <p className={styles.cardContent}>{result.features}</p>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={`${styles.cardIcon} ${styles.orange}`}>🔧</div>
                <div>
                  <div className={styles.cardTitle}>개선점</div>
                  <div className={styles.cardSub}>Recommendations</div>
                </div>
              </div>
              <p className={styles.cardContent}>{result.improvements}</p>
            </div>

            <div className={`${styles.card} ${styles.full}`}>
              <div className={styles.cardHeader}>
                <div className={`${styles.cardIcon} ${styles.yellow}`}>📋</div>
                <div>
                  <div className={styles.cardTitle}>최종 보고서</div>
                  <div className={styles.cardSub}>Executive summary</div>
                </div>
              </div>
              <p className={styles.cardContent}>{result.report}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
