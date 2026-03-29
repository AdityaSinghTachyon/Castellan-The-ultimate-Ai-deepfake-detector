import { useState, useEffect, useRef } from 'react';
import './index.css';
import './App.css';
import UploadScreen from './components/UploadScreen';
import AnalysisScreen from './components/AnalysisScreen';
import OrbitalSystem from './components/OrbitalSystem';

// ── Fabric Canvas Animation ──────────────────────────────────────────────────
function FabricCanvas({ isFake }) {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);
  const isFakeRef = useRef(isFake);
  const crossScaleRef = useRef({}); // tracks per-dot cross scale for pop-in

  useEffect(() => {
    isFakeRef.current = isFake;
  }, [isFake]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let dots = [];

    const SPACING = 42;
    const BASE_RADIUS = 0.8;
    const MAX_RADIUS = 1.6;
    const INFLUENCE = 160;
    const SPRING = 0.1;

    function buildDots() {
      dots = [];
      crossScaleRef.current = {};
      const cols = Math.ceil(canvas.width / SPACING) + 2;
      const rows = Math.ceil(canvas.height / SPACING) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const key = `${r}_${c}`;
          dots.push({ ox: c * SPACING, oy: r * SPACING, x: c * SPACING, y: r * SPACING, key });
          crossScaleRef.current[key] = 0;
        }
      }
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildDots();
    }

    function drawCross(ctx, x, y, size, alpha) {
      const half = size * 0.75; // Increased size
      ctx.save();
      ctx.strokeStyle = `rgba(255, 60, 70, ${alpha})`;
      ctx.lineWidth = 1.6; // Increased thickness
      ctx.lineCap = 'round';
      ctx.shadowBlur = 8 * alpha; // Neon glow
      ctx.shadowColor = 'rgba(255, 60, 70, 0.8)';
      ctx.beginPath();
      ctx.moveTo(x - half, y - half);
      ctx.lineTo(x + half, y + half);
      ctx.moveTo(x + half, y - half);
      ctx.lineTo(x - half, y + half);
      ctx.stroke();
      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const fake = isFakeRef.current;

      for (const d of dots) {
        const dx = d.ox - mx;
        const dy = d.oy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let r = BASE_RADIUS;
        let alpha = 0.12;
        let color = '140, 100, 240';

        if (dist < INFLUENCE) {
          const t = 1 - dist / INFLUENCE;
          const ease = t * t * (3 - 2 * t);
          const push = ease * 6;
          const angle = Math.atan2(dy, dx);

          d.x += (d.ox + Math.cos(angle) * push - d.x) * 0.2;
          d.y += (d.oy + Math.sin(angle) * push - d.y) * 0.2;

          r = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * ease;
          alpha = 0.12 + 0.28 * ease;

          if (ease > 0.5) color = '61, 214, 245';
        } else {
          d.x += (d.ox - d.x) * SPRING;
          d.y += (d.oy - d.y) * SPRING;
        }

        if (fake) {
          // Animate cross scale from 0 → 1 (pop-in)
          const cs = crossScaleRef.current;
          if (cs[d.key] === undefined) cs[d.key] = 0;
          if (cs[d.key] < 1) cs[d.key] = Math.min(1, cs[d.key] + 0.035);
          const crossAlpha = dist < INFLUENCE ? alpha : 0.13;
          const crossSize = (1.6 + (dist < INFLUENCE ? (MAX_RADIUS - BASE_RADIUS) * (1 - dist / INFLUENCE) * 2 : 0)) * cs[d.key];
          drawCross(ctx, d.x, d.y, crossSize, crossAlpha);
        } else {
          // Reset cross scale so dots re-animate next time isFake becomes true
          if (crossScaleRef.current[d.key]) crossScaleRef.current[d.key] = 0;
          ctx.beginPath();
          ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${alpha})`;
          ctx.shadowBlur = 4 * alpha; // Subtle dot glow
          ctx.shadowColor = `rgba(${color}, 0.6)`;
          ctx.fill();
          ctx.shadowBlur = 0; // reset for next
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    const onMove = (e) => { mouse.current.x = e.clientX; mouse.current.y = e.clientY; };
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMove);

    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return <canvas id="fabric-canvas" ref={canvasRef} />;
}

// ── Scanner Overlay ──────────────────────────────────────────────────────────
function ScannerOverlay({ onClose }) {
  return (
    <div className="scanner-overlay">
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', letterSpacing: '0.2em', color: 'white' }}>
        OVERLAY SCANNER
      </div>
      <div className="scanner-overlay-inner">
        No external media detected on this view.<br />
        Use the main upload interface for deepfake analysis.
      </div>
      <button className="btn-ghost" onClick={onClose}>CLOSE SCANNER</button>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
const API_URL = 'https://castellan-the-ultimate-ai-deepfake.onrender.com'; // Production backend

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationWarning, setValidationWarning] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('INITIALIZING SCAN...');
  const [backendStatus, setBackendStatus] = useState('CHECKING'); // For debugging status
  const pendingFileRef = useRef(null);

  const loadingMessages = [
    'INITIALIZING SCAN...',
    'LOADING CNN MODEL...',
    'EXTRACTING FEATURES...',
    'ANALYZING HEURISTICS...',
    'COMPUTING FUSION SCORE...',
    'GENERATING REPORT...',
  ];

  useEffect(() => {
    // Ping backend on mount to verify connection
    const ping = async () => {
      try {
        const res = await fetch(`${API_URL}/`);
        if (res.ok) setBackendStatus('ONLINE');
        else setBackendStatus('ERROR');
      } catch {
        setBackendStatus('OFFLINE');
      }
    };
    ping();
  }, []);

  useEffect(() => {
    if (!isLoading) return;
    let i = 0;
    const iv = setInterval(() => {
      i = (i + 1) % loadingMessages.length;
      setLoadingMsg(loadingMessages[i]);
    }, 900);
    return () => clearInterval(iv);
  }, [isLoading]);

  const handleStartAnalysis = async (file) => {
    setIsLoading(true);
    setLoadingMsg('VALIDATING IMAGE...');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const vRes = await fetch(`${API_URL}/validate`, { method: 'POST', body: formData });
      if (vRes.ok) {
        const vData = await vRes.json();
        if (!vData.isValid) {
          setIsLoading(false);
          setValidationWarning({ file, reason: vData.reason });
          return;
        }
      }
      proceedToAnalysis(file);
    } catch {
      proceedToAnalysis(file);
    }
  };

  const proceedToAnalysis = async (file) => {
    setValidationWarning(null);
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/analyze`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setAnalysisData(data);
    } catch (err) {
      console.error('Fetch Error:', err);
      alert(`Error: Could not reach the analysis server at ${API_URL}.\n\nPlease ensure your local Python backend is running:\npython -m uvicorn main:app`);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => { setAnalysisData(null); setValidationWarning(null); };

  const showLanding = !analysisData && !isLoading && !validationWarning;

  const isFake = analysisData?.result === 'FAKE';

  return (
    <>
      <FabricCanvas isFake={isFake} />
      <OrbitalSystem />
      <div className="faint-background-trace" />

      <div className="app-shell">
        {/* ── Header ── */}
        <header className="brand-header">
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              cursor: 'default',
              transition: 'transform 0.25s ease, filter 0.25s ease',
              borderRadius: '8px',
              padding: '0.2rem 0.5rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.filter = 'brightness(1.12) drop-shadow(0 0 10px rgba(79,142,247,0.22))';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.filter = 'none';
            }}
          >
            <div className="brand-logo">
              <img src={`${import.meta.env.BASE_URL}biometric-trace.jpg`} alt="Castellan Logo" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="brand-name" style={{ fontSize: '1.35rem' }}>CASTELLAN</span>
              <span style={{ fontSize: '0.6rem', color: backendStatus === 'ONLINE' ? 'var(--color-real)' : 'var(--color-warn)', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                SYSTEM: {backendStatus}
              </span>
            </div>
          </div>
          <span className="brand-tag">v2.0 · DEEPFAKE ANALYSIS</span>
        </header>

        {/* ── Main Content ── */}
        <main className="app-content">
          {showLanding && <UploadScreen onUpload={handleStartAnalysis} />}

          {validationWarning && (
            <div className="glass-panel validation-card">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-warn)" strokeWidth="1.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h2>FACE VALIDATION</h2>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                This does not appear to be a clear human face. Deepfake analysis works best on facial data.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', lineHeight: 1.5 }}>
                {validationWarning.reason}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Do you want to continue?
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem' }}>
                <button className="btn-ghost" onClick={reset}>UPLOAD NEW</button>
                <button className="btn-primary" onClick={() => proceedToAnalysis(validationWarning.file)}>CONTINUE</button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="loading-state">
              <div className="loading-ring" />
              <p className="loading-text">{loadingMsg}</p>
            </div>
          )}

          {analysisData && !isLoading && (
            <AnalysisScreen data={analysisData} onBack={reset} />
          )}
        </main>

        {/* ── Landing Footer ── */}
        {showLanding && (
          <>
            <div className="landing-footer">
              Castellan is a one-click AI detection system that uses advanced methods like rPPG and visual analysis to identify deepfake and AI-generated media easily.
            </div>
            <div className="landing-bar" />
          </>
        )}

        {/* ── Floating Scanner ── */}
        <button
          className="float-scanner"
          title="Double-tap to open overlay scanner"
          onDoubleClick={() => setScannerOpen(true)}
          aria-label="Open overlay scanner"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M2 9h20M2 14h20" strokeDasharray="3 3" opacity="0.5"/>
            <circle cx="12" cy="19" r="1" fill="white" />
            <path d="M8 22h8" />
          </svg>
        </button>

        {scannerOpen && <ScannerOverlay onClose={() => setScannerOpen(false)} />}
      </div>
    </>
  );
}

export default App;
