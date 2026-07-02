const riskLevel = (riskScore) => (riskScore >= 70 ? "high" : riskScore >= 40 ? "medium" : "low");

export const calculateLoginRisk = ({ failedAttempts = 0, ipChange = false, deviceChange = false, lastLoginMinutesAgo = 1440 } = {}) => {
  const reasons = [];
  let riskScore = Math.min(40, Number(failedAttempts || 0) * 10);
  if (ipChange) {
    riskScore += 20;
    reasons.push("New IP address detected");
  }
  if (deviceChange) {
    riskScore += 20;
    reasons.push("New device detected");
  }
  if (lastLoginMinutesAgo < 5 && failedAttempts > 0) {
    riskScore += 15;
    reasons.push("Repeated activity in a short time window");
  }
  riskScore = Math.min(100, riskScore);
  return { riskScore, riskLevel: riskLevel(riskScore), reasons };
};

export const getPermissionScore = (userRole = "USER", requiredRole = "USER") => {
  const ranks = { USER: 1, ADMIN: 2 };
  return (ranks[String(userRole).toUpperCase()] || 0) >= (ranks[String(requiredRole).toUpperCase()] || 1) ? 100 : 0;
};

export const isSuspiciousAuthActivity = (authEvents = []) => {
  if (!Array.isArray(authEvents) || !authEvents.length) return { suspicious: false, riskScore: 0, reasons: [] };
  const failedAttempts = authEvents.filter((event) => event.status === "FAILED" || event.failed).length;
  const uniqueIps = new Set(authEvents.map((event) => event.ip).filter(Boolean)).size;
  const risk = calculateLoginRisk({ failedAttempts, ipChange: uniqueIps > 2, deviceChange: new Set(authEvents.map((event) => event.device).filter(Boolean)).size > 2 });
  return { suspicious: risk.riskScore >= 40, ...risk };
};

export const calculateModerationRisk = (text = "") => {
  const unsafeWords = ["spam", "scam", "hack", "password", "leak"];
  const value = typeof text === "string" ? text.toLowerCase() : "";
  const matches = unsafeWords.filter((word) => value.includes(word));
  const riskScore = Math.min(100, matches.length * 25);
  return { riskScore, riskLevel: riskLevel(riskScore), reasons: matches };
};

export const detectHardcodedSecrets = (fileContents = []) => {
  const contents = Array.isArray(fileContents) ? fileContents : [fileContents];
  const patterns = [/api[_-]?key\s*=/i, /secret\s*=/i, /password\s*=/i, /token\s*=/i, /sk_live_/i];
  return contents.flatMap((content, index) => patterns.filter((pattern) => pattern.test(String(content))).map((pattern) => ({ fileIndex: index, pattern: pattern.toString() })));
};
