const logger =
  (level: string) =>
  (message?: any, ...optionalParams: any[]) =>
    console.log(`[${level}] ${message}`, ...optionalParams);

const debug = logger("DEBUG");
const info = logger("INFO");
const error = logger("ERROR");

export { debug, info, error };
