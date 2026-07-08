import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaArrowLeft,
  FaBroadcastTower,
  FaChartBar,
  FaChartLine,
  FaChevronRight,
  FaCodeBranch,
  FaDatabase,
  FaLock,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaSignOutAlt,
  FaSyncAlt,
  FaUserCircle,
  FaUsers,
} from 'react-icons/fa'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { dashboardStatus } from '../data/suiteCatalog'
import {
  getDashboardState,
  resetDashboardState,
  subscribeDashboardState,
  updateDashboardMetric,
  updateDashboardStatus,
  updateRealtimeData,
  updateSuiteScore,
} from '../utils/dashboardStore'
import {
  calculateUserDsaScore,
  getAdminUsers as getStoredAdminUsers,
  getUserAverageScore,
  resetAdminUsers,
  saveAdminUsers,
  subscribeAdminUsers,
  updateAdminUser,
  userScoreFields,
} from '../utils/adminUserStore'
import {
  deleteAdminUser,
  getAdminDashboardBundle,
  updateAdminUserRole,
} from '../services/adminService'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@hirepilot.ai'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'HirePilot@2026'
const CHART_COLORS = ['#059669', '#0f172a', '#2563eb', '#f59e0b', '#dc2626']

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0))

const getErrorText = (error) => error?.message || error?.error || 'Admin API request failed'

const formatDateTime = (value) => {
  if (!value) return 'Not available'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

const normalizeBackendUsers = (backendUsers = [], fallbackUsers = []) => {
  if (!Array.isArray(backendUsers) || !backendUsers.length) return fallbackUsers

  return backendUsers.map((backendUser, index) => {
    const fallback = fallbackUsers.find((item) => item.id === backendUser.id || item.email === backendUser.email) || fallbackUsers[index % fallbackUsers.length] || {
      name: 'User',
      email: 'user@example.com',
      plan: 'FREE',
      status: 'Active',
      risk: 'Normal',
      targetRole: 'Not set',
      location: 'Not set',
      lastActive: 'Not available',
      scores: { career: 50, resume: 50, job: 50, interview: 50, dsa: 50, roadmap: 50, applications: 50, credits: 50 },
      credits: { used: 0, remaining: 100, limit: 100 },
      notifications: 0,
      nextActions: [],
      activity: [],
      funnel: [],
      dsa: { solved: 0, attempted: 0, streak: 0, weakTopics: 0, reviewScore: 0, topics: [] },
      projects: [],
    }
    const activeSubscription = backendUser.subscriptions?.[0]
    const displayName = backendUser.name || backendUser.fullName || backendUser.email?.split('@')[0] || fallback.name

    return {
      ...fallback,
      id: backendUser.id,
      name: displayName,
      email: backendUser.email || fallback.email,
      plan: activeSubscription?.plan || backendUser.plan || fallback.plan,
      status: backendUser.isActive === false ? 'Inactive' : backendUser.role === 'ADMIN' ? 'Admin' : 'Active',
      risk: backendUser.isActive === false ? 'High' : fallback.risk,
      targetRole: backendUser.targetRole || backendUser.profile?.targetRole || fallback.targetRole,
      location: backendUser.location || backendUser.profile?.location || fallback.location,
      lastActive: formatDateTime(backendUser.updatedAt || backendUser.lastLoginAt),
      joined: backendUser.createdAt || fallback.joined,
      role: backendUser.role || fallback.role || 'USER',
      backendUser,
    }
  })
}

const getRiskClass = (risk) => {
  if (risk === 'High') return 'bg-red-50 text-red-700 ring-red-100'
  if (risk === 'Low') return 'bg-emerald-50 text-emerald-700 ring-emerald-100'
  return 'bg-amber-50 text-amber-700 ring-amber-100'
}

function AdminDashboard() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('hirepilot-admin') === 'true')
  const [users, setUsers] = useState(() => getStoredAdminUsers())
  const [backendBundle, setBackendBundle] = useState(null)
  const [isApiLoading, setIsApiLoading] = useState(false)
  const [apiError, setApiError] = useState('')
  const [apiSyncedAt, setApiSyncedAt] = useState('')
  const [dashboardState, setDashboardState] = useState(() => getDashboardState())
  const [realtime, setRealtime] = useState(() => getDashboardState().realtime)
  const [statusDraft, setStatusDraft] = useState(() => getDashboardState().status)

  useEffect(() => subscribeAdminUsers(setUsers), [])

  useEffect(() => subscribeDashboardState((state) => {
    setDashboardState(state)
    setRealtime(state.realtime)
    setStatusDraft(state.status)
  }), [])

  const refreshAdminApiData = async () => {
    setIsApiLoading(true)
    try {
      const bundle = await getAdminDashboardBundle()
      const nextUsers = normalizeBackendUsers(bundle.users, getStoredAdminUsers())
      saveAdminUsers(nextUsers)
      setBackendBundle(bundle)
      setApiError('')
      setApiSyncedAt(new Date().toLocaleString())
    } catch (error) {
      setApiError(getErrorText(error))
    } finally {
      setIsApiLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthed) return undefined

    let cancelled = false

    const loadAdminApiData = async () => {
      setIsApiLoading(true)
      try {
        const bundle = await getAdminDashboardBundle()
        if (cancelled) return
        const nextUsers = normalizeBackendUsers(bundle.users, getStoredAdminUsers())
        saveAdminUsers(nextUsers)
        setBackendBundle(bundle)
        setApiError('')
        setApiSyncedAt(new Date().toLocaleString())
      } catch (error) {
        if (!cancelled) setApiError(getErrorText(error))
      } finally {
        if (!cancelled) setIsApiLoading(false)
      }
    }

    loadAdminApiData()

    return () => {
      cancelled = true
    }
  }, [isAuthed])

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [selectedUserId, users],
  )

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return users
    return users.filter((user) => [
      user.name,
      user.email,
      user.plan,
      user.status,
      user.targetRole,
      user.location,
    ].join(' ').toLowerCase().includes(needle))
  }, [query, users])

  const selectedAverage = useMemo(() => getUserAverageScore(selectedUser), [selectedUser])
  const dsaScore = useMemo(() => calculateUserDsaScore(selectedUser?.dsa), [selectedUser])

  const scoreChartData = useMemo(() => userScoreFields.map((field) => ({
    name: field.label.replace(' score', '').replace(' remaining', ''),
    value: selectedUser?.scores?.[field.key] ?? 0,
  })), [selectedUser])

  const creditChartData = useMemo(() => {
    if (!selectedUser) return []
    return [
      { name: 'Used', value: Number(selectedUser.credits.used) || 0 },
      { name: 'Remaining', value: Number(selectedUser.credits.remaining) || 0 },
    ]
  }, [selectedUser])

  const backendUsageData = useMemo(() => {
    const usage = backendBundle?.analytics?.algorithmAnalysis?.aiUsageByFeature || {}
    return Object.entries(usage).map(([feature, value]) => ({
      feature,
      requests: value?.requests || 0,
      credits: value?.creditsConsumed || 0,
    })).slice(0, 8)
  }, [backendBundle])

  const backendOverview = useMemo(() => {
    const analytics = backendBundle?.analytics || {}
    return [
      ['Users', analytics.users ?? users.length],
      ['Interviews', analytics.interviews ?? backendBundle?.interviews?.length ?? 0],
      ['Reports', backendBundle?.reports?.length ?? 0],
      ['Revenue', analytics.revenue ? `Rs. ${analytics.revenue}` : 'Rs. 0'],
    ]
  }, [backendBundle, users.length])

  const handleLogin = (event) => {
    event.preventDefault()
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('hirepilot-admin', 'true')
      setIsAuthed(true)
      setError('')
      return
    }
    setError('Invalid admin credentials. Check VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD in client/.env.')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('hirepilot-admin')
    setIsAuthed(false)
    setSelectedUserId('')
    setEmail('')
    setPassword('')
  }

  const handleRoleChange = async (role) => {
    if (!selectedUser) return
    updateSelectedUser((user) => ({ ...user, role }))
    try {
      await updateAdminUserRole(selectedUser.id, role)
      await refreshAdminApiData()
    } catch (error) {
      setApiError(getErrorText(error))
    }
  }

  const handleDeleteSelectedUser = async () => {
    if (!selectedUser) return
    const confirmed = window.confirm(`Delete ${selectedUser.name}? This calls the backend admin delete route.`)
    if (!confirmed) return

    try {
      await deleteAdminUser(selectedUser.id)
      const nextUsers = users.filter((user) => user.id !== selectedUser.id)
      saveAdminUsers(nextUsers)
      setSelectedUserId('')
      await refreshAdminApiData()
    } catch (error) {
      setApiError(getErrorText(error))
    }
  }

  const updateSelectedUser = (updater) => {
    if (!selectedUser) return
    updateAdminUser(selectedUser.id, updater)
  }

  const updateUserScore = (scoreKey, value) => {
    updateSelectedUser((user) => ({
      ...user,
      scores: { ...user.scores, [scoreKey]: clamp(value) },
    }))
  }

  const updateDsaField = (field, value) => {
    updateSelectedUser((user) => {
      const nextDsa = { ...user.dsa, [field]: Number(value) || 0 }
      return {
        ...user,
        dsa: nextDsa,
        scores: { ...user.scores, dsa: calculateUserDsaScore(nextDsa) },
      }
    })
  }

  const updateStatusField = (label, field, value) => {
    setStatusDraft((current) => ({
      ...current,
      [label]: { ...(current[label] || {}), [field]: value },
    }))
  }

  const publishUserToSuiteDashboard = () => {
    if (!selectedUser) return

    userScoreFields.forEach((field) => {
      const value = selectedUser.scores[field.key]
      updateDashboardMetric(field.metric, value)
      updateSuiteScore(field.suiteKey, value)
    })

    updateDashboardStatus('Current plan', {
      value: selectedUser.plan,
      detail: `${selectedUser.credits.remaining} of ${selectedUser.credits.limit} AI credits remaining`,
    })
    updateDashboardStatus('Recent notifications', {
      value: String(selectedUser.notifications),
      detail: `${selectedUser.status} - last active ${selectedUser.lastActive}`,
    })
    updateDashboardStatus('Recommended next actions', {
      value: String(selectedUser.nextActions.length),
      detail: selectedUser.nextActions.slice(0, 3).join(', '),
    })
    updateRealtimeData({
      headline: `${selectedUser.name} dashboard synced`,
      message: `${selectedUser.targetRole} readiness is ${selectedAverage}%. Admin user analytics were published to the suite dashboard.`,
      priority: selectedUser.risk === 'High' ? 'High' : 'Normal',
    })
  }

  const applyRealtimeData = () => {
    updateRealtimeData(realtime)
  }

  if (!isAuthed) {
    return (
      <div className='page-shell min-h-screen px-4 py-8 sm:px-6'>
        <div className='mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center'>
          <div className='grid w-full gap-5 lg:grid-cols-[0.9fr_1.1fr]'>
            <div className='dark-card rounded-2xl p-7 sm:p-10'>
              <button onClick={() => navigate('/')} className='btn-secondary mb-8 h-11 w-11 min-h-0 rounded-full p-0'>
                <FaArrowLeft className='text-slate-600' />
              </button>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-950'>
                <FaShieldAlt size={24} />
              </div>
              <h1 className='mt-6 text-3xl font-black leading-tight text-white sm:text-5xl'>HirePilot AI Admin Console</h1>
              <p className='mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base'>
                Secure admin access for user data, suite scores, realtime dashboard updates, DSA calibration, and platform analytics.
              </p>
              <div className='mt-8 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100'>
                Credentials are read from <span className='font-black'>client/.env</span> using <span className='font-black'>VITE_ADMIN_EMAIL</span> and <span className='font-black'>VITE_ADMIN_PASSWORD</span>.
              </div>
            </div>

            <form onSubmit={handleLogin} className='glass-panel rounded-2xl p-7 sm:p-10'>
              <div className='mb-8 flex items-center gap-3'>
                <img src='/logo.png' alt='HirePilot-AI logo' className='h-12 w-12 rounded-xl object-contain' />
                <div>
                  <h2 className='text-2xl font-black text-slate-950'>Admin Login</h2>
                  <p className='text-sm font-semibold text-emerald-700'>Restricted dashboard access</p>
                </div>
              </div>

              <div className='space-y-4'>
                <label>
                  <span className='mb-2 block text-sm font-bold text-slate-700'>Admin email</span>
                  <input value={email} onChange={(event) => setEmail(event.target.value)} className='input-field p-3' placeholder='Configured admin email' />
                </label>
                <label>
                  <span className='mb-2 block text-sm font-bold text-slate-700'>Password</span>
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type='password' className='input-field p-3' placeholder='Configured admin password' />
                </label>
              </div>

              {error && <p className='mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 ring-1 ring-red-100'>{error}</p>}

              <button className='btn-primary mt-6 w-full px-5 py-3'>
                <FaLock />
                Login to Admin Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedUser) {
    return (
      <div className='page-shell min-h-screen px-4 py-8 sm:px-6'>
        <div className='wide-shell'>
          <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex items-start gap-4'>
              <button onClick={() => navigate('/')} className='btn-secondary h-11 w-11 min-h-0 rounded-full p-0'>
                <FaArrowLeft className='text-slate-600' />
              </button>
              <div>
                <p className='eyebrow mb-3'><FaUsers /> Admin Users</p>
                <h1 className='text-3xl font-black text-slate-950 sm:text-5xl'>User Directory</h1>
                <p className='mt-3 max-w-3xl text-slate-500'>Select a user to open their complete analytics, scores, website activity, DSA data, and suite publishing controls.</p>
              </div>
            </div>
            <div className='flex flex-col gap-3 sm:flex-row'>
              <button onClick={refreshAdminApiData} disabled={isApiLoading} className='btn-secondary w-fit px-5 py-2'>
                <FaDatabase /> {isApiLoading ? 'Loading API' : 'Refresh backend'}
              </button>
              <button onClick={() => resetAdminUsers()} className='btn-secondary w-fit px-5 py-2'>
                <FaSyncAlt /> Reset users
              </button>
              <button onClick={handleLogout} className='btn-danger w-fit px-5 py-2'>
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>

          <section className='surface-card p-5 sm:p-6'>
            <div className='mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
              <div>
                <h2 className='text-2xl font-black text-slate-950'>All Users</h2>
                <p className='mt-1 text-sm text-slate-500'>The first admin view is intentionally limited to the user list.</p>
                <p className={`mt-2 text-xs font-bold ${apiError ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {apiError ? `Backend API fallback: ${apiError}` : apiSyncedAt ? `Backend synced: ${apiSyncedAt}` : 'Backend sync pending'}
                </p>
              </div>
              <label className='relative w-full lg:max-w-sm'>
                <FaSearch className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400' />
                <input value={query} onChange={(event) => setQuery(event.target.value)} className='input-field p-3 pl-11' placeholder='Search users, roles, plans...' />
              </label>
            </div>

            <div className='overflow-hidden rounded-xl border border-slate-200 bg-white'>
              <div className='hidden grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.6fr] gap-4 bg-slate-950 px-5 py-3 text-xs font-black uppercase tracking-wide text-white lg:grid'>
                <span>User</span>
                <span>Target role</span>
                <span>Plan</span>
                <span>Readiness</span>
                <span>Open</span>
              </div>
              <div className='divide-y divide-slate-100'>
                {filteredUsers.map((user) => (
                  <button key={user.id} onClick={() => setSelectedUserId(user.id)} className='grid w-full gap-4 px-5 py-5 text-left transition hover:bg-emerald-50/60 lg:grid-cols-[1.2fr_0.8fr_0.7fr_0.7fr_0.6fr] lg:items-center'>
                    <span className='flex items-center gap-3'>
                      <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white'>
                        <FaUserCircle />
                      </span>
                      <span>
                        <span className='block font-black text-slate-950'>{user.name}</span>
                        <span className='block text-sm text-slate-500'>{user.email}</span>
                        <span className='mt-1 block text-xs font-bold text-slate-400'>Last active: {user.lastActive}</span>
                      </span>
                    </span>
                    <span className='font-bold text-slate-700'>{user.targetRole}</span>
                    <span className='w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-slate-200'>{user.plan}</span>
                    <span>
                      <span className='block text-2xl font-black text-slate-950'>{getUserAverageScore(user)}%</span>
                      <span className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-black ring-1 ${getRiskClass(user.risk)}`}>{user.risk}</span>
                    </span>
                    <span className='inline-flex items-center gap-2 font-black text-emerald-700'>
                      Dashboard <FaChevronRight />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className='page-shell min-h-screen px-4 py-8 sm:px-6'>
      <div className='wide-shell'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-start gap-4'>
            <button onClick={() => setSelectedUserId('')} className='btn-secondary h-11 w-11 min-h-0 rounded-full p-0'>
              <FaArrowLeft className='text-slate-600' />
            </button>
            <div>
              <p className='eyebrow mb-3'><FaShieldAlt /> User Analytics</p>
              <h1 className='text-3xl font-black text-slate-950 sm:text-5xl'>{selectedUser.name}</h1>
              <p className='mt-3 max-w-3xl text-slate-500'>{selectedUser.email} - {selectedUser.targetRole} - {selectedUser.location}</p>
            </div>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <button onClick={publishUserToSuiteDashboard} className='btn-primary w-fit px-5 py-2'>
              <FaSave /> Publish to suite
            </button>
            <button onClick={() => resetDashboardState()} className='btn-secondary w-fit px-5 py-2'>
              <FaSyncAlt /> Reset suite
            </button>
            <button onClick={handleLogout} className='btn-danger w-fit px-5 py-2'>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        <section className='grid gap-4 md:grid-cols-4'>
          {[
            ['Readiness', `${selectedAverage}%`, FaChartLine],
            ['Plan', selectedUser.plan, FaDatabase],
            ['AI credits', `${selectedUser.credits.remaining}/${selectedUser.credits.limit}`, FaBroadcastTower],
            ['DSA score', `${dsaScore}%`, FaCodeBranch],
          ].map(([label, value, Icon]) => (
            <div key={label} className='rounded-xl border border-slate-800 bg-slate-950 p-5 text-white'>
              <div className='flex items-center justify-between gap-4'>
                <p className='text-xs font-black uppercase tracking-wide text-slate-300'>{label}</p>
                <Icon className='text-emerald-300' />
              </div>
              <p className='mt-4 truncate text-3xl font-black'>{value}</p>
            </div>
          ))}
        </section>

        <section className='mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='grid gap-4 lg:grid-cols-[1fr_0.55fr_0.55fr] lg:items-end'>
            <div>
              <h2 className='text-xl font-black text-slate-950'>Backend Admin Routes</h2>
              <p className='mt-1 text-sm text-slate-500'>
                Connected to /api/admin/users, /api/admin/analytics, /api/admin/interviews, /api/admin/reports, PATCH role, and DELETE user.
              </p>
              {apiError && <p className='mt-2 text-sm font-bold text-amber-700'>{apiError}</p>}
            </div>
            <label>
              <span className='mb-2 block text-sm font-bold text-slate-700'>User role</span>
              <select value={selectedUser.role || 'USER'} onChange={(event) => handleRoleChange(event.target.value)} className='input-field p-3'>
                {['USER', 'ADMIN'].map((role) => <option key={role}>{role}</option>)}
              </select>
            </label>
            <button onClick={handleDeleteSelectedUser} className='btn-danger px-5 py-3'>
              Delete user
            </button>
          </div>
        </section>

        <section className='mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]'>
          <div className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>Platform Analytics</h2>
            <p className='mt-1 text-sm text-slate-500'>Live values from admin analytics, interviews, and reports routes when the backend ADMIN session is available.</p>
            <div className='mt-5 grid gap-3 sm:grid-cols-2'>
              {backendOverview.map(([label, value]) => (
                <div key={label} className='rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100'>
                  <p className='text-xs font-black uppercase tracking-wide text-slate-500'>{label}</p>
                  <p className='mt-2 text-2xl font-black text-slate-950'>{value}</p>
                </div>
              ))}
            </div>
            <button onClick={refreshAdminApiData} disabled={isApiLoading} className='btn-secondary mt-5 w-full px-5 py-3'>
              <FaDatabase /> {isApiLoading ? 'Refreshing backend' : 'Refresh backend analytics'}
            </button>
          </div>

          <div className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>AI Usage By Feature</h2>
            <p className='mt-1 text-sm text-slate-500'>Bar graph from /api/admin/analytics algorithmAnalysis.aiUsageByFeature.</p>
            <div className='mt-5 h-72'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={backendUsageData.length ? backendUsageData : [{ feature: 'No API data', requests: 0, credits: 0 }]}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='feature' stroke='#64748b' interval={0} tick={{ fontSize: 11 }} />
                  <YAxis stroke='#64748b' />
                  <Tooltip />
                  <Bar dataKey='requests' radius={[6, 6, 0, 0]} fill='#2563eb' />
                  <Bar dataKey='credits' radius={[6, 6, 0, 0]} fill='#059669' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className='mt-5 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]'>
          <div className='surface-card p-5 sm:p-6'>
            <div className='mb-5 flex items-center justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-black text-slate-950'>Readiness Trend</h2>
                <p className='mt-1 text-sm text-slate-500'>User activity, interview volume, and AI usage over recent sessions.</p>
              </div>
              <FaChartLine className='text-emerald-700' />
            </div>
            <div className='h-72'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={selectedUser.activity}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='date' stroke='#64748b' />
                  <YAxis stroke='#64748b' />
                  <Tooltip />
                  <Line type='monotone' dataKey='readiness' stroke='#059669' strokeWidth={3} dot={{ r: 4 }} />
                  <Line type='monotone' dataKey='credits' stroke='#2563eb' strokeWidth={2} />
                  <Line type='monotone' dataKey='interviews' stroke='#f59e0b' strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className='surface-card p-5 sm:p-6'>
            <div className='mb-5 flex items-center justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-black text-slate-950'>Credit Usage</h2>
                <p className='mt-1 text-sm text-slate-500'>Plan consumption for this user.</p>
              </div>
              <FaChartBar className='text-emerald-700' />
            </div>
            <div className='h-72'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie data={creditChartData} dataKey='value' nameKey='name' innerRadius={58} outerRadius={94} paddingAngle={4}>
                    {creditChartData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className='mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]'>
          <div className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>Suite Score Controls</h2>
            <p className='mt-1 text-sm text-slate-500'>Edit per-user score values, then publish them to the main suite dashboard.</p>
            <div className='mt-5 grid gap-4 md:grid-cols-2'>
              {userScoreFields.map((field) => (
                <label key={field.key} className='rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100'>
                  <span className='mb-2 block text-sm font-black text-slate-700'>{field.label}</span>
                  <input type='number' min='0' max='100' value={selectedUser.scores[field.key] ?? 0} onChange={(event) => updateUserScore(field.key, event.target.value)} className='input-field p-3' />
                </label>
              ))}
            </div>
          </div>

          <div className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>Score Distribution</h2>
            <p className='mt-1 text-sm text-slate-500'>Bar graph generated from the selected user's suite data.</p>
            <div className='mt-5 h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={scoreChartData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='name' stroke='#64748b' interval={0} tick={{ fontSize: 11 }} />
                  <YAxis stroke='#64748b' />
                  <Tooltip />
                  <Bar dataKey='value' radius={[6, 6, 0, 0]} fill='#0f172a' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className='mt-5 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]'>
          <div className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>Placement Flow</h2>
            <p className='mt-1 text-sm text-slate-500'>Flowchart built from this user's job pipeline.</p>
            <div className='mt-6 flex flex-col gap-3'>
              {selectedUser.funnel.map((step, index) => (
                <div key={step.label} className='flex items-center gap-3'>
                  <div className='flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm'>
                    <p className='text-xs font-black uppercase tracking-wide text-slate-500'>{step.label}</p>
                    <p className='mt-1 text-3xl font-black text-slate-950'>{step.value}</p>
                  </div>
                  {index < selectedUser.funnel.length - 1 && <FaChevronRight className='hidden shrink-0 text-emerald-700 sm:block' />}
                </div>
              ))}
            </div>
          </div>

          <div className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>DSA Algorithm</h2>
            <p className='mt-1 text-sm text-slate-500'>Solved rate, review quality, streak, and weak-topic penalty update this user's DSA score.</p>
            <div className='mt-5 grid gap-4 sm:grid-cols-2'>
              {[
                ['solved', 'Solved problems'],
                ['attempted', 'Attempted problems'],
                ['streak', 'Practice streak'],
                ['weakTopics', 'Weak topics'],
                ['reviewScore', 'Code review score'],
              ].map(([key, label]) => (
                <label key={key}>
                  <span className='mb-2 block text-sm font-bold text-slate-700'>{label}</span>
                  <input type='number' value={selectedUser.dsa[key]} onChange={(event) => updateDsaField(key, event.target.value)} className='input-field p-3' />
                </label>
              ))}
            </div>
            <div className='mt-5 rounded-lg bg-slate-950 p-5 text-white'>
              <p className='text-sm font-bold text-emerald-200'>Calculated DSA score</p>
              <p className='mt-2 text-4xl font-black'>{dsaScore}%</p>
            </div>
            <div className='mt-5 h-56'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={selectedUser.dsa.topics}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
                  <XAxis dataKey='topic' stroke='#64748b' />
                  <YAxis stroke='#64748b' />
                  <Tooltip />
                  <Bar dataKey='score' radius={[6, 6, 0, 0]} fill='#059669' />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className='mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]'>
          <div className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>Project Data</h2>
            <p className='mt-1 text-sm text-slate-500'>Portfolio and website signals connected to this user.</p>
            <div className='mt-5 space-y-3'>
              {selectedUser.projects.map((project) => (
                <div key={project.name} className='rounded-xl border border-slate-200 bg-white p-4'>
                  <div className='flex items-center justify-between gap-4'>
                    <div>
                      <h3 className='font-black text-slate-950'>{project.name}</h3>
                      <p className='mt-1 text-sm text-slate-500'>{project.signal}</p>
                    </div>
                    <span className='text-2xl font-black text-emerald-700'>{project.health}%</span>
                  </div>
                  <div className='mt-3 h-2 overflow-hidden rounded-full bg-slate-100'>
                    <div className='h-full rounded-full bg-emerald-600' style={{ width: `${project.health}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className='surface-card p-5 sm:p-6'>
            <div className='mb-5 flex items-center justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-black text-slate-950'>Realtime Suite Notice</h2>
                <p className='mt-1 text-sm text-slate-500'>Publish live admin data visible in the suite dashboard.</p>
              </div>
              <FaBroadcastTower className='text-emerald-700' />
            </div>
            <div className='space-y-4'>
              <label>
                <span className='mb-2 block text-sm font-bold text-slate-700'>Headline</span>
                <input value={realtime.headline} onChange={(event) => setRealtime((current) => ({ ...current, headline: event.target.value }))} className='input-field p-3' />
              </label>
              <label>
                <span className='mb-2 block text-sm font-bold text-slate-700'>Message</span>
                <textarea value={realtime.message} onChange={(event) => setRealtime((current) => ({ ...current, message: event.target.value }))} className='input-field min-h-24 p-3' />
              </label>
              <label>
                <span className='mb-2 block text-sm font-bold text-slate-700'>Priority</span>
                <select value={realtime.priority} onChange={(event) => setRealtime((current) => ({ ...current, priority: event.target.value }))} className='input-field p-3'>
                  {['Low', 'Normal', 'High', 'Critical'].map((priority) => <option key={priority}>{priority}</option>)}
                </select>
              </label>
              <button onClick={applyRealtimeData} className='btn-primary w-full px-5 py-3'>
                <FaSave /> Publish realtime data
              </button>
            </div>
          </div>
        </section>

        <section className='mt-5 grid gap-4 md:grid-cols-3'>
          {dashboardStatus.map((item) => (
            <div key={item.label} className='surface-card p-5'>
              <h3 className='font-black text-slate-950'>{item.label}</h3>
              <div className='mt-4 space-y-3'>
                <input value={statusDraft[item.label]?.value || ''} onChange={(event) => updateStatusField(item.label, 'value', event.target.value)} className='input-field p-3' />
                <textarea value={statusDraft[item.label]?.detail || ''} onChange={(event) => updateStatusField(item.label, 'detail', event.target.value)} className='input-field min-h-20 p-3' />
                <button onClick={() => updateDashboardStatus(item.label, statusDraft[item.label])} className='btn-secondary w-full px-4 py-2'>
                  Save status panel
                </button>
              </div>
            </div>
          ))}
        </section>

        <p className='mt-5 text-xs font-semibold text-slate-400'>
          Last suite state update: {dashboardState.updatedAt ? new Date(dashboardState.updatedAt).toLocaleString() : 'Not published yet'}
        </p>
      </div>
    </div>
  )
}

export default AdminDashboard
