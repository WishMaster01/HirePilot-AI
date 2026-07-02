import prisma from "../config/prisma.js";
import { errorResponse } from "../shared/apiResponse.js";
import { getPermissionScore } from "../shared/algorithms/securityRisk.algorithm.js";

export const attachPrismaUser = async (req, res, next) => {
  try {
    if (!req.userId) {
      return errorResponse(res, "Authentication required", "Missing authenticated user.", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId },
    });

    if (!user || !user.isActive) {
      return errorResponse(res, "Authentication required", "User not found.", 401);
    }

    req.prismaUser = user;
    req.prismaUserId = user.id;
    next();
  } catch (error) {
    next(error);
  }
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.prismaUser) {
    return errorResponse(res, "Authentication required", "Missing authenticated user.", 401);
  }

  const hasRequiredRole = roles.some((role) => getPermissionScore(req.prismaUser.role, role) === 100);

  if (!hasRequiredRole) {
    return errorResponse(res, "Forbidden", "You do not have permission to access this resource.", 403);
  }

  next();
};
