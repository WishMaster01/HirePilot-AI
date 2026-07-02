import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaGithub, FaLinkedin, FaPlay, FaRobot, FaVideo } from 'react-icons/fa'
import { createContextualVideoInterview } from '../interviewApi'

const defaultContext = {
  targetRole: 'Full Stack Developer',
  experienceLevel: 'Student / fresher',
  interviewType: 'Technical video interview',
  difficulty: 'medium',
  company: '',
  resumeText: 'Paste resume summary, skills, projects, internships, and achievements here.',
  linkedInProfile: 'Paste LinkedIn headline, about section, skills, and experience highlights here.',
  githubUrl: 'https://github.com/username',
  githubProjects: 'Describe your best GitHub repositories, architecture, tech stack, and features here.',
  techStack: 'React, Node.js, Express, PostgreSQL, Prisma, Firebase, Tailwind CSS',
  focusAreas: 'Project deep dive, backend APIs, authentication, database design, deployment',
}

function ContextualVideoInterview() {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultContext)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const generate = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await createContextualVideoInterview(form)
      setResult(response.data?.data)
    } catch (err) {
      setError(err?.message || 'Unable to generate contextual video interview.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='page-shell min-h-screen px-4 py-8 sm:px-6'>
      <div className='wide-shell'>
        <div className='mb-6 flex items-start gap-4'>
          <button onClick={() => navigate('/career')} className='btn-secondary h-11 w-11 min-h-0 rounded-full p-0'>
            <FaArrowLeft className='text-slate-600' />
          </button>
          <div>
            <p className='eyebrow mb-3'><FaVideo /> Context-aware video mock</p>
            <h1 className='text-3xl font-black text-slate-950 sm:text-5xl'>AI Video Interview Assistant</h1>
            <p className='mt-3 max-w-3xl text-slate-500'>Generate interview questions from resume, LinkedIn, GitHub, projects, tech stack, and target role evidence.</p>
          </div>
        </div>

        <div className='grid gap-5 xl:grid-cols-[0.95fr_1.05fr]'>
          <section className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>Candidate context</h2>
            <div className='mt-5 grid gap-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <input value={form.targetRole} onChange={(e) => update('targetRole', e.target.value)} className='input-field p-3' placeholder='Target role' />
                <input value={form.experienceLevel} onChange={(e) => update('experienceLevel', e.target.value)} className='input-field p-3' placeholder='Experience level' />
                <input value={form.interviewType} onChange={(e) => update('interviewType', e.target.value)} className='input-field p-3' placeholder='Interview type' />
                <input value={form.difficulty} onChange={(e) => update('difficulty', e.target.value)} className='input-field p-3' placeholder='Difficulty' />
              </div>
              <textarea value={form.resumeText} onChange={(e) => update('resumeText', e.target.value)} className='input-field min-h-28 p-3' />
              <textarea value={form.linkedInProfile} onChange={(e) => update('linkedInProfile', e.target.value)} className='input-field min-h-28 p-3' />
              <div className='grid gap-4 md:grid-cols-[0.8fr_1.2fr]'>
                <input value={form.githubUrl} onChange={(e) => update('githubUrl', e.target.value)} className='input-field p-3' />
                <input value={form.techStack} onChange={(e) => update('techStack', e.target.value)} className='input-field p-3' />
              </div>
              <textarea value={form.githubProjects} onChange={(e) => update('githubProjects', e.target.value)} className='input-field min-h-28 p-3' />
              <textarea value={form.focusAreas} onChange={(e) => update('focusAreas', e.target.value)} className='input-field min-h-20 p-3' />
              <button onClick={generate} disabled={loading} className='btn-primary w-full px-5 py-3'>
                <FaPlay />
                {loading ? 'Generating...' : 'Generate personalized video interview'}
              </button>
              {error && <p className='rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 ring-1 ring-red-100'>{error}</p>}
            </div>
          </section>

          <section className='space-y-5'>
            <div className='dark-card rounded-2xl p-6'>
              <div className='flex items-start gap-4'>
                <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white text-slate-950'><FaRobot /></div>
                <div>
                  <h2 className='text-2xl font-black text-white'>{result?.assistantPersona || 'Senior AI interviewer'}</h2>
                  <p className='mt-2 text-sm leading-relaxed text-slate-300'>{result?.contextSummary || 'Add candidate context and generate a realistic video interview plan.'}</p>
                </div>
              </div>
            </div>

            {result && (
              <>
                <div className='surface-card p-5'>
                  <h3 className='text-xl font-black text-slate-950'>Opening prompt</h3>
                  <p className='mt-3 text-slate-600'>{result.openingPrompt}</p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {(result.videoInterviewTips || []).map((tip) => <span key={tip} className='rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700'>{tip}</span>)}
                  </div>
                </div>

                <div className='grid gap-4'>
                  {(result.sourceQuestions || []).map((item, index) => (
                    <div key={`${item.question}-${index}`} className='surface-card p-5'>
                      <div className='mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-700'>
                        <span><FaGithub /> {item.source}</span>
                        <span><FaLinkedin /> {item.type}</span>
                        <span>{item.difficulty}</span>
                      </div>
                      <h3 className='text-lg font-black text-slate-950'>{item.question}</h3>
                      <p className='mt-3 text-sm text-slate-500'>Expected points: {(item.expectedAnswerPoints || []).join(', ')}</p>
                      <p className='mt-2 text-sm text-slate-500'>Follow-ups: {(item.followUps || []).join(', ') || 'None'}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default ContextualVideoInterview
