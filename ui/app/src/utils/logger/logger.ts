type LogLevel = "error" | "warn" | "info" | "debug";

type LogReporter = (
  level: LogLevel,
  message: unknown,
  ...details: unknown[]
) => void;

const isDev = import.meta.env.DEV;

let reporter: LogReporter | null = null;

export const setLogReporter = (next: LogReporter | null) => {
  reporter = next;
};

const emit = (level: LogLevel, message: unknown, details: unknown[]) => {
  if (isDev) {
    console[level](message, ...details);
  }

  reporter?.(level, message, ...details);
};

export const logger = {
  error: (message: unknown, ...details: unknown[]) =>
    emit("error", message, details),
  warn: (message: unknown, ...details: unknown[]) =>
    emit("warn", message, details),
  info: (message: unknown, ...details: unknown[]) =>
    emit("info", message, details),
  debug: (message: unknown, ...details: unknown[]) =>
    emit("debug", message, details),
};
