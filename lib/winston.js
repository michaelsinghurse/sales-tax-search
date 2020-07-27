"use strict";

const appRoot = require("app-root-path");
const winston = require("winston");

const options = {
  file: {
    level: "info",
    filename: `${appRoot}/logs/app.log`,
    format: winston.format.json(),
    maxsize: 5242880, // 5 MB
  },
  console: {
    level: "debug",
    format: winston.format.simple(),
  },
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.File(options.file),
    new winston.transports.Console(options.console),
  ],
  exitOnError: false,
});

logger.stream = {
  write: function(message, encoding) {
    logger.info(message);
  },
};

module.exports = logger;
