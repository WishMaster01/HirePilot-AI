import React from 'react'
import { IoSparkles } from "react-icons/io5";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '../../../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../../../constants/api';
import { useDispatch } from 'react-redux';
import { setUserData } from '../../../redux/userSlice';
import { useState } from 'react';

const MotionDiv = motion.div
const MotionButton = motion.button

const getGoogleAuthErrorMessage = (error) => {
    if (error?.response?.data?.message) {
        return error.response.data.message
    }

    switch (error?.code) {
        case "auth/configuration-not-found":
            return "Firebase Authentication is not configured. Enable Google sign-in in Firebase Console."
        case "auth/unauthorized-domain":
            return "This domain is not authorized in Firebase Authentication settings."
        case "auth/popup-closed-by-user":
            return "Google sign-in was closed before completion."
        case "auth/popup-blocked":
            return "Google sign-in popup was blocked by the browser."
        case "auth/network-request-failed":
            return "Network error while connecting to Firebase."
        case "auth/api-key-not-valid.-please-pass-a-valid-api-key.":
        case "auth/invalid-api-key":
            return "Firebase API key is invalid. Check the client Firebase config."
        default:
            return "Google sign-in failed. Please try again."
    }
}

function Auth({isModel = false}) {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState("")

    const handleGoogleAuth = async () => {
        if (loading) return
        setLoading(true)
        setErrorMessage("")
        try {
            const response = await signInWithPopup(auth,provider)
            const idToken = await response.user.getIdToken()
            const result = await axios.post(ServerUrl + "/api/auth/google" , { idToken } , {withCredentials:true})
            dispatch(setUserData(result.data))
        } catch (error) {
            console.log(error)
            setErrorMessage(getGoogleAuthErrorMessage(error))
            dispatch(setUserData(null))
        } finally {
            setLoading(false)
        }
    }
  return (
    <div className={`
      w-full 
      ${isModel ? "py-4" : "page-shell flex items-center justify-center px-4 py-20 sm:px-6"}
    `}>
        <MotionDiv 
        initial={{opacity:0 , y:-40}} 
        animate={{opacity:1 , y:0}} 
        transition={{duration:1.05}}
        className={`
        w-full 
        ${isModel ? "max-w-md p-7 sm:p-8 rounded-2xl" : "max-w-lg p-8 rounded-2xl sm:p-12"}
        glass-panel
      `}>
            <div className='flex items-center justify-center gap-3 mb-6'>
                <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-lg shadow-emerald-900/10 ring-1 ring-slate-200'>
                    <img src="/logo.png" alt="HirePilot-AI logo" className='h-9 w-9 rounded-lg object-contain' />
                </div>
                <div>
                    <h2 className='font-bold text-lg leading-tight text-slate-950'>HirePilot-AI</h2>
                    <p className='text-xs font-semibold text-emerald-700'>AI mock interview studio</p>
                </div>
            </div>

            <h1 className='text-2xl md:text-3xl font-bold text-center leading-tight text-slate-950 mb-4'>
                Continue to your
                <span className='mx-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full inline-flex items-center gap-2'>
                    <IoSparkles size={16}/>
                    AI interview cockpit

                </span>
            </h1>

            <p className='text-slate-500 text-center text-sm md:text-base leading-relaxed mb-8'>
                Sign in to start AI-powered mock interviews,
                track progress, and unlock detailed performance insights.
            </p>


            <MotionButton 
            onClick={handleGoogleAuth}
            disabled={loading}
            whileHover={{y:-2}}
            whileTap={{opacity:1 , scale:0.98}}
            className='btn-primary w-full px-5 py-3'>
                <FcGoogle size={20}/>
                {loading ? "Connecting..." : "Continue with Google"}

   
            </MotionButton>

            {errorMessage && (
                <p className='mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600'>
                    {errorMessage}
                </p>
            )}

            <p className='mt-5 text-center text-xs leading-relaxed text-slate-400'>
                Secure authentication keeps your interview history and credit balance connected to your account.
            </p>
        </MotionDiv>

      
    </div>
  )
}

export default Auth
