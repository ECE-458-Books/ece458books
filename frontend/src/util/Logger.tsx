/* eslint-disable @typescript-eslint/no-explicit-any */

class CustLogger {
  debug(...args: any[]) {
    console.log(args);
  }

  error(...args: any[]) {
    console.error(args);
  }
}

export const logger = new CustLogger();

/* To be used to save logging files
logger.attachTransport((logObj) => {
  appendFileSync("logs.txt", JSON.stringify(logObj) + "\n");
});*/
