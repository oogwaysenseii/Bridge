import { Resend } from "resend";
import type { EmailProvider, SendEmailInput } from "./email-provider.interface.js";
import { env } from "../config/env.js";

/**
 * Production transactional email via Resend (resend.com). Requires
 * RESEND_API_KEY and EMAIL_FROM — both enforced at startup by env.ts's
 * loadEnv() whenever EMAIL_PROVIDER="resend", not just here.
 *
 * EMAIL_FROM must be an address on a domain verified in the Resend
 * dashboard; Resend rejects sends from unverified domains — that's an
 * account-level setup step, not something this code can validate.
 */
export class ResendEmailProvider implements EmailProvider {
  private readonly client: Resend;
  private readonly fromAddress: string;

  public constructor() {
    // env.RESEND_API_KEY / env.EMAIL_FROM are typed string | undefined
    // (they're conditionally required, not universally so — see env.ts).
    // loadEnv() already guarantees both are present whenever
    // EMAIL_PROVIDER="resend", which is the only way this class gets
    // constructed (see email.factory.ts) — this check exists to give
    // TypeScript an explicit narrowing point and as defense in depth, not
    // because it should ever actually be reachable.
    if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
      throw new Error("ResendEmailProvider requires RESEND_API_KEY and EMAIL_FROM to be configured.");
    }
    this.client = new Resend(env.RESEND_API_KEY);
    this.fromAddress = env.EMAIL_FROM;
  }

  public async send(input: SendEmailInput): Promise<void> {
    // Resend's SDK returns a { data, error } tuple rather than throwing on
    // API-level failures (invalid recipient, unverified domain, rate
    // limit, etc.) — must be checked explicitly, not just awaited.
    const { error } = await this.client.emails.send({
      from: this.fromAddress,
      to: input.to,
      subject: input.subject,
      text: input.text,
      ...(input.html ? { html: input.html } : {}),
    });

    if (error) {
      throw new Error(`Resend failed to send email to ${input.to}: ${error.message}`);
    }
  }
}
