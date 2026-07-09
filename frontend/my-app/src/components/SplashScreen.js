import React from "react";
import "./SplashScreen.css";

function SplashScreen() {
  return (
    <div className="splash-screen">

      {/* Floating Background */}
      <div className="floating floating1">🍎</div>
      <div className="floating floating2">🥛</div>
      <div className="floating floating3">🥦</div>
      <div className="floating floating4">🍞</div>
      <div className="floating floating5">🧃</div>

      <div className="splash-content">

        <div className="logo-wrapper">
          <div className="logo-circle">
            <i className="bi bi-cart-fill"></i>
          </div>
        </div>

        <h1 className="app-title">
          <span>Quick</span>
          <span className="green">Mart</span>
        </h1>

        <p className="tagline">
          Groceries delivered in minutes
        </p>

        <div className="progress-area">

          <div className="road">

            <div className="cart-animation">
              🛒
            </div>

          </div>

        </div>

        <p className="loading-text">
          Loading your groceries...
        </p>

      </div>

    </div>
  );
}

export default SplashScreen;