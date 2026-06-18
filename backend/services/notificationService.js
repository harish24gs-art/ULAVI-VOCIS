import sendgrid from "@sendgrid/mail";
import twilio from "twilio";

function normalizeWhatsApp(phone) {
  const value = String(phone || "").trim();
  if (value.startsWith("whatsapp:")) return value;
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `whatsapp:+91${digits}`;
  return `whatsapp:+${digits}`;
}

function textForLead(lead) {
  const meta = lead.metadata || {};
  return [
    `ULAVI VOCIS | Travel Request ${lead.reference_number || lead.id || "new"}`,
    "",
    `[OK] Status: Request received`,
    `[USER] Name: ${lead.name || "Pending"}`,
    `[SERVICE] Service: ${lead.service_type || "Pending"}`,
    `[ROUTE] Journey: ${meta.pickup || "Pending"} -> ${meta.dropoff || "Pending"}`,
    `[TIME] Date & Time: ${meta.date || "Pending"} at ${meta.time || "Pending"}`,
    `[PAX] Passengers: ${meta.passengers || "Pending"}`,
    `[PHONE] Phone: ${lead.phone || "Pending"}`,
    `[EMAIL] Email: ${lead.email || "Pending"}`,
    "",
    `Next steps: Our operations team will review this request and send a quotation within 24 hours.`,
    "",
    lead.summary || "",
    "",
    "ULAVI VOCIS - AI Travel Concierge"
  ].join("\n");
}

function htmlForLead(lead) {
  const meta = lead.metadata || {};
  const ref = lead.reference_number || lead.id || "new";
  const rows = [
    ["Service", lead.service_type || "Pending"],
    ["Journey", `${meta.pickup || "Pending"} -> ${meta.dropoff || "Pending"}`],
    ["Date", meta.date || "Pending"],
    ["Pickup Time", meta.time || "Pending"],
    ["Passengers", meta.passengers || "Pending"],
    ["Name", lead.name || "Pending"],
    ["WhatsApp", lead.phone || "Pending"],
    ["Email", lead.email || "Pending"]
  ];

  return `<!doctype html>
  <html>
    <body style="margin:0;background:#020713;font-family:Inter,Arial,sans-serif;color:#f8fafc;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#020713;padding:28px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;border:1px solid rgba(148,163,184,.22);border-radius:28px;background:linear-gradient(135deg,#071326,#0b1730);overflow:hidden;box-shadow:0 28px 90px rgba(0,0,0,.35);">
              <tr>
                <td style="padding:30px 30px 18px;">
                  <div style="font-size:13px;letter-spacing:.22em;color:#d7b46a;font-weight:800;">ULAVI VOCIS</div>
                  <h1 style="margin:18px 0 8px;font-size:30px;line-height:1.15;color:#ffffff;">Request received successfully</h1>
                  <p style="margin:0;color:#cbd5e1;font-size:16px;line-height:1.7;">Your AI travel concierge request is with our operations team. We will contact you shortly.</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 30px 24px;">
                  <div style="border:1px solid rgba(59,130,246,.35);background:rgba(37,99,235,.14);border-radius:20px;padding:18px 20px;">
                    <div style="font-size:12px;letter-spacing:.16em;color:#93c5fd;text-transform:uppercase;font-weight:800;">Reference Number</div>
                    <div style="margin-top:8px;font-family:Consolas,monospace;font-size:26px;color:#6ee7b7;font-weight:900;">${ref}</div>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 30px 10px;">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                    ${rows.map(([label, value]) => `
                      <tr>
                        <td style="padding:13px 0;border-bottom:1px solid rgba(148,163,184,.16);color:#94a3b8;font-size:13px;">${label}</td>
                        <td style="padding:13px 0;border-bottom:1px solid rgba(148,163,184,.16);color:#ffffff;font-size:15px;font-weight:700;text-align:right;">${value}</td>
                      </tr>
                    `).join("")}
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:18px 30px 30px;">
                  <div style="border-radius:18px;background:rgba(15,23,42,.72);padding:18px;color:#cbd5e1;line-height:1.7;">
                    <strong style="color:#ffffff;">What happens next?</strong><br />
                    1. Operations review your request.<br />
                    2. A personalized quotation is prepared.<br />
                    3. Confirmation is sent by email and WhatsApp within 24 hours.
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function escapePdfText(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
}

function wrapLine(line, width = 92) {
  const words = String(line || "").split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

function buildConversationPdf(lead, messages = []) {
  const meta = lead.metadata || {};
  const transcript = [
    "ULAVI VOCIS - Conversation Transcript",
    `Reference: ${lead.reference_number || lead.id || "new"}`,
    `Service: ${lead.service_type || "Pending"}`,
    `Journey: ${meta.pickup || "Pending"} -> ${meta.dropoff || "Pending"}`,
    `Date & Time: ${meta.date || "Pending"} at ${meta.time || "Pending"}`,
    `Customer: ${lead.name || "Pending"} | ${lead.phone || "Pending"} | ${lead.email || "Pending"}`,
    "",
    "Conversation",
    ...messages.map((message, index) => `${index + 1}. ${String(message.role || "user").toUpperCase()}: ${message.content || message.message || ""}`)
  ];

  const lines = transcript.flatMap((line) => wrapLine(line)).slice(0, 110);
  const content = [
    "BT",
    "/F1 10 Tf",
    "48 780 Td",
    "14 TL",
    ...lines.map((line, index) => `${index === 0 ? "" : "T*"}(${escapePdfText(line)}) Tj`)
  ].join("\n") + "\nET";

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}endstream`
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(pdf, "utf8");
}

function describeProviderError(err) {
  const status = err?.code || err?.response?.statusCode || err?.statusCode;
  const body = err?.response?.body;
  const providerMessage = Array.isArray(body?.errors)
    ? body.errors.map((item) => item.message).filter(Boolean).join("; ")
    : body?.message;
  const message = providerMessage || err.message || "Unknown provider error";
  return status ? `${message} (${status})` : message;
}

async function sendEmailNotifications(lead, conversationMessages = []) {
  if (!process.env.SENDGRID_API_KEY) return "Skipped: SendGrid not configured";
  sendgrid.setApiKey(process.env.SENDGRID_API_KEY);

  const from = process.env.SENDGRID_FROM_EMAIL;
  const ops = process.env.OPERATIONS_EMAIL;
  if (!from) return "Skipped: SENDGRID_FROM_EMAIL not configured";
  const subject = `Ulavi booking request ${lead.reference_number || lead.id || "new"}`;
  const text = textForLead(lead);
  const html = htmlForLead(lead);
  const messages = [];

  if (lead.email) messages.push({ to: lead.email, from, subject: "Your Ulavi travel request is confirmed", text, html });
  if (ops) {
    const pdf = buildConversationPdf(lead, conversationMessages);
    messages.push({
      to: ops,
      from,
      subject,
      text,
      html,
      attachments: [
        {
          content: pdf.toString("base64"),
          filename: `${lead.reference_number || lead.id || "ulavi"}-conversation.pdf`,
          type: "application/pdf",
          disposition: "attachment"
        }
      ]
    });
  }
  if (!messages.length) return "Skipped: no email recipients";

  await sendgrid.send(messages);
  return "Sent";
}

async function sendWhatsAppNotifications(lead) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return "Skipped: Twilio not configured";
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) return "Skipped: TWILIO_WHATSAPP_FROM not configured";
  const body = textForLead(lead);
  const targets = [normalizeWhatsApp(lead.phone), process.env.OPERATIONS_WHATSAPP].filter(Boolean);
  if (!targets.length) return "Skipped: no WhatsApp recipients";

  await Promise.all(targets.map((to) => client.messages.create({ from, to, body })));
  return "Sent";
}

export async function sendLeadNotifications(lead, conversationMessages = []) {
  const result = {};
  try {
    result.email = await sendEmailNotifications(lead, conversationMessages);
  } catch (err) {
    result.email = `Failed: ${describeProviderError(err)}`;
  }
  try {
    result.whatsapp = await sendWhatsAppNotifications(lead);
  } catch (err) {
    result.whatsapp = `Failed: ${describeProviderError(err)}`;
  }
  return result;
}
