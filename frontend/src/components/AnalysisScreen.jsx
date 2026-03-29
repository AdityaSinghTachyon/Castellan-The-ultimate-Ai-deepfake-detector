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
      padding: '0.6rem 0', borderBottom: '1px solid var(--border-color)',
    }}>
      <span style={{ fontSize: '1.1rem', minWidth: '1.5rem' }}>{meta.icon}</span>
      <span style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
        {meta.label}
      </span>
      <span className={cls} style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {signal.status}
      </span>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', maxWidth: '140px', textAlign: 'right', lineHeight: 1.3 }}>
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
            {/* Striped bounding box */}
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

            {/* Connector line + label */}
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

// ── Main Analysis Screen ─────────────────────────────────────────────────────
const AnalysisScreen = ({ data, onBack }) => {
  const [showResults, setShowResults] = useState(false);

  const { result, confidence, issues, signals, markers, analyzed_image_b64, detailed_analysis_text, cnn_note } = data;
  const isFake = result === 'FAKE';
  const resultColor = isFake ? 'var(--color-fake)' : 'var(--color-real)';
  const resultColorHex = isFake ? '#FF5A6E' : '#3DEBB1';

  useEffect(() => {
    const timer = setTimeout(() => setShowResults(true), 3200);
    return () => clearTimeout(timer);
  }, []);

  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

  return (
    <div style={{ width: '100%', maxWidth: '1080px', display: 'flex', gap: '2rem', alignItems: 'flex-start', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* ── Left: Main Analysis Content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
        
        {/* Row 1: Detail + Image */}
        <div style={{ display: 'flex', gap: '1.5rem', width: '100%', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          
          {/* Detail Panel */}
          <div style={{
            display: 'flex', gap: 0, flex: '0 0 auto',
            borderRadius: '8px', overflow: 'hidden',
            border: '1px solid var(--border-color)',
            maxWidth: '200px', width: '200px',
            alignSelf: 'stretch',
            background: 'var(--glass-bg)',
          }}>
            <div style={{
              width: '4px',
              background: 'linear-gradient(180deg, var(--color-warn), rgba(245,200,66,0.3))',
              flexShrink: 0,
            }} />
            <div style={{ padding: '1.2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.12em' }}>DETAILED ANALYSIS</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', lineHeight: 1.65, opacity: showResults ? 1 : 0.3, transition: 'opacity 1s' }}>
                {detailed_analysis_text}
              </p>
              {cnn_note && (
                <p style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', lineHeight: 1.5, borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  ENGINE: {cnn_note}
                </p>
              )}
            </div>
          </div>

          {/* Analyzed Image */}
          <div style={{ flex: 1, minWidth: '280px', position: 'relative', borderRadius: '8px', overflow: 'hidden',
            border: `1px solid ${isFake ? 'rgba(255,90,110,0.25)' : 'rgba(61,235,177,0.2)'}`,
            boxShadow: `0 0 40px ${isFake ? 'rgba(255,90,110,0.08)' : 'rgba(61,235,177,0.08)'}`,
          }}>
            <img
              src={`data:image/jpeg;base64,${analyzed_image_b64}`}
              alt="Analyzed"
              style={{ display: 'block', width: '100%', height: 'auto', opacity: 0.92 }}
            />
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3,
              backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }} />
            {!showResults && (
              <div style={{
                position: 'absolute', left: 0, width: '100%', height: '3px',
                background: `linear-gradient(90deg, transparent, ${resultColorHex}, transparent)`,
                boxShadow: `0 0 12px ${resultColorHex}`,
                zIndex: 8,
                animation: 'scan-pass 1.5s linear 2',
                animationFillMode: 'forwards',
              }} />
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

        {/* Row 2: Checklist */}
        <div style={{
          width: '100%', padding: '1.5rem',
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          opacity: showResults ? 1 : 0,
          transform: showResults ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.6s 0.2s, transform 0.6s 0.2s',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.15em', display: 'block', marginBottom: '1rem' }}>
            HUMAN SIGNAL ANALYSIS
          </span>
          {signals && Object.entries(signals).map(([id, sig]) => (
            <SignalItem key={id} id={id} signal={sig} />
          ))}
        </div>

        {/* Row 3: Report Box */}
        <div style={{
          width: '100%', fontFamily: 'var(--font-mono)',
          padding: '1.75rem',
          background: 'var(--glass-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '10px',
          opacity: showResults ? 1 : 0,
          transform: showResults ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.6s 0.4s, transform 0.6s 0.4s',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px dashed var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>STATUS</div>
              <div style={{ color: resultColor, fontSize: '2rem', fontWeight: 700, letterSpacing: '0.12em', lineHeight: 1 }}>{result}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>CONFIDENCE LEVEL</div>
              <div style={{ fontSize: '1.4rem', color: 'var(--text-primary)', fontWeight: 500 }}>{confidence}%</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {issues && issues.map((issue, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ width: '6px', height: '6px', background: resultColor, borderRadius: '50%' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', letterSpacing: '0.02em' }}>{issue}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>VOTR_AUTH: FUSION-7-X9</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>{timestamp}</span>
          </div>
        </div>

        <button className="btn-ghost" onClick={onBack} style={{ marginTop: '1rem' }}>
          PERFORM NEW ANALYSIS
        </button>
      </div>

      {/* ── Right Column: Ads ── */}
      {showResults && (
        <div className="ads-wrapper" style={{ opacity: showResults ? 1 : 0, transition: 'opacity 1s 0.8s' }}>
          <AdsComponent />
        </div>
      )}

    </div>
  );
};

export default AnalysisScreen;
