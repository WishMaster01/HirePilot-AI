const STORAGE_KEY = 'hirepilot-admin-users'
const CHANGE_EVENT = 'hirepilot-admin-users-change'

const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0))

export const userScoreFields = [
  { key: 'career', label: 'Career score', metric: 'Career score', suiteKey: 'career-intelligence' },
  { key: 'resume', label: 'Resume score', metric: 'Resume score', suiteKey: 'resume-intelligence' },
  { key: 'job', label: 'Job match score', metric: 'Job match score', suiteKey: 'job-placement' },
  { key: 'interview', label: 'Interview score', metric: 'Interview score', suiteKey: 'interview-preparation' },
  { key: 'dsa', label: 'DSA score', metric: 'DSA score', suiteKey: 'coding-dsa' },
  { key: 'roadmap', label: 'Roadmap progress', metric: 'Roadmap progress', suiteKey: 'ai-mentor' },
  { key: 'applications', label: 'Application status', metric: 'Application status', suiteKey: 'productivity' },
  { key: 'credits', label: 'AI credits remaining', metric: 'AI credits remaining', suiteKey: 'billing-subscription' },
]

export const defaultAdminUsers = [
  {
    id: 'usr-1001',
    name: 'Aanya Sharma',
    email: 'aanya.sharma@example.com',
    plan: 'PRO',
    status: 'Active',
    risk: 'Normal',
    targetRole: 'Frontend Engineer',
    location: 'Bengaluru',
    lastActive: 'Today, 10:24 AM',
    joined: '2026-05-14',
    scores: { career: 88, resume: 82, job: 76, interview: 84, dsa: 73, roadmap: 70, applications: 68, credits: 61 },
    credits: { used: 389, remaining: 611, limit: 1000 },
    notifications: 5,
    nextActions: ['Run ATS rewrite', 'Practice graph problems', 'Submit Infosys application'],
    activity: [
      { date: 'Jul 2', readiness: 71, credits: 42, interviews: 1 },
      { date: 'Jul 3', readiness: 73, credits: 58, interviews: 0 },
      { date: 'Jul 4', readiness: 76, credits: 64, interviews: 1 },
      { date: 'Jul 5', readiness: 78, credits: 49, interviews: 2 },
      { date: 'Jul 6', readiness: 81, credits: 72, interviews: 1 },
      { date: 'Jul 7', readiness: 84, credits: 81, interviews: 2 },
    ],
    funnel: [
      { label: 'Matched', value: 34 },
      { label: 'Applied', value: 18 },
      { label: 'OA', value: 7 },
      { label: 'Interview', value: 4 },
      { label: 'Offer', value: 1 },
    ],
    dsa: {
      solved: 44,
      attempted: 58,
      streak: 8,
      weakTopics: 2,
      reviewScore: 82,
      topics: [
        { topic: 'Arrays', score: 88 },
        { topic: 'Graphs', score: 62 },
        { topic: 'DP', score: 55 },
        { topic: 'Trees', score: 74 },
      ],
    },
    projects: [
      { name: 'Portfolio v2', health: 84, signal: 'Strong UI proof' },
      { name: 'Placement Tracker', health: 72, signal: 'Needs tests' },
      { name: 'Resume Parser', health: 65, signal: 'Add deployed demo' },
    ],
  },
  {
    id: 'usr-1002',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@example.com',
    plan: 'FREE',
    status: 'Needs attention',
    risk: 'High',
    targetRole: 'Backend Developer',
    location: 'Pune',
    lastActive: 'Yesterday, 7:18 PM',
    joined: '2026-06-02',
    scores: { career: 66, resume: 59, job: 54, interview: 61, dsa: 57, roadmap: 48, applications: 39, credits: 22 },
    credits: { used: 78, remaining: 22, limit: 100 },
    notifications: 9,
    nextActions: ['Complete profile gaps', 'Rewrite backend resume bullets', 'Create daily DSA plan'],
    activity: [
      { date: 'Jul 2', readiness: 50, credits: 6, interviews: 0 },
      { date: 'Jul 3', readiness: 52, credits: 8, interviews: 0 },
      { date: 'Jul 4', readiness: 53, credits: 14, interviews: 1 },
      { date: 'Jul 5', readiness: 56, credits: 9, interviews: 0 },
      { date: 'Jul 6', readiness: 57, credits: 21, interviews: 0 },
      { date: 'Jul 7', readiness: 59, credits: 20, interviews: 1 },
    ],
    funnel: [
      { label: 'Matched', value: 21 },
      { label: 'Applied', value: 8 },
      { label: 'OA', value: 2 },
      { label: 'Interview', value: 1 },
      { label: 'Offer', value: 0 },
    ],
    dsa: {
      solved: 18,
      attempted: 34,
      streak: 3,
      weakTopics: 5,
      reviewScore: 64,
      topics: [
        { topic: 'Arrays', score: 65 },
        { topic: 'Graphs', score: 41 },
        { topic: 'DP', score: 37 },
        { topic: 'Trees', score: 52 },
      ],
    },
    projects: [
      { name: 'Auth API', health: 58, signal: 'Needs docs' },
      { name: 'Mongo Notes App', health: 49, signal: 'Missing tests' },
      { name: 'System Design Notes', health: 64, signal: 'Good interview asset' },
    ],
  },
  {
    id: 'usr-1003',
    name: 'Meera Iyer',
    email: 'meera.iyer@example.com',
    plan: 'PRO',
    status: 'Interview stage',
    risk: 'Low',
    targetRole: 'Data Analyst',
    location: 'Hyderabad',
    lastActive: 'Today, 8:03 AM',
    joined: '2026-04-22',
    scores: { career: 91, resume: 87, job: 83, interview: 79, dsa: 69, roadmap: 88, applications: 86, credits: 74 },
    credits: { used: 260, remaining: 740, limit: 1000 },
    notifications: 3,
    nextActions: ['Prepare SQL case interview', 'Polish analytics portfolio', 'Follow up with recruiter'],
    activity: [
      { date: 'Jul 2', readiness: 78, credits: 31, interviews: 1 },
      { date: 'Jul 3', readiness: 80, credits: 35, interviews: 1 },
      { date: 'Jul 4', readiness: 82, credits: 42, interviews: 1 },
      { date: 'Jul 5', readiness: 84, credits: 46, interviews: 2 },
      { date: 'Jul 6', readiness: 86, credits: 49, interviews: 2 },
      { date: 'Jul 7', readiness: 88, credits: 57, interviews: 2 },
    ],
    funnel: [
      { label: 'Matched', value: 42 },
      { label: 'Applied', value: 26 },
      { label: 'OA', value: 11 },
      { label: 'Interview', value: 6 },
      { label: 'Offer', value: 2 },
    ],
    dsa: {
      solved: 31,
      attempted: 45,
      streak: 12,
      weakTopics: 2,
      reviewScore: 79,
      topics: [
        { topic: 'SQL', score: 91 },
        { topic: 'Python', score: 82 },
        { topic: 'Stats', score: 74 },
        { topic: 'Case', score: 78 },
      ],
    },
    projects: [
      { name: 'Sales BI Dashboard', health: 91, signal: 'Strong business story' },
      { name: 'Churn Prediction', health: 80, signal: 'Needs model card' },
      { name: 'SQL Portfolio', health: 86, signal: 'Ready to share' },
    ],
  },
]

export const calculateUserDsaScore = (dsa = {}) => {
  const solvedRate = Number(dsa.attempted) ? (Number(dsa.solved) / Number(dsa.attempted)) * 100 : 0
  const streakBoost = Math.min(15, Number(dsa.streak || 0) * 2)
  const review = Number(dsa.reviewScore) || 0
  const weakPenalty = Math.min(25, Number(dsa.weakTopics || 0) * 5)
  return clampScore(Math.round(solvedRate * 0.45 + review * 0.35 + streakBoost + 10 - weakPenalty))
}

export const getUserAverageScore = (user) => {
  const values = Object.values(user?.scores || {})
  if (!values.length) return 0
  return Math.round(values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length)
}

const mergeUser = (user, fallback) => ({
  ...fallback,
  ...user,
  scores: { ...fallback.scores, ...(user?.scores || {}) },
  credits: { ...fallback.credits, ...(user?.credits || {}) },
  dsa: { ...fallback.dsa, ...(user?.dsa || {}) },
  activity: Array.isArray(user?.activity) ? user.activity : fallback.activity,
  funnel: Array.isArray(user?.funnel) ? user.funnel : fallback.funnel,
  projects: Array.isArray(user?.projects) ? user.projects : fallback.projects,
  nextActions: Array.isArray(user?.nextActions) ? user.nextActions : fallback.nextActions,
})

export const getAdminUsers = () => {
  try {
    const storedUsers = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    if (!Array.isArray(storedUsers) || !storedUsers.length) return defaultAdminUsers
    return storedUsers.map((user) => {
      const fallback = defaultAdminUsers.find((item) => item.id === user.id) || defaultAdminUsers[0]
      return mergeUser(user, fallback)
    })
  } catch {
    return defaultAdminUsers
  }
}

export const saveAdminUsers = (users) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: users }))
  return users
}

export const subscribeAdminUsers = (callback) => {
  const onLocalChange = (event) => callback(event.detail || getAdminUsers())
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) callback(getAdminUsers())
  }
  window.addEventListener(CHANGE_EVENT, onLocalChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onLocalChange)
    window.removeEventListener('storage', onStorage)
  }
}

export const updateAdminUser = (userId, updater) => {
  const users = getAdminUsers()
  const nextUsers = users.map((user) => {
    if (user.id !== userId) return user
    return typeof updater === 'function' ? updater(user) : { ...user, ...updater }
  })
  return saveAdminUsers(nextUsers)
}

export const resetAdminUsers = () => saveAdminUsers(defaultAdminUsers)
