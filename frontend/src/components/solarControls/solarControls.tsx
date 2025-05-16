import { DateControls } from "./dateControls.tsx";
import { PlayControls } from "./playControls.tsx";
import { DistanceButton } from "./distanceCalculatorButton.tsx";

import { useDate } from "../../hooks/useDate.tsx";

import { useState } from "react";

export const SolarControls = ({
  isCalculatingDistance,
  //setIsCalculatingDistance,
  selectedPlanets,
  planetGroups,
}) => {
  const { dateSliderValue } = useDate(planetGroups);

  const [, triggerUpdate] = useState(0);

  return (
    <>
      <DateControls
        dateSliderValue={dateSliderValue}
        planetGroups={planetGroups}
        triggerUpdate={triggerUpdate}
        //setDateSliderValue={setDateSliderValue}
      />
      <PlayControls //setDateSliderValue={setDateSliderValue}
        dateSliderValue={dateSliderValue}
        planetGroups={planetGroups}
        triggerUpdate={triggerUpdate}
      />
      <DistanceButton
        isCalculatingDistance={isCalculatingDistance}
        //setIsCalculatingDistance={setIsCalculatingDistance}
        selectedPlanets={selectedPlanets}
      />
    </>
  );
};
