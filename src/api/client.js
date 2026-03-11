import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

// 프로젝트
export const getProjects = () => api.get('/api/projects')
export const createProject = (githubUrl) => api.post('/api/projects', { github_url: githubUrl })
export const embedProject = (projectId) => api.post(`/api/projects/${projectId}/embed`)

// 채팅
export const sendChat = (projectId, question) =>
  api.post('/api/chat', { project_id: projectId, question })
export const getChatHistory = (projectId) =>
  api.get(`/api/chat/history/${projectId}`)

// 분석
export const analyzeProject = (projectId) =>
  api.post(`/api/projects/${projectId}/analyze`)

export default api
