import React, { useEffect, useRef, useState } from "react";

// Animation
import { motion, useMotionValue, useTransform } from "motion/react";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

// AppState Context
import { useAppState } from "../contexts/appState.tsx";

import "./BackgroundAnimation.css";

// Background Animations
export const BackgroundAnimation = (props: { children }) => {
  // AppState Context
  const { appState, setAppState } = useAppState();

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const scrollY = useRef(0);
  const maxScrollY = useRef(0);
  const scrollLock = useRef(!appState.startBottom); // Locks the scroll position to the bottom

  // For mobile touch events
  const touchStartY = useRef(0); // Stores the initial Y position of the touch

  // Store the progress of the animation
  const animationProgress = useMotionValue(0);
  if (!appState.startBottom) {
    animationProgress.set(1);
  }

  // Default Parallax effect
  const parallax = useTransform(
    animationProgress,
    [0, 1],
    [
      0,
      scrollContainerRef.current
        ? -scrollContainerRef.current.clientHeight * 0.5
        : -500,
    ]
  );

  const handleScroll = (delta: number) => {
    if (scrollLock.current) return;

    const container = scrollContainerRef.current;

    if (!container) return;

    const newScrollY = scrollY.current - delta;

    animationProgress.set(
      Math.max(0, Math.min(1 - newScrollY / maxScrollY.current, 1))
    );

    if (newScrollY <= 0) {
      scrollY.current = 0;
      container.scrollTop = 0;
      scrollLock.current = true;
      setAppState({ ...appState, startBottom: false });
    } else if (newScrollY > maxScrollY.current) {
      container.scrollTop = maxScrollY.current;
      scrollY.current = maxScrollY.current;
    } else {
      container.scrollTop = newScrollY;
      scrollY.current = newScrollY;
    }
  };

  const handleResize = () => {
    const container = scrollContainerRef.current;

    if (!container) return;

    const scrollContainerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const max = scrollHeight - scrollContainerHeight;
    maxScrollY.current = max;

    handleScroll(0);
  };

  /*
  const releaseScroll = () => {
    scrollLock.current = false;
    setAppState({ ...appState, startBottom: true });

    handleScroll(-maxScrollY.current);
  };*/

  // Easing function for smooth effect
  const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

  const releaseScroll = () => {
    scrollLock.current = false;
    setAppState({ ...appState, startBottom: true });

    const totalDelta = -maxScrollY.current; // We want to scroll to the bottom
    const duration = 500; // Duration of the animation in milliseconds
    const frameRate = 16; // Roughly 60fps, 16ms per frame
    const frames = Math.ceil(duration / frameRate); // Total frames for the animation
    const deltaPerFrame = totalDelta / frames; // Small delta for each frame

    let currentFrame = 0;

    const animate = () => {
      if (currentFrame < frames) {
        handleScroll(deltaPerFrame); // Call handleScroll with small delta
        currentFrame++;
        requestAnimationFrame(animate);
      } else {
        // Ensure it lands exactly at the bottom
        handleScroll(totalDelta - deltaPerFrame * currentFrame);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    setAppState({ ...appState, startBottom: !scrollLock.current });
  }, [scrollLock.current]);

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) return;

    // Set the initial scroll position to the bottom
    const scrollContainerHeight = container.clientHeight;
    const scrollHeight = container.scrollHeight;
    const max = scrollHeight - scrollContainerHeight;
    maxScrollY.current = max;

    // Set the initial scroll position based on the scrollLock
    if (appState.startBottom) {
      // Start at bottom
      scrollY.current = max;
      container.scrollTop = max;
    } else {
      // Start at top
      scrollY.current = 0;
    }

    const handlePCScroll = (e) => {
      e.preventDefault();
      const delta = e.deltaY || e.detail || e.wheelDelta;
      if (!delta) return;
      handleScroll(delta);
    };

    const handleTouchStart = (e) => {
      touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchEndY = e.touches[0].clientY;
      const delta = touchStartY.current - touchEndY;
      touchStartY.current = touchEndY;
      handleScroll(delta);
    };

    container.addEventListener("wheel", handlePCScroll);

    container.addEventListener("touchstart", handleTouchStart);
    container.addEventListener("touchmove", handleTouchMove);

    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("wheel", handlePCScroll);

      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, []); // Run on mount

  return (
    <div className="view main-view">
      <div
        id="scrollContainer"
        className="scroll-container"
        ref={scrollContainerRef}
      >
        <div className="space">
          {props.children}
          <div className="scroll-release" onClick={releaseScroll}>
            <p>Go Back Down</p>
            <div className="scroll-release-arrow">
              <FontAwesomeIcon
                icon={faArrowDown}
                className="scroll-release-icon"
              />
            </div>
          </div>
        </div>
        <div className="sky">
          <motion.div
            className="parallax-layer"
            style={{
              y: useTransform(parallax, (value) => value * 0.3),
              top: "600px",
            }}
          >
            <img
              className="parallax-img"
              src="/parallax/sky/clouds.png"
              alt="clouds"
            />
          </motion.div>
        </div>
        <div className="ground">
          <motion.div
            className="parallax-layer"
            style={{ y: useTransform(parallax, (value) => value * 0.9) }}
          >
            <img
              className="parallax-img"
              src="/parallax/low_res/ground/Parallax_Drawing-1.jpg"
              srcSet="/parallax/ground/Parallax_Drawing-1.png 1200w"
              alt="background"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{ y: useTransform(parallax, (value) => value * 0.8) }}
          >
            <img
              className="parallax-img"
              src="/parallax/low_res/ground/Parallax_Drawing-2.jpg"
              srcSet="/parallax/ground/Parallax_Drawing-2.png 1200w"
              alt="Mountains"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{ y: useTransform(parallax, (value) => value * 0.7) }}
          >
            <img
              className="parallax-img"
              src="/parallax/low_res/ground/Parallax_Drawing-3.jpg"
              srcSet="/parallax/ground/Parallax_Drawing-3.png 1200w"
              alt="Mountains"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{ y: useTransform(parallax, (value) => value * 0.6) }}
          >
            <img
              className="parallax-img"
              src="/parallax/low_res/ground/Parallax_Drawing-4.jpg"
              srcSet="/parallax/ground/Parallax_Drawing-4.png 1200w"
              alt="Mountains"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{ y: useTransform(parallax, (value) => value * 0.5) }}
          >
            <img
              className="parallax-img"
              src="/parallax/low_res/ground/Parallax_Drawing-5.jpg"
              srcSet="/parallax/ground/Parallax_Drawing-5.png 1200w"
              alt="Mountains"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{ y: useTransform(parallax, (value) => value * 0.4) }}
          >
            <img
              className="parallax-img"
              src="/parallax/low_res/ground/Parallax_Drawing-6.jpg"
              srcSet="/parallax/ground/Parallax_Drawing-6.png 1200w"
              alt="Plains with Rocket Launchsite"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{
              y: useTransform(parallax, (value) => value * 0.39),
              opacity: useTransform(
                animationProgress,
                [0, 0.05, 0.2, 1],
                [0, 1, 0, 0]
              ),
            }}
          >
            <img
              className="parallax-img"
              srcSet="/parallax/smoke.png"
              alt="Rocket Smoke"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{ y: useTransform(parallax, (value) => value * 0.0) }}
          >
            <img
              className="parallax-img"
              src="/parallax/low_res/ground/Parallax_Drawing-7.jpg"
              srcSet="/parallax/ground/Parallax_Drawing-7.png 1200w"
              alt="Birds"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{ y: useTransform(parallax, (value) => value * 0.2) }}
          >
            <img
              className="parallax-img"
              src="/parallax/low_res/ground/Parallax_Drawing-8.jpg"
              srcSet="/parallax/ground/Parallax_Drawing-8.png 1200w"
              alt="Trees on a hill"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{ y: useTransform(parallax, (value) => value * 0.1) }}
          >
            <img
              className="parallax-img"
              src="/parallax/low_res/ground/Parallax_Drawing-9.jpg"
              srcSet="/parallax/ground/Parallax_Drawing-9.png 1200w"
              alt="Grass"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{ y: useTransform(parallax, (value) => value * 0) }}
          >
            <img
              className="parallax-img"
              src="/parallax/low_res/ground/Parallax_Drawing-10.jpg"
              srcSet="/parallax/ground/Parallax_Drawing-10.png 1200w"
              alt="Weeds"
            />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{
              marginLeft: "5px",
              y: useTransform(parallax, (value) => value * 5.5),
              scale: useTransform(animationProgress, [0, 0.8, 1], [1, 0.8, 0]),
              rotate: useTransform(animationProgress, [0, 1], [0, -10]),
              opacity: useTransform(
                animationProgress,
                [0, 0.05, 0.8, 0.81, 1],
                [0, 1, 1, 0, 0]
              ),
            }}
          >
            <img className="parallax-img" src="/parallax/fire.png" alt="Fire" />
          </motion.div>
          <motion.div
            className="parallax-layer"
            style={{
              // Bind the motionValue directly to style
              y: useTransform(parallax, (value) => value * 5.5),
              scale: useTransform(animationProgress, [0, 0.8, 1], [1, 0.8, 0]),
              rotate: useTransform(animationProgress, [0, 1], [0, -10]),
            }}
            transition={{ ease: "linear" }}
          >
            <img
              className="parallax-img"
              src="/parallax/rocket.png"
              alt="Rocket"
            />
          </motion.div>
        </div>
        <motion.div
          className="title"
          style={{
            opacity: useTransform(animationProgress, [0, 0.2, 1], [1, 0, 0]),
            display: useTransform(animationProgress, (value) =>
              value > 0.2 ? "none" : "flex"
            ),
          }}
        >
          <img className="logo-icon" src="/logo/CI_Logo_White.svg" />
          <h1>Cosmic Insight</h1>
        </motion.div>
      </div>
    </div>
  );
};
