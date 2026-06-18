const jsonHeaders = { "Content-Type": "application/json" };

async function parseResponse(response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || "Request failed");
  }
  return body;
}

export async function sendMessage(payload) {
  const response = await fetch("/api/conversation/message", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function sendVoice(payload) {
  const response = await fetch("/api/conversation/voice", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function submitLead(payload) {
  const response = await fetch("/api/leads", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function fetchLeadByReference(reference) {
  const response = await fetch(`/api/leads/${encodeURIComponent(reference)}`);
  return parseResponse(response);
}
