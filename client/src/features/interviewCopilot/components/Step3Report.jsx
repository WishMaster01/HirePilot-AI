import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from "motion/react"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const MotionDiv = motion.div

function Step3Report({ report }) {
  const navigate = useNavigate()
  if (!report) {
    return (
      <div className="page-shell min-h-screen flex items-center justify-center px-4">
        <div className='surface-card w-full max-w-md p-8 text-center'>
          <div className='skeleton mx-auto mb-5 h-14 w-14 rounded-full'></div>
          <p className="text-slate-500 text-lg font-semibold">Loading report...</p>
        </div>
      </div>
    );
  }
  const {
    finalScore = 0,
    confidence = 0,
    communication = 0,
    correctness = 0,
    questionWiseScore = [],
  } = report;

  const questionScoreData = questionWiseScore.map((score, index) => ({
    name: `Q${index + 1}`,
    score: score.score || 0
  }))

  const skills = [
    { label: "Confidence", value: confidence },
    { label: "Communication", value: communication },
    { label: "Correctness", value: correctness },
  ];

  let performanceText = "";
  let shortTagline = "";

  if (finalScore >= 8) {
    performanceText = "Ready for job opportunities.";
    shortTagline = "Excellent clarity and structured responses.";
  } else if (finalScore >= 5) {
    performanceText = "Needs minor improvement before interviews.";
    shortTagline = "Good foundation, refine articulation.";
  } else {
    performanceText = "Significant improvement required.";
    shortTagline = "Work on clarity and confidence.";
  }

  const score = finalScore;
  const percentage = (score / 10) * 100;


  const downloadPDF = () => {
  const doc = new jsPDF("p", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let currentY = 25;

  // ================= TITLE =================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(34, 197, 94);
  doc.text("HirePilot-AI Performance Report", pageWidth / 2, currentY, {
    align: "center",
  });

  currentY += 5;

  // underline
  doc.setDrawColor(34, 197, 94);
  doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

  currentY += 15;

  // ================= FINAL SCORE BOX =================
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(
    `Final Score: ${finalScore}/10`,
    pageWidth / 2,
    currentY + 12,
    { align: "center" }
  );

  currentY += 30;

  // ================= SKILLS BOX =================
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

  doc.setFontSize(12);

  doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
  doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
  doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

  currentY += 45;

  // ================= ADVICE =================
  let advice = "";

  if (finalScore >= 8) {
    advice =
      "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
  } else if (finalScore >= 5) {
    advice =
      "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
  } else {
    advice =
      "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud regularly.";
  }

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(220);
  doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

  doc.setFont("helvetica", "bold");
  doc.text("Professional Advice", margin + 10, currentY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);
  doc.text(splitAdvice, margin + 10, currentY + 20);

  currentY += 50;

  // ================= QUESTION TABLE =================
  autoTable(doc, {
  startY: currentY,
  margin: { left: margin, right: margin },
  head: [["#", "Question", "Score", "Feedback"]],
  body: questionWiseScore.map((q, i) => [
    `${i + 1}`,
    q.question,
    `${q.score}/10`,
    q.feedback,
  ]),
  styles: {
    fontSize: 9,
    cellPadding: 5,
    valign: "top",
  },
  headStyles: {
    fillColor: [34, 197, 94],
    textColor: 255,
    halign: "center",
  },
  columnStyles: {
    0: { cellWidth: 10, halign: "center" }, // index
    1: { cellWidth: 55 }, // question
    2: { cellWidth: 20, halign: "center" }, // score
    3: { cellWidth: "auto" }, // feedback
  },
  alternateRowStyles: {
    fillColor: [249, 250, 251],
  },
});


  doc.save("HirePilot_AI_Interview_Report.pdf");
};

  return (
    <div className='page-shell min-h-screen px-4 sm:px-6 lg:px-10 py-8'>
      <div className='wide-shell'>
      <div className='mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
        <div className='md:mb-10 w-full flex items-start gap-4 flex-wrap'>
          <button
            onClick={() => navigate("/history")}
            className='btn-secondary h-11 w-11 min-h-0 rounded-full p-0'><FaArrowLeft className='text-slate-600' /></button>

          <div>
            <p className='eyebrow mb-3'>AI feedback report</p>
            <h1 className='text-3xl font-black flex-nowrap text-slate-950 sm:text-4xl'>
              Interview Analytics Dashboard
            </h1>
            <p className='text-slate-500 mt-2'>
              HirePilot-AI performance insights, trend scoring, and question-level guidance.
            </p>

          </div>
        </div>

        <button onClick={downloadPDF} className='btn-primary shrink-0 px-6 py-3 text-sm sm:text-base text-nowrap'>Download PDF</button>
      </div>


      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8'>

        <div className='space-y-6'>
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="surface-card p-6 sm:p-8 text-center">

            <h3 className="text-slate-500 mb-4 sm:mb-6 text-sm sm:text-base font-semibold">
              Overall Performance
            </h3>
            <div className='relative w-28 h-28 sm:w-32 sm:h-32 mx-auto'>
              <CircularProgressbar
                value={percentage}
                text={`${score}/10`}
                styles={buildStyles({
                  textSize: "18px",
                  pathColor: "#10b981",
                  textColor: "#0f172a",
                  trailColor: "#e2e8f0",
                  strokeLinecap: "round",
                })}
              />
            </div>

            <p className="text-slate-400 mt-3 text-xs sm:text-sm">
              Out of 10
            </p>

            <div className="mt-4">
              <p className="font-bold text-slate-950 text-sm sm:text-base">
                {performanceText}
              </p>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                {shortTagline}
              </p>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='surface-card p-6 sm:p-8'>
            <h3 className="text-base sm:text-lg font-bold text-slate-950 mb-6">
              Skill Evaluation
            </h3>

            <div className='space-y-5'>
              {
                skills.map((s, i) => (
                  <div key={i}>
                    <div className='flex justify-between mb-2 text-sm sm:text-base text-slate-600'>

                      <span className='font-semibold'>{s.label}</span>
                      <span className='font-bold text-emerald-700'>{s.value}</span>
                    </div>

                    <div className='bg-slate-200 h-2 sm:h-3 rounded-full overflow-hidden'>
                      <div className='bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700'
                        style={{ width: `${s.value * 10}%` }}

                      ></div>

                    </div>


                  </div>
                ))
              }
            </div>

          </MotionDiv>


        </div>

        <div className='lg:col-span-2 space-y-6'>

          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='surface-card p-5 sm:p-8'>
            <h3 className="text-base sm:text-lg font-bold text-slate-950 mb-4 sm:mb-6">
              Performance Trend
            </h3>

            <div className='h-64 sm:h-72'>

              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={questionScoreData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis domain={[0, 10]} stroke="#64748b" />
                  <Tooltip />
                  <Area type="monotone"
                    dataKey="score"
                    stroke="#22c55e"
                    fill="#bbf7d0"
                    strokeWidth={3} />


                </AreaChart>

              </ResponsiveContainer>


            </div>


          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='surface-card p-5 sm:p-8'>
            <h3 className="text-base sm:text-lg font-bold text-slate-950 mb-6">
              Question Breakdown
            </h3>
            <div className='space-y-6'>
              {questionWiseScore.map((q, i) => (
                <div key={i} className='surface-card-muted p-4 sm:p-6'>

                  <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>
                    <div>
                      <p className="text-xs text-emerald-700 font-bold">
                        Question {i + 1}
                      </p>

                      <p className="font-bold text-slate-950 text-sm sm:text-base leading-relaxed">
                        {q.question || "Question not available"}
                      </p>
                    </div>


                    <div className='bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit'>
                      {q.score ?? 0}/10
                    </div>
                  </div>

                  <div className='bg-white border border-emerald-100 p-4 rounded-lg'>
                    <p className='text-xs text-emerald-700 font-bold mb-1 uppercase tracking-wide'>
                      AI Feedback
                    </p>
                    <p className='text-sm text-slate-700 leading-relaxed'>

                      {q.feedback && q.feedback.trim() !== ""
                        ? q.feedback
                        : "No feedback available for this question."}
                    </p>
                  </div>

                </div>
              ))}
            </div>

          </MotionDiv>





        </div>
      </div>
      </div>

    </div>
  )
}

export default Step3Report
