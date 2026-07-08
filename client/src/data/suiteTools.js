const fieldSets = {
  'career-intelligence': [
    ['targetRole', 'Target role', 'Full Stack Developer'],
    ['profile', 'Education, experience, interests', 'B.Tech CSE, internship experience, interested in AI SaaS products'],
    ['skills', 'Skills and tech stack', 'React, Node.js, PostgreSQL, JavaScript, Tailwind'],
    ['projects', 'Projects and proof points', 'AI mock interview platform, resume parser, dashboard analytics'],
  ],
  'resume-intelligence': [
    ['targetRole', 'Target role', 'Frontend Developer'],
    ['resumeText', 'Resume text', 'React developer with MERN projects, Firebase auth, dashboards, and AI workflows.'],
    ['jobDescription', 'Job description or keywords', 'React, Node.js, REST APIs, PostgreSQL, testing, accessibility, deployment'],
  ],
  'job-placement': [
    ['targetRole', 'Target role', 'Software Engineer Intern'],
    ['skills', 'Skills and strengths', 'React, Node.js, PostgreSQL, DSA, REST APIs'],
    ['company', 'Company or placement target', 'Microsoft'],
    ['jobDescription', 'Job description or placement notes', 'Frontend internship requiring React, APIs, problem solving, and teamwork.'],
  ],
  'interview-preparation': [
    ['targetRole', 'Interview role', 'Backend Developer'],
    ['company', 'Company', 'Amazon'],
    ['resumeText', 'Resume/project context', 'Built APIs, auth, database schemas, dashboards, and AI feedback workflows.'],
    ['question', 'Answer or focus area', 'Explain a scalable API design for interview feedback.'],
  ],
  'coding-dsa': [
    ['topic', 'Topic or problem', 'Arrays and sliding window'],
    ['code', 'Code or approach', 'function maxSubarray(nums) { let best = nums[0]; return best; }'],
    ['notes', 'Constraints or weak areas', 'Need help with edge cases, time complexity, and practice plan.'],
  ],
  'portfolio-branding': [
    ['projectUrl', 'GitHub/project/portfolio URL', 'https://github.com/username/hirepilot-ai'],
    ['resumeText', 'Project or profile summary', 'AI career platform with auth, billing, interviews, resume AI, and dashboards.'],
    ['targetRole', 'Target role', 'Full Stack Engineer'],
  ],
  'ai-mentor': [
    ['question', 'Question for mentor', 'How should I prepare for placements in 30 days?'],
    ['targetRole', 'Target role', 'Full Stack Developer'],
    ['profile', 'Current profile', 'React, Node.js, resume project, basic DSA, two mock interviews completed.'],
  ],
  community: [
    ['topic', 'Post, experience, or peer-interview topic', 'TCS technical interview experience'],
    ['notes', 'Details', 'Round 1 focused on JavaScript, SQL, projects, and HR communication.'],
    ['targetRole', 'Audience or goal', 'Students preparing for campus placements'],
  ],
  gamification: [
    ['activity', 'Activity completed', 'Solved 5 DSA problems and completed one mock interview'],
    ['notes', 'Current streak, XP, or badge context', '4 day streak, 1240 XP, resume score 78'],
  ],
  'billing-subscription': [
    ['plan', 'Current or target plan', 'PRO'],
    ['usage', 'Usage and credit needs', 'Used 240 of 650 credits; need resume, interview, and video analysis this week.'],
  ],
  productivity: [
    ['goal', 'Daily goal or reminder', 'Practice one technical interview and apply to three roles'],
    ['deadline', 'Deadline', 'Friday 6 PM'],
    ['notes', 'Context', 'Need reminders for interview practice, placement deadlines, and email reports.'],
  ],
  administration: [
    ['metric', 'Admin area', 'AI usage analytics'],
    ['notes', 'Data or concern', 'Spike in resume analysis usage and several moderation reports pending.'],
  ],
  platform: [
    ['profile', 'Profile/security setting', 'Update profile and enable stronger account security'],
    ['notes', 'Account context', 'User wants suspicious login checks, session cleanup, and profile update guidance.'],
  ],
}

const defaults = [
  ['targetRole', 'Target role or goal', 'Full Stack Developer'],
  ['notes', 'Context', 'Describe what you want this feature to do.'],
]

const words = (value) => String(value || '').toLowerCase().match(/[a-z0-9+#.-]+/g) || []

const unique = (items) => [...new Set(items.filter(Boolean))]

const score = (count, base = 52, step = 7) => Math.max(12, Math.min(98, base + count * step))

const stripEmoji = (value) => String(value || '').replace(/[^\p{L}\p{N}&/ +.-]/gu, '').replace(/\s+/g, ' ').trim()

const lines = (items) => items.filter(Boolean).map((item) => `- ${item}`).join('\n')

const getValue = (inputs, key) => inputs[key] || ''

const getKeywords = (text) => unique(words(text).filter((word) => word.length > 2))

const overlap = (left, right) => {
  const leftSet = new Set(getKeywords(left))
  return getKeywords(right).filter((word) => leftSet.has(word))
}

const missing = (left, right) => {
  const leftSet = new Set(getKeywords(left))
  return getKeywords(right).filter((word) => !leftSet.has(word)).slice(0, 8)
}

export const getSuiteFields = (suiteKey) => fieldSets[suiteKey] || defaults

export const createInitialInputs = (suiteKey) =>
  Object.fromEntries(getSuiteFields(suiteKey).map(([key, , placeholder]) => [key, placeholder]))

export const buildSuitePrompt = ({ suite, feature, inputs }) => {
  const context = Object.entries(inputs)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')

  return `You are HirePilot AI working inside the ${stripEmoji(suite.title)} suite.
Feature: ${stripEmoji(feature)}
Return structured JSON with: score, summary, recommendations, nextActions, risks, and generatedContent.
Use the user's context and be specific, practical, and career-outcome focused.

User context:
${context}`
}

const careerOutput = (feature, inputs) => {
  const skills = getValue(inputs, 'skills')
  const projects = getValue(inputs, 'projects')
  const profile = getValue(inputs, 'profile')
  const targetRole = getValue(inputs, 'targetRole')
  const skillCount = getKeywords(skills).length
  const projectCount = getKeywords(projects).length
  const readiness = score(skillCount + projectCount, 42, 4)
  return {
    score: readiness,
    summary: `${stripEmoji(feature)} for ${targetRole}: current profile shows ${skillCount} skill signals and ${projectCount} project/proof signals.`,
    generatedContent: lines([
      `Career DNA: ${readiness}% readiness for ${targetRole}.`,
      `Strong signals: ${skills || 'Add technical skills to improve scoring.'}`,
      `Proof signals: ${projects || 'Add project outcomes, metrics, and links.'}`,
      `Recommended roles: Full Stack Developer, Frontend Developer, AI Product Engineer.`,
    ]),
    recommendations: ['Add measurable project impact', 'Map top skills to the job description', 'Close one DSA and one deployment gap this week'],
    nextActions: ['Update career profile', 'Run Resume Intelligence next', 'Book one mock interview'],
    risks: profile.length < 40 ? ['Profile context is thin; add education, experience, and interests.'] : ['No critical profile risk detected.'],
  }
}

const resumeOutput = (feature, inputs) => {
  const resumeText = getValue(inputs, 'resumeText')
  const jobDescription = getValue(inputs, 'jobDescription')
  const matched = overlap(resumeText, jobDescription)
  const gaps = missing(resumeText, jobDescription)
  const atsScore = score(matched.length, 48, 8)
  return {
    score: atsScore,
    summary: `${stripEmoji(feature)} found ${matched.length} matched keywords and ${gaps.length} priority gaps.`,
    generatedContent: lines([
      `ATS estimate: ${atsScore}%.`,
      `Matched keywords: ${matched.slice(0, 10).join(', ') || 'None yet'}.`,
      `Missing keywords: ${gaps.join(', ') || 'Strong coverage'}.`,
      `Rewrite sample: Built ${getValue(inputs, 'targetRole')} proof through production-style projects, measurable dashboard workflows, API integration, and role-aligned delivery.`,
    ]),
    recommendations: ['Use a single-column resume format', 'Add metrics to every project bullet', 'Mirror the job description vocabulary naturally'],
    nextActions: ['Add missing keywords', 'Rewrite top project bullets', 'Run job matching after resume optimization'],
    risks: gaps.length > 5 ? ['Resume may fail ATS keyword screening for this job.'] : ['ATS keyword risk is manageable.'],
  }
}

const jobOutput = (feature, inputs) => {
  const matched = overlap(getValue(inputs, 'skills'), getValue(inputs, 'jobDescription'))
  const probability = score(matched.length, 45, 9)
  return {
    score: probability,
    summary: `${stripEmoji(feature)} estimates ${probability}% success probability for ${getValue(inputs, 'company') || 'the target company'}.`,
    generatedContent: lines([
      `Top match: ${getValue(inputs, 'targetRole')} at ${getValue(inputs, 'company') || 'target company'}.`,
      `Matched strengths: ${matched.join(', ') || 'Add stronger role keywords.'}`,
      `Application stage suggestion: apply after tailoring resume and preparing 3 company-specific project stories.`,
      `Weekly report: 5 applications, 2 follow-ups, 1 mock interview, 1 company prep block.`,
    ]),
    recommendations: ['Tailor resume per company', 'Track every application status', 'Prepare company-specific project answers'],
    nextActions: ['Create application entry', 'Generate company prep plan', 'Schedule follow-up reminder'],
    risks: probability < 65 ? ['Low skill overlap; close two missing skills before applying.'] : ['Good application readiness.'],
  }
}

const interviewOutput = (feature, inputs) => ({
  score: score(words(getValue(inputs, 'resumeText')).length, 50, 1),
  summary: `${stripEmoji(feature)} prepared for ${getValue(inputs, 'targetRole')} at ${getValue(inputs, 'company')}.`,
  generatedContent: lines([
    `Question 1: Walk me through the most relevant project for ${getValue(inputs, 'targetRole')}.`,
    `Question 2: ${getValue(inputs, 'question') || 'Explain a technical decision and its tradeoffs.'}`,
    'Feedback rubric: structure, technical depth, tradeoffs, metrics, communication.',
    'Video cues: keep answers under 90 seconds, pause between points, reduce filler words.',
  ]),
  recommendations: ['Use STAR for behavioral answers', 'Explain tradeoffs, not only implementation', 'End each answer with business or user impact'],
  nextActions: ['Practice 5 questions', 'Record one answer', 'Review feedback dashboard'],
  risks: ['Answers without metrics or tradeoffs will score lower.'],
})

const codingOutput = (feature, inputs) => {
  const code = getValue(inputs, 'code')
  const hasLoop = /for|while|map|reduce/.test(code)
  const hasReturn = /return/.test(code)
  const codeScore = 50 + (hasLoop ? 18 : 0) + (hasReturn ? 18 : 0)
  return {
    score: Math.min(95, codeScore),
    summary: `${stripEmoji(feature)} reviewed ${getValue(inputs, 'topic') || 'the submitted problem'}.`,
    generatedContent: lines([
      `Complexity estimate: ${hasLoop ? 'O(n)' : 'Needs enough implementation detail to classify'}.`,
      `Correctness signal: ${hasReturn ? 'Has return path' : 'Missing clear return path'}.`,
      'Practice plan: 3 easy, 2 medium, 1 timed problem for this topic.',
      'Weak topic note: document edge cases before coding.',
    ]),
    recommendations: ['Add edge-case tests', 'State time and space complexity', 'Use a consistent problem-solving template'],
    nextActions: ['Solve one timed challenge', 'Request AI code review', 'Update DSA progress'],
    risks: hasLoop && hasReturn ? ['No major static review risk.'] : ['Implementation is incomplete for reliable scoring.'],
  }
}

const portfolioOutput = (feature, inputs) => ({
  score: score(words(`${getValue(inputs, 'resumeText')} ${getValue(inputs, 'projectUrl')}`).length, 55, 1),
  summary: `${stripEmoji(feature)} generated branding improvements for ${getValue(inputs, 'targetRole')}.`,
  generatedContent: lines([
    `Project signal: ${getValue(inputs, 'projectUrl') || 'Add a GitHub or portfolio URL.'}`,
    'Portfolio suggestion: show architecture, screenshots, metrics, deployment, and tradeoffs.',
    'LinkedIn headline: Full Stack Engineer | React, Node.js, AI SaaS | Building career-tech products.',
    'Project interview questions: architecture, auth/security, data model, scaling, testing.',
  ]),
  recommendations: ['Add README architecture diagram', 'Pin the strongest 3 projects', 'Use recruiter-search keywords in headline and About'],
  nextActions: ['Update GitHub README', 'Rewrite LinkedIn headline', 'Add portfolio case study'],
  risks: ['Projects without deployment proof are less persuasive to recruiters.'],
})

const mentorOutput = (feature, inputs) => ({
  score: 82,
  summary: `${stripEmoji(feature)} created a focused plan for ${getValue(inputs, 'targetRole')}.`,
  generatedContent: lines([
    `Mentor answer: ${getValue(inputs, 'question')}`,
    'Week 1: resume ATS cleanup, portfolio proof, and core DSA patterns.',
    'Week 2: mock interviews, company prep, and targeted applications.',
    'Week 3: advanced project stories, behavioral answers, and follow-ups.',
    'Week 4: revision, timed practice, and interview performance review.',
  ]),
  recommendations: ['Pick one target role', 'Use daily measurable tasks', 'Review progress every Sunday'],
  nextActions: ['Generate roadmap', 'Create daily recommendations', 'Start mentor session history'],
  risks: ['Broad goals dilute progress; narrow the target role.'],
})

const communityOutput = (feature, inputs) => ({
  score: 74,
  summary: `${stripEmoji(feature)} drafted a community-ready contribution.`,
  generatedContent: lines([
    `Title: ${getValue(inputs, 'topic') || 'Interview preparation discussion'}`,
    `Post: ${getValue(inputs, 'notes')}`,
    'Suggested tags: interview-experience, placement, peer-practice.',
    'Moderation score: low risk if company claims are factual and respectful.',
  ]),
  recommendations: ['Ask one clear question at the end', 'Add company/round context', 'Keep personal data out of the post'],
  nextActions: ['Publish post', 'Invite peer mock interview', 'React to helpful answers'],
  risks: ['Avoid sharing confidential interview questions verbatim.'],
})

const gamificationOutput = (feature, inputs) => {
  const xp = 25 + words(getValue(inputs, 'activity')).length * 4
  return {
    score: Math.min(99, xp),
    summary: `${stripEmoji(feature)} calculated XP and streak updates.`,
    generatedContent: lines([
      `XP earned: ${xp}.`,
      'Potential badge: Consistent Builder.',
      `Activity: ${getValue(inputs, 'activity')}`,
      'Leaderboard signal: streak and completed practice both improve ranking.',
    ]),
    recommendations: ['Reward completed work, not intentions', 'Use streaks for daily habits', 'Unlock badges at meaningful milestones'],
    nextActions: ['Award XP', 'Check streak', 'Refresh leaderboard'],
    risks: ['XP without quality checks can reward low-value activity.'],
  }
}

const billingOutput = (feature, inputs) => ({
  score: 78,
  summary: `${stripEmoji(feature)} reviewed plan and usage readiness.`,
  generatedContent: lines([
    `Plan context: ${getValue(inputs, 'plan')}`,
    `Usage context: ${getValue(inputs, 'usage')}`,
    'Recommendation: reserve credits for high-value AI workflows first: resume, interview feedback, video analysis.',
    'Payment flow: create Razorpay order, verify signature, then add credits/subscription.',
  ]),
  recommendations: ['Track usage by feature', 'Warn at 80% usage', 'Verify every payment signature server-side'],
  nextActions: ['Review plans', 'Create order', 'Check credit usage'],
  risks: ['Do not unlock paid credits before payment verification.'],
})

const productivityOutput = (feature, inputs) => ({
  score: 80,
  summary: `${stripEmoji(feature)} created a productivity workflow.`,
  generatedContent: lines([
    `Goal: ${getValue(inputs, 'goal')}`,
    `Deadline: ${getValue(inputs, 'deadline')}`,
    'Reminder priority: high if deadline is within 48 hours.',
    'Email report: summarize completed goals, missed actions, and tomorrow priorities.',
  ]),
  recommendations: ['Keep daily goals small', 'Rank reminders by urgency', 'Send weekly placement summaries'],
  nextActions: ['Create daily goal', 'Add reminder', 'Queue email report'],
  risks: ['Too many goals reduce completion rate.'],
})

const adminOutput = (feature, inputs) => ({
  score: 91,
  summary: `${stripEmoji(feature)} generated an admin action summary.`,
  generatedContent: lines([
    `Area: ${getValue(inputs, 'metric')}`,
    `Context: ${getValue(inputs, 'notes')}`,
    'Admin checks: user growth, AI usage, revenue, reports, moderation queue, system health.',
    'Abnormal usage signal: investigate sudden feature spikes by user and time window.',
  ]),
  recommendations: ['Segment analytics by plan', 'Review high-risk moderation items first', 'Track AI spend by feature'],
  nextActions: ['Open admin analytics', 'Review reports', 'Check system health'],
  risks: ['Admin actions must stay role-protected.'],
})

const platformOutput = (feature, inputs) => ({
  score: 88,
  summary: `${stripEmoji(feature)} prepared account/security actions.`,
  generatedContent: lines([
    `Setting: ${getValue(inputs, 'profile')}`,
    `Context: ${getValue(inputs, 'notes')}`,
    'Security risk score: medium-low with active session review and suspicious-login checks.',
    'Permission check: users manage own profile; admins manage roles and moderation.',
  ]),
  recommendations: ['Keep JWT secrets strong', 'Review sessions periodically', 'Use admin middleware for privileged routes'],
  nextActions: ['Update profile', 'Review account security', 'Confirm active sessions'],
  risks: ['Profile/account deletion should require confirmation.'],
})

const generators = {
  'career-intelligence': careerOutput,
  'resume-intelligence': resumeOutput,
  'job-placement': jobOutput,
  'interview-preparation': interviewOutput,
  'coding-dsa': codingOutput,
  'portfolio-branding': portfolioOutput,
  'ai-mentor': mentorOutput,
  community: communityOutput,
  gamification: gamificationOutput,
  'billing-subscription': billingOutput,
  productivity: productivityOutput,
  administration: adminOutput,
  platform: platformOutput,
}

export const runSuiteFeature = ({ suite, feature, inputs }) => {
  const generate = generators[suite.key] || careerOutput
  const result = generate(feature, inputs)
  return {
    ...result,
    prompt: buildSuitePrompt({ suite, feature, inputs }),
    generatedAt: new Date().toLocaleString(),
  }
}
