import type { ErrorHandler } from "hono";
import { z, ZodError } from "zod";
import { AppError } from "./app-error";
import { logger } from "../observability/logger";

const HTTP_BAD_REQUEST = 400;
/** Used both as the "is this a server error worth logging loudly" threshold and as the actual status for the generic fallback response below — same value, two related purposes. */
const HTTP_INTERNAL_SERVER_ERROR = 500;

/**
 * Registered once via `app.onError(errorHandler)` in src/index.ts.
 * Route and service code should throw AppError (or a ZodError, which we
 * translate here) rather than returning ad hoc error shapes — this keeps
 * every error response consistent across the whole API.
 */
export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    if (err.httpStatus >= HTTP_INTERNAL_SERVER_ERROR) {
      logger.error({ err, code: err.code }, "Unhandled AppError reached the client boundary");
    }
    return c.json(
      { error: { code: err.code, message: err.userMessage } },
      err.httpStatus as 400 | 401 | 403 | 404 | 409 | 429 | 500,
    );
  }

  if (err instanceof ZodError) {
    // .flatten() is deprecated as of Zod 4, in favor of the top-level
    // z.flattenError() — same { formErrors, fieldErrors } shape, so
    // .fieldErrors access below is unchanged. Not z.treeifyError(): that
    // replaces the *other* deprecated method, .format(), and returns an
    // incompatible nested { properties, items } shape with no
    // .fieldErrors — verified against zod.dev's own error-formatting docs.
    return c.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          issues: z.flattenError(err).fieldErrors,
        },
      },
      HTTP_BAD_REQUEST,
    );
  }

  // Anything else is a genuine bug — log with full detail, never leak internals to the client.
  logger.error({ err }, "Unexpected error");
  return c.json(
    { error: { code: "INTERNAL_ERROR", message: "Something went wrong on our end." } },
    HTTP_INTERNAL_SERVER_ERROR,
  );
};
