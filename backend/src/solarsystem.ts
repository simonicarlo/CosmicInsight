import express from "express";
import fs from "fs";
import path from "path";
const router = express.Router();

/*import { fileURLToPath } from "url"; // Import fileURLToPath
// Helper to get the directory name for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);*/

router.get("/planetconfigs", async (req, res) => {
  const filePath = path.join(__dirname, "/data/planet_configs.json");

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

router.get("/planetconfigs/:planet", async (req, res) => {
  const { planet } = req.params;
  const filePath = path.join(__dirname, `/data/planet_config.json`);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err); // Log the error for debugging
      res.status(500).send("Error reading file");
      return;
    }
    res.setHeader("Content-Type", "application/json");

    // Extract the data for the requested planet
    const jsonData = JSON.parse(data);
    const planetData = jsonData[planet];
    if (!planetData) {
      res.status(404).send("Planet not found");
      return;
    }
    res.send(planetData);
  });
});

router.get("/planetpositions", async (req, res) => {
  const filePath = path.join(
    __dirname,
    "/data/planet_positions_assembled.json"
  );

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

router.get("/planetpositions_daily", async (req, res) => {
  const filePath = path.join(
    __dirname,
    "/data/planet_positions_assembled_2000-01-01_2099-12-31.json"
  );

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

// TEMPORARY OVERVIEW DATA

// router.get("/planetdata/:planet", async (req, res) => {
//   const { planet } = req.params;
//   const filePath = path.join(__dirname, `/temp-planetOverviewData/planet.json`);

//   fs.readFile(filePath, "utf8", (err, data) => {
//     if (err) {
//       console.error("Error reading file:", err);
//       res.status(500).send("Error reading file");
//       return;
//     }
//     try {
//       const jsonData = JSON.parse(data); // Ensure the file is valid JSON
//       res.setHeader("Content-Type", "application/json");
//       res.json(jsonData);
//       console.log("Sent data for planet:", planet);
//     } catch (parseError) {
//       console.error("Error parsing JSON:", parseError);
//       res.status(500).send("Error parsing JSON file");
//     }
//   });
// });

export default router;

// Legacy data endpoints, both replaced by getPlanetConfigs
/*
router.get("/planetproperties", async (req, res) => {
  const filePath = path.join(__dirname, "/data/planet_properties.json");

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

router.get("/sunproperties", async (req, res) => {
  const filePath = path.join(__dirname, "/data/sun_properties.json");

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
*/
