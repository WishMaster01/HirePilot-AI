import React from 'react'
import { useState } from 'react'
import { FaArrowLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import Step1SetUp from '../components/Step1SetUp'
import Step2Interview from '../components/Step2Interview'
import Step3Report from '../components/Step3Report'

function InterviewPage() {
    const navigate = useNavigate()
    const [step,setStep] = useState(1)
    const [interviewData,setInterviewData] = useState(null)

  return (
    <div className='page-shell min-h-screen'>
        <div className='mx-auto flex w-full max-w-7xl px-4 pt-6 sm:px-6 lg:px-8'>
            <button
                type='button'
                onClick={() => navigate('/')}
                className='btn-secondary h-11 w-11 min-h-0 rounded-full p-0'
                aria-label='Back to home'
            >
                <FaArrowLeft className='text-slate-600' />
            </button>
        </div>

        {step===1 && (
            <Step1SetUp onStart={(data)=>{
                setInterviewData(data);
            setStep(2)}}/>
        )}

         {step===2 && (
            <Step2Interview interviewData={interviewData}
            onFinish={(report)=>{setInterviewData(report);
                setStep(3)
            }}
            />
        )}

          {step===3 && (
            <Step3Report report={interviewData}/>
        )}

      
    </div>
  )
}

export default InterviewPage
