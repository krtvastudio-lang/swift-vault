import { useState, useRef, useEffect } from "react";

/* ───────────────────────────────────────────
   Validator Feedback SDK (inline for widget)
   ─────────────────────────────────────────── */
const FEEDBACK_TYPES = ["bug", "feature_request"];
const PRIORITIES = ["low", "medium", "high"];

const ValidatorFeedback = {
  appKey: "sf-int-EYOtqlP67YbIUkdItcqHLfBmhzaHIiHF",
  endpoint: "https://api.factory.8090.dev/v1/integration/validator/feedback",

  validate(fb) {
    if (!fb.description || fb.description.trim().length === 0)
      return { valid: false, error: "Description is required." };
    if (fb.description.trim().length < 10)
      return { valid: false, error: "Please provide at least 10 characters." };
    if (fb.type && !FEEDBACK_TYPES.includes(fb.type))
      return { valid: false, error: "Invalid feedback type." };
    if (fb.priority && !PRIORITIES.includes(fb.priority))
      return { valid: false, error: "Invalid priority." };
    if (fb.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fb.email))
      return { valid: false, error: "Invalid email address." };
    return { valid: true };
  },

  getPageContext() {
    if (typeof window === "undefined") return "unknown";
    return window.location.pathname || "/";
  },

  async submit(feedback) {
    const v = this.validate(feedback);
    if (!v.valid) throw new Error(v.error);

    const payload = {
      description: feedback.description.trim(),
      feedback_type: feedback.type || "bug",
      priority: feedback.priority || "medium",
      user_email: feedback.email || null,
    };

    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-App-Key": this.appKey,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 429)
        throw new Error("Rate limit exceeded. Please wait before trying again.");
      if (!res.ok) throw new Error(`Submission failed (${res.status}).`);
      return await res.json();
    } catch (err) {
      if (err.name === "TypeError" && err.message === "Failed to fetch")
        throw new Error("Network error. Check your connection.");
      throw err;
    }
  },
};

/* ───────────────────────────────────────────
   Floating Feedback Widget
   ─────────────────────────────────────────── */
const STATUS = { IDLE: "idle", SENDING: "sending", SUCCESS: "success", ERROR: "error" };

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(STATUS.IDLE);
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    description: "",
    type: "bug",
    priority: "medium",
    email: "",
  });
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const reset = () => {
    setForm({ description: "", type: "bug", priority: "medium", email: "" });
    setStatus(STATUS.IDLE);
    setErrorMsg("");
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(STATUS.SENDING);
    setErrorMsg("");

    try {
      await ValidatorFeedback.submit(form);
      setStatus(STATUS.SUCCESS);
      setTimeout(() => { reset(); setOpen(false); }, 2200);
    } catch (err) {
      setErrorMsg(err.message);
      setStatus(STATUS.ERROR);
    }
  };

  /* ── Styles ────────────────────────────── */
  const colors = {
    bg: "#ffffff",
    surface: "#f8f9fb",
    border: "#e2e5ea",
    primary: "#4f46e5",
    primaryHover: "#4338ca",
    text: "#1e2028",
    muted: "#6b7280",
    success: "#16a34a",
    error: "#dc2626",
  };

  const fabStyle = {
    position: "fixed",
    bottom: 24,
    right: 24,
    zIndex: 99999,
    width: 56,
    height: 56,
    borderRadius: "50%",
    border: "none",
    backgroundColor: colors.primary,
    color: "#fff",
    fontSize: 24,
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(79,70,229,.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.2s, background-color 0.2s",
  };

  const panelStyle = {
    position: "fixed",
    bottom: 92,
    right: 24,
    zIndex: 99999,
    width: 360,
    maxHeight: "80vh",
    overflowY: "auto",
    backgroundColor: colors.bg,
    borderRadius: 14,
    boxShadow: "0 12px 40px rgba(0,0,0,.15)",
    border: `1px solid ${colors.border}`,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    animation: "vf-slide-up 0.25s ease-out",
  };

  const headerStyle = {
    padding: "18px 20px 12px",
    borderBottom: `1px solid ${colors.border}`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const inputBase = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1px solid ${colors.border}`,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.15s",
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: colors.text,
    marginBottom: 6,
  };

  const btnStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 8,
    border: "none",
    backgroundColor: colors.primary,
    color: "#fff",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.15s",
  };

  /* ── Render ────────────────────────────── */
  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @keyframes vf-slide-up {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Floating Action Button */}
      <button
        onClick={() => { setOpen((v) => !v); if (status === STATUS.SUCCESS) reset(); }}
        style={fabStyle}
        aria-label={open ? "Close feedback form" : "Open feedback form"}
        title="Send feedback"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Feedback Panel */}
      {open && (
        <div ref={panelRef} style={panelStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <span style={{ fontSize: 16, fontWeight: 700, color: colors.text }}>
              Send Feedback
            </span>
            <span style={{ fontSize: 12, color: colors.muted }}>Swift Vault</span>
          </div>

          {/* Success state */}
          {status === STATUS.SUCCESS ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: colors.success, margin: 0 }}>
                Thanks for your feedback!
              </p>
              <p style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>
                We'll review it shortly.
              </p>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} style={{ padding: "16px 20px 20px" }}>
              {/* Feedback type selector */}
              <fieldset style={{ border: "none", padding: 0, margin: "0 0 16px" }}>
                <legend style={labelStyle}>What kind of feedback?</legend>
                <div style={{ display: "flex", gap: 8 }}>
                  {[
                    { value: "bug", label: "🐛 Bug Report" },
                    { value: "feature_request", label: "✨ Feature Request" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, type: opt.value }))}
                      style={{
                        flex: 1,
                        padding: "8px 4px",
                        borderRadius: 8,
                        border: `2px solid ${form.type === opt.value ? colors.primary : colors.border}`,
                        backgroundColor: form.type === opt.value ? "#eef2ff" : colors.bg,
                        color: form.type === opt.value ? colors.primary : colors.muted,
                        fontSize: 13,
                        fontWeight: form.type === opt.value ? 600 : 400,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              {/* Description */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="vf-desc" style={labelStyle}>
                  Description <span style={{ color: colors.error }}>*</span>
                </label>
                <textarea
                  id="vf-desc"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder={
                    form.type === "bug"
                      ? "What happened? What did you expect?"
                      : "Describe the feature you'd like to see…"
                  }
                  style={{ ...inputBase, resize: "vertical", minHeight: 80 }}
                />
              </div>

              {/* Priority */}
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="vf-priority" style={labelStyle}>Priority</label>
                <select
                  id="vf-priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  style={{ ...inputBase, cursor: "pointer" }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Email (optional) */}
              <div style={{ marginBottom: 20 }}>
                <label htmlFor="vf-email" style={labelStyle}>
                  Email <span style={{ color: colors.muted, fontWeight: 400 }}>(optional)</span>
                </label>
                <input
                  id="vf-email"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={inputBase}
                />
              </div>

              {/* Error banner */}
              {status === STATUS.ERROR && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: 8,
                    backgroundColor: "#fef2f2",
                    border: "1px solid #fecaca",
                    color: colors.error,
                    fontSize: 13,
                    marginBottom: 16,
                  }}
                >
                  {errorMsg}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === STATUS.SENDING}
                style={{
                  ...btnStyle,
                  opacity: status === STATUS.SENDING ? 0.7 : 1,
                  cursor: status === STATUS.SENDING ? "not-allowed" : "pointer",
                }}
              >
                {status === STATUS.SENDING ? "Submitting…" : "Submit Feedback"}
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
}
