export const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const error = new Error(result.error.issues.map((issue) => issue.message).join(", "));
    error.statusCode = 400;
    next(error);
    return;
  }
  req.body = result.data;
  next();
};
