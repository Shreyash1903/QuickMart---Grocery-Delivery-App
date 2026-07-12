import React, { useState, useEffect } from "react";
import Lottie from "lottie-react";
import "./SplashScreen.css";
import deliveryBoyAnimation from "../assets/delivery-boy.json";

function SplashScreen() {
  const taglines = [
    "Fresh groceries, delivered to your door",
    "Your neighborhood grocery, now at your doorstep",
    "Farm-fresh produce, delivered daily",
    "Quality groceries, delivered with care",
    "Fresh food, fast delivery",
    "Organic, fresh, delivered"
  ];

  const [currentTagline, setCurrentTagline] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTagline((prev) => (prev + 1) % taglines.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="splash-screen">
      
      {/* Particles Background */}
      <div className="particles-container">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Floating Background */}
      <div className="floating floating1">🍎</div>
      <div className="floating floating2">🥛</div>
      <div className="floating floating3">🥦</div>
      <div className="floating floating4">🍞</div>
      <div className="floating floating5">🧃</div>
      <div className="floating floating6">🛒</div>
      <div className="floating floating7">📦</div>

      <div className="splash-content">

        {/* Logo Section - Uncomment if needed */}
        {/* <div className="logo-wrapper">
          <div className="logo-circle">
            <div className="logo-glow"></div>
            <i className="bi bi-bag-fill"></i>
          </div>
        </div> */}

        <h1 className="app-title">
          <span className="title-part">Quick</span>
          <span className="title-part green">Mart</span>
        </h1>

        {/* Rotating Tagline */}
        <p className="tagline tagline-rotate">
          {taglines[currentTagline]}
        </p>

        <div className="progress-area">

          {/* Lottie Animation */}
          <div className="lottie-container">
            <Lottie 
              animationData={deliveryBoyAnimation}
              loop={true}
              autoplay={true}
              className="delivery-lottie"
              style={{ width: '100%', height: '100%', maxWidth: '350px', maxHeight: '350px' }}
            />
          </div>

        </div>

        {/* Loading Text */}
        <div className="loading-section">
          <div className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </div>
          <p className="loading-text">
            <span className="text-part">D</span>
            <span className="text-part">e</span>
            <span className="text-part">l</span>
            <span className="text-part">i</span>
            <span className="text-part">v</span>
            <span className="text-part">e</span>
            <span className="text-part">r</span>
            <span className="text-part">i</span>
            <span className="text-part">n</span>
            <span className="text-part">g</span>
            <span className="text-space"> </span>
            <span className="text-part">f</span>
            <span className="text-part">r</span>
            <span className="text-part">e</span>
            <span className="text-part">s</span>
            <span className="text-part">h</span>
            <span className="text-space"> </span>
            <span className="text-part">g</span>
            <span className="text-part">r</span>
            <span className="text-part">o</span>
            <span className="text-part">c</span>
            <span className="text-part">e</span>
            <span className="text-part">r</span>
            <span className="text-part">i</span>
            <span className="text-part">e</span>
            <span className="text-part">s</span>
            <span className="text-space"> </span>
            <span className="text-part">t</span>
            <span className="text-part">o</span>
            <span className="text-space"> </span>
            <span className="text-part">y</span>
            <span className="text-part">o</span>
            <span className="text-part">u</span>
            <span className="text-part">r</span>
            <span className="text-space"> </span>
            <span className="text-part">d</span>
            <span className="text-part">o</span>
            <span className="text-part">o</span>
            <span className="text-part">r</span>
            <span className="text-part">s</span>
            <span className="text-part">t</span>
            <span className="text-part">e</span>
            <span className="text-part">p</span>
            <span className="text-part">.</span>
            <span className="text-part">.</span>
            <span className="text-part">.</span>
            <span className="scooter-icon">🛵</span>
            <span className="scooter-icon">💨</span>
          </p>
        </div>

        {/* Version Info */}
        <div className="version-info">v2.0.0 • Made with ❤️</div>

      </div>

      {/* Corner Decorations */}
      <div className="corner corner-tl"></div>
      <div className="corner corner-tr"></div>
      <div className="corner corner-bl"></div>
      <div className="corner corner-br"></div>

    </div>
  );
}

export default SplashScreen;