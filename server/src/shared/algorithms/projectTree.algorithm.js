export const traverseProjectTree = (fileTree = []) => {
  const paths = [];
  const visit = (node, prefix = "") => {
    if (!node) return;
    const path = `${prefix}${node.name || ""}`;
    if (node.type !== "directory") paths.push(path);
    (node.children || []).forEach((child) => visit(child, `${path}/`));
  };
  (Array.isArray(fileTree) ? fileTree : [fileTree]).forEach((node) => visit(node));
  return paths.filter(Boolean);
};

export const detectProjectLayers = (filePaths = []) => {
  const paths = Array.isArray(filePaths) ? filePaths : [];
  return {
    frontend: paths.some((path) => /src\/.*\.(jsx|tsx|css)$|client/i.test(path)),
    backend: paths.some((path) => /server|controller|routes|service/i.test(path)),
    database: paths.some((path) => /prisma|schema|migration|models?/i.test(path)),
    tests: paths.some((path) => /test|spec/i.test(path)),
  };
};

export const detectMissingProjectFiles = (filePaths = []) => {
  const paths = (Array.isArray(filePaths) ? filePaths : []).map((path) => path.toLowerCase());
  return ["readme.md", "package.json", ".env.example"].filter((required) => !paths.some((path) => path.endsWith(required)));
};

export const calculateArchitectureScore = (projectStructure = {}) => {
  const layers = detectProjectLayers(projectStructure.filePaths || projectStructure.paths || []);
  const missing = detectMissingProjectFiles(projectStructure.filePaths || projectStructure.paths || []);
  return Math.max(0, Math.min(100, Object.values(layers).filter(Boolean).length * 22 + Math.max(0, 12 - missing.length * 4)));
};
