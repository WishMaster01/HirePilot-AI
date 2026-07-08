import { dashboardMetrics, dashboardStatus, suiteCatalog } from '../data/suiteCatalog'

const STORAGE_KEY = 'hirepilot-suite-dashboard-state'
const CHANGE_EVENT = 'hirepilot-dashboard-state-change'

const suiteToMetric = {
  'career-intelligence': 'Career score',
  'resume-intelligence': 'Resume score',
  'job-placement': 'Job match score',
  'interview-preparation': 'Interview score',
  'coding-dsa': 'DSA score',
  'ai-mentor': 'Roadmap progress',
  productivity: 'Application status',
  'billing-subscription': 'AI credits remaining',
}

export const defaultDashboardState = {
  metrics: Object.fromEntries(dashboardMetrics),
  suiteScores: Object.fromEntries(suiteCatalog.map((suite) => [suite.key, suite.score])),
  status: Object.fromEntries(dashboardStatus.map((item) => [item.label, { value: item.value, detail: item.detail }])),
  realtime: {
    headline: 'Placement drive active',
    message: 'Admin can publish urgent placement, interview, billing, or platform updates here.',
    priority: 'Normal',
  },
  activity: [
    'Suite dashboard initialized',
    'Career Intelligence ready',
    'AI Mock Interview available',
  ],
  updatedAt: new Date().toISOString(),
}

const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0))

const mergeState = (state = {}) => ({
  ...defaultDashboardState,
  ...state,
  metrics: { ...defaultDashboardState.metrics, ...(state.metrics || {}) },
  suiteScores: { ...defaultDashboardState.suiteScores, ...(state.suiteScores || {}) },
  status: { ...defaultDashboardState.status, ...(state.status || {}) },
  realtime: { ...defaultDashboardState.realtime, ...(state.realtime || {}) },
  activity: Array.isArray(state.activity) ? state.activity : defaultDashboardState.activity,
})

export const getDashboardState = () => {
  try {
    return mergeState(JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'))
  } catch {
    return defaultDashboardState
  }
}

export const saveDashboardState = (nextState) => {
  const state = mergeState({ ...nextState, updatedAt: new Date().toISOString() })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: state }))
  return state
}

export const subscribeDashboardState = (callback) => {
  const onLocalChange = (event) => callback(event.detail || getDashboardState())
  const onStorage = (event) => {
    if (event.key === STORAGE_KEY) callback(getDashboardState())
  }
  window.addEventListener(CHANGE_EVENT, onLocalChange)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onLocalChange)
    window.removeEventListener('storage', onStorage)
  }
}

export const recordSuiteScore = ({ suiteKey, suiteTitle, feature, score }) => {
  const state = getDashboardState()
  const metricName = suiteToMetric[suiteKey]
  const nextMetrics = { ...state.metrics }
  const numericScore = clampScore(score)

  if (metricName) {
    nextMetrics[metricName] = numericScore
  }

  const activity = [
    `${suiteTitle} generated ${numericScore}% for ${feature}`,
    ...state.activity,
  ].slice(0, 8)

  return saveDashboardState({
    ...state,
    metrics: nextMetrics,
    suiteScores: { ...state.suiteScores, [suiteKey]: numericScore },
    activity,
  })
}

export const updateDashboardMetric = (label, value) => {
  const state = getDashboardState()
  return saveDashboardState({
    ...state,
    metrics: { ...state.metrics, [label]: clampScore(value) },
  })
}

export const updateSuiteScore = (suiteKey, value) => {
  const state = getDashboardState()
  return saveDashboardState({
    ...state,
    suiteScores: { ...state.suiteScores, [suiteKey]: clampScore(value) },
  })
}

export const updateDashboardStatus = (label, patch) => {
  const state = getDashboardState()
  return saveDashboardState({
    ...state,
    status: {
      ...state.status,
      [label]: { ...(state.status[label] || {}), ...patch },
    },
  })
}

export const updateRealtimeData = (realtime) => {
  const state = getDashboardState()
  return saveDashboardState({
    ...state,
    realtime: { ...state.realtime, ...realtime },
    activity: [`Admin update: ${realtime.headline || state.realtime.headline}`, ...state.activity].slice(0, 8),
  })
}

export const resetDashboardState = () => saveDashboardState(defaultDashboardState)
