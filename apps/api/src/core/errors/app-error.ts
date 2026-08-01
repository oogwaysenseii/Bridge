/**
 * Every domain-level error thrown anywhere in the API extends AppError.
 * Route handlers never construct raw HTTP error responses by hand — they
 * throw one of these, and the error-handler middleware (see
 * error-handler.middleware.ts) maps it to a status code in exactly one
 * place. This is what api.md means by "the mapping to HTTP status is
 * centralized so it isn't reinvented per route."
 */
export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

const STATUS_BY_CODE: Record<AppErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
};

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly httpStatus: number;
  /** Safe to show to the end user. Distinct from `message`, which may be more technical / for logs. */
  public readonly userMessage: string;

  public constructor(code: AppErrorCode, message: string, userMessage?: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.httpStatus = STATUS_BY_CODE[code];
    this.userMessage = userMessage ?? message;
    Error.captureStackTrace(this, AppError);
  }
}

export class NotFoundError extends AppError {
  public constructor(resource: string, id: string) {
    super("NOT_FOUND", `${resource} not found: ${id}`, `${resource} could not be found.`);
    this.name = "NotFoundError";
  }
}

export class ForbiddenError extends AppError {
  public constructor(message = "You don't have permission to do that.") {
    super("FORBIDDEN", message, message);
    this.name = "ForbiddenError";
  }
}

export class UnauthorizedError extends AppError {
  public constructor(message = "You need to sign in to do that.") {
    super("UNAUTHORIZED", message, message);
    this.name = "UnauthorizedError";
  }
}

export class ValidationError extends AppError {
  public constructor(message: string) {
    super("VALIDATION_ERROR", message, message);
    this.name = "ValidationError";
  }
}

export class ConflictError extends AppError {
  public constructor(message: string) {
    super("CONFLICT", message, message);
    this.name = "ConflictError";
  }
}

export class RateLimitedError extends AppError {
  public constructor(retryAfterSeconds: number) {
    super(
      "RATE_LIMITED",
      `Rate limit exceeded, retry after ${retryAfterSeconds}s`,
      "You're doing that too much. Please wait a moment and try again.",
    );
    this.name = "RateLimitedError";
  }
}
