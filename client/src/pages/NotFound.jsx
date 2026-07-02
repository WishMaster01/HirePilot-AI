import React from 'react'
import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className='page-shell flex min-h-screen items-center justify-center px-4'>
      <div className='surface-card max-w-lg p-8 text-center'>
        <img src='/logo.png' alt='HirePilot-AI logo' className='mx-auto mb-5 h-14 w-14 rounded-xl object-contain' />
        <h1 className='text-3xl font-black text-slate-950'>Page not found</h1>
        <p className='mt-3 text-slate-500'>The page you opened does not exist in HirePilot-AI.</p>
        <Link to='/' className='btn-primary mt-6 px-6 py-3'>Go home</Link>
      </div>
    </div>
  )
}

export default NotFound
