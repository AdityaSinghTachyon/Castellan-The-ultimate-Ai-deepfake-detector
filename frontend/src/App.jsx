import { useState, useEffect, useRef } from 'react';
import './index.css';
import './App.css';
import UploadScreen from './components/UploadScreen';
import AnalysisScreen from './components/AnalysisScreen';

// ── Fabric Canvas Animation ──────────────────────────────────────────────────
function FabricCanvas() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let dots = [];

    const SPACING = 42;
    const BASE_RADIUS = 0.8;
    const MAX_RADIUS = 1.6;   // very subtle expansion
    const INFLUENCE = 160;    // wider influence for ultra-fluid gradient
    const SPRING = 0.1;       // snappier but still fluid

    function buildDots() {
      dots = [];
      const cols = Math.ceil(canvas.width / SPACING) + 2;
      const rows = Math.ceil(canvas.height / SPACING) + 2;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          dots.push({ ox: c * SPACING, oy: r * SPACING, x: c * SPACING, y: r * SPACING });
        }
      }
    }

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildDots();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      for (const d of dots) {
        const dx = d.ox - mx;
        const dy = d.oy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let r = BASE_RADIUS;
        let alpha = 0.12;
        let color = '140, 100, 240'; // Deep purple

        if (dist < INFLUENCE) {
          const t = 1 - dist / INFLUENCE;
          const ease = t * t * (3 - 2 * t); 
          const push = ease * 6;
          const angle = Math.atan2(dy, dx);
          
          d.x += (d.ox + Math.cos(angle) * push - d.x) * 0.2;
          d.y += (d.oy + Math.sin(angle) * push - d.y) * 0.2;
          
          r = BASE_RADIUS + (MAX_RADIUS - BASE_RADIUS) * ease;
          alpha = 0.12 + 0.28 * ease;
          
          // Subtle color shift to cyan on hover
          if (ease > 0.5) {
            color = '61, 214, 245'; // Accent Cyan
          }
        } else {
          d.x += (d.ox - d.x) * SPRING;
          d.y += (d.oy - d.y) * SPRING;
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${alpha})`;
        ctx.fill();
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
const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : 'https://castellan-backend.onrender.com');

function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [validationWarning, setValidationWarning] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('INITIALIZING SCAN...');
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
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAnalysisData(data);
    } catch (err) {
      console.error(err);
      alert(`Error: Could not reach the analysis server at ${API_URL}.\n\nPlease ensure your Render.com backend is live and active.`);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => { setAnalysisData(null); setValidationWarning(null); };

  const showLanding = !analysisData && !isLoading && !validationWarning;

  return (
    <>
      <FabricCanvas />
      <div className="faint-background-trace" />

      <div className="app-shell">
        {/* ── Header ── */}
        <header className="brand-header">
          <div className="brand-logo">
            <img src={`${import.meta.env.BASE_URL}biometric-trace.jpg`} alt="Castellan Logo" />
          </div>
          <span className="brand-name">CASTELLAN</span>
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
              <h2>VALIDATION WARNING</h2>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                This does not appear to be a valid human face image.
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                {validationWarning.reason}
              </p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Do you still want to proceed?
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button className="btn-ghost" onClick={reset}>UPLOAD NEW</button>
                <button className="btn-primary" onClick={() => proceedToAnalysis(validationWarning.file)}>PROCEED</button>
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
              Castellan analyzes facial patterns, textures, and biological signals to detect AI-generated media.
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
