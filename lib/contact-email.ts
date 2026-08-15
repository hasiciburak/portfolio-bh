import type { Locale } from "@/app/[lang]/dictionaries";

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  /** Which locale the visitor was reading when they wrote. */
  lang?: Locale;
}

/**
 * Everything below is written into an HTML document, and all of it comes from a
 * public form. Escaped at the point of interpolation rather than trusted from
 * validation upstream: the route checks that a name is non-empty and an address
 * has a shape, neither of which says anything about angle brackets.
 */
const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Escaped first, then broken into lines — the other order would escape the tags. */
const toParagraphs = (message: string): string =>
  escapeHtml(message)
    .split(/\n{2,}/)
    .map(
      (block) =>
        `<p style="margin:0 0 14px;line-height:1.6;">${block.replace(/\n/g, "<br />")}</p>`,
    )
    .join("");

const LOCALE_LABEL: Record<string, string> = {
  en: "English",
  tr: "Turkish",
};

/**
 * The contact form's message as an email worth opening.
 *
 * Table-based and inline-styled on purpose: Gmail strips `<style>` blocks from
 * the document head, and Outlook's Word renderer ignores most of what modern CSS
 * would do with a flex column. Tables and inline attributes are what survive both.
 *
 * `text` is not a fallback nobody sees — Gmail's own preview, notification
 * summaries and any plain-text client read it instead of the HTML, so it carries
 * the same facts in the same order.
 */
export const renderContactEmail = ({
  name,
  email,
  message,
  lang,
}: ContactMessage): { html: string; text: string } => {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const locale = lang ? LOCALE_LABEL[lang] : undefined;

  const text = [
    `New message from burakhasici.com`,
    ``,
    `From: ${name} <${email}>`,
    locale ? `Reading in: ${locale}` : null,
    ``,
    message,
    ``,
    `Reply straight to this email — it goes back to ${email}.`,
  ]
    .filter((line) => line !== null)
    .join("\n");

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>New message from burakhasici.com</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;">
    <!-- The line the inbox shows next to the subject, before anything is opened. -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${safeName} &lt;${safeEmail}&gt; wrote through the contact form.</div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e4e7;border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#18181b;">
            <!-- Teal, the site's accent, so the mail is recognisably from the same place. -->
            <tr><td style="height:4px;background:#0d9488;font-size:0;line-height:0;">&nbsp;</td></tr>

            <tr>
              <td style="padding:28px 28px 0;">
                <p style="margin:0;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#71717a;">New message</p>
                <h1 style="margin:8px 0 0;font-size:20px;line-height:1.3;font-weight:700;">burakhasici.com contact form</h1>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 28px 0;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">
                  <tr>
                    <td style="padding:6px 0;color:#71717a;width:88px;">From</td>
                    <td style="padding:6px 0;font-weight:600;">${safeName}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;color:#71717a;">Email</td>
                    <td style="padding:6px 0;"><a href="mailto:${safeEmail}" style="color:#0f766e;text-decoration:underline;">${safeEmail}</a></td>
                  </tr>
                  ${
                    locale
                      ? `<tr>
                    <td style="padding:6px 0;color:#71717a;">Reading in</td>
                    <td style="padding:6px 0;">${locale}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 28px 0;">
                <!-- The message itself, set apart so it is never confused with the
                     header rows above it. -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fafafa;border:1px solid #e4e4e7;border-radius:12px;">
                  <tr>
                    <td style="padding:18px 20px;font-size:15px;color:#27272a;">${toParagraphs(message)}</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:20px 28px 28px;">
                <a href="mailto:${safeEmail}" style="display:inline-block;background:#18181b;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:11px 20px;border-radius:999px;">Reply to ${safeName}</a>
                <p style="margin:14px 0 0;font-size:13px;color:#71717a;line-height:1.5;">Hitting reply works too — this email's reply-to is already set to ${safeEmail}.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, text };
};
