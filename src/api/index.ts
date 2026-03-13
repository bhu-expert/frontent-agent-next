import type {
  BrandEvent,
  AdVariationsPayload,
  AdVariationsResponse,
  ContextFeedbackPayload,
  ContextFeedbackResponse,
  ContextFeedbackStreamEvent,
} from "@/types/onboarding.types";
import { API_BASE_URL, API_ENDPOINTS } from "@/constants";

const BASE_URL = API_BASE_URL.replace(/\/$/, "");

// ─── Error helper ────────────────────────────────────────────────────

function apiError(message: string, status: number): never {
  throw { message, status } as { message: string; status: number };
}

// ─── Auth endpoints ──────────────────────────────────────────────────

/**
 * Signs up a new user
 */
export async function signUp(
  email: string,
  password: string
): Promise<{ token: string; user_id: string }> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.SIGNUP}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.message || "Sign-up failed", res.status);
  }
  return res.json();
}

/**
 * Signs in an existing user
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ token: string; user_id: string }> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.SIGNIN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.message || "Sign-in failed", res.status);
  }
  return res.json();
}

// ─── Brand SSE stream ────────────────────────────────────────────────

/**
 * Creates an SSE stream for brand discovery (POST)
 */
export async function* createBrandStream(
  url: string,
  brandName: string,
  token?: string
): AsyncGenerator<BrandEvent, void, unknown> {
  const payload = {
    website_url: url,
    name: brandName || "My Brand",
  };

  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.BRANDS}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    apiError(`Failed to create brand: ${res.statusText}`, res.status);
  }

  if (!res.body) {
    apiError("ReadableStream not supported in this browser.", 0);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim() === "") continue;

        let jsonString = line;
        if (line.startsWith("data:")) {
          jsonString = line.slice(5).trim();
        }

        try {
          if (jsonString) {
            const event: BrandEvent = JSON.parse(jsonString);
            yield event;
          }
        } catch {
          // Ignore lines that aren't valid JSON
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

/**
 * Gets the SSE URL for brand discovery (GET utility)
 */
export function getBrandStreamUrl(
  websiteUrl: string,
  name: string = "",
  guardrails?: string
): string {
  const params = new URLSearchParams({
    website_url: websiteUrl,
    name,
  });
  if (guardrails) {
    params.set("guardrails", guardrails);
  }
  return `${BASE_URL}${API_ENDPOINTS.BRANDS}?${params.toString()}`;
}

// ─── Brand context ───────────────────────────────────────────────────

/**
 * Fetches the generated brand context
 */
export async function getBrandContext(
  brandId: string,
  token: string
): Promise<{ context_md: string }> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.BRAND_CONTEXT(brandId)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.message || "Failed to fetch brand context", res.status);
  }
  return res.json();
}

export async function submitContextFeedback(
  brandId: string,
  payload: ContextFeedbackPayload,
  token: string
): Promise<ContextFeedbackResponse> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.BRAND_CONTEXT_FEEDBACK(brandId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.detail || body.message || "Failed to submit context feedback", res.status);
  }

  return res.json();
}

export async function* streamContextFeedback(
  brandId: string,
  payload: ContextFeedbackPayload,
  token: string
): AsyncGenerator<ContextFeedbackStreamEvent, void, unknown> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.BRAND_CONTEXT_FEEDBACK(brandId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.detail || body.message || "Failed to stream context feedback", res.status);
  }

  if (!res.body) {
    apiError("ReadableStream not supported in this browser.", 0);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const rawEvent of events) {
        const lines = rawEvent.split("\n");
        let eventName = "";
        let dataPayload = "";

        for (const line of lines) {
          if (line.startsWith("event: ")) eventName = line.slice(7).trim();
          if (line.startsWith("data: ")) dataPayload += line.slice(6).trim();
        }

        if (!eventName || !dataPayload) continue;

        try {
          yield {
            event: eventName as ContextFeedbackStreamEvent["event"],
            data: JSON.parse(dataPayload),
          };
        } catch {
          // Ignore malformed events
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

// ─── Claim brand ─────────────────────────────────────────────────────

/**
 * Claims a brand for the authenticated user
 */
export async function claimBrand(
  brandId: string,
  token: string
): Promise<void> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.BRAND_CLAIM(brandId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.message || "Failed to claim brand", res.status);
  }
}

// ─── Generate ad variations ──────────────────────────────────────────

/**
 * Generates ad variations for a brand
 */
export async function generateAdVariations(
  brandId: string,
  payload: AdVariationsPayload,
  token: string
): Promise<AdVariationsResponse> {
  const res = await fetch(`${BASE_URL}${API_ENDPOINTS.BRAND_VARIATIONS(brandId)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    apiError(body.message || "Failed to generate ad variations", res.status);
  }
  return res.json();
}
