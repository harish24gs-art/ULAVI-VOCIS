import { getSupabase } from "./supabaseService.js";

function referenceNumber() {
  return `ULV-${Date.now().toString(36).toUpperCase()}`;
}

function buildSummary(draft) {
  return [
    `Service: ${draft.serviceType || "Unknown"}`,
    `Pickup: ${draft.pickup || "TBD"}`,
    `Dropoff: ${draft.dropoff || "TBD"}`,
    `Date: ${draft.date || "TBD"}`,
    `Time: ${draft.time || "TBD"}`,
    `Passengers: ${draft.passengers || "TBD"}`,
    draft.equipment ? `Equipment: ${draft.equipment}` : "",
    draft.packageHours ? `Hours: ${draft.packageHours}` : "",
    draft.notes ? `Notes: ${draft.notes}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

export async function saveLead(draft, messages) {
  const reference = referenceNumber();
  const lead = {
    reference_number: reference,
    service_type: draft.serviceType,
    name: draft.name,
    email: draft.email,
    phone: draft.phone,
    language: draft.language,
    summary: buildSummary(draft),
    status: "new",
    metadata: {
      pickup: draft.pickup,
      dropoff: draft.dropoff,
      date: draft.date,
      time: draft.time,
      passengers: draft.passengers,
      equipment: draft.equipment,
      packageHours: draft.packageHours,
      notes: draft.notes
    }
  };

  const supabase = getSupabase();
  if (!supabase) return { reference, lead: { id: reference, ...lead, demo: true } };

  let data;
  const fullInsert = await supabase.from("leads").insert(lead).select("*").single();
  if (fullInsert.error) {
    console.warn("Supabase full lead insert failed, trying compatibility insert:", fullInsert.error.message);
    const compatibleLead = {
      service_type: lead.service_type,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      language: lead.language,
      summary: `${lead.summary}\nReference: ${reference}`,
      status: lead.status
    };
    const compatibleInsert = await supabase.from("leads").insert(compatibleLead).select("*").single();
    if (compatibleInsert.error) {
      console.warn("Supabase compatibility insert failed, returning demo lead:", compatibleInsert.error.message);
      return {
        reference,
        lead: {
          id: reference,
          ...lead,
          demo: true,
          persistence_error: compatibleInsert.error.message
        }
      };
    }
    data = { reference_number: reference, ...compatibleInsert.data };
  } else {
    data = fullInsert.data;
  }

  const rows = messages.map((message) => ({
    lead_id: data.id,
    role: message.role,
    message: message.content
  }));
  if (rows.length) {
    const { error: messageError } = await supabase.from("messages").insert(rows);
    if (messageError) console.warn("Supabase message insert failed:", messageError.message);
  }

  return { reference, lead: data };
}

export async function getLeadByReference(reference) {
  const cleanReference = String(reference || "").trim();
  if (!cleanReference) return { found: false, reference: "", lead: null };

  const supabase = getSupabase();
  if (!supabase) {
    return {
      found: false,
      reference: cleanReference,
      lead: null,
      demo: true,
      message: "Lead storage is not configured in this environment."
    };
  }

  const direct = await supabase
    .from("leads")
    .select("*")
    .eq("reference_number", cleanReference)
    .maybeSingle();

  if (!direct.error && direct.data) {
    return { found: true, reference: cleanReference, lead: direct.data };
  }

  const fallback = await supabase
    .from("leads")
    .select("*")
    .ilike("summary", `%Reference: ${cleanReference}%`)
    .maybeSingle();

  if (!fallback.error && fallback.data) {
    return { found: true, reference: cleanReference, lead: { ...fallback.data, reference_number: cleanReference } };
  }

  return {
    found: false,
    reference: cleanReference,
    lead: null,
    error: direct.error?.message || fallback.error?.message || ""
  };
}
