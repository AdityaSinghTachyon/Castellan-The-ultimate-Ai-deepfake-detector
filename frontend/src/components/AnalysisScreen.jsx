import React, { useState, useEffect, useRef } from 'react';
import AdsComponent from './AdsComponent';

// ── Signal Checklist Item ────────────────────────────────────────────────────
const SIGNAL_META = {
  heart:         { icon: '❤️', label: 'Heart Signal' },
  skin:          { icon: '🎨', label: 'Skin Texture' },
  eye_alignment: { icon: '👁', label: 'Eye Alignment' },
  face_structure:{ icon: '🧍', label: 'Face Structure' },
};

function SignalItem({ id, signal }) {
  const meta = SIGNAL_META[id] || { icon: '·', label: id };
  const cls = `status-${signal.status}`;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.85rem',
      padding: '0.7rem 0', borderBottom: '1px solid var(--border-color)',
    }}>
      <span style={{ fontSize: '1.15rem', minWidth: '1.5rem' }}>{meta.icon}</span>
      <span style={{ flex: 1, fontSize: '0.88rem', color: 'var(--text-secondary)', letterSpacing: '0.04em' }}>
        {meta.label}
      </span>
      <span className={cls} style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
        {signal.status}
      </span>
      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', maxWidth: '150px', textAlign: 'right', lineHeight: 1.4 }}>
        {signal.detail}
      </span>
    </div>
  );
}

// ── Marker SVG Overlay ───────────────────────────────────────────────────────
function MarkerOverlay({ markers, resultColor, show }) {
  if (!markers || !show) return null;
  return (
    <>
      {markers.map((m, i) => {
        const size = m.size || 55;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: `${m.coordinates.x}%`,
            top: `${m.coordinates.y}%`,
            transform: 'translate(-50%, -50%)',
            width: `${size}px`,
            height: `${size}px`,
            zIndex: 10,
            opacity: show ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}>
            <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id={`stripe-${i}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <line x1="0" y1="0" x2="0" y2="10" stroke={resultColor} strokeWidth="2" opacity="0.3" />
                </pattern>
              </defs>
              <rect x="2" y="2" width="96" height="96" fill={`url(#stripe-${i})`} stroke={resultColor} strokeWidth="3" rx="2" />
              <polyline points="2,14 2,2 14,2" fill="none" stroke={resultColor} strokeWidth="3" />
              <polyline points="86,2 98,2 98,14" fill="none" stroke={resultColor} strokeWidth="3" />
              <polyline points="2,86 2,98 14,98" fill="none" stroke={resultColor} strokeWidth="3" />
              <polyline points="86,98 98,98 98,86" fill="none" stroke={resultColor} strokeWidth="3" />
            </svg>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              whiteSpace: 'nowrap',
            }}>
              <div style={{ width: '22px', height: '1px', background: resultColor, opacity: 0.7 }} />
              <span style={{
                background: resultColor,
                color: '#080810',
                fontSize: '9px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                padding: '3px 7px',
                borderRadius: '2px',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}>
                {m.label}
              </span>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ── Help / Cyber Safety Panel ─────────────────────────────────────────────────
function HelpPanel({ onClose }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const close = () => { setVisible(false); setTimeout(onClose, 320); };

  const copyNumber = () => {
    navigator.clipboard.writeText('1930').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 600,
        background: 'rgba(8,8,16,0.45)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={close}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '320px', height: '100vh',
          background: '#ffffff',
          color: '#111',
          padding: '2.5rem 2rem',
          overflowY: 'auto',
          borderRight: '1px solid #d0d8e8',
          boxShadow: '4px 0 32px rgba(0,0,0,0.15)',
          transform: visible ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.32s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column', gap: '1.4rem',
        }}
      >
        <button
          onClick={close}
          style={{
            alignSelf: 'flex-end', background: 'transparent', border: 'none',
            cursor: 'pointer', fontSize: '1.2rem', color: '#555', lineHeight: 1,
          }}
        >✕</button>

        <div style={{ borderBottom: '1px solid #e0e6f0', paddingBottom: '1.2rem' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', letterSpacing: '0.14em', color: '#0d0d1a', marginBottom: '0.25rem' }}>
            NEED HELP?
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#8896b0', letterSpacing: '0.12em' }}>CYBER SAFETY SUPPORT</div>
        </div>

        <p style={{ fontSize: '0.85rem', lineHeight: 1.75, color: '#334' }}>
          If you are a victim of cyber fraud or deepfake misuse, report it immediately.
        </p>

        {/* Helpline */}
        <div style={{ background: '#fff8f8', border: '1px solid #f0ccd0', borderRadius: '8px', padding: '1rem 1.1rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#c0444a', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>HELPLINE</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href="tel:1930"
              style={{
                fontSize: '1.6rem', fontWeight: 700, color: '#c0444a',
                textDecoration: 'none', letterSpacing: '0.05em',
                fontFamily: 'var(--font-mono)',
              }}
            >
              📞 1930
            </a>
            <button
              onClick={copyNumber}
              style={{
                background: copied ? '#e8f5e9' : '#f5f5f5',
                border: `1px solid ${copied ? '#a5d6a7' : '#ddd'}`,
                borderRadius: '5px',
                padding: '0.3rem 0.7rem',
                fontSize: '0.68rem',
                fontFamily: 'var(--font-mono)',
                color: copied ? '#4caf50' : '#555',
                cursor: 'pointer',
                transition: 'all 0.2s',
                letterSpacing: '0.05em',
              }}
            >
              {copied ? 'COPIED!' : 'COPY'}
            </button>
          </div>
          <p style={{ fontSize: '0.73rem', color: '#888', marginTop: '0.4rem' }}>Cyber Fraud Helpline — Available 24/7</p>
        </div>

        {/* Link */}
        <div style={{ background: '#f5f8ff', border: '1px solid #dce4f5', borderRadius: '8px', padding: '1rem 1.1rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#4F8EF7', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>REPORT ONLINE</p>
          <a
            href="https://cybercrime.gov.in/Webform/Accept.aspx"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: '0.78rem', color: '#4F8EF7',
              textDecoration: 'underline',
              wordBreak: 'break-all',
              lineHeight: 1.5,
            }}
          >
            cybercrime.gov.in
          </a>
          <p style={{ fontSize: '0.72rem', color: '#888', marginTop: '0.3rem' }}>Opens in new tab ↗</p>
        </div>

        <div style={{ background: '#f8f8f8', border: '1px solid #e8e8e8', borderRadius: '6px', padding: '0.8rem 1rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#556', lineHeight: 1.6 }}>
            📍 Contact your local police station if the situation requires immediate attention.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Printable PDF Report ──────────────────────────────────────────────────────
function PrintReport({ data, timestamp }) {
  const { result, confidence, issues, signals, detailed_analysis_text } = data;
  const isFake = result === 'FAKE';
  return (
    <div id="castellan-print-report" style={{ display: 'none' }}>
      <style>{`
        @media print {
          body > *:not(#castellan-print-report-wrapper) { display: none !important; }
          #castellan-print-report-wrapper { display: block !important; }
          #castellan-print-report { display: block !important; }
          @page { size: A4; margin: 2cm; }
        }
      `}</style>
      <div id="castellan-print-report-wrapper" style={{
        fontFamily: "'Courier New', monospace",
        color: '#111', background: '#fff',
        padding: '2.5cm', maxWidth: '18cm',
      }}>
        {/* Header */}
        <div style={{ borderBottom: '2px solid #111', paddingBottom: '12px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '4px', marginBottom: '2px' }}>CASTELLAN</div>
              <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#555' }}>AI DEEPFAKE ANALYSIS REPORT</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '9px', color: '#555' }}>
              <div>{timestamp}</div>
              <div style={{ marginTop: '2px' }}>AUTH: FUSION-7-X9</div>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div style={{ border: `2px solid ${isFake ? '#d32f2f' : '#2e7d32'}`, borderRadius: '6px', padding: '14px 18px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#555', marginBottom: '4px' }}>VERDICT</div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: isFake ? '#d32f2f' : '#2e7d32', letterSpacing: '4px' }}>{result}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#555', marginBottom: '4px' }}>CONFIDENCE</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: isFake ? '#d32f2f' : '#2e7d32' }}>{confidence}%</div>
          </div>
        </div>

        {/* Analysis */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#555', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>DETAILED ANALYSIS</div>
          <p style={{ fontSize: '11px', lineHeight: 1.7, color: '#222' }}>{detailed_analysis_text}</p>
        </div>

        {/* Issues */}
        {issues && issues.length > 0 && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#555', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>DETECTED ISSUES</div>
            {issues.map((issue, i) => (
              <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: '6px', alignItems: 'flex-start' }}>
                <span style={{ color: isFake ? '#d32f2f' : '#2e7d32', marginTop: '2px' }}>▸</span>
                <span style={{ fontSize: '11px', lineHeight: 1.5 }}>{issue}</span>
              </div>
            ))}
          </div>
        )}

        {/* Human Signals */}
        {signals && (
          <div style={{ marginBottom: '18px' }}>
            <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#555', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>HUMAN SIGNAL ANALYSIS</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Signal</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Status</th>
                  <th style={{ textAlign: 'left', padding: '6px 8px', fontWeight: 600 }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(signals).map(([id, sig]) => {
                  const labels = { heart: 'Heart Signal', skin: 'Skin Texture', eye_alignment: 'Eye Alignment', face_structure: 'Face Structure' };
                  return (
                    <tr key={id} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '6px 8px' }}>{labels[id] || id}</td>
                      <td style={{ padding: '6px 8px', textTransform: 'uppercase', fontWeight: 600, color: sig.status === 'normal' ? '#2e7d32' : sig.status === 'suspicious' ? '#f57c00' : '#d32f2f' }}>{sig.status}</td>
                      <td style={{ padding: '6px 8px', color: '#555' }}>{sig.detail}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div style={{ borderTop: '1px solid #ddd', paddingTop: '12px', fontSize: '9px', color: '#888', display: 'flex', justifyContent: 'space-between' }}>
          <span>CASTELLAN v2.0 — AI Deepfake Detection</span>
          <span>Report generated: {timestamp}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Analysis Screen ─────────────────────────────────────────────────────
const AnalysisScreen = ({ data, onBack }) => {
  const [showResults, setShowResults] = useState(false);
  const [impactPhase, setImpactPhase] = useState('idle'); // idle | flash | fade
  const [showHelp, setShowHelp] = useState(false);

  const { result, confidence, issues, signals, markers, analyzed_image_b64, detailed_analysis_text, cnn_note } = data;
  const isFake = result === 'FAKE';
  const resultColor = isFake ? 'var(--color-fake)' : 'var(--color-real)';
  const resultColorHex = isFake ? '#FF5A6E' : '#3DEBB1';
  const impactRgb = isFake ? '255,90,110' : '61,235,177';

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  useEffect(() => {
    // At 3s: trigger impact flash, at 4s: show results (after impact fades)
    const t1 = setTimeout(() => setImpactPhase('flash'), 3000);
    const t2 = setTimeout(() => setImpactPhase('fade'), 3700);
    const t3 = setTimeout(() => { setImpactPhase('idle'); setShowResults(true); }, 4200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleDownloadReport = () => {
    // Make the hidden print div visible for printing
    const el = document.getElementById('castellan-print-report');
    const wrapper = document.getElementById('castellan-print-report-wrapper');
    if (el) el.style.display = 'block';
    if (wrapper) wrapper.style.display = 'block';
    window.print();
    setTimeout(() => {
      if (el) el.style.display = 'none';
      if (wrapper) wrapper.style.display = 'none';
    }, 1000);
  };

  // Image container shake
  const shakeStyle = impactPhase === 'flash'
    ? { animation: 'result-shake 0.35s ease-in-out' }
    : {};

  // Glow burst
  const glowStyle = impactPhase === 'flash'
    ? { boxShadow: `0 0 60px rgba(${impactRgb},0.55), 0 0 120px rgba(${impactRgb},0.25)` }
    : impactPhase === 'fade'
    ? { boxShadow: `0 0 20px rgba(${impactRgb},0.12)`, transition: 'box-shadow 0.5s ease-out' }
    : { boxShadow: `0 0 40px ${isFake ? 'rgba(255,90,110,0.08)' : 'rgba(61,235,177,0.08)'}` };

  return (
    <>
      <PrintReport data={data} timestamp={timestamp} />

      <div style={{ width: '100%', maxWidth: '1080px', display: 'flex', gap: '2rem', alignItems: 'flex-start', margin: '0 auto', paddingBottom: '4rem' }}>

        {/* ── Left: Main Analysis Content ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>

          {/* Row 1: Detail + Image */}
          <div style={{ display: 'flex', gap: '1.5rem', width: '100%', alignItems: 'flex-start', flexWrap: 'wrap' }}>

            {/* Detail Panel */}
            <div style={{
              display: 'flex', gap: 0, flex: '0 0 auto',
              borderRadius: '8px', overflow: 'hidden',
              border: '1px solid rgba(79,142,247,0.25)',
              maxWidth: '200px', width: '200px',
              alignSelf: 'stretch',
              background: 'rgba(79, 142, 247, 0.07)',
            }}>
              <div style={{
                width: '4px',
                background: 'linear-gradient(180deg, var(--accent-blue), rgba(79,142,247,0.2))',
                flexShrink: 0,
              }} />
              <div style={{ padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.12em', fontWeight: 600 }}>DETAILED ANALYSIS</span>
                <p style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.92)', lineHeight: 1.7, opacity: showResults ? 1 : 0.3, transition: 'opacity 1s' }}>
                  {detailed_analysis_text}
                </p>
                {cnn_note && (
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)', lineHeight: 1.5, borderTop: '1px solid rgba(79,142,247,0.2)', paddingTop: '0.75rem' }}>
                    ENGINE: {cnn_note}
                  </p>
                )}
              </div>
            </div>

            {/* Analyzed Image */}
            <div style={{
              flex: 1, minWidth: '280px', position: 'relative', borderRadius: '8px', overflow: 'hidden',
              border: `1px solid ${isFake ? 'rgba(255,90,110,0.25)' : 'rgba(61,235,177,0.2)'}`,
              transition: 'box-shadow 0.4s ease',
              ...glowStyle,
              ...shakeStyle,
            }}>
              <img
                src={`data:image/jpeg;base64,${analyzed_image_b64}`}
                alt="Analyzed"
                style={{ display: 'block', width: '100%', height: 'auto', opacity: 0.92 }}
              />

              {/* Grid overlay */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
                backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }} />

              {/* Improved dual-layer scan line */}
              {!showResults && impactPhase === 'idle' && (
                <>
                  <div style={{
                    position: 'absolute', left: 0, width: '100%', height: '2px',
                    background: `linear-gradient(90deg, transparent, ${resultColorHex}, transparent)`,
                    boxShadow: `0 0 14px ${resultColorHex}, 0 0 6px ${resultColorHex}`,
                    zIndex: 9,
                    animation: 'scan-pass 1.4s linear 2',
                    animationFillMode: 'forwards',
                  }} />
                  <div style={{
                    position: 'absolute', left: 0, width: '100%', height: '12px',
                    background: `linear-gradient(180deg, transparent, rgba(${impactRgb},0.12), transparent)`,
                    zIndex: 8,
                    animation: 'scan-pass 1.4s linear 2',
                    animationFillMode: 'forwards',
                    marginTop: '2px',
                  }} />
                </>
              )}

              {/* Impact: color overlay */}
              {(impactPhase === 'flash' || impactPhase === 'fade') && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 15, pointerEvents: 'none',
                  background: `rgba(${impactRgb}, ${impactPhase === 'flash' ? 0.22 : 0})`,
                  transition: impactPhase === 'fade' ? 'background 0.5s ease-out' : 'none',
                }} />
              )}

              {/* Impact: center status bar */}
              {(impactPhase === 'flash' || impactPhase === 'fade') && (
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 16, pointerEvents: 'none',
                  background: 'rgba(255,255,255,0.92)',
                  borderRadius: '4px',
                  padding: '0.45rem 1.8rem',
                  opacity: impactPhase === 'flash' ? 1 : 0,
                  transition: impactPhase === 'fade' ? 'opacity 0.5s ease-out' : 'none',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    letterSpacing: '0.2em',
                    color: resultColorHex,
                  }}>{result}</span>
                </div>
              )}

              {showResults && (
                <div style={{
                  position: 'absolute', inset: 0, zIndex: 4,
                  background: 'rgba(255,255,255,0.03)',
                  pointerEvents: 'none',
                }} />
              )}

              <MarkerOverlay markers={markers} resultColor={resultColorHex} show={showResults} />

              <div style={{
                position: 'absolute', top: '0.75rem', right: '0.75rem', zIndex: 12,
                background: isFake ? 'rgba(255,90,110,0.85)' : 'rgba(61,235,177,0.85)',
                color: isFake ? 'white' : '#080810',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.15em',
                padding: '0.25rem 0.65rem',
                borderRadius: '3px',
                opacity: showResults ? 1 : 0,
                transition: 'opacity 0.5s 0.3s',
              }}>
                {result}
              </div>
            </div>
          </div>

          {/* Row 2: Status / Verdict Report Box */}
          <div style={{
            width: '100%', fontFamily: 'var(--font-mono)',
            padding: '1.75rem',
            background: isFake ? 'rgba(255, 90, 110, 0.04)' : 'rgba(61, 235, 177, 0.04)',
            border: `1px solid ${isFake ? 'rgba(255,90,110,0.18)' : 'rgba(61,235,177,0.15)'}`,
            borderRadius: '10px',
            opacity: showResults ? 1 : 0,
            transform: showResults ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s 0.2s, transform 0.6s 0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: `1px dashed ${isFake ? 'rgba(255,90,110,0.22)' : 'rgba(61,235,177,0.18)'}`, paddingBottom: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: isFake ? 'rgba(255,90,110,0.6)' : 'rgba(61,235,177,0.6)', letterSpacing: '0.12em', marginBottom: '0.6rem' }}>STATUS</div>
                <div style={{
                  display: 'inline-block',
                  background: isFake ? 'rgba(255, 90, 110, 0.12)' : 'rgba(61, 235, 177, 0.1)',
                  border: `1px solid ${isFake ? 'rgba(255,90,110,0.3)' : 'rgba(61,235,177,0.25)'}`,
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  padding: '0.3rem 1rem 0.3rem 0.7rem',
                }}>
                  <div style={{ color: resultColor, fontSize: '2.6rem', fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1 }}>{result}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.65rem', color: isFake ? 'rgba(255,90,110,0.6)' : 'rgba(61,235,177,0.6)', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>CONFIDENCE LEVEL</div>
                <div style={{ fontSize: '1.5rem', color: isFake ? 'rgba(255,130,145,0.9)' : 'rgba(61,235,177,0.9)', fontWeight: 600 }}>{confidence}%</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {issues && issues.map((issue, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: '6px', height: '6px', background: isFake ? 'rgba(255,110,125,0.75)' : 'rgba(61,235,177,0.7)', borderRadius: '50%', flexShrink: 0 }} />
                  <span style={{ fontSize: '0.83rem', color: isFake ? 'rgba(255,180,185,0.88)' : 'rgba(180,255,230,0.88)', letterSpacing: '0.02em', lineHeight: 1.45 }}>{issue}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: `1px solid ${isFake ? 'rgba(255,90,110,0.15)' : 'rgba(61,235,177,0.12)'}`, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.62rem', color: isFake ? 'rgba(255,90,110,0.45)' : 'rgba(61,235,177,0.4)', letterSpacing: '0.05em' }}>VOTR_AUTH: FUSION-7-X9</span>
              <span style={{ fontSize: '0.62rem', color: isFake ? 'rgba(255,90,110,0.45)' : 'rgba(61,235,177,0.4)', letterSpacing: '0.05em' }}>{timestamp}</span>
            </div>
          </div>

          {/* Row 3: Human Signal Analysis */}
          <div style={{
            width: '100%', padding: '1.5rem',
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            opacity: showResults ? 1 : 0,
            transform: showResults ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.6s 0.4s, transform 0.6s 0.4s',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: 'rgba(255,255,255,0.75)', letterSpacing: '0.15em', display: 'block', marginBottom: '1.1rem', fontWeight: 600, textTransform: 'uppercase' }}>
              Human Signal Analysis
            </span>
            {signals && Object.entries(signals).map(([id, sig]) => (
              <SignalItem key={id} id={id} signal={sig} />
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', marginTop: '0.5rem',
            opacity: showResults ? 1 : 0,
            transition: 'opacity 0.5s 0.6s',
          }}>
            {/* Download Report */}
            <button
              id="download-report-btn"
              onClick={handleDownloadReport}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.6rem 1.6rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '8px',
                color: 'rgba(255,255,255,0.65)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.68rem',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.22)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              DOWNLOAD REPORT
            </button>

            {/* Perform New Analysis — Refined CTA */}
            <button
              id="new-analysis-btn"
              onClick={onBack}
              style={{
                padding: '0.72rem 2.2rem',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(79,142,247,0.35)',
                borderRadius: '6px',
                color: 'rgba(255,255,255,0.82)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                fontWeight: 500,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 0.22s ease, border-color 0.22s ease, color 0.22s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(79,142,247,0.09)';
                e.currentTarget.style.borderColor = 'rgba(79,142,247,0.65)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.96)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.borderColor = 'rgba(79,142,247,0.35)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.82)';
              }}
              onMouseDown={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.05)'; }}
              onMouseUp={e => { e.currentTarget.style.background = 'rgba(79,142,247,0.09)'; }}
            >
              PERFORM NEW ANALYSIS
            </button>
          </div>
        </div>

        {/* ── Right Column: Ads ── */}
        {showResults && (
          <div className="ads-wrapper" style={{ opacity: showResults ? 1 : 0, transition: 'opacity 1s 0.8s' }}>
            <AdsComponent />
          </div>
        )}

      </div>

      {/* ── Help Button (fixed, bottom-left) ── */}
      <button
        id="help-btn"
        onClick={() => setShowHelp(true)}
        style={{
          position: 'fixed', bottom: '5rem', left: '1.5rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.6)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.62rem',
          letterSpacing: '0.1em',
          padding: '0.5rem 0.85rem',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          transition: 'background 0.2s, color 0.2s, border-color 0.2s',
          zIndex: 100,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        HELP
      </button>

      {showHelp && <HelpPanel onClose={() => setShowHelp(false)} />}
    </>
  );
};

export default AnalysisScreen;
