import React, { useEffect, useRef, useState } from "react";

const startDate = new Date("2000-01-01");
const endDate = new Date("2099-12-31");

const stepSize = 1;

import { updatePositions } from "../solarsystem/planet.ts";
import { s } from "motion/react-client";

export const validDates: Date[] = [];

// Helper to ensure all dates share the same format
export function getDateFormat(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );
}

for (
  let date = getDateFormat(startDate);
  date <= endDate;
  date.setUTCDate(date.getUTCDate() + stepSize)
) {
  validDates.push(getDateFormat(date)); // Clone to avoid reference issues
}

// Function to convert slider value to date
export const getDateFromSliderValue = (value: number): Date => {
  const date = validDates[value];
  if (date) {
    return date;
  } else {
    return getDateFormat(new Date());
  }
};

export const getSliderValueFromDate = (selectedDate: Date): number => {
  const formattedDate = getDateFormat(selectedDate);
  return validDates.findIndex(
    (date) => date.getTime() === formattedDate.getTime()
  );
};

export const getStringFromDate = (date: Date): string => {
  const dateString = date.toISOString().split("T")[0];
  if (dateString) {
    return dateString;
  }
  return "";
};

export const getDateFromString = (dateString: string): Date => {
  return getDateFormat(new Date(dateString));
};

/* ------------------ */
//  DATE SLIDER HOOK
/* ------------------ */

export const useDate = (planetGroups) => {
  const dateSliderValue = useRef<number>(getSliderValueFromDate(new Date()));

  //const [selectedDate, setSelectedDate] = useState(new Date());
  /*const [dateSliderValue, setDateSliderValue] = useState(
    getSliderValueFromDate(new Date())
  );*/

  /*useEffect(() => {
    console.log("Selected Date: " + selectedDate);
    console.log("Date Slider Value: " + dateSliderValue);
  }, [selectedDate, dateSliderValue]);*/

  /*useEffect(() => {
    // set selected date based on slider value
    const date = getDateFromSliderValue(dateSliderValue.current);
    if (date) {
      selectedDate.current = date;
    }
  }, [dateSliderValue]);*/

  useEffect(() => {
    const updatePlanets = async () => {
      await updatePositions(
        getDateFromSliderValue(dateSliderValue.current),
        planetGroups
      );
    };
    updatePlanets();
  }, [planetGroups]);

  return {
    dateSliderValue,
  };
};
