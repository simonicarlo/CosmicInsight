import React, { useState, useEffect } from "react";

import {
  validDates,
  getSliderValueFromDate,
  getStringFromDate,
  getDateFromString,
  getDateFromSliderValue,
} from "../../hooks/useDate.tsx";

import "./controlStyles.css";
import StepperControl from "../StepperControl.tsx";
import { updatePositions } from "../../solarsystem/planet.ts";

export const DateControls = ({
  dateSliderValue,
  planetGroups,
  triggerUpdate,
}) => {
  const handleDateInput = async (value: string) => {
    const date = getDateFromString(value);
    dateSliderValue.current = getSliderValueFromDate(date);
    triggerUpdate();
    updatePositions(
      getDateFromSliderValue(dateSliderValue.current),
      planetGroups
    );
  };

  const onChange = (updatedValue: number) => {
    dateSliderValue.current = updatedValue;
    triggerUpdate();
    updatePositions(
      getDateFromSliderValue(dateSliderValue.current),
      planetGroups
    );
  };

  return (
    <StepperControl
      title="Date"
      min={0}
      max={validDates.length - 1}
      step={1}
      onValueInput={handleDateInput}
      onValueChange={onChange}
      initialValue={dateSliderValue.current}
      displayedValueConversion={(value: number) =>
        getStringFromDate(getDateFromSliderValue(value))
      }
      style={{ position: "absolute", left: "30px", bottom: "50px" }}
    />
  );
};
