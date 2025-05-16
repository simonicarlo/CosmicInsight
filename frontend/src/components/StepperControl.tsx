import React, { useEffect, useRef, useState } from "react";
import "./StepperControl.css";

// Types
interface StepperControlProps {
  title?: string;
  min?: number;
  max?: number;
  step?: number;
  initialValue?: number;
  displayedValueConversion?: (value: number) => string;
  onValueInput?: ((value: string) => void) | null;
  onValueChange?: ((value: number) => void) | null;
  style?: React.CSSProperties;
}

const StepperControl = ({
  title = "",
  min = 0,
  max = 100,
  step = 1,
  initialValue = 0,
  displayedValueConversion = (value) => value.toString(),
  onValueInput = null,
  onValueChange = null,

  style = {},
}: StepperControlProps) => {
  const [value, setValue] = useState(initialValue);
  const [displayedValue, setDisplayedValue] = useState(
    displayedValueConversion(value)
  );

  // Handles increment
  const increment = () => {
    let shouldContinue = true;
    setValue((prevValue) => {
      const newValue = Math.min(prevValue + step, max);
      if (newValue >= max) {
        shouldContinue = false; // Stop further increments
      }
      return newValue;
    });
    return shouldContinue; // Return whether to continue the operation
  };

  // Handles decrement
  const decrement = () => {
    let shouldContinue = true;
    setValue((prevValue) => {
      const newValue = Math.max(prevValue - step, min);
      if (newValue <= min) {
        shouldContinue = false; // Stop further decrements
      }
      return newValue;
    });
    return shouldContinue; // Return whether to continue the operation
  };

  // Handles direct input
  const handleChange = (e) => {
    setDisplayedValue(e.target.value);
  };

  const handleBlur = () => {
    onValueInput && onValueInput(displayedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onValueInput && onValueInput(displayedValue);
      e.currentTarget.blur();
    }
    // Unfocus input
  };

  const handleMouseDown = (operation: () => boolean) => {
    // Start the operation after 500ms
    let timeout = setTimeout(() => {
      operation();
      // Continuously perform the operation every 50ms
      let interval = setInterval(() => {
        if (!operation()) {
          clearInterval(interval); // Stop the interval if the operation returns false
        }
      }, 50);

      // Clear the interval on mouseup or mouseleave
      const clear = () => {
        clearInterval(interval);
        document.removeEventListener("mouseup", clear);
        document.removeEventListener("mouseleave", clear);
      };
      document.addEventListener("mouseup", clear, { once: true });
      document.addEventListener("mouseleave", clear, { once: true });
    }, 500);

    // Cancel the timeout if the mouse is released early
    const cancelTimeout = () => {
      clearTimeout(timeout);
      document.removeEventListener("mouseup", cancelTimeout);
      document.removeEventListener("mouseleave", cancelTimeout);
    };
    document.addEventListener("mouseup", cancelTimeout, { once: true });
    document.addEventListener("mouseleave", cancelTimeout, { once: true });
  };

  useEffect(() => {
    onValueChange && onValueChange(value);
    setDisplayedValue(displayedValueConversion(value));
  }, [value]);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  return (
    <div className="stepper" style={style}>
      {title != "" && <div className="stepper-title">{title}</div>}
      <div className="stepper-control">
        <button
          className="stepper-btn"
          onClick={decrement}
          disabled={value <= min}
          onMouseDown={() => handleMouseDown(decrement)}
        >
          -
        </button>
        <input
          type="text"
          className="stepper-input"
          value={displayedValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        <button
          className="stepper-btn"
          onClick={increment}
          disabled={value >= max}
          onMouseDown={() => handleMouseDown(increment)}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default StepperControl;
