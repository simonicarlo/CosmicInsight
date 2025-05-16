import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          &copy; {new Date().getFullYear()} Cosmic Insight. All rights reserved.
        </p>
        {/*<div className="footer-links">
          <a href="#link1">Link 1</a>
          <a href="#link2">Link 2</a>
          <a href="#link3">Link 3</a>
        </div>*/}
      </div>
    </footer>
  );
};

export default Footer;
