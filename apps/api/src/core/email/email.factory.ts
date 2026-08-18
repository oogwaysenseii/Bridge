import type { EmailProvider } from "./email-provider.interface.js";
import { ConsoleEmailProvider } from "./console-email.provider.js";
import { ResendEmailProvider } from "./resend-email.provider.js";
import { env } from "../config/env.js";

/**
 * Resolves to the configured EmailProvider implementation. "console" and
 * "resend" are implemented; "postmark" and "ses" remain reserved but
 * unimplemented (see docs/deployment.md). Selecting an unimplemented
 * provider fails loudly at startup rather than silently falling back — a
 * misconfigured production deploy should never look like it's sending
 * email when it isn't.
 */
export function createEmailProvider(): EmailProvider {
  switch (env.EMAIL_PROVIDER) {
    case "console":
      return new ConsoleEmailProvider();
    case "resend":
      return new ResendEmailProvider();
    case "postmark":
    case "ses":
      throw new Error(
        `EMAIL_PROVIDER="${env.EMAIL_PROVIDER}" is not implemented yet. ` +
          "Implement the EmailProvider interface for this vendor once docs/deployment.md's " +
          "open decision is resolved.",
      );
  }
}

export const emailProvider: EmailProvider = createEmailProvider();
