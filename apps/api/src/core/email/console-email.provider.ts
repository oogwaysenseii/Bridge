import type { EmailProvider, SendEmailInput } from "./email-provider.interface";
import { logger } from "../observability/logger";
import { env } from "../config/env";

/**
 * Logs the email instead of sending it. This is the correct default for
 * local development and for any environment where EMAIL_PROVIDER=console,
 * and it is explicitly rejected as the production default below — a real
 * vendor adapter is required before shipping password-reset/verification
 * emails to real users.
 */
export class ConsoleEmailProvider implements EmailProvider {
  public constructor() {
    if (env.NODE_ENV === "production") {
      throw new Error(
        "ConsoleEmailProvider must not be used in production. Configure EMAIL_PROVIDER " +
          "to a real vendor (see docs/deployment.md) once one is selected.",
      );
    }
  }

  public async send(input: SendEmailInput): Promise<void> {
    logger.info(
      { to: input.to, subject: input.subject, text: input.text },
      "📧 [console email provider] Would have sent email",
    );
    await Promise.resolve();
  }
}
