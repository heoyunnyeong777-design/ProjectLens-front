import { NavLink, Outlet } from 'react-router-dom'
import styles from './Layout.module.css'

export default function Layout() {
  return (
    <div className={styles.layout}>
      {/* 사이드바 */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>🔭</div>
          <span>Project<strong>Lens</strong></span>
        </div>

        <nav className={styles.nav}>
          <NavLink to="/chat" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <span className={styles.navIcon}>💬</span>
            <span>Q&A 채팅</span>
          </NavLink>
          <NavLink to="/analysis" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <span className={styles.navIcon}>🔍</span>
            <span>프로젝트 분석</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? `${styles.navItem} ${styles.active}` : styles.navItem}>
            <span className={styles.navIcon}>📁</span>
            <span>프로젝트 관리</span>
          </NavLink>
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>A</div>
            <span>Alex Developer</span>
          </div>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
