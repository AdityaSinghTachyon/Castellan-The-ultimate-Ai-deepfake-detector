import React, { useState, useEffect } from 'react';

const AdsComponent = () => {
  const images = ['/ads/ad1.jpg', '/ads/ad2.jpg', '/ads/ad3.jpg'];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 8000); // 8-second interval as requested
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="ads-container">
      <div className="ads-slideshow">
        {images.map((img, idx) => (
          <img
            key={img}
            src={img}
            alt={`Ad ${idx + 1}`}
            className={`ad-slide ${idx === currentIndex ? 'active' : ''}`}
          />
        ))}
      </div>
      <div className="ads-overlay">
        <span className="ads-label">Ads by castellan</span>
      </div>
    </div>
  );
};

export default AdsComponent;
