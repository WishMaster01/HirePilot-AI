import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaArrowLeft,
  FaBroadcastTower,
  FaChartLine,
  FaLock,
  FaSave,
  FaShieldAlt,
  FaSignOutAlt,
  FaSyncAlt,
} from 'react-icons/fa'
import { dashboardMetrics, dashboardStatus, suiteCatalog } from '../data/suiteCatalog'
import {
  getDashboardState,
  resetDashboardState,
  subscribeDashboardState,
  updateDashboardMetric,
  updateDashboardStatus,
  updateRealtimeData,
  updateSuiteScore,
} from '../utils/dashboardStore'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@hirepilot.ai'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'HirePilot@2026'

const clamp = (value) => Math.max(0, Math.min(100, Number(value) || 0))

function AdminDashboard() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('hirepilot-admin') === 'true')
  const [dashboardState, setDashboardState] = useState(() => getDashboardState())
  const [realtime, setRealtime] = useState(() => getDashboardState().realtime)
  const [statusDraft, setStatusDraft] = useState(() => getDashboardState().status)
  const [dsaInputs, setDsaInputs] = useState({
    solved: 28,
    attempted: 36,
    streak: 5,
    weakTopics: 2,
    reviewScore: 78,
  })

  useEffect(() => subscribeDashboardState((state) => {
    setDashboardState(state)
    setRealtime(state.realtime)
    setStatusDraft(state.status)
  }), [])

  const adminMetrics = useMemo(() => {
    const values = Object.values(dashboardState.metrics)
    const averageScore = Math.round(values.reduce((sum, value) => sum + Number(value || 0), 0) / values.length)
    return [
      ['Average KPI', `${averageScore}%`],
      ['Suite scores', String(Object.keys(dashboardState.suiteScores).length)],
      ['Realtime priority', dashboardState.realtime.priority],
      ['Latest activity', dashboardState.activity[0] || 'No activity'],
    ]
  }, [dashboardState])

  const dsaScore = useMemo(() => {
    const solvedRate = dsaInputs.attempted ? (Number(dsaInputs.solved) / Number(dsaInputs.attempted)) * 100 : 0
    const streakBoost = Math.min(15, Number(dsaInputs.streak) * 2)
    const review = Number(dsaInputs.reviewScore) || 0
    const weakPenalty = Math.min(25, Number(dsaInputs.weakTopics) * 5)
    return clamp(Math.round(solvedRate * 0.45 + review * 0.35 + streakBoost + 10 - weakPenalty))
  }, [dsaInputs])

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
    setEmail('')
    setPassword('')
  }

  const updateStatusField = (label, field, value) => {
    setStatusDraft((current) => ({
      ...current,
      [label]: { ...(current[label] || {}), [field]: value },
    }))
  }

  const applyDsaScore = () => {
    updateDashboardMetric('DSA score', dsaScore)
    updateSuiteScore('coding-dsa', dsaScore)
    updateRealtimeData({
      headline: 'DSA readiness recalculated',
      message: `Admin algorithm updated DSA score to ${dsaScore}% using solved rate, review score, streak, and weak-topic penalty.`,
      priority: dsaScore < 60 ? 'High' : 'Normal',
    })
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
                Professional control surface for score values, suite health, realtime notices, dashboard status, and DSA algorithm calibration.
              </p>
              <div className='mt-8 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100'>
                Admin credentials are read from <span className='font-black'>client/.env</span> using <span className='font-black'>VITE_ADMIN_EMAIL</span> and <span className='font-black'>VITE_ADMIN_PASSWORD</span>.
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

  return (
    <div className='page-shell min-h-screen px-4 py-8 sm:px-6'>
      <div className='wide-shell'>
        <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-start gap-4'>
            <button onClick={() => navigate('/career')} className='btn-secondary h-11 w-11 min-h-0 rounded-full p-0'>
              <FaArrowLeft className='text-slate-600' />
            </button>
            <div>
              <p className='eyebrow mb-3'><FaShieldAlt /> Admin Dashboard</p>
              <h1 className='text-3xl font-black text-slate-950 sm:text-5xl'>HirePilot Control Center</h1>
              <p className='mt-3 max-w-3xl text-slate-500'>Admin changes here update the suite dashboard scores, suite cards, realtime notice, and status panels in the same browser session.</p>
            </div>
          </div>
          <div className='flex flex-col gap-3 sm:flex-row'>
            <button onClick={() => resetDashboardState()} className='btn-secondary w-fit px-5 py-2'>
              <FaSyncAlt /> Reset dashboard
            </button>
            <button onClick={handleLogout} className='btn-danger w-fit px-5 py-2'>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>

        <section className='grid gap-4 md:grid-cols-4'>
          {adminMetrics.map(([label, value]) => (
            <div key={label} className='rounded-lg border border-slate-800 bg-slate-950 p-5 text-white'>
              <p className='text-xs font-black uppercase tracking-wide text-slate-300'>{label}</p>
              <p className='mt-3 truncate text-2xl font-black'>{value}</p>
            </div>
          ))}
        </section>

        <section className='mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]'>
          <div className='surface-card p-5 sm:p-6'>
            <div className='mb-5 flex items-center justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-black text-slate-950'>Dashboard KPI Scores</h2>
                <p className='mt-1 text-sm text-slate-500'>Edit values shown in the suite dashboard KPI row.</p>
              </div>
              <FaChartLine className='text-emerald-700' />
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              {dashboardMetrics.map(([label]) => (
                <label key={label} className='rounded-lg bg-slate-50 p-4 ring-1 ring-slate-100'>
                  <span className='mb-2 block text-sm font-black text-slate-700'>{label}</span>
                  <input type='number' min='0' max='100' value={dashboardState.metrics[label] ?? 0} onChange={(event) => updateDashboardMetric(label, event.target.value)} className='input-field p-3' />
                </label>
              ))}
            </div>
          </div>

          <div className='surface-card p-5 sm:p-6'>
            <div className='mb-5 flex items-center justify-between gap-4'>
              <div>
                <h2 className='text-2xl font-black text-slate-950'>Realtime Data</h2>
                <p className='mt-1 text-sm text-slate-500'>Publish a live notice to the suite dashboard.</p>
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
              <button onClick={() => updateRealtimeData(realtime)} className='btn-primary w-full px-5 py-3'>
                <FaSave /> Publish realtime data
              </button>
            </div>
          </div>
        </section>

        <section className='mt-5 grid gap-5 xl:grid-cols-[1fr_0.9fr]'>
          <div className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>Suite Score Values</h2>
            <p className='mt-1 text-sm text-slate-500'>These values appear on suite cards and inside each suite sidebar.</p>
            <div className='mt-5 grid gap-3 md:grid-cols-2'>
              {suiteCatalog.map((suite) => (
                <label key={suite.key} className='rounded-lg border border-slate-200 bg-white p-4'>
                  <span className='mb-2 block text-sm font-black text-slate-700'>{suite.title}</span>
                  <input type='number' min='0' max='100' value={dashboardState.suiteScores[suite.key] ?? 0} onChange={(event) => updateSuiteScore(suite.key, event.target.value)} className='input-field p-3' />
                </label>
              ))}
            </div>
          </div>

          <div className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>DSA Algorithm Calibration</h2>
            <p className='mt-1 text-sm text-slate-500'>Score = solved rate, review quality, streak boost, and weak-topic penalty.</p>
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
                  <input type='number' value={dsaInputs[key]} onChange={(event) => setDsaInputs((current) => ({ ...current, [key]: event.target.value }))} className='input-field p-3' />
                </label>
              ))}
            </div>
            <div className='mt-5 rounded-lg bg-slate-950 p-5 text-white'>
              <p className='text-sm font-bold text-emerald-200'>Calculated DSA score</p>
              <p className='mt-2 text-4xl font-black'>{dsaScore}%</p>
            </div>
            <button onClick={applyDsaScore} className='btn-primary mt-5 w-full px-5 py-3'>
              Apply DSA score to dashboard
            </button>
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
      </div>
    </div>
  )
}

export default AdminDashboard
