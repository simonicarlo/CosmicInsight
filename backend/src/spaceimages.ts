import express from "express";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load .env first
if (fs.existsSync(".env")) {
  dotenv.config({ path: ".env" });
}

// Then load .env.local and overwrite variables if it exists
if (fs.existsSync(".env.local")) {
  dotenv.config({ path: ".env.local" });
}

dotenv.config();

const router = express.Router();

const planets = [
  "sun",
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];

async function fetchNasaImages(query) {
  const url = `https://images-api.nasa.gov/search?q=${query}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.collection && data.collection.items) {
      const images = data.collection.items
        .map((item) => {
          const link = item.links && item.links[0] && item.links[0].href;
          const description = item.data && item.data[0] && item.data[0].description;
          const title = item.data && item.data[0] && item.data[0].title;
      
          if (link &&  (link.endsWith('.jpg') || link.endsWith('.jpeg') || link.endsWith('.png'))){
            return {url: link, description, title};
          }          
          return null;
        })
        .filter((item) => item !== null);

      
      return images;


    } else {
      console.error("No items found in the response");
    }
  } catch (error) {
    console.error("Error fetching images from NASA images API:", error);
  }
}

router.get("/planets/:planet", async (req, res) => {
  const { planet } = req.params;

  if (!planets.includes(planet.toLowerCase())) {
    return res.status(400).json({ error: `Invalid planet name ${planet}` });
  }

  try {
    if (planet === "earth") {
      const images = await fetchNasaImages("Apollo earth");
      return res.json(images);
    } else {
      const images = await fetchNasaImages(`Hubble ${planet}`);
      return res.json(images);
    }
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ error: "Error fetching images" });
  }
});

router.get("/apod", async (req, res) => {
  /*const apiKey = process.env.NASA_API_KEY;

  if (!apiKey) {
    console.error(
      "NASA API key not found. Please add an API key to .env.local"
    );
    return res.status(500).json({
      error: "NASA API key not found. Please add an API key to .env.local",
    });
  }*/

  //const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
  const url = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching image of the day:", error);
    res.status(500).json({ error: "Error fetching image of the day" });
  }
});

router.get("/query/:query", async (req, res) => {
  const { query } = req.params;

  try {
    const images = await fetchNasaImages(query);
    return res.json(images);
  } catch (error) {
    console.error("Error fetching images:", error);
    return res.status(500).json({ error: "Error fetching images" });
  }
});

export default router;
