import crypto from "crypto";
import prisma from "../../config/prisma.js";
import genToken from "../../config/token.js";

export const hashPassword = (
  password,
  salt = crypto.randomBytes(16).toString("hex"),
) => {
  const hash = crypto.scryptSync(String(password), salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash = "") => {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(
    Buffer.from(hash, "hex"),
    Buffer.from(candidate, "hex"),
  );
};

export const setAuthCookie = async (res, userId) => {
  const token = await genToken(userId);
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const toList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};

const boundedScore = (count, base = 45, step = 7) =>
  Math.max(0, Math.min(98, base + count * step));

export const buildCareerScores = (profile = {}) => {
  const skills = toList(profile.skills || profile.techStack);
  const projects = toList(profile.projects);
  const interests = toList(profile.interests);
  return {
    careerDnaScore: boundedScore(skills.length + projects.length, 38, 7),
    skillGapScore: Math.max(
      5,
      100 - boundedScore(skills.length + projects.length, 32, 6),
    ),
    employabilityScore: boundedScore(projects.length + skills.length, 42, 6),
    readinessScore: boundedScore(skills.length + interests.length, 40, 6),
  };
};

export const recommendedRoles = (profile = {}) => {
  const skills = toList(profile.skills || profile.techStack);
  const hasReact = skills.some((skill) =>
    skill.toLowerCase().includes("react"),
  );
  const hasNode = skills.some((skill) => skill.toLowerCase().includes("node"));
  return [
    {
      role: hasReact ? "Frontend Developer" : "Software Developer",
      score: hasReact ? 88 : 72,
      reasons: ["Skill overlap", "Portfolio fit"],
    },
    {
      role: hasNode ? "Backend Developer" : "Full Stack Developer",
      score: hasNode ? 84 : 76,
      reasons: ["API experience", "Project depth"],
    },
    {
      role: "AI Product Engineer",
      score: 70 + Math.min(18, skills.length * 2),
      reasons: ["Career-tech platform context", "AI workflow exposure"],
    },
  ];
};

export const getProfilePayload = (body = {}) => ({
  education: body.education,
  techStack: toList(body.techStack || body.skills),
  projects: toList(body.projects),
  experience: body.experience,
  interests: toList(body.interests),
});

export const createResumeRecord = async (req, defaults = {}) =>
  prisma.resume.create({
    data: {
      userId: req.prismaUserId,
      title:
        defaults.title ||
        req.body.title ||
        req.file?.originalname ||
        "Untitled resume",
      content:
        defaults.content || req.body.content || req.body.resumeText || "",
      fileUrl: req.file?.path,
      fileName: req.file?.originalname,
      fileType: req.file?.mimetype,
      fileSize: req.file?.size,
    },
  });

export const resolveResume = async (req) => {
  if (req.body.resumeId) {
    const resume = await prisma.resume.findFirst({
      where: { id: req.body.resumeId, userId: req.prismaUserId },
    });
    if (resume) return resume;
  }
  return createResumeRecord(req);
};
