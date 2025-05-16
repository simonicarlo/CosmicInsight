import express from "express";
import fs from "fs";
import path from "path";
const router = express.Router();

/*import { fileURLToPath } from "url"; // Import fileURLToPath
// Helper to get the directory name for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);*/

import { fetchWikipediaSummary } from "./externalAPIHelpers";

const planets = [
  "Sun",
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

router.get("/basic", async (req, res) => {
  const filePath = path.join(__dirname, "/data_graphs/planetBasicData.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err); // Log the error for debugging
      res.status(500).send("Error reading file");
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

router.get("/coredata", async (req, res) => {
  const filePath = path.join(__dirname, "/data_graphs/planetCores.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err); // Log the error for debugging
      res.status(500).send("Error reading file");
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

router.get("/atmospheredata", async (req, res) => {
  const filePath = path.join(__dirname, "/data_graphs/planetAtmospheres.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err); // Log the error for debugging
      res.status(500).send("Error reading file");
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

/*router.get("/overviewdata", async (req, res) => {
  const filePath = path.join(__dirname, "/data_graphs/planetOverviewData.json");

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err); // Log the error for debugging
      res.status(500).send("Error reading file");
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});*/

router.get("/overviewdata", async (req, res) => {
  try {
    // Fetch data for all planets in parallel
    const summaries = await Promise.all(
      planets.map(async (planet) => ({
        name: planet,
        summary: await fetchWikipediaSummary(planet),
      }))
    );

    res.json(summaries); // Send data to the frontend
  } catch (error) {
    console.error("Error fetching planet summaries:", error);
    res.status(500).send("Failed to fetch planet summaries.");
  }
});

router.get("/overviewdata/:planet", async (req, res) => {
  const { planet } = req.params;

  const Planet = planet.charAt(0).toUpperCase() + planet.slice(1); // capitalize the first letter

  if (!planets.includes(Planet)) {
    return res.status(400).json({ error: `Invalid planet name ${planet}` });
  }

  try {
    const summary = await fetchWikipediaSummary(Planet);
    res.json({ name: Planet, summary });
  } catch (error) {
    console.error("Error fetching planet summary:", error);
    res.status(500).json({ error: "Error fetching planet summary" });
  }
});

export default router;
