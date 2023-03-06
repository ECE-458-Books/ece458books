/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-explicit-any */

//import { createWriteStream } from "fs";
const pino = require("pino");

export const logger = pino({
  transport: {
    target: "pino-pretty",
  },
  level: "debug",
  stream: process.stderr,
});
