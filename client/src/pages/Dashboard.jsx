import React from 'react'
import { useNavigate } from 'react-router-dom'
import { dashboardMetrics, dashboardStatus, suiteCatalog } from '../data/suiteCatalog'

function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className='page-shell min-h-screen'>
      <div className='wide-shell py-6 sm:py-8'>
        <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='eyebrow mb-3'>Suite dashboard</p>
            <h1 className='text-3xl font-black text-slate-950 sm:text-5xl'>HirePilot AI Career Platform</h1>
            <p className='mt-3 max-w-3xl text-sm leading-relaxed text-slate-500 sm:text-base'>
              Track readiness, applications, AI credits, plan status, notifications, and recommended actions across every career suite.
            </p>
          </div>
          <button onClick={() => navigate('/career')} className='btn-primary w-fit px-6 py-3'>Open command center</button>
        </div>

        <section className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
          {dashboardMetrics.map(([label, value]) => (
            <div key={label} className='surface-card p-5'>
              <p className='text-sm font-bold text-slate-500'>{label}</p>
              <p className='mt-2 text-3xl font-black text-slate-950'>{value}%</p>
              <div className='mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100'>
                <div className='h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500' style={{ width: `${value}%` }} />
              </div>
            </div>
          ))}
        </section>

        <section className='mt-5 grid gap-4 md:grid-cols-3'>
          {dashboardStatus.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className='surface-card p-5'>
                <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'>
                  <Icon />
                </div>
                <p className='text-sm font-bold text-slate-500'>{item.label}</p>
                <p className='mt-1 text-2xl font-black text-slate-950'>{item.value}</p>
                <p className='mt-2 text-sm text-slate-500'>{item.detail}</p>
              </div>
            )
          })}
        </section>

        <section className='mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {suiteCatalog.map((suite) => {
            const Icon = suite.icon
            return (
              <button key={suite.key} onClick={() => navigate(suite.path)} className='surface-card p-5 text-left transition hover:-translate-y-0.5 hover:shadow-lg'>
                <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-white'>
                  <Icon />
                </div>
                <h2 className='text-lg font-black text-slate-950'>{suite.title}</h2>
                <p className='mt-2 text-sm text-slate-500'>{suite.features.slice(0, 3).join(', ')}</p>
              </button>
            )
          })}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
