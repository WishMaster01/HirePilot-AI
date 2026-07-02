import React from 'react'

function Footer() {
  return (
    <div className='flex justify-center px-4 pb-8 pt-6 sm:pb-10 sm:pt-10'>
      <div className='glass-panel w-full max-w-6xl rounded-2xl py-8 px-5 text-center'>
        <div className='flex justify-center items-center gap-3 mb-3'>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-lg shadow-emerald-900/10 ring-1 ring-slate-200'>
              <img src="/logo.png" alt="HirePilot-AI logo" className='h-7 w-7 rounded-lg object-contain' />
            </div>
            <h2 className='font-bold text-slate-950'>HirePilot-AI</h2>
        </div>
        <p className='text-slate-500 text-sm max-w-xl mx-auto leading-relaxed'>
          AI-powered interview preparation platform designed to improve
          communication skills, technical depth and professional confidence.
        </p>


      </div>
    </div>
  )
}

export default Footer
