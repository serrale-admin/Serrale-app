export class AppError extends Error {
  public readonly code: string;
  public readonly cause?: unknown;

  constructor(message: string, code = "APP_ERROR", cause?: unknown) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.cause = cause;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Something went wrong. Please try again.";
}
