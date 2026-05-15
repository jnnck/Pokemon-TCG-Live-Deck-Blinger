type GtagFn = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: GtagFn;
    dataLayer?: unknown[];
  }
}

const MEASUREMENT_ID = "G-5NT4L8NZBF";

export function trackPageView(path: string, title: string): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", "page_view", {
    page_title: title,
    page_location: `${window.location.origin}${window.location.pathname}${path}`,
    page_path: path,
    send_to: MEASUREMENT_ID,
  });
}

export function trackEvent(name: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, { send_to: MEASUREMENT_ID, ...(params ?? {}) });
}
