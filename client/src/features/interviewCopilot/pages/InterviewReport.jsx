import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from "axios"
import { ServerUrl } from '../../../constants/api';
import Step3Report from '../components/Step3Report';
import { FaArrowLeft } from 'react-icons/fa';
function InterviewReport() {
  const {id} = useParams()
  const navigate = useNavigate()
  const [report,setReport] = useState(null);
  const [loadError, setLoadError] = useState({ id: '', message: '' })
  const isInvalidReportId = !id || id === 'undefined' || id === 'null'
  const invalidReportMessage = isInvalidReportId ? 'Invalid report link. Please open a report from interview history.' : ''
  const error = invalidReportMessage || (loadError.id === id ? loadError.message : '')
   
  useEffect(()=>{
    if (isInvalidReportId) {
      return
    }

    const fetchReport = async () => {
      try {
        const result = await axios.get(ServerUrl + "/api/interview/report/" + id , {withCredentials:true})
        setReport(result.data)
      } catch (error) {
        console.log(error)
        setLoadError({
          id,
          message: error.response?.data?.message || 'Unable to load this interview report.',
        })
      }
    }

    fetchReport()
  },[id, isInvalidReportId])

  if (error) {
    return (
      <div className="page-shell min-h-screen flex items-center justify-center px-4">
        <div className='surface-card w-full max-w-md p-8 text-center'>
          <img src="/logo.png" alt="HirePilot-AI logo" className='mx-auto mb-5 h-14 w-14 rounded-xl object-contain' />
          <h1 className='text-xl font-black text-slate-950'>Report unavailable</h1>
          <p className="mt-3 text-slate-500 text-sm font-semibold">
            {error}
          </p>
          <button onClick={() => navigate('/history')} className='btn-primary mx-auto mt-6 px-5 py-3'>
            <FaArrowLeft /> Back to history
          </button>
        </div>
      </div>
    )
  }

    if (!report) {
    return (
      <div className="page-shell min-h-screen flex items-center justify-center px-4">
        <div className='surface-card w-full max-w-md p-8 text-center'>
          <div className='skeleton mx-auto mb-5 h-14 w-14 rounded-full'></div>
          <p className="text-slate-500 text-lg font-semibold">
            Loading report...
          </p>
        </div>
      </div>
    );
  }

  return <Step3Report report={report}/>
}

export default InterviewReport
