import React from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
function Timer({ timeLeft, totalTime }) {
    const percentage = totalTime ? (timeLeft/totalTime)*100 : 0
  return (
    <div className='h-24 w-24 sm:h-28 sm:w-28'>
        <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          textSize: "24px",
          pathColor: timeLeft <= 10 ? "#ef4444" : "#10b981",
          textColor: "#0f172a",
          trailColor: "#e2e8f0",
          strokeLinecap: "round",
        })}
        />
      
    </div>
  )
}

export default Timer
