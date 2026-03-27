import emailjs from "@emailjs/nodejs";

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey) {
    console.warn("[email] EmailJS credentials not set — skipping welcome email");
    return;
  }

  if (!email) {
    console.warn("[email] No email address provided — skipping welcome email");
    return;
  }

  try {
    const response = await emailjs.send(
      serviceId,
      templateId,
      {
        to_name: name,
        to_email: email,
        from_name: "Slydar",
        reply_to: "support@slydar.app",
      },
      {
        publicKey,
        privateKey,
      }
    );

    console.log("[email] Welcome email sent to", email, "— status:", response.status, response.text);
  } catch (err: any) {
    console.error("[email] Failed to send welcome email:", err?.text ?? err?.message ?? err);
  }
}
