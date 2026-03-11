import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import AnalyzingPage from './pages/AnalyzingPage'
import ChatPage from './pages/ChatPage'
import ReportPage from './pages/ReportPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/analyzing/:projectId" element={<AnalyzingPage />} />
      <Route path="/report/:projectId" element={<ReportPage />} />
      <Route path="/chat/:projectId" element={<ChatPage />} />
    </Routes>
  )
}

export default App
