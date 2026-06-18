import { z } from "zod";
import { getLeadByReference, saveLead } from "../services/leadService.js";
import { sendLeadNotifications } from "../services/notificationService.js";

const leadSchema = z.object({
  draft: z.record(z.any()),
  messages: z.array(z.record(z.any())).default([])
});

export async function createLead(req, res, next) {
  try {
    const { draft, messages } = leadSchema.parse(req.body);
    const saved = await saveLead(draft, messages);
    const notifications = await sendLeadNotifications(saved.lead, messages);
    res.status(201).json({
      reference: saved.reference,
      lead: saved.lead,
      notifications
    });
  } catch (err) {
    console.error("Lead submission fallback:", err);
    const reference = `ULV-${Date.now().toString(36).toUpperCase()}`;
    const draft = req.body?.draft || {};
    const fallbackLead = {
      id: reference,
      reference_number: reference,
      service_type: draft.serviceType,
      name: draft.name,
      email: draft.email,
      phone: draft.phone,
      language: draft.language,
      summary: [
        `Service: ${draft.serviceType || "Unknown"}`,
        `Pickup: ${draft.pickup || "TBD"}`,
        `Dropoff: ${draft.dropoff || "TBD"}`,
        `Date: ${draft.date || "TBD"}`,
        `Time: ${draft.time || "TBD"}`,
        `Passengers: ${draft.passengers || "TBD"}`
      ].join("\n"),
      demo: true,
      persistence_error: err.message
    };
    const notifications = await sendLeadNotifications(fallbackLead, req.body?.messages || []);
    res.status(201).json({
      reference,
      lead: fallbackLead,
      notifications
    });
  }
}

export async function getLead(req, res, next) {
  try {
    const result = await getLeadByReference(req.params.reference);
    if (!result.found) {
      res.status(404).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}
