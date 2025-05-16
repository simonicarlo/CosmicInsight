import { useEffect, useState } from "react";
import { getPlanetOverviewData, getBasicPlanetData } from "../../../helpers/fetchData";

interface Planet {
  selectedPlanet: string;
}

export default function Overview({ selectedPlanet }: Planet) {
  const [planetDescription, setPlanetDescription] = useState<string>("");
  const [planetData, setPlanetData] = useState<any>({});
  const [showMessage, setShowMessage] = useState<boolean>(true); // State to control the visibility of the message box

  // Fetch planet data from backend
  useEffect(() => {
    const fetchPlanetData = async () => {
      try {
        const data = await getBasicPlanetData();

        if (data && data[selectedPlanet]) {
          setPlanetData(data[selectedPlanet]);
        } else {
          setPlanetData("Data not available.");
        }
      } catch (error) {
        console.error("Error fetching planet data:", error);
        setPlanetData("Data not available.");
      }
    };

    fetchPlanetData();
  }, [selectedPlanet]);

  // Fetch planet descriptions from backend
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        const selectedPlanetData = await getPlanetOverviewData(selectedPlanet);

        if (selectedPlanetData) {
          setPlanetDescription(selectedPlanetData.summary);
        } else {
          setPlanetDescription("Description not available.");
        }
      } catch (error) {
        console.error("Error fetching planet overview:", error);
        setPlanetDescription("Description not available.");
      }
    };

    fetchOverviewData();
  }, [selectedPlanet]);

  return (
    <div className="overview-container" style={{ paddingLeft: "15px", paddingRight: "15px" }}>
       
      {/* 2x2 table with planet data */}
      {planetData && planetData["Mean Radius"] && (
        <table>
          <thead>
            <tr>
              <th>Mean Radius</th>
              <th>Average Temperature</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{planetData["Mean Radius"]} km</td>
              <td>{planetData["Average Temperature"]} °C</td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th>Escape Velocity</th>
              <th>Mass</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{planetData["Escape Velocity"]} km/s</td>
              <td>{planetData["Mass"]} kg</td>
            </tr>
          </tbody>
        </table>
      )}

      {/* Planet Description */}
      <p className="overview-description">{planetDescription || "Loading..."}</p>

      {/* Wikipedia Link */}
      <p style={{ marginTop: "20px" }}>
        Learn more on the {"  "}
        <a
          href={
            selectedPlanet === "mercury"
              ? "https://en.wikipedia.org/wiki/Mercury_(planet)"
              : `https://en.wikipedia.org/wiki/${encodeURIComponent(selectedPlanet)}`
          }
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#007BFF" }}
          role="link"
        >
          Wikipedia page
        </a>
        .
      </p>
    </div>
  );
}
