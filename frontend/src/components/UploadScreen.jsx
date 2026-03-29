import React, { useCallback, useState, useEffect, useRef } from 'react';

// ── About Us Panel ────────────────────────────────────────────────────────────
function AboutPanel({ onClose }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

  const close = () => { setVisible(false); setTimeout(onClose, 320); };

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
        {/* Close */}
        <button
          onClick={close}
          style={{
            alignSelf: 'flex-end', background: 'transparent', border: 'none',
            cursor: 'pointer', fontSize: '1.2rem', color: '#555', lineHeight: 1,
          }}
        >✕</button>

        {/* Logo row */}
        <div style={{ borderBottom: '1px solid #e0e6f0', paddingBottom: '1.2rem' }}>
          <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', letterSpacing: '0.18em', color: '#0d0d1a', marginBottom: '0.25rem' }}>
            CASTELLAN
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#8896b0', letterSpacing: '0.12em' }}>AI DEEPFAKE DETECTION SYSTEM</div>
        </div>

        {/* About section */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', letterSpacing: '0.1em', color: '#1a1a2e', marginBottom: '0.85rem', borderLeft: '3px solid #4F8EF7', paddingLeft: '0.6rem' }}>
            About Castellan
          </h2>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.75, color: '#334', marginBottom: '1rem' }}>
            Castellan is an AI-based deepfake detection system designed to help users identify fake or manipulated media.
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#556', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>IT ANALYZES:</p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {['Facial patterns', 'Skin consistency', 'Visual blending', 'Physiological signals (rPPG)'].map(item => (
              <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', fontSize: '0.83rem', color: '#334' }}>
                <span style={{ width: '5px', height: '5px', background: '#4F8EF7', borderRadius: '50%', flexShrink: 0 }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ borderTop: '1px solid #e0e6f0', paddingTop: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#556', letterSpacing: '0.05em', marginBottom: '0.4rem' }}>GOAL</p>
          <p style={{ fontSize: '0.83rem', lineHeight: 1.7, color: '#334' }}>
            To make AI detection simple, understandable, and accessible to everyone.
          </p>
        </div>

        <div style={{ background: '#f5f8ff', border: '1px solid #dce4f5', borderRadius: '6px', padding: '0.8rem 1rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#8896b0', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>NOTE</p>
          <p style={{ fontSize: '0.8rem', color: '#445', lineHeight: 1.6 }}>
            This project is currently in testing phase.
          </p>
        </div>

        <div style={{ borderTop: '1px solid #e0e6f0', paddingTop: '1rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: '#8896b0', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>MADE BY</p>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1a1a2e', lineHeight: 1.9 }}>
            Aditya Singh<br />
            Harshit Jha
          </p>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e8edf5' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: '#aab', letterSpacing: '0.08em' }}>
            CASTELLAN v2.0 · AI DEEPFAKE ANALYSIS
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Upload Screen ─────────────────────────────────────────────────────────────
const UploadScreen = ({ onUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      setIsVideo(selectedFile.type.startsWith('video'));
      return () => URL.revokeObjectURL(url);
    }
  }, [selectedFile]);

  const handleDrag = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    if (!selectedFile) {
      if (e.type === 'dragenter' || e.type === 'dragover') setIsDragActive(true);
      else if (e.type === 'dragleave') setIsDragActive(false);
    }
  }, [selectedFile]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragActive(false);
    if (!selectedFile && e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  }, [selectedFile]);

  const handleChange = (e) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const cancel = () => { setSelectedFile(null); setPreviewUrl(null); setIsVideo(false); };

  // Glow intensity based on state
  const glowOpacity = isDragActive ? 0.28 : isHovered ? 0.16 : 0.07;
  const glowColor = isDragActive ? '155,110,250' : '79,142,247';
  const borderColor = isDragActive
    ? 'rgba(155,110,250,0.65)'
    : isHovered
    ? 'rgba(79,142,247,0.4)'
    : 'rgba(255,255,255,0.12)';

  // ── Preview State ──
  if (selectedFile) {
    return (
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{
          width: '100%', borderRadius: '12px', overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'var(--glass-bg)',
          position: 'relative',
        }}>
          {isVideo ? (
            <video src={previewUrl} controls style={{ width: '100%', display: 'block', maxHeight: '360px', objectFit: 'contain' }} />
          ) : (
            <img src={previewUrl} alt="Preview" style={{ width: '100%', display: 'block', maxHeight: '400px', objectFit: 'contain' }} />
          )}
          <div style={{
            position: 'absolute', bottom: '0.75rem', left: '0.75rem',
            background: 'rgba(8,8,16,0.75)',
            border: '1px solid var(--border-color)',
            padding: '0.3rem 0.75rem',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.65rem',
            color: 'var(--text-secondary)',
            backdropFilter: 'blur(8px)',
          }}>
            {selectedFile.name} · {(selectedFile.size / 1024).toFixed(0)} KB
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-ghost" onClick={cancel}>CANCEL</button>
          <button className="btn-primary" onClick={() => onUpload(selectedFile)}>START ANALYSIS</button>
        </div>
      </div>
    );
  }

  // ── Drop Zone ──
  return (
    <>
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2.4rem', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
            AI — Deepfake Detection
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
            Upload an image or video for AI-driven biometric analysis.
          </p>
        </div>

        {/* Drop zone */}
        <div
          style={{
            width: '100%', height: '280px',
            border: `1px dashed ${borderColor}`,
            borderRadius: '16px',
            background: isDragActive
              ? 'rgba(155,110,250,0.07)'
              : isHovered
              ? 'rgba(79,142,247,0.04)'
              : 'var(--glass-bg)',
            backgroundImage: `radial-gradient(ellipse at 50% 40%, rgba(${glowColor},0.06) 0%, transparent 70%)`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
            position: 'relative', cursor: 'pointer',
            overflow: 'hidden',
            transition: 'border-color 0.3s, background 0.3s, box-shadow 0.3s, transform 0.3s',
            transform: isHovered ? 'scale(1.012)' : 'scale(1)',
            boxShadow: `0 0 ${isDragActive ? 50 : isHovered ? 35 : 20}px rgba(${glowColor},${glowOpacity}), inset 0 0 40px rgba(${glowColor},${glowOpacity * 0.6})`,
          }}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
        >
          {/* Floating icon */}
          <svg
            width="42" height="42" viewBox="0 0 24 24"
            fill="none" stroke="rgba(155,110,250,0.7)" strokeWidth="1.2" strokeLinecap="round"
            style={{ animation: 'float-icon 3.5s ease-in-out infinite' }}
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>

          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: '0.3rem', letterSpacing: '0.06em', opacity: 0.9 }}>
              Drag &amp; drop file here
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              or click to browse · JPG, PNG, MP4, MOV
            </p>
          </div>

          {/* Very slow scan line */}
          <div style={{
            position: 'absolute', left: 0, width: '100%', height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(79,142,247,0.35), transparent)',
            animation: 'scan-slow 6s linear infinite',
            pointerEvents: 'none',
          }} />

          <input
            type="file" accept="image/*,video/*"
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
            onChange={handleChange}
          />
        </div>

        {/* Supported formats */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {['JPG', 'PNG', 'WEBP', 'MP4', 'MOV'].map(f => (
            <span key={f} style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
              color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
              padding: '0.2rem 0.5rem', borderRadius: '3px',
            }}>{f}</span>
          ))}
        </div>
      </div>

      {/* ── About Us Button ── */}
      <button
        id="about-us-btn"
        onClick={() => setShowAbout(true)}
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
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        ABOUT US
      </button>

      {showAbout && <AboutPanel onClose={() => setShowAbout(false)} />}
    </>
  );
};

export default UploadScreen;
