import * as THREE from "three";

import { getPlanetPositionsDaily } from "../helpers/fetchData.ts";

const planetVisibilityDistance = 5e9; // Distance at which to switch between sphere and point representation
const scalingFactor = 1e6; // Scaling factor for everything that has size or position

const sunRadius = 1.5e7 / scalingFactor;
const planetRadius = 1e7 / scalingFactor;

// texture imports
import earthTexture from "../assets/planetTextures/earth/earth.jpg";
import mercuryTexture from "../assets/planetTextures/mercury.jpg";
import venusTexture from "../assets/planetTextures/venus.jpg";
import marsTexture from "../assets/planetTextures/mars.jpg";
import jupiterTexture from "../assets/planetTextures/jupiter.jpg";
import saturnTexture from "../assets/planetTextures/saturn.jpg";
import saturnRingTexture from "../assets/planetTextures/saturn_ring.png";
import uranusTexture from "../assets/planetTextures/uranus.jpg";
import uranusRingTexture from "../assets/planetTextures/uranus_ring.png";
import neptuneTexture from "../assets/planetTextures/neptune.jpg";
import plutoTexture from "../assets/planetTextures/pluto.jpg";
import sunTexture from "../assets/planetTextures/sun.jpg";
import Planet from "../pages/Planet.tsx";

const textureLoader = new THREE.TextureLoader();

// Colors for when the planets are far away (point representation)
// Define the association as an object
const planetColors: Record<string, string> = {
  mercury: "#b5b5b5", // Gray
  venus: "#e6b600", // Yellow
  earth: "#1f77b4", // Blue
  mars: "#d62728", // Red
  jupiter: "#ff7f0e", // Orange
  saturn: "#f5d17f", // Light Yellow
  uranus: "#2ca02c", // Light Blue-Green
  neptune: "#1f77b4", // Dark Blue
};

// Function to get the color of a planet
function getPlanetColor(planet: string): string | undefined {
  return planetColors[planet];
}

function createCircleTexture(size = 100) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return;
  }

  // Draw a circle
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  ctx.fillStyle = "white";
  ctx.fill();

  // Make the background transparent
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 10, 0, 2 * Math.PI);
  ctx.fillStyle = "black";
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// --------------- SUN ----------------
// Function to create planet positions object

const loadedsunTexture = textureLoader.load(sunTexture);
export const createSunGroup = (): THREE.Group => {
  // Sphere representation (for close-up)
  const sunGeometry = new THREE.SphereGeometry(sunRadius, 32, 32);
  const sunMaterial = new THREE.MeshStandardMaterial({
    map: loadedsunTexture,
    emissive: 0xffffff,
    emissiveMap: loadedsunTexture,
    emissiveIntensity: 1,
  });
  const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);

  // Point representation (for far away)

  const circleTexture = createCircleTexture(20); // You can adjust the size as needed

  const pointMaterial = new THREE.PointsMaterial({
    size: 10, // Adjust size as necessary
    sizeAttenuation: false, // Keep constant size
    map: circleTexture, // Apply the circular texture
    transparent: true, // Ensure transparency works correctly
    color: 0xffff00, // Use the planet color
  });

  /*const pointMaterial = new THREE.PointsMaterial({
    size: 10,
    color: 0xffff00,
    sizeAttenuation: false,
  });*/

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(3), 3)
  );
  const sunPoint = new THREE.Points(pointGeometry, pointMaterial);

  // Outline representation (for selection)
  const outlineGeometry = new THREE.SphereGeometry(sunRadius * 1.1, 32, 32);
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.BackSide,
  });
  const sunOutline = new THREE.Mesh(outlineGeometry, outlineMaterial);
  sunOutline.visible = false; // Hidden by default
  sunOutline.isOutline = true; // Tag the outline mesh (for updatePlanetVisibility)

  // Add a PointLight to make the sun emit light

  const sunLight = new THREE.PointLight(0xffffaa, 5, 0); // Color, intensity, distance (0 = infinite)
  sunLight.decay = 0; // Ensure the light intensity does not decrease with distance
  sunLight.castShadow = true; // Optional: Enable shadows if needed
  sunLight.position.set(0, 0, 0); // Ensure the light is at the sun's center

  // Group to hold all representations
  const group = new THREE.Group();
  group.add(sunMesh);
  group.add(sunPoint);
  group.add(sunOutline);
  group.add(sunLight); // Add the light to the group
  group.planetName = "sun"; // Store planet name in group

  group.position.set(0, 0, 0); // Set group position

  return group;
};

// --------------- PLANETS ----------------

// Function to create planet representations
export const createPlanetGroup = (planetName): THREE.Group => {
  // Sphere representation (for close-up)
  const sphereGeometry = new THREE.SphereGeometry(planetRadius, 32, 32);
  let sphereMaterial;

  if (planetName === "earth") {
    sphereMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(earthTexture),
    });
  } else if (planetName === "mercury") {
    sphereMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(mercuryTexture),
    });
  } else if (planetName === "venus") {
    sphereMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(venusTexture),
    });
  } else if (planetName === "mars") {
    sphereMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(marsTexture),
    });
  } else if (planetName === "jupiter") {
    sphereMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(jupiterTexture),
    });
  } else if (planetName === "saturn") {
    sphereMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(saturnTexture),
    });
  } else if (planetName === "uranus") {
    sphereMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(uranusTexture),
    });
  } else if (planetName === "neptune") {
    sphereMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(neptuneTexture),
    });
  } else if (planetName === "pluto") {
    sphereMaterial = new THREE.MeshStandardMaterial({
      map: textureLoader.load(plutoTexture),
    });
  }

  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);

  // Point representation (for far away)

  const color = getPlanetColor(planetName) || "#ffffff";

  /*const pointMaterial = new THREE.PointsMaterial({
    size: 10,
    color: color,
    sizeAttenuation: false,
  });*/

  const circleTexture = createCircleTexture(20); // You can adjust the size as needed

  const pointMaterial = new THREE.PointsMaterial({
    size: 10, // Adjust size as necessary
    sizeAttenuation: false, // Keep constant size
    map: circleTexture, // Apply the circular texture
    transparent: true, // Ensure transparency works correctly
    color: color, // Use the planet color
  });

  const pointGeometry = new THREE.BufferGeometry();
  pointGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(3), 3)
  );
  const pointMesh = new THREE.Points(pointGeometry, pointMaterial);

  // Outline representation (for selection)
  const outlineGeometry = new THREE.SphereGeometry(planetRadius * 1.1, 32, 32);
  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    side: THREE.BackSide,
  });
  const planetOutline = new THREE.Mesh(outlineGeometry, outlineMaterial);
  planetOutline.visible = false; // Hidden by default
  planetOutline.isOutline = true; // Tag the outline mesh (for updatePlanetVisibility)

  // rotate for textures:
  //sphereMesh.rotation.x = 0.5 * Math.PI;

  // Group to hold all representations
  const group = new THREE.Group();
  group.add(sphereMesh);
  group.add(pointMesh);
  group.add(planetOutline);
  group.planetName = planetName; // Store planet name in group

  group.position.set(0, 0, 0); // Set group position

  // FOR RING PLANETS (SATURN, URANUS)
  if (planetName === "saturn") {
    const ring_geo = new THREE.RingGeometry(
      planetRadius * 1.2,
      planetRadius * 1.8,
      32
    );
    const ring_mat = new THREE.MeshBasicMaterial({
      map: textureLoader.load(saturnRingTexture),
      side: THREE.DoubleSide,
    });
    const planet_ring = new THREE.Mesh(ring_geo, ring_mat);

    planet_ring.rotation.x = -0.5 * Math.PI;

    group.add(planet_ring);
  }
  if (planetName === "uranus") {
    const ring_geo = new THREE.RingGeometry(
      planetRadius * 1.1,
      planetRadius * 1.5,
      32
    );
    const ring_mat = new THREE.MeshBasicMaterial({
      map: textureLoader.load(uranusRingTexture),
      side: THREE.DoubleSide,
    });
    const planet_ring = new THREE.Mesh(ring_geo, ring_mat);
    planet_ring.rotation.x = -0.5 * Math.PI;
    group.add(planet_ring);
  }

  return group;
};

// Update visibility based on distance
export const updatePlanetVisibility = (group, camera) => {
  const distance = camera.position.distanceTo(group.position);

  const transitionDistance = planetVisibilityDistance / scalingFactor; // Transition between sphere and point representation

  group.children.forEach((child) => {
    if (child.isOutline) return;

    if (child.isMesh || child.isPoints) {
      if (distance < transitionDistance) {
        if (
          child.geometry instanceof THREE.SphereGeometry ||
          child.geometry instanceof THREE.RingGeometry
        ) {
          child.visible = true; // Show sphere mesh
        } else {
          child.visible = false; // Hide point representation
        }
      } else {
        if (
          child.geometry instanceof THREE.SphereGeometry ||
          child.geometry instanceof THREE.RingGeometry
        ) {
          child.visible = false; // Hide sphere mesh
        } else {
          child.visible = true; // Show point representation
        }
      }
    }
  });
};

export const updatePositions = async (date, planetGroups) => {
  const dayKey = date.toISOString().split("T")[0]; // Get the key for the current day

  const planet_positions_daily = await getPlanetPositionsDaily();

  //const planetPositions = planet_positions;
  const planetPositions = planet_positions_daily;

  // Iterate over each planetGroup (using the keys as planetNames)
  for (let planetName in planetGroups) {
    if (planetName === "sun") continue; // Skip the Sun
    const planetGroup = planetGroups[planetName]; // Access the group for the current planet

    // Check if the planet's position is available for the given day
    if (planetPositions[dayKey] && planetPositions[dayKey][planetName]) {
      planetGroup.visible = true; // Make the group visible if position is available
      planetGroup.position.x =
        planetPositions[dayKey][planetName][0] / scalingFactor; // Update the X position
      planetGroup.position.y =
        planetPositions[dayKey][planetName][1] / scalingFactor; // Update the Y position
      planetGroup.position.z =
        planetPositions[dayKey][planetName][2] / scalingFactor; // Update the Z position
    } else {
      planetGroup.visible = false; // Hide the group if no position data is available
    }
  }
};

export const rotatePlanets = (planetGroups) => {
  for (let planetName in planetGroups) {
    if (planetName === "sun") continue; // Skip the Sun
    const planetGroup = planetGroups[planetName]; // Access the group for the current planet

    planetGroup.rotation.x = 0.5 * Math.PI;

    if (planetName === "earth") {
      planetGroup.rotation.y += 0.01; // Rotate the planet
    } else if (planetName === "mercury") {
      planetGroup.rotation.y += 0.004; // Rotate the planet
    } else if (planetName === "venus") {
      planetGroup.rotation.y += -0.015; // Rotate the planet
    } else if (planetName === "mars") {
      planetGroup.rotation.y += 0.008; // Rotate the planet
    } else if (planetName === "jupiter") {
      planetGroup.rotation.y += 0.002; // Rotate the planet
    } else if (planetName === "saturn") {
      planetGroup.rotation.y += 0.009; // Rotate the planet
    } else if (planetName === "uranus") {
      planetGroup.rotation.y += 0.01; // Rotate the planet
    } else if (planetName === "neptune") {
      planetGroup.rotation.y += 0.004; // Rotate the planet
    } else if (planetName === "pluto") {
      planetGroup.rotation.y += 0.01; // Rotate the planet
    }
  }
};
