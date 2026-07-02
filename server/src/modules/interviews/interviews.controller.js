import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { askAi } from "../../services/openRouter.service.js";
import { z } from "zod";
import prisma from "../../config/prisma.js";
import asyncHandler from "../../shared/asyncHandler.js";
import { successResponse } from "../../shared/apiResponse.js";
import { CREDIT_COSTS, consumeCredits } from "../../services/credit.service.js";
import { analyzeCareerProfileAI } from "../../services/ai/careerProfileAI.service.js";
import { analyzeResumeAI, optimizeKeywordsAI, rewriteResumeAI } from "../../services/ai/resumeAI.service.js";
import { analyzeJobMatchAI } from "../../services/ai/jobMatchAI.service.js";
import { generateInterviewFeedbackAI, generateInterviewQuestionsAI } from "../../services/ai/interviewAI.service.js";
import { analyzeVideoAI } from "../../services/ai/videoAnalysisAI.service.js";
import { generateRoadmapAI } from "../../services/ai/roadmapAI.service.js";
import { assessDsaAI, reviewCodeAI } from "../../services/ai/dsaAI.service.js";
import { analyzeProjectAI } from "../../services/ai/projectAnalyzerAI.service.js";
import { analyzeLinkedInAI } from "../../services/ai/linkedInAI.service.js";
import { generatePlacementReportAI } from "../../services/ai/placementAI.service.js";
import { answerMentorAI } from "../../services/ai/mentorAI.service.js";
import { calculateInterviewScore as calculateAdaptiveInterviewScore, generateInterviewProgress } from "../../shared/algorithms/adaptiveInterview.algorithm.js";

const idSchema = z.object({ id: z.string().min(1) });
const parse = (schema, value) => schema.parse(value);
const userWhere = (req) => ({ userId: req.prismaUserId });
const normalizePlacementStatus = (status = "APPLIED") => String(status).toUpperCase().replaceAll(" ", "_");

const assertOwned = async (model, id, userId, include) => {
  const record = await prisma[model].findFirst({
    where: { id, userId },
    include,
  });
  if (!record) {
    const error = new Error("Resource not found");
    error.statusCode = 404;
    throw error;
  }
  return record;
};

export const analyzeResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume required" });
    }
    const filepath = req.file.path

    const fileBuffer = await fs.promises.readFile(filepath)
    const uint8Array = new Uint8Array(fileBuffer)

    const pdf = await pdfjsLib.getDocument({ data: uint8Array }).promise;

    let resumeText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const content = await page.getTextContent();

      const pageText = content.items.map(item => item.str).join(" ");
      resumeText += pageText + "\n";
    }


    resumeText = resumeText
      .replace(/\s+/g, " ")
      .trim();

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:

{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
      },
      {
        role: "user",
        content: resumeText
      }
    ];


    const aiResponse = await askAi(messages)

    const parsed = JSON.parse(aiResponse);

    fs.unlinkSync(filepath)


    res.json({
      role: parsed.role,
      experience: parsed.experience,
      projects: parsed.projects,
      skills: parsed.skills,
      resumeText
    });

  } catch (error) {
    console.error(error);

    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    return res.status(500).json({ message: error.message });
  }
};


export const generateQuestion = async (req, res) => {
  try {
    let { role, experience, mode, resumeText, projects, skills } = req.body

    role = role?.trim();
    experience = experience?.trim();
    mode = mode?.trim();

    if (!role || !experience || !mode) {
      return res.status(400).json({ message: "Role, Experience and Mode are required." })
    }

    const user = await prisma.user.findUnique({ where: { id: req.userId } })

    if (!user) {
      return res.status(404).json({
        message: "User not found."
      });
    }

    if (user.credits < 50) {
      return res.status(400).json({
        message: "Not enough credits. Minimum 50 required."
      });
    }

    const projectText = Array.isArray(projects) && projects.length
      ? projects.join(", ")
      : "None";

    const skillsText = Array.isArray(skills) && skills.length
      ? skills.join(", ")
      : "None";

    const safeResume = resumeText?.trim() || "None";

    const userPrompt = `
    Role:${role}
    Experience:${experience}
    InterviewMode:${mode}
    Projects:${projectText}
    Skills:${skillsText},
    Resume:${safeResume}
    `;

    if (!userPrompt.trim()) {
      return res.status(400).json({
        message: "Prompt content is empty."
      });
    }

    const messages = [

      {
        role: "system",
        content: `
You are a real human interviewer conducting a professional interview.

Speak in simple, natural English as if you are directly talking to the candidate.

Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate’s role, experience,interviewMode, projects, skills, and resume details.
`
      }
      ,
      {
        role: "user",
        content: userPrompt
      }
    ];


    const aiResponse = await askAi(messages)

    if (!aiResponse || !aiResponse.trim()) {
           
      return res.status(500).json({
        message: "AI returned empty response."
      });

    }

    const questionsArray = aiResponse
      .split("\n")
      .map(q => q.trim())
      .filter(q => q.length > 0)
      .slice(0, 5);

    if (questionsArray.length === 0) {
      
      return res.status(500).json({
        message: "AI failed to generate questions."
      });
    }

    const [updatedUser, interview] = await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 50 } },
      }),
      prisma.interview.create({
        data: {
          userId: user.id,
          role,
          experience,
          mode,
          status: "IN_PROGRESS",
          questions: {
            create: questionsArray.map((q, index) => ({
              question: q,
              difficulty: ["easy", "easy", "medium", "medium", "hard"][index],
              timeLimit: [60, 60, 90, 90, 120][index],
              order: index,
            })),
          },
        },
        include: { questions: { orderBy: { order: "asc" } } },
      }),
    ]);

    res.json({
      interviewId: interview.id,
      creditsLeft: updatedUser.credits,
      userName: updatedUser.name,
      questions: interview.questions
    });
  } catch (error) {
    return res.status(500).json({message:`failed to create interview ${error}`})
  }
}


export const submitAnswer = async (req, res) => {
  try {
    const { interviewId, questionIndex, answer, timeTaken } = req.body

    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, userId: req.userId },
      include: { questions: { orderBy: { order: "asc" } } },
    })

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    const question = interview.questions[questionIndex]
    if (!question) {
      return res.status(400).json({ message: "Question not found" });
    }

    // If no answer
    if (!answer) {
      const feedback = "You did not submit an answer.";
      await prisma.$transaction([
        prisma.interviewAnswer.create({
          data: {
            interviewId: interview.id,
            questionId: question.id,
            answer: "",
            timeTaken,
            score: 0,
          },
        }),
        prisma.interviewFeedback.create({
          data: {
            interviewId: interview.id,
            finalScore: 0,
            feedback,
            raw: { questionId: question.id, confidence: 0, communication: 0, correctness: 0 },
          },
        }),
      ]);

      return res.json({
        feedback
      });
    }

    // If time exceeded
    if (timeTaken > question.timeLimit) {
      const feedback = "Time limit exceeded. Answer not evaluated.";
      await prisma.$transaction([
        prisma.interviewAnswer.create({
          data: {
            interviewId: interview.id,
            questionId: question.id,
            answer,
            timeTaken,
            score: 0,
          },
        }),
        prisma.interviewFeedback.create({
          data: {
            interviewId: interview.id,
            finalScore: 0,
            feedback,
            raw: { questionId: question.id, confidence: 0, communication: 0, correctness: 0 },
          },
        }),
      ]);

      return res.json({
        feedback
      });
    }


    const messages = [
      {
        role: "system",
        content: `
You are a professional human interviewer evaluating a candidate's answer in a real interview.

Evaluate naturally and fairly, like a real person would.

Score the answer in these areas (0 to 10):

1. Confidence – Does the answer sound clear, confident, and well-presented?
2. Communication – Is the language simple, clear, and easy to understand?
3. Correctness – Is the answer accurate, relevant, and complete?

Rules:
- Be realistic and unbiased.
- Do not give random high scores.
- If the answer is weak, score low.
- If the answer is strong and detailed, score high.
- Consider clarity, structure, and relevance.

Calculate:
finalScore = average of confidence, communication, and correctness (rounded to nearest whole number).

Feedback Rules:
- Write natural human feedback.
- 10 to 15 words only.
- Sound like real interview feedback.
- Can suggest improvement if needed.
- Do NOT repeat the question.
- Do NOT explain scoring.
- Keep tone professional and honest.

Return ONLY valid JSON in this format:

{
  "confidence": number,
  "communication": number,
  "correctness": number,
  "finalScore": number,
  "feedback": "short human feedback"
}
`
      }
      ,
      {
        role: "user",
        content: `
Question: ${question.question}
Answer: ${answer}
`
      }
    ];


    const aiResponse = await askAi(messages)


    const parsed = JSON.parse(aiResponse);

    await prisma.$transaction([
      prisma.interviewAnswer.create({
        data: {
          interviewId: interview.id,
          questionId: question.id,
          answer,
          timeTaken,
          score: Number(parsed.finalScore || 0),
        },
      }),
      prisma.interviewFeedback.create({
        data: {
          interviewId: interview.id,
          confidence: Number(parsed.confidence || 0),
          communication: Number(parsed.communication || 0),
          correctness: Number(parsed.correctness || 0),
          finalScore: Number(parsed.finalScore || 0),
          feedback: parsed.feedback || "",
          raw: { ...parsed, questionId: question.id },
        },
      }),
    ]);


    return res.status(200).json({feedback :parsed.feedback})
  } catch (error) {
    return res.status(500).json({message:`failed to submit answer ${error}`})

  }
}


export const finishInterview = async (req,res) => {
  try {
    const {interviewId} = req.body
    const interview = await prisma.interview.findFirst({
      where: { id: interviewId, userId: req.userId },
      include: {
        questions: { orderBy: { order: "asc" } },
        answers: true,
        feedback: true,
      },
    })
    if(!interview){
      return res.status(400).json({message:"failed to find Interview"})
    }

    const feedbackByQuestionId = new Map(interview.feedback.map((item) => [item.raw?.questionId, item]));
    const answerByQuestionId = new Map(interview.answers.map((item) => [item.questionId, item]));
    const totalQuestions = interview.questions.length;

    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      const answerRecord = answerByQuestionId.get(q.id);
      const feedbackRecord = feedbackByQuestionId.get(q.id);
      totalScore += answerRecord?.score || feedbackRecord?.finalScore || 0;
      totalConfidence += feedbackRecord?.confidence || 0;
      totalCommunication += feedbackRecord?.communication || 0;
      totalCorrectness += feedbackRecord?.correctness || 0;
    });

    const finalScore = totalQuestions
      ? totalScore / totalQuestions
      : 0;

    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

    await prisma.interview.update({
      where: { id: interview.id },
      data: {
        finalScore,
        status: "COMPLETED",
      },
    });

    const algorithmAnalysis = {
      interviewScore: calculateAdaptiveInterviewScore(interview.feedback),
      progress: generateInterviewProgress(interview.answers.length, totalQuestions),
    };

    return res.status(200).json({
      finalScore: Number(finalScore.toFixed(1)),
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      algorithmAnalysis,
      questionWiseScore: interview.questions.map((q) => {
        const answerRecord = answerByQuestionId.get(q.id);
        const feedbackRecord = feedbackByQuestionId.get(q.id);
        return {
        question: q.question,
        score: answerRecord?.score || feedbackRecord?.finalScore || 0,
        feedback: feedbackRecord?.feedback || "",
        confidence: feedbackRecord?.confidence || 0,
        communication: feedbackRecord?.communication || 0,
        correctness: feedbackRecord?.correctness || 0,
      }}),
    })
  } catch (error) {
    return res.status(500).json({message:`failed to finish Interview ${error}`})
  }
}


export const getMyInterviews = async (req,res) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        role: true,
        experience: true,
        mode: true,
        finalScore: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(200).json(interviews)

  } catch (error) {
     return res.status(500).json({message:`failed to find currentUser Interview ${error}`})
  }
}

export const getInterviewReport = async (req,res) => {
  try {
    const interview = await prisma.interview.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: {
        questions: { orderBy: { order: "asc" } },
        answers: true,
        feedback: true,
      },
    })

    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }


    const feedbackByQuestionId = new Map(interview.feedback.map((item) => [item.raw?.questionId, item]));
    const answerByQuestionId = new Map(interview.answers.map((item) => [item.questionId, item]));
    const totalQuestions = interview.questions.length;

    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    interview.questions.forEach((q) => {
      const feedbackRecord = feedbackByQuestionId.get(q.id);
      totalConfidence += feedbackRecord?.confidence || 0;
      totalCommunication += feedbackRecord?.communication || 0;
      totalCorrectness += feedbackRecord?.correctness || 0;
    });
    const avgConfidence = totalQuestions
      ? totalConfidence / totalQuestions
      : 0;

    const avgCommunication = totalQuestions
      ? totalCommunication / totalQuestions
      : 0;

    const avgCorrectness = totalQuestions
      ? totalCorrectness / totalQuestions
      : 0;

       return res.json({
      finalScore: interview.finalScore,
      confidence: Number(avgConfidence.toFixed(1)),
      communication: Number(avgCommunication.toFixed(1)),
      correctness: Number(avgCorrectness.toFixed(1)),
      questionWiseScore: interview.questions.map((q) => {
        const answerRecord = answerByQuestionId.get(q.id);
        const feedbackRecord = feedbackByQuestionId.get(q.id);
        return {
          ...q,
          answer: answerRecord?.answer || "",
          score: answerRecord?.score || feedbackRecord?.finalScore || 0,
          feedback: feedbackRecord?.feedback || "",
          confidence: feedbackRecord?.confidence || 0,
          communication: feedbackRecord?.communication || 0,
          correctness: feedbackRecord?.correctness || 0,
        };
      })
    });

  } catch (error) {
    return res.status(500).json({message:`failed to find currentUser Interview report ${error}`})
  }
}

export const createInterview = asyncHandler(async (req, res) => {
  const body = parse(z.object({ role: z.string(), experience: z.string().optional(), mode: z.string(), company: z.string().optional(), difficulty: z.string().optional() }), req.body);
  const interview = await prisma.interview.create({ data: { ...body, userId: req.prismaUserId, status: "DRAFT" } });
  return successResponse(res, "Interview created", interview, 201);
});

export const listInterviews = asyncHandler(async (req, res) => successResponse(res, "Interviews fetched", await prisma.interview.findMany({ where: userWhere(req), include: { questions: true, feedback: true }, orderBy: { createdAt: "desc" } })));

export const getInterview = asyncHandler(async (req, res) => successResponse(res, "Interview fetched", await assertOwned("interview", req.params.id, req.prismaUserId, { questions: true, answers: true, feedback: true, video: true })));

export const updateInterview = asyncHandler(async (req, res) => { await assertOwned("interview", req.params.id, req.prismaUserId); return successResponse(res, "Interview updated", await prisma.interview.update({ where: { id: req.params.id }, data: req.body })); });

export const deleteInterview = asyncHandler(async (req, res) => { await assertOwned("interview", req.params.id, req.prismaUserId); await prisma.interview.delete({ where: { id: req.params.id } }); return successResponse(res, "Interview deleted"); });

export const createInterviewQuestions = asyncHandler(async (req, res) => {
  const interview = await assertOwned("interview", req.params.id, req.prismaUserId);
  const ai = await generateInterviewQuestionsAI(interview);
  const questions = await prisma.$transaction((ai.data.questions || []).map((q) => prisma.interviewQuestion.create({ data: { ...q, interviewId: interview.id } })));
  return successResponse(res, "Interview questions generated", questions);
});

export const createInterviewAnswer = asyncHandler(async (req, res) => {
  await assertOwned("interview", req.params.id, req.prismaUserId);
  const body = parse(z.object({ questionId: z.string().optional(), answer: z.string(), timeTaken: z.number().optional() }), req.body);
  const answer = await prisma.interviewAnswer.create({ data: { ...body, interviewId: req.params.id } });
  return successResponse(res, "Interview answer saved", answer, 201);
});

export const createInterviewFeedback = asyncHandler(async (req, res) => {
  const interview = await assertOwned("interview", req.params.id, req.prismaUserId, { questions: true });
  const ai = await generateInterviewFeedbackAI(req.body);
  await consumeCredits({ userId: req.prismaUserId, featureName: "INTERVIEW_FEEDBACK", credits: CREDIT_COSTS.INTERVIEW_FEEDBACK, tokensUsed: ai.tokensUsed, metadata: { interviewId: interview.id } });
  const feedback = await prisma.interviewFeedback.create({ data: { interviewId: interview.id, ...ai.data, raw: ai.data } });
  await prisma.interview.update({ where: { id: interview.id }, data: { finalScore: ai.data.finalScore, status: "COMPLETED" } });
  return successResponse(res, "Interview feedback generated", feedback);
});
