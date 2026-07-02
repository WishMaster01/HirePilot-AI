import React from 'react'
import maleVideo from "../../../assets/videos/male-ai.mp4"
import femaleVideo from "../../../assets/videos/female-ai.mp4"
import Timer from './Timer'
import { motion } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash } from "react-icons/fa";
import { useState } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import axios from "axios"
import { ServerUrl } from '../../../constants/api'
import { BsArrowRight } from 'react-icons/bs'

const MotionButton = motion.button
const MotionDiv = motion.div

function Step2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;
  const [isIntroPhase, setIsIntroPhase] = useState(true);

  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(
    questions[0]?.timeLimit || 60
  );
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");


  const videoRef = useRef(null);

  const currentQuestion = questions[currentIndex];


  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      // Try known female voices first
      const femaleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female")
        );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }

      // Try known male voices
      const maleVoice =
        voices.find(v =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male")
        );

      if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
        return;
      }

      // Fallback: first voice (assume female)
      setSelectedVoice(voices[0]);
      setVoiceGender("female");
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

  }, [])

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  function startMic() {
    if (recognitionRef.current && !isAIPlaying) {
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.log(error)
      }
    }
  }

  function stopMic() {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }

  /* ---------------- SPEAK FUNCTION ---------------- */
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      // Add natural pauses after commas and periods
      const humanText = text
        .replace(/,/g, ", ... ")
        .replace(/\./g, ". ... ");

      const utterance = new SpeechSynthesisUtterance(humanText);

      utterance.voice = selectedVoice;

      // Human-like pacing
      utterance.rate = 0.92;     // slightly slower than normal
      utterance.pitch = 1.05;    // small warmth
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic()
        videoRef.current?.play();
      };


      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setIsAIPlaying(false);



        if (isMicOn) {
          startMic();
        }
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };


      setSubtitle(text);

      window.speechSynthesis.speak(utterance);
    });
  };


  useEffect(() => {
    if (!selectedVoice) {
      return;
    }
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin."
        );

        setIsIntroPhase(false)
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));

        // If last question (hard level)
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challenging.");
        }

        await speakText(currentQuestion.question);

        if (isMicOn) {
          startMic();
        }
      }

    }

    runIntro()


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVoice, isIntroPhase, currentIndex])



  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0;
        }
        return prev - 1

      })
    }, 1000);

    return () => clearInterval(timer)

  }, [isIntroPhase, currentIndex, currentQuestion])

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript;

      setAnswer((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;

  }, []);

  const toggleMic = () => {
    if (isMicOn) {
      stopMic();
    } else {
      startMic();
    }
    setIsMicOn(!isMicOn);
  };


  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic()
    setIsSubmitting(true)

    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken:
          currentQuestion.timeLimit - timeLeft,
      } , {withCredentials:true})

      setFeedback(result.data.feedback)
      speakText(result.data.feedback)
      setIsSubmitting(false)
    } catch (error) {
console.log(error)
setIsSubmitting(false)
    }
  }

  const handleNext =async () => {
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }

    await speakText("Alright, let's move to the next question.");

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    setTimeLeft(questions[nextIndex]?.timeLimit || 60);
    setTimeout(() => {
      if (isMicOn) startMic();
    }, 500);

   
  }

  const finishInterview = async () => {
    stopMic()
    setIsMicOn(false)
    try {
      const result = await axios.post(ServerUrl+ "/api/interview/finish" , { interviewId} , {withCredentials:true})

      console.log(result.data)
      onFinish(result.data)
    } catch (error) {
      console.log(error)
    }
  }


   useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;

    if (timeLeft === 0 && !isSubmitting && !feedback) {
      const timeout = setTimeout(() => {
        submitAnswer()
      }, 0);

      return () => clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }

      window.speechSynthesis.cancel();
    };
  }, []);







  return (
    <div className='page-shell min-h-screen flex items-center justify-center p-4 sm:p-6'>
      <div className='glass-panel w-full max-w-7xl min-h-[82vh] rounded-2xl flex flex-col overflow-hidden lg:flex-row'>

        <div className='w-full lg:w-[36%] dark-shell flex flex-col items-center p-5 space-y-5 sm:p-6'>
          <div className='flex w-full max-w-md items-center justify-between gap-3'>
            <div className='flex items-center gap-3'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-white'>
                <img src="/logo.png" alt="HirePilot-AI logo" className='h-8 w-8 rounded-lg object-contain' />
              </div>
              <div>
                <p className='font-bold text-white'>HirePilot-AI</p>
                <p className='text-xs font-medium text-slate-300'>Live practice room</p>
              </div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${isAIPlaying ? "bg-emerald-400/15 text-emerald-200 ring-emerald-300/25" : "bg-white/10 text-slate-200 ring-white/10"}`}>
              {isAIPlaying ? "AI Speaking" : "Listening"}
            </span>
          </div>

          <div className='w-full max-w-md overflow-hidden rounded-2xl bg-slate-950 shadow-2xl shadow-slate-950/30 ring-1 ring-white/10'>
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>

          {subtitle && (
            <div className='w-full max-w-md rounded-xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur-sm'>
              <p className='text-slate-100 text-sm sm:text-base font-medium text-center leading-relaxed'>{subtitle}</p>
            </div>
          )}


          <div className='w-full max-w-md rounded-2xl border border-white/10 bg-white/95 p-5 shadow-xl sm:p-6'>
            <div className='flex justify-between items-center'>
              <span className='text-sm font-semibold text-slate-500'>
                Interview Status
              </span>
              <span className='text-sm font-bold text-emerald-700'>
                {isIntroPhase ? "Intro" : `Question ${currentIndex + 1}`}
              </span>
            </div>

            <div className="my-5 h-px bg-slate-200"></div>

            <div className='flex justify-center'>

              <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className="my-5 h-px bg-slate-200"></div>

            <div className='grid grid-cols-2 gap-3 text-center'>
              <div className='rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100'>
                <span className='block text-2xl font-black text-emerald-700'>{currentIndex + 1}</span>
                <span className='text-xs font-semibold text-slate-400'>Current Question</span>
              </div>

              <div className='rounded-xl bg-slate-50 p-4 ring-1 ring-slate-100'>
                <span className='block text-2xl font-black text-emerald-700'>{questions.length}</span>
                <span className='text-xs font-semibold text-slate-400'>Total Questions</span>
              </div>
            </div>


          </div>
        </div>

        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative bg-white/90'>
          <div className='mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
            <div>
              <p className='eyebrow'>Interview cockpit</p>
              <h2 className='mt-3 text-2xl font-black text-slate-950 sm:text-3xl'>
                AI mock interview
              </h2>
            </div>
            <div className='metric-pill w-fit'>
              {isMicOn ? <FaMicrophone size={14} /> : <FaMicrophoneSlash size={14}/>}
              {isMicOn ? "Mic on" : "Mic muted"}
            </div>
          </div>


          {!isIntroPhase && (<div className='relative mb-5 surface-card-muted p-4 sm:p-6'>
            <p className='text-xs sm:text-sm text-emerald-700 font-bold mb-2'>
              Question {currentIndex + 1} of {questions.length}
            </p>

            <div className='text-base sm:text-lg font-bold text-slate-950 leading-relaxed '>{currentQuestion?.question}</div>
          </div>)
          }
          <textarea
            placeholder="Type your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="input-field min-h-64 flex-1 resize-none p-4 leading-relaxed text-slate-800 sm:p-6" />


         {!feedback ? ( <div className='flex items-center gap-3 mt-5 sm:gap-4 sm:mt-6'>
            <MotionButton
              onClick={toggleMic}
              whileTap={{ scale: 0.9 }}
              className={`h-12 w-12 sm:w-14 sm:h-14 flex shrink-0 items-center justify-center rounded-full text-white shadow-lg transition ${isMicOn ? "bg-slate-950 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}>
              {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20}/>}
            </MotionButton>

            <MotionButton
            onClick={submitAnswer}
            disabled={isSubmitting}
              whileTap={{ scale: 0.95 }}
              className='btn-primary flex-1 px-5 py-3 sm:py-4'>
              {isSubmitting?"Submitting...":"Submit Answer"}

            </MotionButton>

          </div>):(
            <MotionDiv 
             initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            className='mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-5 shadow-sm'>
              <p className='mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700'>AI feedback</p>
              <p className='text-slate-700 font-medium leading-relaxed mb-4'>{feedback}</p>

              <button
              onClick={handleNext}

               className='btn-primary w-full px-5 py-3'>
                Next Question <BsArrowRight size={18}/>
              </button>

            </MotionDiv>
          )}
        </div>
      </div>

    </div>
  )
}

export default Step2Interview
