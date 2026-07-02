import React from 'react'
import { motion } from "motion/react"
import {
    FaUserTie,
    FaBriefcase,
    FaFileUpload,
    FaMicrophoneAlt,
    FaChartLine,
} from "react-icons/fa";
import { useState } from 'react';
import axios from "axios"
import { ServerUrl } from '../../../constants/api';
import { useDispatch, useSelector } from 'react-redux';
import { setUserData } from '../../../redux/userSlice';

const MotionDiv = motion.div
const MotionButton = motion.button

function Step1SetUp({ onStart }) {
    const {userData}= useSelector((state)=>state.user)
    const dispatch = useDispatch()
    const [role, setRole] = useState("");
    const [experience, setExperience] = useState("");
    const [mode, setMode] = useState("Technical");
    const [resumeFile, setResumeFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [projects, setProjects] = useState([]);
    const [skills, setSkills] = useState([]);
    const [resumeText, setResumeText] = useState("");
    const [analysisDone, setAnalysisDone] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);


    const handleUploadResume = async () => {
        if (!resumeFile || analyzing) return;
        setAnalyzing(true)

        const formdata = new FormData()
        formdata.append("resume", resumeFile)

        try {
            const result = await axios.post(ServerUrl + "/api/interview/resume", formdata, { withCredentials: true })

            console.log(result.data)

            setRole(result.data.role || "");
            setExperience(result.data.experience || "");
            setProjects(result.data.projects || []);
            setSkills(result.data.skills || []);
            setResumeText(result.data.resumeText || "");
            setAnalysisDone(true);

            setAnalyzing(false);

        } catch (error) {
            console.log(error)
            setAnalyzing(false);
        }
    }

    const handleStart = async () => {
        setLoading(true)
        try {
           const result = await axios.post(ServerUrl + "/api/interview/generate-questions" , {role, experience, mode , resumeText, projects, skills } , {withCredentials:true}) 
           console.log(result.data)
           if(userData){
            dispatch(setUserData({...userData , credits:result.data.creditsLeft}))
           }
           setLoading(false)
           onStart(result.data)

        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }
    return (
        <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className='page-shell min-h-screen flex items-center justify-center px-4 py-8 sm:px-6'>

            <div className='glass-panel w-full max-w-6xl rounded-2xl grid overflow-hidden lg:grid-cols-[0.9fr_1.1fr]'>

                <MotionDiv
                    initial={{ x: -80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className='dark-shell relative p-8 flex flex-col justify-center sm:p-10 lg:p-12'>

                    <div className='mb-7 flex items-center gap-3'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-white'>
                            <img src="/logo.png" alt="HirePilot-AI logo" className='h-10 w-10 rounded-lg object-contain' />
                        </div>
                        <div>
                            <p className='text-sm font-bold text-emerald-200'>HirePilot-AI</p>
                            <p className='text-xs font-medium text-slate-300'>Interview setup cockpit</p>
                        </div>
                    </div>

                    <h2 className="text-3xl font-black leading-tight text-white mb-5 sm:text-4xl">
                        Build a targeted AI interview session
                    </h2>

                    <p className="text-slate-300 mb-10 leading-relaxed">
                        Choose the role, experience level, and interview mode. Upload a resume when you want project-specific questions and sharper feedback.
                    </p>

                    <div className='space-y-5'>

                        {
                            [
                                {
                                    icon: <FaUserTie className="text-green-600 text-xl" />,
                                    text: "Choose Role & Experience",
                                },
                                {
                                    icon: <FaMicrophoneAlt className="text-green-600 text-xl" />,
                                    text: "Smart Voice Interview",
                                },
                                {
                                    icon: <FaChartLine className="text-green-600 text-xl" />,
                                    text: "Performance Analytics",
                                },
                            ].map((item, index) => (
                                <MotionDiv key={index}
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 + index * 0.15 }}
                                    whileHover={{ x: 4 }}
                                    className='flex items-center space-x-4 rounded-xl border border-white/10 bg-white/8 p-4 text-white backdrop-blur-sm'>
                                    {item.icon}
                                    <span className='font-semibold'>{item.text}</span>

                                </MotionDiv>
                            ))
                        }
                    </div>



                </MotionDiv>



                <MotionDiv
                    initial={{ x: 80, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    className="bg-white/95 p-6 sm:p-8 lg:p-12">

                    <h2 className='text-2xl font-black text-slate-950 mb-2 sm:text-3xl'>
                        Interview Setup
                    </h2>
                    <p className='mb-8 text-sm leading-relaxed text-slate-500'>
                        Keep the prompts specific. Better role and resume context helps the AI generate more relevant questions.
                    </p>


                    <div className='space-y-6'>

                        <div className='relative'>
                            <FaUserTie className='absolute top-4 left-4 text-slate-400' />

                            <input type='text' placeholder='Enter role'
                                className='input-field px-4 py-3 pl-12'
                                onChange={(e) => setRole(e.target.value)} value={role} />
                        </div>


                        <div className='relative'>
                            <FaBriefcase className='absolute top-4 left-4 text-slate-400' />

                            <input type='text' placeholder='Experience (e.g. 2 years)'
                                className='input-field px-4 py-3 pl-12'
                                onChange={(e) => setExperience(e.target.value)} value={experience} />



                        </div>

                        <select value={mode}
                            onChange={(e) => setMode(e.target.value)}
                            className='input-field px-4 py-3'>

                            <option value="Technical">Technical Interview</option>
                            <option value="HR">HR Interview</option>

                        </select>

                        {!analysisDone && (
                            <MotionDiv
                                whileHover={{ y: -2 }}
                                onClick={() => document.getElementById("resumeUpload").click()}
                                className='rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/80 p-7 text-center cursor-pointer transition hover:border-emerald-500 hover:bg-emerald-50/80'>

                                <FaFileUpload className='text-4xl mx-auto text-emerald-600 mb-3' />

                                <input type="file"
                                    accept="application/pdf"
                                    id="resumeUpload"
                                    className='hidden'
                                    onChange={(e) => setResumeFile(e.target.files[0])} />

                                <p className='text-slate-600 font-semibold break-words'>
                                    {resumeFile ? resumeFile.name : "Click to upload resume (Optional)"}
                                </p>
                                <p className='mt-2 text-xs text-slate-400'>PDF only. Used to personalize role, skills, and project questions.</p>

                                {resumeFile && (
                                    <MotionButton
                                        whileHover={{ y: -2 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUploadResume()
                                        }}

                                        className='btn-primary mt-4 min-h-10 px-5 py-2 text-sm'>
                                        {analyzing ? "Analyzing..." : "Analyze Resume"}



                                    </MotionButton>)}

                            </MotionDiv>


                        )}

                        {analysisDone && (
                            <MotionDiv
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className='surface-card-muted p-5 space-y-4'>
                                <h3 className='text-lg font-bold text-slate-950'>
                                    Resume Analysis Result</h3>

                                {projects.length > 0 && (
                                    <div>
                                        <p className='font-semibold text-slate-700 mb-1'>
                                            Projects:</p>

                                        <ul className='list-disc list-inside text-slate-600 space-y-1'>
                                            {projects.map((p, i) => (
                                                <li key={i}>{p}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {skills.length > 0 && (
                                    <div>
                                        <p className='font-semibold text-slate-700 mb-1'>
                                            Skills:</p>

                                        <div className='flex flex-wrap gap-2'>
                                            {skills.map((s, i) => (
                                                <span key={i} className='bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold'>{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                            </MotionDiv>
                        )}


                        <MotionButton
                        onClick={handleStart}
                            disabled={!role || !experience || loading}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            className='btn-primary w-full px-5 py-3 text-lg'>
                            {loading ? "Starting...":"Start Interview"}


                        </MotionButton>
                    </div>

                </MotionDiv>
            </div>

        </MotionDiv>
    )
}

export default Step1SetUp
