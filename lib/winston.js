"use strict";

const appRoot = require("app-root-path");
const config = require(`${appRoot}/lib/config.js`);
const winston = require("winston");
require("winston-mongodb");

const options = {
  console: {
    format: winston.format.simple(),
    level: "debug",
  },
  mongodb: {
    collection: "winston_logs",
    db: config.DATABASE_URL,
    decolorize: true,
    level: "info",
  },
};

const logger = winston.createLogger({
  transports: [
    new winston.transports.MongoDB(options.mongodb),
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


