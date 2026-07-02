import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaBrain, FaGithub, FaGraduationCap, FaLinkedin } from 'react-icons/fa'
import { createProfileTrainingQuestions } from '../interviewApi'

const defaultContext = {
  targetRole: 'Backend Developer',
  experienceLevel: 'Student / fresher',
  resumeText: 'Paste resume analysis summary, missing skills, strengths, and projects here.',
  linkedInProfile: 'Paste LinkedIn headline, about section, skills, and weak profile areas here.',
  githubUrl: 'https://github.com/username',
  githubProjects: 'Paste GitHub project descriptions, repositories, README notes, and architecture details here.',
  techStack: 'Node.js, Express, PostgreSQL, Prisma, REST APIs, Authentication',
  weakAreas: 'System design basics, testing, deployment, DSA edge cases',
  targetCompanies: 'Google, Amazon, Microsoft, TCS, Infosys',
}

function ProfileInterviewTraining() {
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
      const response = await createProfileTrainingQuestions(form)
      setResult(response.data?.data)
    } catch (err) {
      setError(err?.message || 'Unable to generate training questions.')
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
            <p className='eyebrow mb-3'><FaGraduationCap /> Profile-based training</p>
            <h1 className='text-3xl font-black text-slate-950 sm:text-5xl'>Interview Training Question Lab</h1>
            <p className='mt-3 max-w-3xl text-slate-500'>Train from your resume analysis, LinkedIn profile, GitHub projects, weak areas, and target companies.</p>
          </div>
        </div>

        <div className='grid gap-5 xl:grid-cols-[0.9fr_1.1fr]'>
          <section className='surface-card p-5 sm:p-6'>
            <h2 className='text-2xl font-black text-slate-950'>Training inputs</h2>
            <div className='mt-5 grid gap-4'>
              <div className='grid gap-4 md:grid-cols-2'>
                <input value={form.targetRole} onChange={(e) => update('targetRole', e.target.value)} className='input-field p-3' />
                <input value={form.experienceLevel} onChange={(e) => update('experienceLevel', e.target.value)} className='input-field p-3' />
              </div>
              <textarea value={form.resumeText} onChange={(e) => update('resumeText', e.target.value)} className='input-field min-h-24 p-3' />
              <textarea value={form.linkedInProfile} onChange={(e) => update('linkedInProfile', e.target.value)} className='input-field min-h-24 p-3' />
              <input value={form.githubUrl} onChange={(e) => update('githubUrl', e.target.value)} className='input-field p-3' />
              <textarea value={form.githubProjects} onChange={(e) => update('githubProjects', e.target.value)} className='input-field min-h-24 p-3' />
              <textarea value={form.techStack} onChange={(e) => update('techStack', e.target.value)} className='input-field min-h-20 p-3' />
              <textarea value={form.weakAreas} onChange={(e) => update('weakAreas', e.target.value)} className='input-field min-h-20 p-3' />
              <input value={form.targetCompanies} onChange={(e) => update('targetCompanies', e.target.value)} className='input-field p-3' />
              <button onClick={generate} disabled={loading} className='btn-primary w-full px-5 py-3'>
                <FaBrain />
                {loading ? 'Building plan...' : 'Generate training questions'}
              </button>
              {error && <p className='rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 ring-1 ring-red-100'>{error}</p>}
            </div>
          </section>

          <section className='space-y-5'>
            <div className='dark-card rounded-2xl p-6'>
              <h2 className='text-2xl font-black text-white'>{result?.trainingTitle || 'Personal interview training plan'}</h2>
              <p className='mt-3 text-sm leading-relaxed text-slate-300'>{result?.contextSummary || 'Generate a question bank from your resume, GitHub, LinkedIn and technical gaps.'}</p>
              {result?.readinessScore !== undefined && <p className='mt-4 text-4xl font-black text-emerald-200'>{result.readinessScore}% readiness</p>}
            </div>

            {result && (
              <>
                <div className='grid gap-4 md:grid-cols-2'>
                  {(result.topicBuckets || []).map((bucket, index) => (
                    <div key={`${bucket.topic}-${index}`} className='surface-card p-5'>
                      <p className='eyebrow mb-3'>{bucket.source === 'github' ? <FaGithub /> : <FaLinkedin />} {bucket.source}</p>
                      <h3 className='text-xl font-black text-slate-950'>{bucket.topic}</h3>
                      <p className='mt-2 text-sm font-bold text-emerald-700'>Priority: {bucket.priority}</p>
                      <div className='mt-4 space-y-3'>
                        {(bucket.questions || []).map((question, qIndex) => (
                          <div key={`${question.question}-${qIndex}`} className='rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100'>
                            <p className='font-bold text-slate-950'>{question.question}</p>
                            <p className='mt-2 text-sm text-slate-500'>{question.whyAsked}</p>
                            <p className='mt-2 text-sm text-emerald-700'>{question.practiceTask}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className='surface-card p-5'>
                  <h3 className='text-xl font-black text-slate-950'>Daily practice plan</h3>
                  <div className='mt-4 grid gap-3 md:grid-cols-2'>
                    {(result.dailyPracticePlan || []).map((step) => (
                      <div key={step} className='rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>{step}</div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

export default ProfileInterviewTraining
