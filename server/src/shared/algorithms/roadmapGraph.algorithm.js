export const buildSkillGraph = (skillsWithPrerequisites = []) => {
  const graph = new Map();
  (Array.isArray(skillsWithPrerequisites) ? skillsWithPrerequisites : []).forEach(({ skill, prerequisites = [] }) => {
    if (!skill) return;
    if (!graph.has(skill)) graph.set(skill, new Set());
    prerequisites.forEach((pre) => {
      if (!graph.has(pre)) graph.set(pre, new Set());
      graph.get(pre).add(skill);
    });
  });
  return graph;
};

// Kahn topological sort gives prerequisite-safe learning order for a DAG.
export const topologicalSortSkills = (skillGraph) => {
  if (!(skillGraph instanceof Map)) return [];
  const indegree = new Map([...skillGraph.keys()].map((key) => [key, 0]));
  skillGraph.forEach((neighbors) => neighbors.forEach((neighbor) => indegree.set(neighbor, (indegree.get(neighbor) || 0) + 1)));
  const queue = [...indegree.entries()].filter(([, degree]) => degree === 0).map(([node]) => node);
  const result = [];
  while (queue.length) {
    const node = queue.shift();
    result.push(node);
    (skillGraph.get(node) || []).forEach((neighbor) => {
      indegree.set(neighbor, indegree.get(neighbor) - 1);
      if (indegree.get(neighbor) === 0) queue.push(neighbor);
    });
  }
  return result;
};

export const generateLearningPath = (targetRole = "", knownSkills = [], requiredSkills = []) => {
  const known = new Set((Array.isArray(knownSkills) ? knownSkills : []).map(String));
  const missingSkills = (Array.isArray(requiredSkills) ? requiredSkills : []).filter((skill) => !known.has(String(skill)));
  return { targetRole, knownSkills: [...known], missingSkills, learningPath: missingSkills };
};

export const findPrerequisiteChain = (skillGraph, targetSkill) => {
  if (!(skillGraph instanceof Map) || !targetSkill) return [];
  const reversed = new Map();
  skillGraph.forEach((neighbors, node) => neighbors.forEach((neighbor) => reversed.set(neighbor, [...(reversed.get(neighbor) || []), node])));
  const result = [];
  const visit = (skill) => (reversed.get(skill) || []).forEach((pre) => {
    visit(pre);
    if (!result.includes(pre)) result.push(pre);
  });
  visit(targetSkill);
  return [...result, targetSkill];
};
