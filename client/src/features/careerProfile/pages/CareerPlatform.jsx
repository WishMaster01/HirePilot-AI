import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import jsPDF from 'jspdf'
import {
  FaArrowLeft,
  FaBriefcase,
  FaChartLine,
  FaCheckCircle,
  FaCode,
  FaComments,
  FaCoins,
  FaCrown,
  FaFileAlt,
  FaGithub,
  FaGraduationCap,
  FaLinkedin,
  FaMagic,
  FaMoon,
  FaPlay,
  FaRobot,
  FaRoute,
  FaStar,
  FaSun,
  FaUsers,
  FaVideo,
} from 'react-icons/fa'

const modules = [
  { id: 'career', label: 'Career DNA', icon: FaGraduationCap, credits: 5 },
  { id: 'resume', label: 'Resume Builder', icon: FaFileAlt, credits: 10 },
  { id: 'ats', label: 'ATS Checker', icon: FaCheckCircle, credits: 8 },
  { id: 'keywords', label: 'Keyword Optimizer', icon: FaMagic, credits: 6 },
  { id: 'rewrite', label: 'Resume Rewrite', icon: FaStar, credits: 12 },
  { id: 'jobs', label: 'Job Match', icon: FaBriefcase, credits: 8 },
  { id: 'interview', label: 'Interview Copilot', icon: FaRobot, credits: 15 },
  { id: 'contextualInterview', label: 'Resume/GitHub Video AI', icon: FaVideo, credits: 25 },
  { id: 'profileTraining', label: 'Profile Training Lab', icon: FaGraduationCap, credits: 18 },
  { id: 'video', label: 'Video AI', icon: FaVideo, credits: 20 },
  { id: 'roadmap', label: 'Roadmaps', icon: FaRoute, credits: 12 },
  { id: 'dsa', label: 'DSA Coach', icon: FaCode, credits: 10 },
  { id: 'project', label: 'Project Analyzer', icon: FaGithub, credits: 14 },
  { id: 'linkedin', label: 'LinkedIn AI', icon: FaLinkedin, credits: 8 },
  { id: 'placement', label: 'Placement Tracker', icon: FaChartLine, credits: 6 },
  { id: 'mentor', label: 'Career Mentor', icon: FaComments, credits: 4 },
  { id: 'game', label: 'Community & XP', icon: FaCrown, credits: 2 },
]

const interviewModes = [
  'HR Interview',
  'Technical Interview',
  'Behavioral Interview',
  'System Design Interview',
  'Group Discussion',
  'Leadership Interview',
]

const companies = ['Google', 'Amazon', 'Microsoft', 'TCS', 'Infosys', 'Accenture']

const roadmaps = {
  'Frontend Developer': ['HTML, CSS, JavaScript mastery', 'React and state management', 'Testing, accessibility, performance', 'Portfolio dashboard and SaaS clone'],
  'Backend Developer': ['Node.js and API design', 'Databases and caching', 'Auth, queues, logging', 'Scalable service project'],
  'Full Stack Developer': ['React frontend foundations', 'Node and database APIs', 'Payments, auth, deployments', 'End-to-end product build'],
  'AI Engineer': ['Python and ML foundations', 'LLMs, embeddings, RAG', 'Model evaluation and safety', 'AI assistant portfolio'],
  'Data Scientist': ['Statistics and Python', 'SQL and visualization', 'ML model workflows', 'Business case studies'],
  'DevOps Engineer': ['Linux and networking', 'CI/CD release automation', 'Cloud infrastructure', 'Monitoring and reliability'],
  'Cyber Security Engineer': ['Networking and OS basics', 'Web security and OWASP', 'SIEM and incident response', 'Security lab reports'],
}

const dsaTopics = ['Arrays', 'Strings', 'Trees', 'Graphs', 'Dynamic Programming', 'System Design']

const applicationsSeed = [
  { company: 'Microsoft', role: 'SDE Intern', status: 'Interview', probability: 74 },
  { company: 'Accenture', role: 'Graduate Engineer', status: 'OA Cleared', probability: 68 },
  { company: 'Amazon', role: 'Backend SDE', status: 'Applied', probability: 52 },
]

function tokens(value) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function scoreFromCount(count, base = 42, step = 8) {
  return Math.min(96, base + count * step)
}

function ScoreBar({ label, value, tone = 'emerald' }) {
  const color = tone === 'blue' ? 'from-blue-500 to-cyan-500' : tone === 'amber' ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500'

  return (
    <div>
      <div className='mb-2 flex items-center justify-between gap-3 text-sm'>
        <span className='font-semibold text-slate-600'>{label}</span>
        <span className='font-black text-slate-950'>{value}%</span>
      </div>
      <div className='h-2.5 overflow-hidden rounded-full bg-slate-200'>
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${value}%` }}></div>
      </div>
    </div>
  )
}

function InsightCard({ icon: Icon, title, children, className = '' }) {
  return (
    <div className={`surface-card lift-card p-5 ${className}`}>
      <div className='mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'>
        {React.createElement(Icon)}
      </div>
      <h3 className='text-lg font-black text-slate-950'>{title}</h3>
      <div className='mt-3 text-sm leading-relaxed text-slate-500'>{children}</div>
    </div>
  )
}

function CareerPlatform() {
  const navigate = useNavigate()
  const [active, setActive] = useState('career')
  const [darkMode, setDarkMode] = useState(false)
  const [profile, setProfile] = useState({
    education: 'B.Tech Computer Science',
    skills: 'React, Node.js, PostgreSQL, JavaScript',
    techStack: 'MERN, Tailwind CSS, Firebase',
    projects: 'AI Mock Interview Platform, Resume Parser',
    experience: '1 internship, 4 months freelance',
    interests: 'Full Stack Developer, AI products',
  })
  const [resumeText, setResumeText] = useState('React developer with MERN stack projects, Firebase auth, AI interview platform, and dashboard experience.')
  const [resumeFileName, setResumeFileName] = useState('')
  const [jobDescription, setJobDescription] = useState('React Node.js PostgreSQL REST API Tailwind testing accessibility deployment')
  const [selectedMode, setSelectedMode] = useState('Technical Interview')
  const [selectedCompany, setSelectedCompany] = useState('Google')
  const [selectedRoadmap, setSelectedRoadmap] = useState('Full Stack Developer')
  const [projectUrl, setProjectUrl] = useState('https://github.com/username/hirepilot-ai')
  const [linkedinUrl, setLinkedinUrl] = useState('https://linkedin.com/in/your-profile')
  const [moduleRunStatus, setModuleRunStatus] = useState({})
  const [applications, setApplications] = useState(applicationsSeed)
  const [newApplication, setNewApplication] = useState({ company: '', role: '', status: 'Applied' })
  const [mentorInput, setMentorInput] = useState('')
  const [mentorMessages, setMentorMessages] = useState([
    { role: 'ai', text: 'Ask me about resumes, DSA, interviews, roadmaps, placements, or job strategy.' },
  ])

  const profileScores = useMemo(() => {
    const skillCount = tokens(profile.skills).length
    const stackCount = tokens(profile.techStack).length
    const projectCount = tokens(profile.projects).length
    const interestCount = tokens(profile.interests).length

    return {
      career: scoreFromCount(skillCount + projectCount, 38, 7),
      strength: scoreFromCount(skillCount + stackCount, 44, 6),
      employability: scoreFromCount(projectCount + stackCount, 40, 8),
      readiness: scoreFromCount(skillCount + interestCount, 36, 7),
      weakness: Math.max(8, 100 - scoreFromCount(skillCount + projectCount + stackCount, 35, 6)),
    }
  }, [profile])

  const resumeScore = useMemo(() => {
    const resumeTokens = new Set(tokens(resumeText.toLowerCase().replace(/\s+/g, ',')))
    const jdTokens = tokens(jobDescription.toLowerCase().replace(/\s+/g, ','))
    const matched = jdTokens.filter((item) => resumeTokens.has(item))
    return {
      score: Math.min(96, 48 + matched.length * 6),
      matched,
      missing: jdTokens.filter((item) => !resumeTokens.has(item)).slice(0, 8),
    }
  }, [resumeText, jobDescription])

  const skillList = tokens(profile.skills)
  const jobMatches = [
    { role: 'Frontend Developer Intern', type: 'Internship', match: Math.min(96, 58 + skillList.length * 5), missing: ['Testing', 'Accessibility'] },
    { role: 'Graduate SDE', type: 'Graduate Role', match: Math.min(92, 52 + skillList.length * 4), missing: ['DSA depth', 'System design basics'] },
    { role: 'Full Stack Product Engineer', type: 'Product Role', match: Math.min(94, 54 + skillList.length * 5), missing: ['Cloud deployment', 'Observability'] },
    { role: 'Backend SDE', type: 'SDE Job', match: Math.min(88, 47 + skillList.length * 4), missing: ['Redis', 'Queue systems'] },
  ]

  const addApplication = () => {
    if (!newApplication.company || !newApplication.role) return
    setApplications((prev) => [
      {
        ...newApplication,
        probability: 50 + Math.min(35, prev.length * 4),
      },
      ...prev,
    ])
    setNewApplication({ company: '', role: '', status: 'Applied' })
  }

  const handleResumeUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setResumeFileName(file.name)
    setResumeText((prev) => `${prev}\nUploaded resume: ${file.name}. Add extracted resume text here for frontend analysis.`)
  }

  const downloadRoadmapPDF = () => {
    const doc = new jsPDF()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text(`HirePilot-AI Roadmap: ${selectedRoadmap}`, 14, 20)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    roadmaps[selectedRoadmap].forEach((step, index) => {
      doc.text(`Month ${index + 1}: ${step}`, 14, 36 + index * 14)
      doc.text('Action: complete one course, one project, and one proof point.', 18, 42 + index * 14)
    })
    doc.save(`HirePilot-AI_${selectedRoadmap.replaceAll(' ', '_')}_Roadmap.pdf`)
  }

  const downloadDsaPDF = () => {
    const doc = new jsPDF()
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(18)
    doc.text('HirePilot-AI DSA Practice Plan', 14, 20)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(11)
    dsaTopics.forEach((topic, index) => {
      const score = 55 + index * 7
      doc.text(`${topic}: ${score}% readiness`, 14, 36 + index * 12)
      doc.text('Practice: 3 problems, 1 timed attempt, 1 code review.', 18, 42 + index * 12)
    })
    doc.save('HirePilot-AI_DSA_Practice_Plan.pdf')
  }

  const sendMentorMessage = () => {
    if (!mentorInput.trim()) return
    const question = mentorInput.trim()
    setMentorMessages((prev) => [
      ...prev,
      { role: 'user', text: question },
      {
        role: 'ai',
        text: 'Frontend preview: prioritize one target role, close the top 2 skill gaps, practice 3 focused interviews weekly, and keep your resume keyword aligned to each job description.',
      },
    ])
    setMentorInput('')
  }

  const startModuleProcess = (moduleId, message) => {
    setModuleRunStatus((prev) => ({ ...prev, [moduleId]: message }))
  }

  const activeModule = modules.find((module) => module.id === active)

  return (
    <div className={`${darkMode ? 'dark-shell text-white' : 'page-shell'} min-h-screen`}>
      <div className='wide-shell py-6 sm:py-8'>
        <div className='mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-start gap-4'>
            <button onClick={() => navigate('/')} className='btn-secondary h-11 w-11 min-h-0 rounded-full p-0'>
              <FaArrowLeft className='text-slate-600' />
            </button>
            <div>
              <p className='eyebrow mb-3'><FaMagic /> Startup-grade career platform</p>
              <h1 className={`text-3xl font-black sm:text-5xl ${darkMode ? 'text-white' : 'text-slate-950'}`}>HirePilot-AI Career Command Center</h1>
              <p className={`mt-3 max-w-3xl leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                Frontend-only AI modules for career DNA, resumes, ATS checks, job matching, interview prep, DSA, roadmaps, community, gamification, and mentor workflows.
              </p>
            </div>
          </div>
          <button onClick={() => setDarkMode((value) => !value)} className='btn-secondary w-fit px-5 py-2'>
            {darkMode ? <FaSun /> : <FaMoon />}
            {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
        </div>

        <div className='grid gap-5 lg:grid-cols-[18rem_1fr]'>
          <aside className='glass-panel rounded-2xl p-3 lg:sticky lg:top-6 lg:h-fit'>
            <div className='mb-3 flex items-center gap-3 px-2 py-2'>
              <img src='/logo.png' alt='HirePilot-AI logo' className='h-10 w-10 rounded-xl object-contain' />
              <div>
                <p className='font-black text-slate-950'>Career OS</p>
                <p className='text-xs font-semibold text-emerald-700'>{modules.length} career AI modules</p>
              </div>
            </div>
            <div className='grid gap-1 sm:grid-cols-2 lg:grid-cols-1'>
              {modules.map((module) => {
                const Icon = module.icon
                const selected = active === module.id
                return (
                  <button
                    key={module.id}
                    onClick={() => setActive(module.id)}
                    className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${selected ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/15' : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'}`}
                  >
                    <span className='flex min-w-0 items-center gap-3'>
                      <Icon className='shrink-0' />
                      <span className='truncate'>{module.label}</span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-black ${selected ? 'bg-white/15 text-emerald-100' : 'bg-emerald-50 text-emerald-700'}`}>
                      {module.credits}
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>

          <main className='space-y-5'>
            <section className='dark-card rounded-2xl p-5 sm:p-6'>
              <div className='flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between'>
                <div>
                  <p className='text-sm font-bold uppercase tracking-wide text-emerald-200'>Active module</p>
                  <div className='mt-2 flex flex-col gap-3 sm:flex-row sm:items-center'>
                    <h2 className='text-2xl font-black text-white sm:text-3xl'>{activeModule.label}</h2>
                    <span className='inline-flex w-fit items-center gap-2 rounded-full bg-emerald-400/15 px-4 py-2 text-sm font-black text-emerald-100 ring-1 ring-emerald-300/20'>
                      <FaCoins /> {activeModule.credits} credits
                    </span>
                  </div>
                  <p className='mt-2 max-w-2xl text-sm leading-relaxed text-slate-300'>
                    This is a frontend implementation layer. Scores, reports, match percentages, and mentor replies are client-side previews ready to connect to real AI APIs later.
                  </p>
                </div>
                <div className='grid grid-cols-3 gap-3 text-center'>
                  {[
                    [String(modules.length), 'modules'],
                    ['6', 'interview modes'],
                    ['24/7', 'mentor UI'],
                  ].map(([value, label]) => (
                    <div key={label} className='rounded-xl bg-white/10 p-4 ring-1 ring-white/10'>
                      <p className='text-2xl font-black text-white'>{value}</p>
                      <p className='text-xs font-semibold text-slate-300'>{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {active === 'career' && (
              <section className='grid gap-5 xl:grid-cols-[1fr_0.85fr]'>
                <div className='surface-card p-5 sm:p-6'>
                  <h2 className='text-2xl font-black text-slate-950'>Career DNA Profile</h2>
                  <p className='mt-2 text-sm text-slate-500'>Capture education, skills, stack, projects, experience, and interests to generate readiness signals.</p>
                  <div className='mt-6 grid gap-4 md:grid-cols-2'>
                    {Object.entries(profile).map(([key, value]) => (
                      <label key={key} className='block'>
                        <span className='mb-2 block text-sm font-bold capitalize text-slate-700'>{key.replace(/([A-Z])/g, ' $1')}</span>
                        <textarea
                          value={value}
                          onChange={(event) => setProfile((prev) => ({ ...prev, [key]: event.target.value }))}
                          className='input-field min-h-24 p-3 text-sm'
                        />
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => startModuleProcess('career', 'Career DNA initialized. Readiness scores refreshed from your profile inputs.')}
                    className='btn-primary mt-6 px-5 py-3'
                  >
                    <FaPlay /> Generate career profile
                  </button>
                  {moduleRunStatus.career && (
                    <div className='mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                      {moduleRunStatus.career}
                    </div>
                  )}
                </div>
                <div className='surface-card p-5 sm:p-6'>
                  <h3 className='text-xl font-black text-slate-950'>AI readiness scores</h3>
                  <div className='mt-6 space-y-5'>
                    <ScoreBar label='Career Score' value={profileScores.career} />
                    <ScoreBar label='Strength Score' value={profileScores.strength} />
                    <ScoreBar label='Employability Score' value={profileScores.employability} tone='blue' />
                    <ScoreBar label='Readiness Score' value={profileScores.readiness} />
                    <ScoreBar label='Weakness Risk' value={profileScores.weakness} tone='amber' />
                  </div>
                  <div className='mt-6 rounded-xl bg-amber-50 p-4 text-sm text-amber-800 ring-1 ring-amber-100'>
                    Weakness analysis: add quantified achievements, stronger DSA proof, and cloud deployment evidence to improve recruiter confidence.
                  </div>
                </div>
              </section>
            )}

            {['resume', 'ats', 'keywords', 'rewrite'].includes(active) && (
              <section className='grid gap-5 xl:grid-cols-[1fr_0.85fr]'>
                <div className='surface-card p-5 sm:p-6'>
                  <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
                    <div>
                      <h2 className='text-2xl font-black text-slate-950'>
                        {active === 'ats' ? 'ATS Resume Checker' : active === 'keywords' ? 'Resume Keyword Optimizer' : active === 'rewrite' ? 'AI Resume Rewrite Studio' : 'AI Resume Builder'}
                      </h2>
                      <p className='mt-2 text-sm text-slate-500'>
                        Upload a resume or paste text. The frontend preview scores keywords, gaps, rewriting opportunities, and ATS readiness.
                      </p>
                    </div>
                    <div className='flex shrink-0 flex-col gap-2 sm:flex-row'>
                      <label className='btn-primary px-5 py-2 text-sm'>
                        Upload Resume
                        <input type='file' accept='.pdf,.doc,.docx,.txt' onChange={handleResumeUpload} className='hidden' />
                      </label>
                      <button
                        onClick={() => startModuleProcess(active, `${activeModule.label} process started. Resume score, ATS gaps, and rewrite preview are refreshed below.`)}
                        className='btn-secondary px-5 py-2 text-sm'
                      >
                        <FaPlay /> Run analysis
                      </button>
                    </div>
                  </div>
                  {resumeFileName && (
                    <div className='mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                      Uploaded: {resumeFileName}
                    </div>
                  )}
                  {moduleRunStatus[active] && (
                    <div className='mt-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800 ring-1 ring-blue-100'>
                      {moduleRunStatus[active]}
                    </div>
                  )}
                  <div className='mt-5 grid gap-4'>
                    <label>
                      <span className='mb-2 block text-sm font-bold text-slate-700'>Resume text</span>
                      <textarea value={resumeText} onChange={(event) => setResumeText(event.target.value)} className='input-field min-h-36 p-4' />
                    </label>
                    <label>
                      <span className='mb-2 block text-sm font-bold text-slate-700'>Target job keywords</span>
                      <textarea value={jobDescription} onChange={(event) => setJobDescription(event.target.value)} className='input-field min-h-24 p-4' />
                    </label>
                  </div>
                </div>
                <div className='grid gap-5'>
                  <InsightCard icon={FaFileAlt} title={`Resume Score: ${resumeScore.score}%`}>
                    Matched keywords: {resumeScore.matched.length ? resumeScore.matched.join(', ') : 'No direct keyword matches yet'}.
                  </InsightCard>
                  <InsightCard icon={FaCheckCircle} title='ATS Readiness'>
                    Use a single-column layout, measurable achievements, role keywords, and clear project impact. Current ATS estimate: {Math.min(98, resumeScore.score + 4)}%.
                  </InsightCard>
                  <InsightCard icon={FaMagic} title='AI Rewrite Preview'>
                    Rewrite summary: Full-stack developer with MERN, AI product, authentication, dashboard, and deployment-ready project experience.
                  </InsightCard>
                  <InsightCard icon={FaCheckCircle} title='Gap Analysis'>
                    Missing: {resumeScore.missing.length ? resumeScore.missing.join(', ') : 'Strong keyword coverage'}. Add skills, projects, certifications, and measurable impact.
                  </InsightCard>
                </div>
              </section>
            )}

            {active === 'jobs' && (
              <section className='space-y-5'>
                <div className='surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <h2 className='text-2xl font-black text-slate-950'>AI Job Matching</h2>
                    <p className='mt-2 text-sm text-slate-500'>Start matching your skills and projects against target roles.</p>
                  </div>
                  <button
                    onClick={() => startModuleProcess('jobs', 'Job matching initialized. The best-fit roles are ranked from your Career DNA inputs.')}
                    className='btn-primary px-5 py-3'
                  >
                    <FaPlay /> Find matching jobs
                  </button>
                </div>
                {moduleRunStatus.jobs && (
                  <div className='rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                    {moduleRunStatus.jobs}
                  </div>
                )}
                <div className='grid gap-5 md:grid-cols-2'>
                  {jobMatches.map((job) => (
                    <div key={job.role} className='surface-card lift-card p-5'>
                      <div className='flex items-start justify-between gap-4'>
                        <div>
                          <p className='text-xs font-bold uppercase tracking-wide text-emerald-700'>{job.type}</p>
                          <h3 className='mt-2 text-xl font-black text-slate-950'>{job.role}</h3>
                        </div>
                        <span className='rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700'>{job.match}%</span>
                      </div>
                      <div className='mt-5'>
                        <ScoreBar label='Match Percentage' value={job.match} />
                      </div>
                      <p className='mt-4 text-sm text-slate-500'>Missing skills: {job.missing.join(', ')}. Improve with targeted projects and interview practice.</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === 'interview' && (
              <section className='grid gap-5 xl:grid-cols-[0.8fr_1fr]'>
                <div className='surface-card p-5 sm:p-6'>
                  <h2 className='text-2xl font-black text-slate-950'>AI Interview Copilot</h2>
                  <div className='mt-5 grid gap-4'>
                    <select value={selectedMode} onChange={(event) => setSelectedMode(event.target.value)} className='input-field p-3'>
                      {interviewModes.map((mode) => <option key={mode}>{mode}</option>)}
                    </select>
                    <select value={selectedCompany} onChange={(event) => setSelectedCompany(event.target.value)} className='input-field p-3'>
                      {companies.map((company) => <option key={company}>{company}</option>)}
                    </select>
                    <button onClick={() => navigate('/interview')} className='btn-primary px-5 py-3'><FaPlay /> Start existing mock interview</button>
                    <button onClick={() => navigate('/contextual-video-interview')} className='btn-secondary px-5 py-3'><FaVideo /> Contextual video assistant</button>
                    <button onClick={() => navigate('/interview-training')} className='btn-secondary px-5 py-3'><FaGraduationCap /> Profile training questions</button>
                  </div>
                </div>
                <div className='surface-card p-5 sm:p-6'>
                  <p className='eyebrow'>Adaptive question preview</p>
                  <h3 className='mt-4 text-2xl font-black text-slate-950'>{selectedCompany} {selectedMode}</h3>
                  <div className='mt-5 space-y-3'>
                    {['Warm-up fundamentals', 'Role-specific depth check', 'Scenario-based follow-up', 'Final improvement challenge'].map((question, index) => (
                      <div key={question} className='rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100'>
                        <p className='text-xs font-bold text-emerald-700'>Difficulty {index + 1}</p>
                        <p className='mt-1 font-bold text-slate-950'>{question} for {selectedMode.toLowerCase()}.</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {active === 'contextualInterview' && (
              <section className='grid gap-5 xl:grid-cols-[0.9fr_1fr]'>
                <div className='surface-card p-5 sm:p-6'>
                  <p className='eyebrow'>New feature</p>
                  <h2 className='mt-3 text-2xl font-black text-slate-950'>Resume, LinkedIn & GitHub Video Interview AI</h2>
                  <p className='mt-2 text-sm leading-relaxed text-slate-500'>
                    Launch an interview assistant that uses resume context, LinkedIn positioning, GitHub projects, and target role details to generate personalized video interview prompts.
                  </p>
                  <div className='mt-5 grid gap-3'>
                    <input value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} className='input-field p-3' placeholder='LinkedIn profile URL' />
                    <input value={projectUrl} onChange={(event) => setProjectUrl(event.target.value)} className='input-field p-3' placeholder='GitHub profile or project URL' />
                    <textarea value={resumeText} onChange={(event) => setResumeText(event.target.value)} className='input-field min-h-28 p-3' placeholder='Resume summary or extracted resume text' />
                    <button onClick={() => navigate('/contextual-video-interview')} className='btn-primary px-5 py-3'>
                      <FaVideo /> Start contextual video interview
                    </button>
                  </div>
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <InsightCard icon={FaFileAlt} title='Resume-aware questions'>Questions adapt to your skills, experience, and resume claims.</InsightCard>
                  <InsightCard icon={FaGithub} title='Project deep dives'>Prompts target architecture, tradeoffs, testing, security, and deployment.</InsightCard>
                  <InsightCard icon={FaLinkedin} title='Profile positioning'>Practice explaining your headline, target role, and career narrative.</InsightCard>
                  <InsightCard icon={FaVideo} title='Video readiness'>Prepare camera answers with role-specific structure and confidence cues.</InsightCard>
                </div>
              </section>
            )}

            {active === 'profileTraining' && (
              <section className='grid gap-5 xl:grid-cols-[0.9fr_1fr]'>
                <div className='surface-card p-5 sm:p-6'>
                  <p className='eyebrow'>New feature</p>
                  <h2 className='mt-3 text-2xl font-black text-slate-950'>Profile-Based Interview Training Lab</h2>
                  <p className='mt-2 text-sm leading-relaxed text-slate-500'>
                    Generate training questions from your resume, GitHub projects, LinkedIn profile, skills, and target job so you can rehearse before the real interview.
                  </p>
                  <div className='mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600 ring-1 ring-slate-100'>
                    Training source: {profile.skills}, {profile.projects}, {selectedCompany} {selectedMode}.
                  </div>
                  <button onClick={() => navigate('/interview-training')} className='btn-primary mt-5 px-5 py-3'>
                    <FaGraduationCap /> Generate training questions
                  </button>
                </div>
                <div className='surface-card p-5 sm:p-6'>
                  <h3 className='text-xl font-black text-slate-950'>Training preview</h3>
                  <div className='mt-5 space-y-3'>
                    {['Resume claim validation', 'GitHub project architecture', 'LinkedIn career story', 'Target-role technical depth'].map((item) => (
                      <div key={item} className='rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100'>
                        <p className='font-bold text-slate-950'>{item}</p>
                        <p className='mt-1 text-sm text-slate-500'>AI generates follow-ups, scoring criteria, and improvement suggestions for this area.</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {active === 'video' && (
              <section className='space-y-5'>
                <div className='surface-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <h2 className='text-2xl font-black text-slate-950'>Video AI Analysis</h2>
                    <p className='mt-2 text-sm text-slate-500'>Start the video readiness workflow and review communication signals.</p>
                  </div>
                  <button
                    onClick={() => startModuleProcess('video', 'Video AI initialized. Communication metrics are ready for review.')}
                    className='btn-primary px-5 py-3'
                  >
                    <FaPlay /> Start video analysis
                  </button>
                </div>
                {moduleRunStatus.video && (
                  <div className='rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                    {moduleRunStatus.video}
                  </div>
                )}
                <div className='grid gap-5 md:grid-cols-3'>
                  {[
                    ['Eye Contact', 78],
                    ['Speaking Speed', 84],
                    ['Confidence', 73],
                    ['Facial Expression', 69],
                    ['Filler Word Control', 61],
                    ['Professionalism', 88],
                  ].map(([label, value]) => (
                    <div key={label} className='surface-card p-5'>
                      <ScoreBar label={label} value={value} tone={value > 80 ? 'blue' : value > 70 ? 'emerald' : 'amber'} />
                      <p className='mt-4 text-sm text-slate-500'>AI improvement report: practice concise answers, pause before transitions, and maintain steady camera framing.</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === 'roadmap' && (
              <section className='surface-card p-5 sm:p-6'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <h2 className='text-2xl font-black text-slate-950'>AI Roadmap Generator</h2>
                    <p className='mt-2 text-sm text-slate-500'>Select a role to preview skills, technologies, projects, courses, certifications, and timeline.</p>
                  </div>
                  <div className='flex flex-col gap-3 sm:flex-row'>
                    <select value={selectedRoadmap} onChange={(event) => setSelectedRoadmap(event.target.value)} className='input-field max-w-sm p-3'>
                      {Object.keys(roadmaps).map((role) => <option key={role}>{role}</option>)}
                    </select>
                    <button
                      onClick={() => startModuleProcess('roadmap', `${selectedRoadmap} roadmap generated with monthly milestones and proof points.`)}
                      className='btn-secondary px-5 py-3'
                    >
                      <FaPlay /> Generate
                    </button>
                    <button onClick={downloadRoadmapPDF} className='btn-primary px-5 py-3'>Download PDF</button>
                  </div>
                </div>
                {moduleRunStatus.roadmap && (
                  <div className='mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                    {moduleRunStatus.roadmap}
                  </div>
                )}
                <div className='mt-6 grid gap-4 md:grid-cols-4'>
                  {roadmaps[selectedRoadmap].map((step, index) => (
                    <div key={step} className='rounded-xl bg-slate-50 p-5 ring-1 ring-slate-100'>
                      <p className='text-sm font-black text-emerald-700'>Month {index + 1}</p>
                      <h3 className='mt-2 font-black text-slate-950'>{step}</h3>
                      <p className='mt-3 text-sm text-slate-500'>Add one project, one course, and one measurable proof point.</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === 'dsa' && (
              <section className='grid gap-5 lg:grid-cols-[1fr_0.8fr]'>
                <div className='space-y-5'>
                  <div className='surface-card p-5'>
                    <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                      <div>
                        <h2 className='text-2xl font-black text-slate-950'>AI DSA Coach</h2>
                        <p className='mt-2 text-sm text-slate-500'>Track topic readiness and export a focused practice plan.</p>
                      </div>
                      <div className='flex flex-col gap-2 sm:flex-row'>
                        <button
                          onClick={() => startModuleProcess('dsa', 'DSA coach started. Practice plan and topic readiness are refreshed.')}
                          className='btn-secondary px-5 py-3'
                        >
                          <FaPlay /> Start coach
                        </button>
                        <button onClick={downloadDsaPDF} className='btn-primary px-5 py-3'>Download PDF</button>
                      </div>
                    </div>
                    {moduleRunStatus.dsa && (
                      <div className='mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                        {moduleRunStatus.dsa}
                      </div>
                    )}
                  </div>
                  <div className='grid gap-4 md:grid-cols-2'>
                  {dsaTopics.map((topic, index) => (
                    <div key={topic} className='surface-card p-5'>
                      <ScoreBar label={topic} value={55 + index * 7} tone={index > 3 ? 'blue' : 'emerald'} />
                      <p className='mt-4 text-sm text-slate-500'>Next challenge: solve 3 interview questions and request AI code review.</p>
                    </div>
                  ))}
                  </div>
                </div>
                <InsightCard icon={FaCode} title='Coding Challenge Preview'>
                  Implement longest substring without repeating characters. AI review will score correctness, complexity, readability, and edge cases.
                </InsightCard>
              </section>
            )}

            {active === 'project' && (
              <section className='grid gap-5 lg:grid-cols-[0.8fr_1fr]'>
                <div className='surface-card p-5 sm:p-6'>
                  <h2 className='text-2xl font-black text-slate-950'>AI Project Analyzer</h2>
                  <input value={projectUrl} onChange={(event) => setProjectUrl(event.target.value)} className='input-field mt-5 p-3' />
                  <p className='mt-3 text-sm text-slate-500'>Frontend preview for GitHub architecture review, resume value scoring, and project interview questions.</p>
                  <button
                    onClick={() => startModuleProcess('project', 'Project analyzer started. GitHub review, resume value, and interview prompts are refreshed.')}
                    className='btn-primary mt-5 px-5 py-3'
                  >
                    <FaGithub /> Analyze project
                  </button>
                  {moduleRunStatus.project && (
                    <div className='mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                      {moduleRunStatus.project}
                    </div>
                  )}
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  <InsightCard icon={FaGithub} title='Project Score: 82%'>Architecture is clear. Add tests, deployment docs, and monitoring screenshots.</InsightCard>
                  <InsightCard icon={FaStar} title='Resume Value: High'>Strong SaaS project. Emphasize auth, AI workflow, payments, and analytics.</InsightCard>
                  <InsightCard icon={FaComments} title='Interview Questions'>Explain your data flow, error handling, security model, and scaling plan.</InsightCard>
                  <InsightCard icon={FaCheckCircle} title='Improvements'>Add CI, unit tests, API docs, and Lighthouse performance proof.</InsightCard>
                </div>
              </section>
            )}

            {active === 'linkedin' && (
              <section className='grid gap-5 lg:grid-cols-[0.85fr_1fr]'>
                <div className='surface-card p-5 sm:p-6'>
                  <h2 className='text-2xl font-black text-slate-950'>AI LinkedIn Optimizer</h2>
                  <input value={linkedinUrl} onChange={(event) => setLinkedinUrl(event.target.value)} className='input-field mt-5 p-3' />
                  <button
                    onClick={() => startModuleProcess('linkedin', 'LinkedIn optimization started. Recruiter visibility and profile content are refreshed.')}
                    className='btn-primary mt-4 px-5 py-3'
                  >
                    <FaLinkedin /> Optimize LinkedIn
                  </button>
                  {moduleRunStatus.linkedin && (
                    <div className='mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                      {moduleRunStatus.linkedin}
                    </div>
                  )}
                  <ScoreBar label='Recruiter Visibility Score' value={76} />
                </div>
                <div className='surface-card p-5 sm:p-6'>
                  <p className='eyebrow'>Generated profile content</p>
                  <h3 className='mt-4 text-xl font-black text-slate-950'>Full Stack Developer | React, Node.js, AI SaaS Products | Building HirePilot-AI</h3>
                  <p className='mt-4 text-sm leading-relaxed text-slate-500'>
                    About section: I build production-ready web products with React, Node.js, AI workflows, authentication, dashboards, and user-focused design. Open to internship and graduate SDE roles.
                  </p>
                  <div className='mt-4 flex flex-wrap gap-2'>
                    {['React', 'Node.js', 'AI SaaS', 'PostgreSQL', 'Career Tech', 'Dashboards'].map((keyword) => (
                      <span key={keyword} className='rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700'>{keyword}</span>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {active === 'placement' && (
              <section className='grid gap-5 xl:grid-cols-[0.8fr_1fr]'>
                <div className='surface-card p-5 sm:p-6'>
                  <h2 className='text-2xl font-black text-slate-950'>AI Placement Tracker</h2>
                  <div className='mt-5 grid gap-3'>
                    <input placeholder='Company' value={newApplication.company} onChange={(event) => setNewApplication((prev) => ({ ...prev, company: event.target.value }))} className='input-field p-3' />
                    <input placeholder='Role' value={newApplication.role} onChange={(event) => setNewApplication((prev) => ({ ...prev, role: event.target.value }))} className='input-field p-3' />
                    <select value={newApplication.status} onChange={(event) => setNewApplication((prev) => ({ ...prev, status: event.target.value }))} className='input-field p-3'>
                      {['Applied', 'OA Scheduled', 'OA Cleared', 'Interview', 'Offer', 'Rejected'].map((status) => <option key={status}>{status}</option>)}
                    </select>
                    <button onClick={addApplication} className='btn-primary px-5 py-3'>Add application</button>
                    <button
                      onClick={() => startModuleProcess('placement', 'Placement tracker initialized. Probability insights are refreshed from your application pipeline.')}
                      className='btn-secondary px-5 py-3'
                    >
                      <FaPlay /> Predict readiness
                    </button>
                  </div>
                  {moduleRunStatus.placement && (
                    <div className='mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                      {moduleRunStatus.placement}
                    </div>
                  )}
                </div>
                <div className='grid gap-4'>
                  {applications.map((application) => (
                    <div key={`${application.company}-${application.role}`} className='surface-card p-5'>
                      <div className='flex flex-wrap items-center justify-between gap-4'>
                        <div>
                          <h3 className='font-black text-slate-950'>{application.company}</h3>
                          <p className='text-sm text-slate-500'>{application.role} | {application.status}</p>
                        </div>
                        <span className='rounded-full bg-blue-100 px-3 py-1 text-sm font-black text-blue-700'>{application.probability}% probability</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {active === 'mentor' && (
              <section className='surface-card p-5 sm:p-6'>
                <h2 className='text-2xl font-black text-slate-950'>GPT-style Career Mentor</h2>
                <div className='mt-5 max-h-96 space-y-3 overflow-auto rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100'>
                  {mentorMessages.map((message, index) => (
                    <div key={index} className={`max-w-[85%] rounded-xl p-3 text-sm ${message.role === 'ai' ? 'bg-white text-slate-600 shadow-sm' : 'ml-auto bg-slate-950 text-white'}`}>
                      {message.text}
                    </div>
                  ))}
                </div>
                <div className='mt-4 flex flex-col gap-3 sm:flex-row'>
                  <input value={mentorInput} onChange={(event) => setMentorInput(event.target.value)} placeholder='Ask about resumes, DSA, interviews, or roadmaps...' className='input-field flex-1 p-3' />
                  <button onClick={sendMentorMessage} className='btn-primary px-6 py-3'>Ask mentor</button>
                </div>
              </section>
            )}

            {active === 'game' && (
              <section className='grid gap-5 lg:grid-cols-[0.8fr_1fr]'>
                <div className='surface-card p-5 sm:p-6'>
                  <h2 className='text-2xl font-black text-slate-950'>Community & XP</h2>
                  <p className='mt-2 text-slate-500'>Peer practice, interview experiences, leaderboards, XP, badges, streaks, and career levels keep preparation consistent.</p>
                  <button
                    onClick={() => startModuleProcess('game', 'Community and XP hub initialized. Streaks, badges, and peer practice cards are ready.')}
                    className='btn-primary mt-5 px-5 py-3'
                  >
                    <FaUsers /> Enter community hub
                  </button>
                  {moduleRunStatus.game && (
                    <div className='mt-4 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100'>
                      {moduleRunStatus.game}
                    </div>
                  )}
                  <div className='mt-5 rounded-xl bg-slate-950 p-5 text-white'>
                    <p className='text-sm font-bold text-emerald-200'>Level 10 Candidate</p>
                    <p className='mt-2 text-4xl font-black'>3,240 XP</p>
                    <div className='mt-4 h-3 overflow-hidden rounded-full bg-white/10'>
                      <div className='h-full w-3/4 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400'></div>
                    </div>
                  </div>
                </div>
                <div className='grid gap-4 md:grid-cols-2'>
                  {[
                    ['Peer Mock Interviews', 'Schedule candidate-to-candidate practice rooms.'],
                    ['Placement Stories', 'Share company-wise interview experiences.'],
                    ['7-day Streak', 'Achievement unlocked through consistent practice.'],
                    ['Leaderboard Rank', 'Rank users by XP, interviews, DSA, and resume progress.'],
                  ].map(([badge, copy], index) => (
                    <InsightCard key={badge} icon={index < 2 ? FaUsers : FaCrown} title={badge}>{copy}</InsightCard>
                  ))}
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default CareerPlatform
