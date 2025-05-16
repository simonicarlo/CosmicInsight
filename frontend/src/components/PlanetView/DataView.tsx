import { useEffect, useState } from "react";

import "./DataView.css";
import BarChart from "./Graphs/BarChart.tsx";
import Overview from "./Graphs/Overview.tsx";
import NetworkGraph from "./Graphs/NetworkGraph.tsx";
import TiltGraph from "./Graphs/TiltGraph.tsx";
import TemperatureGraph from "./Graphs/TemperatureGraph.tsx";
import OrbitGraph from "./Graphs/OrbitGraph.tsx";
import CoreGraph from "./Graphs/CoreGraph.tsx";
import StackedBarChart from "./Graphs/StackedBarChart.tsx";

import PlanetImages from "./PlanetImages.tsx";

import {
  getPlanetData,
  getPlanetCoreData,
  getPlanetAtmosData,
} from "../../helpers/fetchData";

// Define types for different planet data structures

export default function DataView(props: {
  selectedPlanet: string;
  type: string;
}) {
  //get planet data from Solar System API in backend and display
  const [planetData, setPlanetData] = useState(null); // State to store planet data

  // Fetch Planet Data for Graphs from Backend
  useEffect(() => {
    // The Sun does not have any data other than images and overview
    
    let type = props.type;

    if (
      props.selectedPlanet === "sun" &&
      !(type === "Images" || type === "Overview")
    ) {
      type = "Overview";
    }

    // Pluto does not have atmospheric or interior composition data
    if (
      props.selectedPlanet === "pluto" &&
      (type === "Atmospheric Composition" || type === "Interior Composition")
    ) {
      type = "Overview";
    }

    const fetchData = async (selectedType) => {
      try {
        const data = await getPlanetData();
        const coreData = await getPlanetCoreData();
        const atmosData = await getPlanetAtmosData();

        switch (selectedType) {
          case "Overview":
            setPlanetData({
              type: selectedType,
              selectedPlanet: props.selectedPlanet,
            });
            break;
          case "Images":
            setPlanetData({
              type: selectedType,
              selectedPlanet: props.selectedPlanet,
            });
            break;
          case "Moons":
          case "Orbit":
          case "Temperature":
          case "Gravity":
          case "Axis Tilt":
            console.log("Data:", data);
            setPlanetData({
              type: selectedType,
              selectedPlanet: props.selectedPlanet,
              data: data,
            });
            break;
          case "Interior Composition":
            setPlanetData({
              type: selectedType,
              selectedPlanet: props.selectedPlanet,
              data: coreData,
            });
            break;
          case "Atmospheric Composition":
            setPlanetData({
              type: selectedType,
              selectedPlanet: props.selectedPlanet,
              data: atmosData,
            });
            break;
          default:
            setPlanetData({
              type: "Overview",
              selectedPlanet: props.selectedPlanet,
            });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData(type);
  }, [props.type, props.selectedPlanet]);

  return (
    <div className="data-view">
      {planetData && planetData.type && planetData.selectedPlanet && (
        <>
          <h2>{planetData.type}</h2>
          <div className="graphic-container">
            {planetData.type === "Overview" && (
              <Overview selectedPlanet={planetData.selectedPlanet} />
            )}
            {planetData.type === "Gravity" && (
              <BarChart
                data={planetData.data}
                selectedPlanet={planetData.selectedPlanet}
              />
            )}
            {planetData.type === "Moons" && (
              <NetworkGraph
                data={planetData.data}
                selectedPlanet={planetData.selectedPlanet}
              />
            )}
            {planetData.type === "Orbit" && (
              <OrbitGraph
                data={planetData.data}
                selectedPlanet={planetData.selectedPlanet}
              />
            )}
            {planetData.type === "Temperature" && (
              <TemperatureGraph
                data={planetData.data}
                selectedPlanet={planetData.selectedPlanet}
              />
            )}
            {planetData.type === "Axis Tilt" && (
              <TiltGraph
                data={planetData.data}
                selectedPlanet={planetData.selectedPlanet}
              />
            )}
            {planetData.type === "Interior Composition" && (
              <CoreGraph
                data={planetData.data}
                selectedPlanet={planetData.selectedPlanet}
              />
            )}
            {planetData.type === "Atmospheric Composition" && (
              <StackedBarChart
                data={planetData.data}
                selectedPlanet={planetData.selectedPlanet}
              />
            )}
            {planetData.type === "Images" && (
              <PlanetImages selectedPlanet={planetData.selectedPlanet} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
