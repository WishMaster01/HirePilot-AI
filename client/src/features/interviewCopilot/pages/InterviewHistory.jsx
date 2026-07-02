import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../../../constants/api'
import { FaArrowLeft } from 'react-icons/fa'

function InterviewHistory() {
    const [interviews, setInterviews] = useState([])
    const navigate = useNavigate()

    const getReportId = (item) => item?.id || item?._id || item?.interviewId || item?.reportId

    const openReport = (item) => {
        const reportId = getReportId(item)
        if (!reportId) return
        navigate(`/report/${reportId}`)
    }

    useEffect(() => {
        const getMyInterviews = async () => {
            try {
                const result = await axios.get(ServerUrl + "/api/interview/get-interview", { withCredentials: true })
                setInterviews(result.data)
            } catch (error) {
                console.log(error)
            }
        }

        getMyInterviews()
    }, [])

    return (
        <div className='page-shell min-h-screen py-10 px-4 sm:px-6'>
            <div className='mx-auto w-full max-w-5xl'>
                <div className='mb-10 flex w-full flex-wrap items-start gap-4'>
                    <button
                        onClick={() => navigate("/")}
                        className='btn-secondary mt-1 h-11 w-11 min-h-0 rounded-full p-0'
                    >
                        <FaArrowLeft className='text-slate-600' />
                    </button>

                    <div>
                        <p className='eyebrow mb-3'>Practice history</p>
                        <h1 className='text-3xl font-black text-slate-950 sm:text-4xl'>
                            Interview History
                        </h1>
                        <p className='mt-2 text-slate-500'>
                            Track previous HirePilot-AI sessions, scores, and detailed feedback reports.
                        </p>
                    </div>
                </div>

                {interviews.length === 0 ? (
                    <div className='surface-card p-10 text-center'>
                        <img src="/logo.png" alt="HirePilot-AI logo" className='mx-auto mb-5 h-14 w-14 rounded-xl object-contain' />
                        <h2 className='text-xl font-black text-slate-950'>No interviews yet</h2>
                        <p className='mt-2 text-slate-500'>
                            No interviews found. Start your first interview.
                        </p>
                    </div>
                ) : (
                    <div className='grid gap-5'>
                        {interviews.map((item, index) => {
                            const reportId = getReportId(item)

                            return (
                            <div
                                key={reportId || `${item.role}-${item.createdAt}-${index}`}
                                onClick={() => openReport(item)}
                                className={`surface-card lift-card p-5 sm:p-6 ${reportId ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                            >
                                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-950">
                                            {item.role}
                                        </h3>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {item.experience} | {item.mode}
                                        </p>

                                        <p className="mt-2 text-xs font-medium text-slate-400">
                                            {new Date(item.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <div className='flex flex-wrap items-center gap-4 sm:gap-6'>
                                        <div className="text-left sm:text-right">
                                            <p className="text-2xl font-black text-emerald-700">
                                                {item.finalScore || 0}/10
                                            </p>
                                            <p className="text-xs font-semibold text-slate-400">
                                                Overall Score
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-4 py-1.5 text-xs font-bold ${item.status === "completed"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default InterviewHistory
