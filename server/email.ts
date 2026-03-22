import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "Slydar <onboarding@resend.dev>";

function welcomeEmailHtml(name: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to Slydar</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#cc1a1a;padding:36px 40px;text-align:center;">
              <p style="margin:0;font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Slyd<span style="color:rgba(255,255,255,0.75);">ar</span>
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:rgba(255,255,255,0.8);letter-spacing:0.5px;text-transform:uppercase;">
                Interactive Presentations
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#111827;line-height:1.3;">
                Welcome to Slydar, ${name}!
              </h1>
              <p style="margin:0 0 20px;font-size:15px;color:#6b7280;line-height:1.6;">
                We're thrilled to have you on board. Slydar makes it easy to create engaging, interactive presentations that your audience will love — live polls, quizzes, word clouds, and more.
              </p>

              <!-- Features -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;background:#f9fafb;border-radius:8px;padding:20px;">
                <tr>
                  <td style="padding:8px 0;">
                    <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">
                      <span style="color:#cc1a1a;font-weight:600;">&#10003;</span>&nbsp; Live polls &amp; multiple choice questions
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">
                      <span style="color:#cc1a1a;font-weight:600;">&#10003;</span>&nbsp; Real-time word clouds &amp; Q&amp;A
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">
                      <span style="color:#cc1a1a;font-weight:600;">&#10003;</span>&nbsp; Quizzes with leaderboards
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;">
                    <p style="margin:0;font-size:14px;color:#374151;line-height:1.5;">
                      <span style="color:#cc1a1a;font-weight:600;">&#10003;</span>&nbsp; AI-powered slide generation
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="https://slydar.app/dashboard"
                       style="display:inline-block;background-color:#cc1a1a;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;padding:14px 36px;border-radius:8px;letter-spacing:0.2px;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:#9ca3af;line-height:1.5;">
                You're receiving this because you created a Slydar account.
              </p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                &copy; ${new Date().getFullYear()} Slydar. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] RESEND_API_KEY not set — skipping welcome email");
    return;
  }

  if (!email) {
    console.warn("[email] No email address provided — skipping welcome email");
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_ADDRESS,
      to: email,
      subject: "Welcome to Slydar 🎉",
      html: welcomeEmailHtml(name),
    });

    if (error) {
      console.error("[email] Failed to send welcome email:", error);
    } else {
      console.log("[email] Welcome email sent to", email, "— id:", data?.id);
    }
  } catch (err) {
    console.error("[email] Unexpected error sending welcome email:", err);
  }
}
