import logger from "../utils/logger.js";

export const requestLogger = (req, res, next) => {
  const { method, originalUrl, body, query } = req;
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info(`${method} ${originalUrl} ${res.statusCode} - ${duration}ms`, {
      query,
      body,
      status: res.statusCode,
      duration,
    });
  });

  next();
};
