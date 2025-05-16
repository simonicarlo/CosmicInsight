import express from "express";
const router = express.Router();

const planets = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
];

router.get("/", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.le-systeme-solaire.net/rest/bodies/"
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const bodies = data.bodies;

    // Filter the bodies to only include the nine planets
    const planet_bodies = bodies.filter((body: any) =>
      planets.includes(body.englishName)
    );

    interface PlanetBody {
      englishName: string;
      avgTemp?: number;
      discoveryDate?: string;
      discoveredBy?: string;
      gravity: number;
      axialTilt?: number;
      sideralOrbit?: number;
      sideralRotation?: number;
      moons?: { moon: string }[];
      perihelion?: number;
      aphelion?: number;
    }

    // Combine all the data
    const planetData = planet_bodies.map((planet: PlanetBody) => ({
      name: planet.englishName,
      temperature: planet.avgTemp,
      discovery_year: planet.discoveryDate || "N/A",
      discovered_by: planet.discoveredBy || "Unknown",
      gravity: planet.gravity,
      axis_tilt: planet.axialTilt !== undefined ? planet.axialTilt : "N/A",
      sun_orbit_speed:
        planet.sideralOrbit !== undefined ? planet.sideralOrbit : "N/A",
      self_orbit_speed:
        planet.sideralRotation !== undefined ? planet.sideralRotation : "N/A",
      num_moons: planet.moons ? planet.moons.length : 0,
      moons: planet.moons?.map((moon) => moon.moon) || [],
      perihelion: planet.perihelion,
      aphelion: planet.aphelion,
    }));

    res.json(planetData); // Send data to frontend
  } catch (error) {
    console.error("Error fetching temperature data:", error);
    res.status(500).send("Failed to fetch temperature data.");
  }
});

export default router;
