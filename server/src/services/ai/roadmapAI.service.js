import { callAIJson } from "./baseAI.service.js";
import { buildRoadmapPrompt } from "../../ai/prompts/roadmap.prompt.js";

export const generateRoadmapAI = async ({ role, timeline = "4 months" }) => {
  const fallback = {
    role,
    summary: `Personalized ${timeline} roadmap for ${role}.`,
    timeline,
    steps: ["Foundations", "Core projects", "Interview practice", "Portfolio and applications"].map((title, index) => ({
      title,
      description: `Month ${index + 1} focus area for ${role}.`,
      skills: ["Problem solving", "Communication"],
      technologies: role?.toLowerCase().includes("frontend") ? ["React", "Tailwind"] : ["Node.js", "PostgreSQL"],
      courses: ["Role-specific course"],
      certifications: ["Optional relevant certification"],
      projects: ["Portfolio project"],
      order: index + 1,
    })),
  };

  const result = await callAIJson({
    prompt: buildRoadmapPrompt({ targetRole: role, timeline }),
    fallback,
    schemaName: "roadmap",
  });
  const data = result.data || fallback;
  result.data = {
    ...data,
    role: data.role || data.targetRole || role,
    summary: data.summary || `${data.targetRole || role} roadmap for ${data.timeline || timeline}.`,
    steps: data.steps || (data.phases || []).map((phase, index) => ({
      title: phase.phaseTitle || `Phase ${index + 1}`,
      description: `${phase.duration || ""} ${phase.milestones?.join(", ") || ""}`.trim(),
      skills: phase.skills || [],
      technologies: phase.topics || [],
      courses: phase.resources || [],
      certifications: data.certifications || [],
      projects: phase.projects || [],
      order: index + 1,
    })) || fallback.steps,
  };
  return result;
};
