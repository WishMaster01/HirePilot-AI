import React from 'react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { FaTimes } from "react-icons/fa";
import Auth from '../pages/Auth';

function AuthModel({onClose}) {
    const {userData} = useSelector((state)=>state.user)

    useEffect(()=>{
        if(userData){
            onClose()
        }

    },[userData , onClose])

  return (
    <div className='fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 backdrop-blur-md px-4'>
        <div className='relative w-full max-w-md'>
            <button onClick={onClose} aria-label="Close sign in dialog" className='absolute top-7 right-5 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:text-slate-950'>
             <FaTimes size={18}/>
            </button>
            <Auth isModel={true}/>


        </div>

      
    </div>
  )
}

export default AuthModel
