/**
 * Review API client — preserves existing backend endpoints exactly.
 * GET  /api/v1/reviews/latest
 * POST /api/v1/analyze-repo  body: { repo_url }
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1";

export function getApiBase() {
  return API_BASE;
}

/**
 * Fetch the latest review payload from the webhook store.
 * Same contract as the original Dashboard loadLatest call.
 */
export async function fetchLatestReview() {
  const response = await fetch(`${API_BASE}/api/v1/reviews/latest`);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const latestPayload = data?.latest || null;
  const storePayload = data?.data || null;
  const reviews = Array.isArray(storePayload)
    ? storePayload
    : storePayload?.reviews || latestPayload?.reviews || data?.reviews || [];
  const basePayload =
    latestPayload || (Array.isArray(storePayload) ? {} : storePayload) || data || {};

  if (reviews.length > 0) {
    return {
      ...basePayload,
      reviews,
    };
  }

  return null;
}

/**
 * Run a lightweight repository analysis.
 * Same contract as the original Dashboard analyzeRepo call.
 */
export async function analyzeRepository(repoUrl) {
  const response = await fetch(`${API_BASE}/api/v1/analyze-repo`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      repo_url: repoUrl,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];

  return { data, reviews };
}
