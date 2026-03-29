import React, { useCallback, useState, useEffect } from 'react';

const UploadScreen = ({ onUpload }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);

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

  // ── Preview State ──
  if (selectedFile) {
    return (
      <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        {/* Preview */}
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
          {/* File info tag */}
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

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-ghost" onClick={cancel}>CANCEL</button>
          <button className="btn-primary" onClick={() => onUpload(selectedFile)}>START ANALYSIS</button>
        </div>
      </div>
    );
  }

  // ── Drop Zone ──
  return (
    <div style={{ width: '100%', maxWidth: '560px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
      {/* Heading */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
          DEEPFAKE DETECTION
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', letterSpacing: '0.05em' }}>
          Upload an image or video for AI-driven biometric analysis.
        </p>
      </div>

      {/* Drop zone */}
      <div
        style={{
          width: '100%', height: '280px',
          border: `1px dashed ${isDragActive ? 'var(--accent-purple)' : 'rgba(255,255,255,0.12)'}`,
          borderRadius: '16px',
          background: isDragActive ? 'rgba(155,110,250,0.05)' : 'var(--glass-bg)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem',
          position: 'relative', cursor: 'pointer',
          transition: 'border-color 0.25s, background 0.25s',
          boxShadow: isDragActive ? '0 0 30px rgba(155,110,250,0.12) inset' : 'none',
        }}
        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(155,110,250,0.6)" strokeWidth="1.2" strokeLinecap="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
            Drag &amp; drop file here
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            or click to browse · JPG, PNG, MP4, MOV
          </p>
        </div>
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
  );
};

export default UploadScreen;
