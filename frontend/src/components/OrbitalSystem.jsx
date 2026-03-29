import React, { useState, useEffect, useRef } from 'react';

const OrbitalSystem = () => {
  const [angle, setAngle] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [mousePos, setMousePos] = useState({ x: -999, y: -999 });
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  
  const requestRef = useRef();

  // Restored to faster base speed for better motion
  const BASE_SPEED = (2 * Math.PI) / (220 * 60); 
  const ORBIT_RX = windowSize.w * 0.78;
  const ORBIT_RY = windowSize.h * 0.53;
  const CENTER_X = windowSize.w * 0.08; 
  const CENTER_Y = windowSize.h * 0.62;

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    
    const animate = () => {
      setAngle((prev) => {
        const x = CENTER_X + ORBIT_RX * Math.cos(prev);
        const y = CENTER_Y + ORBIT_RY * Math.sin(prev);
        const isOff = x < -250 || x > window.innerWidth + 250 || y < -250 || y > window.innerHeight + 250;
        // 6.5x Speed boost when off-screen to minimize wait time
        return (prev + BASE_SPEED * (isOff ? 6.5 : 0.85)) % (Math.PI * 2);
      });
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);

    const interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(requestRef.current);
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [windowSize, CENTER_X, CENTER_Y, ORBIT_RX, ORBIT_RY, BASE_SPEED]);

  // Calculate position
  const earthX = CENTER_X + ORBIT_RX * Math.cos(angle);
  const earthY = CENTER_Y + ORBIT_RY * Math.sin(angle);

  // Visibility check
  const isOffScreen = earthX < -250 || earthX > windowSize.w + 250 || earthY < -250 || earthY > windowSize.h + 250;

  // Hover detection - Precisely limited to Earth area
  const dist = Math.sqrt(Math.pow(mousePos.x - earthX, 2) + Math.pow(mousePos.y - earthY, 2));
  const isHovered = dist < 110; 

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      pointerEvents: 'none',
      overflow: 'hidden'
    }}>
      {/* ── Orbit Line ── */}
      <svg width="100%" height="100%" style={{ position: 'absolute', opacity: 0.45 }}>
        <ellipse
          cx={CENTER_X}
          cy={CENTER_Y}
          rx={ORBIT_RX}
          ry={ORBIT_RY}
          fill="none"
          stroke="white"
          strokeWidth="4"
        />
        
        {/* Status Text when Earth is off-screen */}
        {isOffScreen && (
          <text
            x={40}
            y={windowSize.h - 140}
            fill="white"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              letterSpacing: '0.5em',
              opacity: 0.8,
              textTransform: 'uppercase'
            }}
          >
            &gt; BIOMETRIC SIGNAL TRACKING: EARTH COMING...
          </text>
        )}
      </svg>

      {/* ── Earth + Timer Container ── */}
      <div 
        className={isHovered ? 'smooth-vibrate' : ''}
        style={{
          position: 'absolute',
          left: earthX,
          top: earthY,
          transform: `translate(-50%, -50%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
          transition: 'scale 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          scale: isHovered ? 1.35 : 1,
          visibility: isOffScreen ? 'hidden' : 'visible'
        }}
      >
        {/* Liquid Glowing Masked Earth Container */}
        <div 
          className="liquid-glow-container"
          style={{
            width: '200px',
            height: '200px',
            position: 'relative',
            borderRadius: '50%',
            overflow: 'hidden',
            // Constant Bluish Glow + Hover expansion
            boxShadow: isHovered 
              ? '0 0 100px rgba(79, 142, 247, 0.85), 0 0 160px rgba(155, 110, 250, 0.5)' 
              : '0 0 45px rgba(79, 142, 247, 0.3)',
            transition: 'box-shadow 0.9s ease'
          }}
        >
          {/* Realistic Earth */}
          <img
            src={`${import.meta.env.BASE_URL}earth-real.png`}
            alt="Earth"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isHovered ? 0 : 0.75,
              transition: 'opacity 0.6s ease',
              filter: 'grayscale(1) brightness(1.3)'
            }}
          />
          
          {/* Sketch Blueprint Overlay */}
          <img
            src={`${import.meta.env.BASE_URL}earth-sketch.jpg`}
            alt="Earth Blueprint Sketch"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.7s ease',
              filter: 'grayscale(1) brightness(2.3) contrast(1.9)',
              mixBlendMode: 'screen'
            }}
          />
        </div>

        {/* Timer */}
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '1rem',
          color: 'white',
          opacity: isHovered ? 1 : 0.5,
          letterSpacing: '0.35em',
          whiteSpace: 'nowrap',
          transition: 'opacity 0.6s ease'
        }}>
          [{formatTime(seconds)}]
        </div>
      </div>
    </div>
  );
};

export default OrbitalSystem;
