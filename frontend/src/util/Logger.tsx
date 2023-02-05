import { Logger } from "tslog";
import { createStream } from "rotating-file-stream";

// The logger to be used globally
export const logger = new Logger();

// Save logs to file
const stream = createStream("tslog.log", {
  size: "100M", // rotate every 100 MegaBytes written
  interval: "7d", // rotate weekly
  compress: "gzip", // compress rotated files
});

logger.attachTransport((logObj) => {
  stream.write(JSON.stringify(logObj) + "\n");
});
