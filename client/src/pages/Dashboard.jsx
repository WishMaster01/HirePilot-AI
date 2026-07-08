import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BsArrowRight, BsBroadcast, BsHouseDoor, BsMic, BsStars } from 'react-icons/bs'
import { dashboardMetrics, dashboardStatus, suiteCatalog } from '../data/suiteCatalog'
import { getDashboardState, subscribeDashboardState } from '../utils/dashboardStore'

function Dashboard() {
  const navigate = useNavigate()
  const [dashboardState, setDashboardState] = useState(() => getDashboardState())

  useEffect(() => subscribeDashboardState(setDashboardState), [])

  const liveMetrics = dashboardMetrics.map(([label, fallback]) => [label, dashboardState.metrics[label] ?? fallback])
  const liveStatus = dashboardStatus.map((item) => ({
    ...item,
    value: dashboardState.status[item.label]?.value ?? item.value,
    detail: dashboardState.status[item.label]?.detail ?? item.detail,
  }))

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
          <div className='flex flex-col gap-3 sm:flex-row lg:justify-end'>
            <button onClick={() => navigate('/')} className='btn-secondary w-fit px-5 py-3'>
              <BsHouseDoor /> Home
            </button>
            <button onClick={() => navigate('/mock-interview')} className='btn-primary w-fit px-5 py-3'>
              <BsMic /> Start AI Mock Interview
            </button>
            <button onClick={() => navigate('/career-intelligence')} className='btn-secondary w-fit px-5 py-3'>
              <BsStars /> Career Intelligence
            </button>
          </div>
        </div>

        <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {liveMetrics.map(([label, value], index) => (
            <div key={label} className='overflow-hidden rounded-lg border border-slate-800 bg-slate-950 text-white shadow-lg shadow-slate-950/10'>
              <div className='flex min-h-32 flex-col justify-between p-4'>
                <div className='flex items-center justify-between gap-3'>
                  <p className='max-w-32 text-xs font-black uppercase tracking-wide text-slate-300'>{label}</p>
                  <span className='rounded-full bg-white/10 px-2.5 py-1 text-xs font-black text-emerald-200'>KPI {index + 1}</span>
                </div>
                <div>
                  <p className='text-4xl font-black leading-none'>{value}%</p>
                  <div className='mt-4 h-1.5 overflow-hidden rounded-full bg-white/10'>
                    <div className='h-full rounded-full bg-emerald-400' style={{ width: `${value}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className='mt-5 grid gap-4 md:grid-cols-3'>
          {liveStatus.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.label} className='rounded-lg border border-emerald-200 bg-emerald-50/80 p-5 shadow-sm'>
                <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-emerald-100'>
                  <Icon />
                </div>
                <p className='text-sm font-black uppercase tracking-wide text-emerald-800'>{item.label}</p>
                <p className='mt-1 text-2xl font-black text-slate-950'>{item.value}</p>
                <p className='mt-2 text-sm leading-relaxed text-slate-600'>{item.detail}</p>
              </div>
            )
          })}
        </section>

        <section className='mt-5 overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm'>
          <div className='grid gap-0 lg:grid-cols-[0.85fr_1.15fr]'>
            <div className='bg-slate-950 p-5 text-white'>
              <div className='flex items-center gap-3'>
                <div className='flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-cyan-200'>
                  <BsBroadcast />
                </div>
                <div>
                  <p className='text-xs font-black uppercase tracking-wide text-cyan-200'>Admin realtime update</p>
                  <h2 className='mt-1 text-xl font-black'>{dashboardState.realtime.headline}</h2>
                </div>
              </div>
              <p className='mt-4 text-sm leading-relaxed text-slate-300'>{dashboardState.realtime.message}</p>
              <span className='mt-4 inline-flex rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-black text-cyan-100'>
                Priority: {dashboardState.realtime.priority}
              </span>
            </div>
            <div className='p-5'>
              <p className='text-sm font-black uppercase tracking-wide text-slate-500'>Recent score activity</p>
              <div className='mt-3 grid gap-2 md:grid-cols-2'>
                {dashboardState.activity.slice(0, 4).map((item) => (
                  <div key={item} className='rounded-md bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600 ring-1 ring-slate-100'>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className='mt-8 flex items-end justify-between gap-4'>
          <div>
            <p className='eyebrow mb-3'>Interactive suites</p>
            <h2 className='text-2xl font-black text-slate-950 sm:text-3xl'>Choose a workspace</h2>
          </div>
          <p className='hidden max-w-md text-right text-sm leading-relaxed text-slate-500 md:block'>
            Suite cards open runnable tools with inputs, prompts, generated output, risks, and next actions.
          </p>
        </div>

        <section className='mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {suiteCatalog.map((suite) => {
            const Icon = suite.icon
            return (
              <button key={suite.key} onClick={() => navigate(suite.path)} className='group overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-950/10'>
                <div className='h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500' />
                <div className='p-5'>
                  <div className='mb-5 flex items-start justify-between gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-slate-950 text-white shadow-md shadow-slate-950/15'>
                      <Icon />
                    </div>
                    <span className='rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'>
                      {dashboardState.suiteScores[suite.key] ?? suite.score}%
                    </span>
                  </div>
                  <h2 className='text-lg font-black text-slate-950'>{suite.title}</h2>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {suite.features.slice(0, 3).map((feature) => (
                      <span key={feature} className='rounded-md bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-100'>
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-4'>
                    <p className='text-sm font-black text-slate-700'>Open tools</p>
                    <span className='flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white'>
                      <BsArrowRight />
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
