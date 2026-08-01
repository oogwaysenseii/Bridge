/**
 * The transactional email provider is an open decision (see
 * docs/deployment.md — Resend / Postmark / SES / other, pending input).
 * Rather than blocking Better Auth's email verification / password reset on
 * that decision, or writing a placeholder that does nothing, this interface
 * is the actual contract every adapter — including the dev-only console
 * adapter used right now — implements identically. Swapping in a real
 * vendor later is implementing this interface once, in one new file, and
 * changing EMAIL_PROVIDER in .env. No caller changes.
 */
export interface SendEmailInput {
  to: string;
  subject: string;
  /** Plain text is required; HTML is optional. Never send HTML-only — some
   * clients and all screen readers benefit from a text fallback. */
  text: string;
  html?: string;
}

export interface EmailProvider {
  send(input: SendEmailInput): Promise<void>;
}
