import React, { useState, useEffect } from "react";

import "./controlStyles.css";

import { getDateFromSliderValue, validDates } from "../../hooks/useDate.tsx";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import StepperControl from "../StepperControl.tsx";

import { updatePositions } from "../../solarsystem/planet.ts";

export const usePlayButton = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playInterval, setPlayInterval] = useState<number | null>(null);
  const [playingSpeed, setPlayingSpeed] = useState(4);

  /*useEffect(() => {
    console.log("Play Button: " + isPlaying);
    console.log("Play Interval: " + playInterval);
    console.log("Step Size: " + stepSize);
  }, [isPlaying, playInterval, stepSize]);
  */

  useEffect(() => {
    // Clean up interval on unmount or when playInterval changes
    return () => {
      if (playInterval) clearInterval(playInterval);
    };
  }, [playInterval]);

  return {
    isPlaying,
    setIsPlaying,
    playInterval,
    setPlayInterval,
    playingSpeed,
    setPlayingSpeed,
  };
};

export const PlayButton = (props: {
  isPlaying: boolean;
  handlePlayButton: () => void;
}) => {
  return (
    <button className="play-button" onClick={props.handlePlayButton}>
      {props.isPlaying ? (
        <FontAwesomeIcon className="icon" icon={faPause} />
      ) : (
        <FontAwesomeIcon className="icon" icon={faPlay} />
      )}
    </button>
  );
};

export const SpeedSlider = ({ playingSpeed, setPlayingSpeed }) => {
  const stepperStepSize = 1;

  const handleStepSizeInput = (value: string) => {
    setPlayingSpeed(parseInt(value));
  };

  const onChange = (updatedValue: number) => {
    setPlayingSpeed(updatedValue);
  };

  return (
    <StepperControl
      title="Playing Speed"
      min={1}
      max={10}
      step={stepperStepSize}
      initialValue={playingSpeed}
      onValueChange={onChange}
      onValueInput={handleStepSizeInput}
      style={{ position: "absolute", left: "30px", bottom: "110px" }}
    />
  );
};

export const PlayControls = (props: {
  dateSliderValue: React.MutableRefObject<number>;
  planetGroups;
  triggerUpdate;
}) => {
  const {
    playInterval,
    setPlayInterval,
    isPlaying,
    setIsPlaying,
    playingSpeed,
    setPlayingSpeed,
  } = usePlayButton();

  // --------------------
  // Toggle Playback
  //---------------------

  //old implementation:
  /*
    useEffect(() => {
      if (isPlaying) {
        const speed = 1024 / Math.pow(2, playingSpeed);
        console.log("Playing Speed: " + speed);

        const interval = +setInterval(() => {
          const val = props.dateSliderValue.current;

          const nextValue = val + 1;

          if (nextValue >= validDates.length) {
            setIsPlaying(false); // Stop playback
            return;
          }

          props.dateSliderValue.current = nextValue; // Update dateSliderValue
          props.triggerUpdate((prev) => prev + 1); // Trigger update

          updatePositions(
            getDateFromSliderValue(props.dateSliderValue.current),
            props.planetGroups
          ); // Update planet positions
        }, speed);

        setPlayInterval(interval);
        return () => clearInterval(interval); // Cleanup
      } else if (playInterval) {
        clearInterval(playInterval);
        setPlayInterval(null);
      }
      return () => {}; // No cleanup necessary
    }, [isPlaying, playingSpeed]);
 */
  // New implementation:
  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = performance.now();

    const updateSlider = (timestamp: number) => {
      const elapsed = timestamp - lastTimestamp;
      const speed = 1024 / Math.pow(2, playingSpeed);

      if (elapsed >= speed) {
        const val = props.dateSliderValue.current;

        const nextValue = val + 1;

        if (nextValue >= validDates.length) {
          setIsPlaying(false); // Stop playback
          return;
        }

        props.dateSliderValue.current = nextValue; // Update dateSliderValue
        props.triggerUpdate((prev) => prev + 1); // Trigger update

        updatePositions(
          getDateFromSliderValue(props.dateSliderValue.current),
          props.planetGroups
        ); // Update planet positions

        lastTimestamp = timestamp; // Reset lastTimestamp
      }

      if (isPlaying) {
        animationFrameId = requestAnimationFrame(updateSlider);
      }
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(updateSlider);
    }

    return () => cancelAnimationFrame(animationFrameId); // Cleanup
  }, [isPlaying, playingSpeed, validDates.length]);

  // --------------------

  const handlePlayButton = () => {
    setIsPlaying(!isPlaying);
  };
  return (
    <>
      <PlayButton isPlaying={isPlaying} handlePlayButton={handlePlayButton} />
      <SpeedSlider
        playingSpeed={playingSpeed}
        setPlayingSpeed={setPlayingSpeed}
      />
    </>
  );
};
