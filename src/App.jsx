import FeedbackWidget from './FeedbackWidget.jsx';
import useErrorCapture from './useErrorCapture.js';

export default function App() {
  useErrorCapture();

  return (
    <>
      {/* Demo page content */}
      <div style={{
        maxWidth: 720,
        margin: '80px auto',
        padding: '0 24px',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 14px',
          borderRadius: 20,
          backgroundColor: '#eef2ff',
          color: '#4f46e5',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 16,
        }}>
          Swift Vault
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
          Validator Feedback Widget
        </h1>

        <p style={{ fontSize: 17, color: '#6b7280', lineHeight: 1.6, marginBottom: 40 }}>
          Click the <strong style={{ color: '#4f46e5' }}>💬 button</strong> in the bottom-right corner
          to submit a bug report or feature request. Feedback is sent directly to the
          Software Factory Validator dashboard.
        </p>

        <div style={{
          padding: 24,
          borderRadius: 12,
          backgroundColor: '#fff',
          border: '1px solid #e2e5ea',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Integration Status</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Feedback Widget', status: 'Active' },
              { label: 'Error Capture', status: 'Active' },
              { label: 'API Connection', status: 'Connected' },
            ].map((item) => (
              <div key={item.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: '#f8f9fb',
              }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#16a34a',
                  backgroundColor: '#f0fdf4',
                  padding: '3px 10px',
                  borderRadius: 12,
                }}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={() => { throw new Error('Test error from Swift Vault'); }}
          style={{
            marginTop: 24,
            padding: '10px 20px',
            borderRadius: 8,
            border: '1px solid #e2e5ea',
            backgroundColor: '#fff',
            fontSize: 14,
            cursor: 'pointer',
            color: '#6b7280',
          }}
        >
          Trigger Test Error (auto-captured)
        </button>
      </div>

      {/* Feedback widget — always mounted */}
      <FeedbackWidget />
    </>
  );
}
