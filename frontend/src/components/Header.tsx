import React, { useState } from "react";
import "./Header.css";
import { useAppState } from "../contexts/appState.tsx";
import { NavLink } from "react-router-dom";

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { appState } = useAppState();

  const toggleMenu = () => {
    if (appState.mobile) {
      setIsOpen(!isOpen);
    }
  };
  // Handle keydown event to toggle menu with Enter key
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      toggleMenu();
    }
  };

  return (
    <header className="header">
      <div className="container">
        <div className="logo">
          <img
            className="logo-icon"
            src={
              appState.theme === "dark"
                ? "/logo/CI_Logo_White.svg"
                : "/logo/CI_Logo_Black.svg"
            }
            alt="Cosmic Insight Logo"
          />
          <NavLink to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Cosmic Insight
          </NavLink>
        </div>
        <nav
          className={`nav ${isOpen ? "open" : ""}`}
          role="tablist" // Added ARIA role for the navigation
        >
          <NavLink
            to="/"
            onClick={toggleMenu}
            role="tab" // ARIA role for each tab
            tabIndex={0} // Ensures it is focusable
            aria-selected={window.location.pathname === "/" ? "true" : "false"} // Selects the active tab dynamically
          >
            Home
          </NavLink>
          <NavLink
            to="/images"
            onClick={toggleMenu}
            role="tab" // ARIA role for each tab
            tabIndex={0} // Ensures it is focusable
            aria-selected={window.location.pathname === "/images" ? "true" : "false"} // Selects the active tab dynamically
          >
            Images
          </NavLink>
          <NavLink
            to="/about"
            onClick={toggleMenu}
            role="tab" // ARIA role for each tab
            tabIndex={0} // Ensures it is focusable
            aria-selected={window.location.pathname === "/about" ? "true" : "false"} // Selects the active tab dynamically
          >
            About
          </NavLink>
          {appState.mobile && (
            <>
              <NavLink
                to="/planets/sun"
                onClick={toggleMenu}
                role="tab" // ARIA role for each tab
                tabIndex={0} // Ensures it is focusable
                aria-selected={window.location.pathname === "/planets/sun" ? "true" : "false"}
              >
                Sun
              </NavLink>
              <NavLink
                to="/planets/mercury"
                onClick={toggleMenu}
                role="tab" // ARIA role for each tab
                tabIndex={0} // Ensures it is focusable
                aria-selected={window.location.pathname === "/planets/mercury" ? "true" : "false"}
              >
                Mercury
              </NavLink>
              <NavLink
                to="/planets/venus"
                onClick={toggleMenu}
                role="tab" // ARIA role for each tab
                tabIndex={0} // Ensures it is focusable
                aria-selected={window.location.pathname === "/planets/venus" ? "true" : "false"}
              >
                Venus
              </NavLink>
              <NavLink
                to="/planets/earth"
                onClick={toggleMenu}
                role="tab" // ARIA role for each tab
                tabIndex={0} // Ensures it is focusable
                aria-selected={window.location.pathname === "/planets/earth" ? "true" : "false"}
              >
                Earth
              </NavLink>
              <NavLink
                to="/planets/mars"
                onClick={toggleMenu}
                role="tab" // ARIA role for each tab
                tabIndex={0} // Ensures it is focusable
                aria-selected={window.location.pathname === "/planets/mars" ? "true" : "false"}
              >
                Mars
              </NavLink>
              <NavLink
                to="/planets/jupiter"
                onClick={toggleMenu}
                role="tab" // ARIA role for each tab
                tabIndex={0} // Ensures it is focusable
                aria-selected={window.location.pathname === "/planets/jupiter" ? "true" : "false"}
              >
                Jupiter
              </NavLink>
              <NavLink
                to="/planets/saturn"
                onClick={toggleMenu}
                role="tab" // ARIA role for each tab
                tabIndex={0} // Ensures it is focusable
                aria-selected={window.location.pathname === "/planets/saturn" ? "true" : "false"}
              >
                Saturn
              </NavLink>
              <NavLink
                to="/planets/uranus"
                onClick={toggleMenu}
                role="tab" // ARIA role for each tab
                tabIndex={0} // Ensures it is focusable
                aria-selected={window.location.pathname === "/planets/uranus" ? "true" : "false"}
              >
                Uranus
              </NavLink>
              <NavLink
                to="/planets/neptune"
                onClick={toggleMenu}
                role="tab" // ARIA role for each tab
                tabIndex={0} // Ensures it is focusable
                aria-selected={window.location.pathname === "/planets/neptune" ? "true" : "false"}
              >
                Neptune
              </NavLink>
              <NavLink
                to="/planets/pluto"
                onClick={toggleMenu}
                role="tab" // ARIA role for each tab
                tabIndex={0} // Ensures it is focusable
                aria-selected={window.location.pathname === "/planets/pluto" ? "true" : "false"}
              >
                Pluto
              </NavLink>
            </>
          )}
        </nav>
        <div
          className={`burger ${isOpen ? "open" : ""}`}
          onClick={toggleMenu}
          role="button"
          tabIndex={0} // Ensures it is focusable
          aria-label="Toggle menu"
          onKeyDown={handleKeyDown} // Listen for Enter key press
        >
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
      </div>
    </header>
  );
};

export default Header;
