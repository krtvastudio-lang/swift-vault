import { useEffect } from "react";

/**
 * Validator Feedback – Automatic Error Capture Hook
 *
 * Listens for unhandled JavaScript errors and unhandled promise rejections,
 * then submits them as high-priority bug reports to the Validator API.
 *
 * Usage:
 *   import useErrorCapture from './useErrorCapture';
 *
 *   function App() {
 *     useErrorCapture();        // call once at the root of your app
 *     return <YourApp />;
 *   }
 */

const APP_KEY = "sf-int-EYOtqlP67YbIUkdItcqHLfBmhzaHIiHF";
const ENDPOINT = "https://api.factory.8090.dev/v1/integration/validator/feedback";

// Simple deduplication: skip identical errors within a 60-second window
const recentErrors = new Map();
const DEDUP_WINDOW_MS = 60_000;

function isDuplicate(key) {
  const now = Date.now();
  if (recentErrors.has(key) && now - recentErrors.get(key) < DEDUP_WINDOW_MS) {
    return true;
  }
  recentErrors.set(key, now);
  return false;
}

async function reportError(description) {
  if (!description || description.length < 10) return;
  if (isDuplicate(description)) return;

  const payload = {
    description,
    feedback_type: "bug",
    priority: "high",
    user_email: null,
  };

  try {
    await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Key": APP_KEY,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    // Silently fail — we don't want error reporting to cause more errors
  }
}

export default function useErrorCapture() {
  useEffect(() => {
    const onError = (event) => {
      const page = window.location.pathname || "/";
      const msg = event.message || "Unknown error";
      reportError(`[Auto] JS Error on ${page}: ${msg}`);
    };

    const onUnhandledRejection = (event) => {
      const page = window.location.pathname || "/";
      const reason =
        event.reason instanceof Error
          ? event.reason.message
          : String(event.reason || "Unknown rejection");
      reportError(`[Auto] Unhandled Promise Rejection on ${page}: ${reason}`);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);
}
