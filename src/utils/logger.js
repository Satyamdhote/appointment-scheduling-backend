import winston from "winston";

// Custom formatter that adds any extra metadata (like req.query, req.body)
const logFormat = winston.format.printf(
  ({ level, message, timestamp, ...meta }) => {
    let metaInfo = "";

    // If there is extra meta (e.g. from logger.info("message", metaObj))
    if (meta && Object.keys(meta).length > 0) {
      metaInfo = JSON.stringify(meta);
    }

    return `${timestamp} ${level}: ${message} ${metaInfo}`;
  }
);

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [new winston.transports.Console()],
});

export default logger;
