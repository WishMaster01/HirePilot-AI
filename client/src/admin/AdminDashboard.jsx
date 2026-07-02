import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaArrowLeft,
  FaBriefcase,
  FaChartLine,
  FaCoins,
  FaLock,
  FaRobot,
  FaShieldAlt,
  FaSignOutAlt,
  FaUserCheck,
} from 'react-icons/fa'

const ADMIN_EMAIL = 'admin@hirepilot.ai'
const ADMIN_PASSWORD = 'HirePilot@2026'

function AdminDashboard() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isAuthed, setIsAuthed] = useState(() => sessionStorage.getItem('hirepilot-admin') === 'true')

  const metrics = useMemo(() => ([
    { label: 'Users', value: '1,240', icon: FaUserCheck, tone: 'emerald' },
    { label: 'Interviews', value: '3,890', icon: FaRobot, tone: 'blue' },
    { label: 'Reports', value: '2,745', icon: FaChartLine, tone: 'emerald' },
    { label: 'AI Usage', value: '89,120', icon: FaCoins, tone: 'amber' },
    { label: 'Revenue', value: 'Rs 4.82L', icon: FaCoins, tone: 'blue' },
    { label: 'Job Listings', value: '312', icon: FaBriefcase, tone: 'emerald' },
  ]), [])

  const handleLogin = (event) => {
    event.preventDefault()
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('hirepilot-admin', 'true')
      setIsAuthed(true)
      setError('')
      return
    }
    setError('Invalid admin credentials.')
  }

  const handleLogout = () => {
    sessionStorage.removeItem('hirepilot-admin')
    setIsAuthed(false)
    setEmail('')
    setPassword('')
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
              <h1 className='mt-6 text-3xl font-black leading-tight text-white sm:text-5xl'>HirePilot-AI Admin Console</h1>
              <p className='mt-4 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base'>
                Frontend-only protected admin preview for users, interviews, reports, AI usage, revenue, analytics, and job listings.
              </p>
              <div className='mt-8 rounded-xl border border-emerald-300/20 bg-emerald-400/10 p-4 text-sm text-emerald-100'>
                <p className='font-black'>Demo admin credentials</p>
                <p className='mt-2'>Email: {ADMIN_EMAIL}</p>
                <p>Password: {ADMIN_PASSWORD}</p>
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
                  <input value={email} onChange={(event) => setEmail(event.target.value)} className='input-field p-3' placeholder='admin@hirepilot.ai' />
                </label>
                <label>
                  <span className='mb-2 block text-sm font-bold text-slate-700'>Password</span>
                  <input value={password} onChange={(event) => setPassword(event.target.value)} type='password' className='input-field p-3' placeholder='Enter admin password' />
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
            <button onClick={() => navigate('/')} className='btn-secondary h-11 w-11 min-h-0 rounded-full p-0'>
              <FaArrowLeft className='text-slate-600' />
            </button>
            <div>
              <p className='eyebrow mb-3'><FaShieldAlt /> Admin Dashboard</p>
              <h1 className='text-3xl font-black text-slate-950 sm:text-5xl'>HirePilot-AI Control Center</h1>
              <p className='mt-3 max-w-3xl text-slate-500'>Manage platform analytics, user activity, interviews, reports, AI usage, revenue, and job listings from one admin surface.</p>
            </div>
          </div>
          <button onClick={handleLogout} className='btn-danger w-fit px-5 py-2'>
            <FaSignOutAlt />
            Logout
          </button>
        </div>

        <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>
          {metrics.map((metric) => (
            <div key={metric.label} className='surface-card lift-card p-6'>
              <div className='flex items-start justify-between gap-4'>
                <div>
                  <p className='text-sm font-bold text-slate-500'>{metric.label}</p>
                  <p className='mt-2 text-4xl font-black text-slate-950'>{metric.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${metric.tone === 'blue' ? 'bg-blue-50 text-blue-700' : metric.tone === 'amber' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}`}>
                  {React.createElement(metric.icon)}
                </div>
              </div>
              <p className='mt-5 text-sm text-emerald-700'>Live admin preview metric</p>
            </div>
          ))}
        </div>

        <div className='mt-5 grid gap-5 lg:grid-cols-[1fr_0.8fr]'>
          <div className='surface-card p-6'>
            <h2 className='text-2xl font-black text-slate-950'>Recent Platform Activity</h2>
            <div className='mt-5 space-y-3'>
              {['New resume report generated', 'Technical interview completed', 'Roadmap PDF downloaded', 'Placement tracker updated'].map((item) => (
                <div key={item} className='rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-600 ring-1 ring-slate-100'>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className='dark-card rounded-2xl p-6'>
            <h2 className='text-2xl font-black text-white'>Admin Scope</h2>
            <p className='mt-3 text-sm leading-relaxed text-slate-300'>
              This route is a frontend-only admin prototype. Server-backed role checks, encrypted passwords, audit logs, and permission controls should be added in the backend phase.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
