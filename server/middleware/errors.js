export function notFound(_req, res) {
  res.status(404).json({ error: { code: "NOT_FOUND", message: "The requested resource was not found." } });
}

export function errorHandler(error, _req, res, _next) {
  if (error?.name === "ZodError") return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Check the submitted information.", details: error.issues } });
  if (error?.code === "P2002") return res.status(409).json({ error: { code: "ALREADY_EXISTS", message: "That value is already in use." } });
  if (error?.code === "LIMIT_FILE_SIZE") return res.status(413).json({ error: { code: "FILE_TOO_LARGE", message: "Choose an image under 5 MB." } });
  if (error?.status === 503) return res.status(503).json({ error: { code: "SERVICE_UNAVAILABLE", message: error.message } });
  if (process.env.NODE_ENV !== "production") console.error(error);
  res.status(500).json({ error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } });
}
