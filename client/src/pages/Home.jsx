import React from 'react'
import Navbar from '../components/layout/Navbar'
import { useSelector } from 'react-redux'
import { motion } from "motion/react";
import {
  BsRobot,
  BsMic,
  BsClock,
  BsBarChart,
  BsFileEarmarkText,
  BsBriefcase,
  BsCodeSlash,
  BsPeople,
  BsTrophy
} from "react-icons/bs";
import { HiSparkles } from "react-icons/hi";
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import AuthModel from '../features/auth/components/AuthModal';
import hrImg from "../assets/HR.png";
import techImg from "../assets/tech.png";
import confidenceImg from "../assets/confi.png";
import creditImg from "../assets/credit.png";
import evalImg from "../assets/ai-ans.png";
import resumeImg from "../assets/resume.png";
import pdfImg from "../assets/pdf.png";
import analyticsImg from "../assets/history.png";
import Footer from '../components/layout/Footer';

const MotionDiv = motion.div
const MotionH1 = motion.h1
const MotionH2 = motion.h2
const MotionP = motion.p
const MotionButton = motion.button


function Home() {
  const { userData } = useSelector((state) => state.user)
  const [showAuth, setShowAuth] = useState(false);
  const navigate = useNavigate()

  const startProtectedFlow = (path) => {
    if (!userData) {
      setShowAuth(true)
      return;
    }
    navigate(path)
  }

  return (
    <div className='page-shell min-h-screen flex flex-col'>
      <Navbar />

      <main className='flex-1'>
        <section className='wide-shell pt-32 sm:pt-36 lg:pt-40 pb-20'>
          <div className='grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]'>
            <div className='animate-fade-up'>
              <div className='eyebrow mb-6'>
                <HiSparkles size={16} />
                AI-powered interview preparation for serious candidates
              </div>
            <MotionH1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
                className='section-heading max-w-4xl'>
                Practice smarter with <span className='gradient-text'>HirePilot-AI</span>
            </MotionH1>

            <MotionP
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
                className='section-copy mt-6 max-w-2xl text-base sm:text-lg'>
                Role-based mock interviews with resume context, adaptive questioning, voice practice, performance analytics, and downloadable AI feedback designed for job seekers and students.

            </MotionP>

              <div className='mt-8 flex flex-col gap-3 sm:flex-row'>
              <MotionButton
                  onClick={() => startProtectedFlow("/interview")}
                  whileHover={{ y: -2 }}
                whileTap={{ opacity: 1, scale: 0.98 }}
                  className='btn-primary px-8 py-3'>
                  Start mock interview

              </MotionButton>

              <MotionButton
                  onClick={() => startProtectedFlow("/history")}
                  whileHover={{ y: -2 }}
                whileTap={{ opacity: 1, scale: 0.98 }}
                  className='btn-secondary px-8 py-3'>
                  View progress

              </MotionButton>
              <MotionButton
                  onClick={() => navigate("/career")}
                  whileHover={{ y: -2 }}
                  whileTap={{ opacity: 1, scale: 0.98 }}
                  className='btn-secondary px-8 py-3'>
                  Career Hub

              </MotionButton>
            </div>

              <div className='mt-8 grid max-w-2xl grid-cols-3 gap-3'>
                {[
                  ["3-step", "guided flow"],
                  ["Voice", "practice"],
                  ["PDF", "reports"],
                ].map(([value, label]) => (
                  <div key={value} className='surface-card-muted p-4 text-center'>
                    <p className='text-xl font-black text-slate-950 sm:text-2xl'>{value}</p>
                    <p className='mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500'>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <MotionDiv
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className='relative'
            >
              <div className='dark-card rounded-2xl p-4 sm:p-5'>
                <div className='mb-4 flex items-center justify-between gap-4'>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-white'>
                      <img src="/logo.png" alt="HirePilot-AI logo" className='h-9 w-9 rounded-lg object-contain' />
                    </div>
                    <div>
                      <p className='font-bold text-white'>Live interview cockpit</p>
                      <p className='text-xs font-medium text-emerald-200'>Technical interview in progress</p>
                    </div>
                  </div>
                  <span className='rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-200 ring-1 ring-emerald-300/20'>AI active</span>
                </div>
                <div className='grid gap-4 sm:grid-cols-[0.9fr_1.1fr]'>
                  <div className='rounded-xl bg-slate-950/70 p-4 ring-1 ring-white/10'>
                    <img src={techImg} alt="Technical interview mode preview" className='mx-auto h-48 w-full object-contain sm:h-64' />
                  </div>
                  <div className='space-y-4 rounded-xl bg-white/95 p-5'>
                    <div>
                      <p className='text-xs font-bold uppercase tracking-wide text-emerald-700'>Question 03</p>
                      <h2 className='mt-2 text-xl font-bold leading-snug text-slate-950'>Explain how you would optimize a slow React dashboard.</h2>
                    </div>
                    <div className='space-y-3'>
                      <div className='h-3 w-full rounded-full bg-slate-100'>
                        <div className='h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500'></div>
                      </div>
                      <div className='grid grid-cols-3 gap-2 text-center'>
                        {["Clarity", "Depth", "Pace"].map((label, index) => (
                          <div key={label} className='rounded-lg bg-slate-50 p-3'>
                            <p className='text-lg font-black text-slate-950'>{[8.4, 7.8, 9.1][index]}</p>
                            <p className='text-[11px] font-semibold text-slate-500'>{label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </MotionDiv>
          </div>
        </section>

        <section className='wide-shell pb-20'>
          <div className='dark-card rounded-2xl p-6 sm:p-8'>
            <div className='grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center'>
              <div>
                <p className='eyebrow mb-5'>New Career Development Platform</p>
                <h2 className='text-3xl font-black leading-tight text-white sm:text-4xl'>
                  Go beyond mock interviews with a complete AI career operating system.
                </h2>
                <p className='mt-4 text-sm leading-relaxed text-slate-300 sm:text-base'>
                  Build your Career DNA, optimize resumes, match roles, generate roadmaps, track placements, practice DSA, analyze projects, improve LinkedIn, and use a mentor-style career assistant.
                </p>
                <button onClick={() => navigate("/career")} className='btn-primary mt-6 px-7 py-3'>
                  Open Career Command Center
                </button>
              </div>
              <div className='grid gap-3 sm:grid-cols-2'>
                {[
                  { icon: <BsFileEarmarkText />, title: "Resume AI", copy: "ATS scoring, rewriting, gaps, and keywords." },
                  { icon: <BsBriefcase />, title: "Job Matching", copy: "Internships, graduate roles, SDE and product matches." },
                  { icon: <BsCodeSlash />, title: "DSA Coach", copy: "Topic tracking, coding score, and review preview." },
                  { icon: <BsPeople />, title: "Community", copy: "Peer mocks, forums, leaderboards, experiences." },
                  { icon: <BsTrophy />, title: "Gamification", copy: "XP, badges, streaks, and career levels." },
                  { icon: <BsBarChart />, title: "Progress Analytics", copy: "Career readiness, applications, reports, and growth." },
                ].map((item) => (
                  <div key={item.title} className='rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm'>
                    <div className='mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/20'>
                      {item.icon}
                    </div>
                    <h3 className='font-black text-white'>{item.title}</h3>
                    <p className='mt-2 text-sm leading-relaxed text-slate-300'>{item.copy}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className='content-shell pb-20'>
          <div className='mb-10 text-center'>
            <p className='eyebrow mx-auto'>Structured interview workflow</p>
            <h2 className='mt-5 text-3xl font-black text-slate-950 sm:text-4xl'>Prepare with a real interview rhythm</h2>
          </div>
          <div className='grid gap-5 md:grid-cols-3'>
            {[
                {
                  icon: <BsRobot size={24} />,
                  step: "STEP 1",
                  title: "Role & Experience Selection",
                  desc: "AI adjusts difficulty based on selected job role."
                },
                {
                  icon: <BsMic size={24} />,
                  step: "STEP 2",
                  title: "Smart Voice Interview",
                  desc: "Dynamic follow-up questions based on your answers."
                },
                {
                  icon: <BsClock size={24} />,
                  step: "STEP 3",
                  title: "Timer Based Simulation",
                  desc: "Real interview pressure with time tracking."
                }
              ].map((item, index) => (
                <MotionDiv key={index}
                  initial={{ opacity: 0, y: 60 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.6 + index * 0.2 }}
                  whileHover={{ y: -6 }}
                  className='surface-card lift-card p-8'>
                  <div className='mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'>
                    {item.icon}</div>
                  <div>
                    <div className='text-xs text-emerald-700 font-bold mb-2 tracking-wider'>{item.step}</div>
                    <h3 className='font-bold mb-3 text-lg text-slate-950'>{item.title}</h3>
                    <p className='text-sm text-slate-500 leading-relaxed'>{item.desc}</p>
                  </div>
                </MotionDiv>
              ))
            }
          </div>
        </section>

        <section className='wide-shell pb-20'>
            <MotionH2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            className='mb-12 text-center text-3xl font-black text-slate-950 sm:text-4xl'>
              Advanced AI{" "}
            <span className="gradient-text">Capabilities</span>

            </MotionH2>

          <div className='grid gap-6 md:grid-cols-2'>
              {
                [
                  {
                    image: evalImg,
                    icon: <BsBarChart size={20} />,
                    title: "AI Answer Evaluation",
                    desc: "Scores communication, technical accuracy and confidence."
                  },
                  {
                    image: resumeImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Resume Based Interview",
                    desc: "Project-specific questions based on uploaded resume."
                  },
                  {
                    image: pdfImg,
                    icon: <BsFileEarmarkText size={20} />,
                    title: "Downloadable PDF Report",
                    desc: "Detailed strengths, weaknesses and improvement insights."
                  },
                  {
                    image: analyticsImg,
                    icon: <BsBarChart size={20} />,
                    title: "History & Analytics",
                    desc: "Track progress with performance graphs and topic analysis."
                  }
                ].map((item, index) => (
                  <MotionDiv key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className='surface-card lift-card p-6 sm:p-8'>
                    <div className='flex flex-col gap-6 sm:flex-row sm:items-center'>
                      <div className='flex min-h-44 flex-1 justify-center rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100'>
                        <img src={item.image} alt={item.title} className='h-44 w-full object-contain' />
                      </div>

                    <div className='flex-1'>
                      <div className='bg-emerald-50 text-emerald-700 w-12 h-12 rounded-xl flex items-center justify-center mb-5 ring-1 ring-emerald-100'>
                          {item.icon}
                        </div>
                      <h3 className='font-bold mb-3 text-xl text-slate-950'>{item.title}</h3>
                      <p className='text-slate-500 text-sm leading-relaxed'>{item.desc}</p>
                      </div>

                    </div>
                  </MotionDiv>
                ))
              }
            </div>
        </section>

        <section className='wide-shell pb-24'>
            <MotionH2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
            className='mb-12 text-center text-3xl font-black text-slate-950 sm:text-4xl'>
              Multiple Interview{" "}
            <span className="gradient-text">Modes</span>

            </MotionH2>

          <div className='grid gap-6 md:grid-cols-2'>
              {
                [
                  {
                    img: hrImg,
                    title: "HR Interview Mode",
                    desc: "Behavioral and communication based evaluation."
                  },
                  {
                    img: techImg,
                    title: "Technical Mode",
                    desc: "Deep technical questioning based on selected role."
                  },

                  {
                    img: confidenceImg,
                    title: "Confidence Detection",
                    desc: "Basic tone and voice analysis insights."
                  },
                  {
                    img: creditImg,
                    title: "Credits System",
                    desc: "Unlock premium interview sessions easily."
                  }
                ].map((mode, index) => (
                  <MotionDiv key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -6 }}
                  className="surface-card lift-card p-6 sm:p-8">

                  <div className='flex items-center justify-between gap-6'>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-xl mb-3 text-slate-950">
                          {mode.title}
                        </h3>

                      <p className="text-slate-500 text-sm leading-relaxed">
                          {mode.desc}
                        </p>
                      </div>

                    <div className="flex h-28 w-28 shrink-0 justify-end rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100 sm:h-32 sm:w-32">
                        <img
                          src={mode.img}
                          alt={mode.title}
                        className="h-full w-full object-contain"
                        />
                      </div>
                    </div>
                  </MotionDiv>
                ))
              }
            </div>
        </section>
      </main>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}

      <Footer/>

    </div>
  )
}

export default Home
