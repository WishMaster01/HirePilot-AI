import { callAIJson } from "./baseAI.service.js";
import {
  buildContextualVideoInterviewPrompt,
  buildProfileTrainingQuestionPrompt,
} from "../../ai/prompts/interview.prompt.js";

const fallbackQuestions = (payload) => [
  {
    question: `Walk me through the strongest project from your GitHub or resume for a ${payload.targetRole || "target"} role.`,
    source: "github/resume",
    type: "project-deep-dive",
    difficulty: "medium",
    expectedAnswerPoints: ["problem solved", "architecture", "your contribution", "measurable impact"],
    followUps: ["What tradeoff did you make?", "How would you scale it?"],
    evaluationCriteria: ["clarity", "technical depth", "ownership"],
    timeLimit: 120,
  },
  {
    question: "Which technical skill from your LinkedIn profile can you prove with a concrete project example?",
    source: "linkedin",
    type: "technical-validation",
    difficulty: "medium",
    expectedAnswerPoints: ["skill claim", "project proof", "result"],
    followUps: ["What would you improve now?"],
    evaluationCriteria: ["evidence", "specificity", "communication"],
    timeLimit: 90,
  },
  {
    question: "Tell me about a challenge from your resume and how you handled debugging, testing, or deployment.",
    source: "resume",
    type: "behavioral-technical",
    difficulty: "medium",
    expectedAnswerPoints: ["situation", "action", "technical decision", "result"],
    followUps: ["What did you learn?"],
    evaluationCriteria: ["structure", "problem solving", "reflection"],
    timeLimit: 120,
  },
  {
    question: `How does your current tech stack prepare you for ${payload.targetRole || "this role"}?`,
    source: "tech-stack",
    type: "role-fit",
    difficulty: "easy",
    expectedAnswerPoints: ["stack summary", "role mapping", "gaps"],
    followUps: ["Which gap will you fix first?"],
    evaluationCriteria: ["role alignment", "self-awareness"],
    timeLimit: 90,
  },
  {
    question: "If I review your GitHub after this interview, what code quality signals should I notice first?",
    source: "github",
    type: "code-quality",
    difficulty: "hard",
    expectedAnswerPoints: ["structure", "readability", "tests", "security", "docs"],
    followUps: ["What is missing today?"],
    evaluationCriteria: ["engineering judgment", "honesty", "prioritization"],
    timeLimit: 120,
  },
];

export const generateContextualVideoInterviewAI = async (payload) => {
  const fallback = {
    assistantPersona: "Senior technical interviewer focused on resume, LinkedIn, GitHub, and project evidence.",
    contextSummary: "Candidate context was analyzed from supplied resume, LinkedIn, GitHub, projects, and tech stack.",
    interviewTitle: `${payload.targetRole || "Personalized"} Video Mock Interview`,
    questions: fallbackQuestions(payload),
    videoInterviewTips: ["Answer in STAR format", "Keep camera framing steady", "Use project metrics", "Mention tradeoffs clearly"],
    riskAreas: ["Missing measurable impact", "Weak project depth", "Unclear role fit"],
    openingPrompt: "Start with a concise introduction connected to your target role and strongest project.",
  };

  const result = await callAIJson({
    prompt: buildContextualVideoInterviewPrompt(payload),
    fallback,
    schemaName: "contextualVideoInterview",
  });

  const data = result.data || fallback;
  result.data = {
    ...data,
    questions: (data.questions || fallback.questions).map((question, index) => ({
      question: question.question,
      source: question.source || "profile",
      type: question.type || "mixed",
      difficulty: question.difficulty || payload.difficulty || (index < 2 ? "easy" : index < 4 ? "medium" : "hard"),
      expectedAnswerPoints: question.expectedAnswerPoints || [],
      followUps: question.followUps || [],
      evaluationCriteria: question.evaluationCriteria || [],
      timeLimit: Number(question.timeLimit || [90, 90, 120, 120, 150][index] || 120),
      order: index,
    })),
  };

  return result;
};

export const generateProfileTrainingQuestionsAI = async (payload) => {
  const fallback = {
    trainingTitle: `${payload.targetRole || "Interview"} Profile Training Plan`,
    readinessScore: 72,
    contextSummary: "Training questions were generated from supplied resume, LinkedIn, GitHub, projects, and skills.",
    topicBuckets: [
      {
        topic: "Project Deep Dive",
        source: "github",
        priority: "high",
        questions: fallbackQuestions(payload).slice(0, 2).map((item) => ({
          question: item.question,
          difficulty: item.difficulty,
          whyAsked: "Interviewers validate claimed project ownership and engineering depth.",
          idealAnswerPoints: item.expectedAnswerPoints,
          practiceTask: "Prepare a 90-second answer with architecture and impact.",
        })),
      },
      {
        topic: "Resume and LinkedIn Proof",
        source: "resume/linkedin",
        priority: "high",
        questions: fallbackQuestions(payload).slice(2, 4).map((item) => ({
          question: item.question,
          difficulty: item.difficulty,
          whyAsked: "Interviewers check whether profile claims are specific and defensible.",
          idealAnswerPoints: item.expectedAnswerPoints,
          practiceTask: "Write one STAR answer and record a practice response.",
        })),
      },
    ],
    dailyPracticePlan: ["Day 1: resume deep dive", "Day 2: GitHub project architecture", "Day 3: technical fundamentals", "Day 4: mock video interview"],
    projectDeepDiveQuestions: fallbackQuestions(payload).filter((item) => item.source.includes("github")).map((item) => item.question),
    resumeDeepDiveQuestions: fallbackQuestions(payload).filter((item) => item.source.includes("resume")).map((item) => item.question),
    linkedinBrandingQuestions: ["How does your LinkedIn headline support your target role?"],
    githubCodeReviewQuestions: ["Which repository best proves your coding standards?"],
    nextSteps: ["Update weak profile claims", "Add measurable project impact", "Practice answers on camera"],
  };

  return callAIJson({
    prompt: buildProfileTrainingQuestionPrompt(payload),
    fallback,
    schemaName: "profileTrainingQuestions",
  });
};
