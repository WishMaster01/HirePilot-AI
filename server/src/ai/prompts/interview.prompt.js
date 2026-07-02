const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100 where useful.`;

export const buildInterviewQuestionPrompt = ({ role, experience, interviewType, difficulty, company, techStack } = {}) => `
Generate realistic mock interview questions for a candidate.
Make questions practical, role-specific, and suitable for placement preparation.
${jsonRules}

Context:
${JSON.stringify({ role, experience, interviewType, difficulty, company, techStack }, null, 2)}

JSON shape:
{
  "interviewTitle": "",
  "questions": [
    {
      "question": "",
      "type": "",
      "difficulty": "",
      "expectedAnswerPoints": [],
      "evaluationCriteria": []
    }
  ]
}
`;

export const buildInterviewFeedbackPrompt = ({ question, answer, role, interviewType } = {}) => `
Evaluate this interview answer fairly and professionally.
Give actionable feedback for a student or job seeker.
${jsonRules}

Context:
${JSON.stringify({ question, answer, role, interviewType }, null, 2)}

JSON shape:
{
  "score": 0,
  "communicationScore": 0,
  "technicalScore": 0,
  "confidenceScore": 0,
  "strengths": [],
  "weaknesses": [],
  "idealAnswer": "",
  "improvementTips": [],
  "followUpQuestions": []
}
`;

export const buildContextualVideoInterviewPrompt = ({
  targetRole,
  experienceLevel,
  interviewType,
  difficulty,
  resumeText,
  linkedInProfile,
  githubUrl,
  githubProjects,
  techStack,
  focusAreas,
} = {}) => `
Create a personalized AI video mock interview plan using the candidate's resume, LinkedIn, GitHub, projects, technical stack, and target role.
Questions must reference the candidate's actual evidence where available.
Include behavioral, technical, project-deep-dive, resume-deep-dive, and communication-focused questions.
${jsonRules}

Candidate context:
${JSON.stringify({ targetRole, experienceLevel, interviewType, difficulty, resumeText, linkedInProfile, githubUrl, githubProjects, techStack, focusAreas }, null, 2)}

JSON shape:
{
  "assistantPersona": "",
  "contextSummary": "",
  "interviewTitle": "",
  "questions": [
    {
      "question": "",
      "source": "",
      "type": "",
      "difficulty": "",
      "expectedAnswerPoints": [],
      "followUps": [],
      "evaluationCriteria": [],
      "timeLimit": 90
    }
  ],
  "videoInterviewTips": [],
  "riskAreas": [],
  "openingPrompt": ""
}
`;

export const buildProfileTrainingQuestionPrompt = ({
  targetRole,
  experienceLevel,
  resumeText,
  linkedInProfile,
  githubUrl,
  githubProjects,
  techStack,
  weakAreas,
  targetCompanies,
} = {}) => `
Create a training question bank and preparation plan using resume analysis, LinkedIn profile, GitHub projects, technical stack, weak areas, and target companies.
Make it useful for students and job seekers preparing for placements and global interviews.
Questions must be grouped by source and topic.
${jsonRules}

Candidate context:
${JSON.stringify({ targetRole, experienceLevel, resumeText, linkedInProfile, githubUrl, githubProjects, techStack, weakAreas, targetCompanies }, null, 2)}

JSON shape:
{
  "trainingTitle": "",
  "readinessScore": 0,
  "contextSummary": "",
  "topicBuckets": [
    {
      "topic": "",
      "source": "",
      "priority": "",
      "questions": [
        {
          "question": "",
          "difficulty": "",
          "whyAsked": "",
          "idealAnswerPoints": [],
          "practiceTask": ""
        }
      ]
    }
  ],
  "dailyPracticePlan": [],
  "projectDeepDiveQuestions": [],
  "resumeDeepDiveQuestions": [],
  "linkedinBrandingQuestions": [],
  "githubCodeReviewQuestions": [],
  "nextSteps": []
}
`;
