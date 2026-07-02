const jsonRules = `Return JSON only. Do not use markdown. Do not include explanations outside JSON. Use scores from 0 to 100.`;

export const buildRoadmapPrompt = ({ currentSkills, targetRole, timeline, experienceLevel } = {}) => `
Create a practical career roadmap for a job seeker.
Include skill phases, projects, resources, milestones, and weekly execution.
${jsonRules}

Context:
${JSON.stringify({ currentSkills, targetRole, timeline, experienceLevel }, null, 2)}

JSON shape:
{
  "targetRole": "",
  "timeline": "",
  "roadmapScore": 0,
  "phases": [
    {
      "phaseTitle": "",
      "duration": "",
      "skills": [],
      "topics": [],
      "projects": [],
      "resources": [],
      "milestones": []
    }
  ],
  "certifications": [],
  "finalProjects": [],
  "weeklyPlan": []
}
`;
