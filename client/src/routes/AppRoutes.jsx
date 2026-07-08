import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import Auth from '../features/auth/pages/Auth'
import InterviewPage from '../features/interviewCopilot/pages/InterviewPage'
import ContextualVideoInterview from '../features/interviewCopilot/pages/ContextualVideoInterview'
import ProfileInterviewTraining from '../features/interviewCopilot/pages/ProfileInterviewTraining'
import InterviewHistory from '../features/interviewCopilot/pages/InterviewHistory'
import Pricing from '../features/billing/pages/Pricing'
import InterviewReport from '../features/interviewCopilot/pages/InterviewReport'
import AdminConsole from '../admin/AdminDashboard'
import Dashboard from '../pages/Dashboard'
import CareerIntelligence from '../pages/CareerIntelligence'
import ResumeIntelligence from '../pages/ResumeIntelligence'
import JobPlacement from '../pages/JobPlacement'
import InterviewPreparation from '../pages/InterviewPreparation'
import CodingDSA from '../pages/CodingDSA'
import PortfolioBranding from '../pages/PortfolioBranding'
import AIMentor from '../pages/AIMentor'
import Community from '../pages/Community'
import Gamification from '../pages/Gamification'
import BillingSubscription from '../pages/BillingSubscription'
import Productivity from '../pages/Productivity'
import AdministrationSuite from '../pages/AdminDashboard'
import PlatformSettings from '../pages/PlatformSettings'
import NotFound from '../pages/NotFound'

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/login' element={<Auth />} />
      <Route path='/register' element={<Auth />} />
      <Route path='/dashboard' element={<Dashboard />} />
      <Route path='/career' element={<Dashboard />} />
      <Route path='/career-intelligence' element={<CareerIntelligence />} />
      <Route path='/resume-intelligence' element={<ResumeIntelligence />} />
      <Route path='/job-placement' element={<JobPlacement />} />
      <Route path='/interview-preparation' element={<InterviewPreparation />} />
      <Route path='/coding-dsa' element={<CodingDSA />} />
      <Route path='/portfolio-branding' element={<PortfolioBranding />} />
      <Route path='/ai-mentor' element={<AIMentor />} />
      <Route path='/community-suite' element={<Community />} />
      <Route path='/gamification-suite' element={<Gamification />} />
      <Route path='/billing-subscription' element={<BillingSubscription />} />
      <Route path='/productivity' element={<Productivity />} />
      <Route path='/admin-dashboard' element={<AdminConsole />} />
      <Route path='/administration-suite' element={<AdministrationSuite />} />
      <Route path='/platform-settings' element={<PlatformSettings />} />
      <Route path='/career-profile' element={<CareerIntelligence />} />
      <Route path='/resume-ai' element={<ResumeIntelligence />} />
      <Route path='/job-matching' element={<JobPlacement />} />
      <Route path='/interview' element={<InterviewPage />} />
      <Route path='/mock-interview' element={<InterviewPage />} />
      <Route path='/contextual-video-interview' element={<ContextualVideoInterview />} />
      <Route path='/interview-training' element={<ProfileInterviewTraining />} />
      <Route path='/video-analysis' element={<InterviewPreparation />} />
      <Route path='/roadmap-generator' element={<AIMentor />} />
      <Route path='/dsa-coach' element={<CodingDSA />} />
      <Route path='/project-analyzer' element={<PortfolioBranding />} />
      <Route path='/linkedin-optimizer' element={<PortfolioBranding />} />
      <Route path='/placement-tracker' element={<JobPlacement />} />
      <Route path='/mentor-chat' element={<AIMentor />} />
      <Route path='/community' element={<Community />} />
      <Route path='/gamification' element={<Gamification />} />
      <Route path='/history' element={<InterviewHistory />} />
      <Route path='/pricing' element={<Pricing />} />
      <Route path='/settings' element={<PlatformSettings />} />
      <Route path='/report/:id' element={<InterviewReport />} />
      <Route path='/admin' element={<AdminConsole />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
