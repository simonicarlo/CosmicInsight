import React, { useState, useEffect } from "react";

import "./controlStyles.css";

export const DistanceButton = ({
  isCalculatingDistance,
  //setIsCalculatingDistance,
  selectedPlanets,
}) => {
  const [buttonActive, setButtonActive] = useState(false);

  const handleDistanceButton = () => {
    //setIsCalculatingDistance(!isCalculatingDistance);

    isCalculatingDistance.current = !isCalculatingDistance.current;
    setButtonActive(isCalculatingDistance.current);
    selectedPlanets.current = [];
  };

  return (
    <button
      className={"distance-button" + " " + (buttonActive ? "active" : "")}
      onClick={handleDistanceButton}
    >
      Distance Calculator
    </button>
  );
};
