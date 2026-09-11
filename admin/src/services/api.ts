/**
 * Centralized API Client for InvestLand Admin
 * Ensures all requests are routed through the proxy and handle non-JSON responses gracefully.
 */

const API_BASE = '/api';

export async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const sanitizedUrl = url.startsWith('/') ? url : `/${url}`;
  const fullUrl = sanitizedUrl.startsWith(API_BASE) ? sanitizedUrl : `${API_BASE}${sanitizedUrl}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout for stability

  try {
    const res = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {}),
      }
    });

    clearTimeout(timeoutId);

    const contentType = res.headers.get("content-type") ?? "";

    // Requirement: Check whether the response is JSON before parsing
    if (!contentType.includes("application/json")) {
      const rawText = await res.text();
      console.error(`[Protocol Violation] Received ${contentType} from ${fullUrl}`);
      console.error(`[Snapshot] ${rawText.slice(0, 500)}`);

      throw new Error(
        `Backend Sync Error: Expected JSON but received ${contentType || 'no content'}.
        Check if backend terminal is running on port 5000 and proxy is active.
        Response Snapshot: ${rawText.slice(0, 120) || '[EMPTY BODY]'}`
      );
    }

    const result = await res.json();

    if (!res.ok || result.success === false) {
      throw new Error(result.message || `Terminal Failure (HTTP ${res.status})`);
    }

    return result;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Connection Timeout: The backend terminal (Port 5000) did not respond in time.');
    }
    throw err;
  }
}

export const websiteApi = {
  /**
   * Pings the health terminal for pre-flight verification.
   */
  checkHealth: () => request<{ success: boolean; status: string; port: number; service: string }>('/health'),

  /**
   * Fetches the currently active hero configuration.
   */
  getHero: () => request<{ success: boolean; data: any }>('/hero'),

  /**
   * Deploys modifications to the cloud configuration.
   */
  saveHero: (payload: any) => {
    if (payload.id) {
      return request<{ success: boolean; data: any }>(`/hero/${payload.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      return request<{ success: boolean; data: any }>('/hero', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
  },

  /**
   * Deactivates a specific hero configuration node.
   */
  deleteHero: (id: string) => request<{ success: boolean }> (`/hero/${id}`, {
    method: 'DELETE'
  })
};
