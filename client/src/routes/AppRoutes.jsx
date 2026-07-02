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
import CareerPlatform from '../features/careerProfile/pages/CareerPlatform'
import AdminDashboard from '../admin/AdminDashboard'
import NotFound from '../pages/NotFound'

function AppRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/auth' element={<Auth />} />
      <Route path='/login' element={<Auth />} />
      <Route path='/register' element={<Auth />} />
      <Route path='/dashboard' element={<CareerPlatform />} />
      <Route path='/career' element={<CareerPlatform />} />
      <Route path='/career-profile' element={<CareerPlatform />} />
      <Route path='/resume-ai' element={<CareerPlatform />} />
      <Route path='/job-matching' element={<CareerPlatform />} />
      <Route path='/interview' element={<InterviewPage />} />
      <Route path='/mock-interview' element={<InterviewPage />} />
      <Route path='/contextual-video-interview' element={<ContextualVideoInterview />} />
      <Route path='/interview-training' element={<ProfileInterviewTraining />} />
      <Route path='/video-analysis' element={<CareerPlatform />} />
      <Route path='/roadmap-generator' element={<CareerPlatform />} />
      <Route path='/dsa-coach' element={<CareerPlatform />} />
      <Route path='/project-analyzer' element={<CareerPlatform />} />
      <Route path='/linkedin-optimizer' element={<CareerPlatform />} />
      <Route path='/placement-tracker' element={<CareerPlatform />} />
      <Route path='/mentor-chat' element={<CareerPlatform />} />
      <Route path='/community' element={<CareerPlatform />} />
      <Route path='/gamification' element={<CareerPlatform />} />
      <Route path='/history' element={<InterviewHistory />} />
      <Route path='/pricing' element={<Pricing />} />
      <Route path='/settings' element={<CareerPlatform />} />
      <Route path='/report/:id' element={<InterviewReport />} />
      <Route path='/admin' element={<AdminDashboard />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes
