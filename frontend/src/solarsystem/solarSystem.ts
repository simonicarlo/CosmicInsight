import * as THREE from "three";

import { setCameraPosition, initializeScene } from "./scene.ts";
import { drawOrbits } from "./orbits.ts";

import {
  createSunGroup,
  createPlanetGroup,
  updatePlanetVisibility,
  rotatePlanets,
} from "./planet.ts";

import { getPlanetConfigs } from "../helpers/fetchData.ts";

// Debug: Toggle text border visibility
const isTextBorderVisible = false; // Flag to toggle text border visibility

// ------ META PARAMETERS --------

const scalingFactor = 1e6; // Scaling factor for everything that has size or position

// -------- HELPER FUNCTIONS --------

// Create Planets
const createPlanets = (planetNames) => {
  const planetGroups: { [key: string]: THREE.Group } = {};
  if (!planetNames) {
    console.error("createPlanets: Planet names are null");
    return;
  }
  for (let planetName of planetNames) {
    if (planetName === "sun") {
      const sunGroup = createSunGroup();
      planetGroups[planetName] = sunGroup;
      continue;
    }

    planetGroups[planetName] = createPlanetGroup(planetName);
  }
  return planetGroups;
};

// Highlight the selected planet
const getOutlineMesh = (planetName, planetGroups) => {
  const planetGroup = planetGroups[planetName];
  if (!planetGroup) return null;

  // Look for the child with isOutline = true
  const outlineMesh = planetGroup.children.find(
    (child) => child.isMesh && child.isOutline
  );
  return outlineMesh || null; // Return null if not found
};

const resetOutlineMeshes = (outlineMeshes: THREE.Group[]) => {
  for (const outlineMesh of outlineMeshes) {
    outlineMesh.visible = false;
  }
};

// Function to create a sprite for text
function createTextSprite(
  message,
  parameters = {
    fontface: "Arial",
    fontsize: 24,
    borderColor: "white",
    borderWidth: null,
    color: "white",
  }
) {
  const fontface = parameters.fontface;
  const fontsize = parameters.fontsize;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  // Set canvas size for crisp text
  const scaleFactor = 4;
  canvas.width = 256 * scaleFactor;
  canvas.height = 128 * scaleFactor;

  if (!context) {
    console.error("createTextSprite: Unable to create 2D canvas context");
    return null;
  }

  context.font = `${fontsize * scaleFactor}px ${fontface}`;

  // Border
  if (isTextBorderVisible) {
    // Draw border around the canvas
    const borderColor = parameters.borderColor;
    const borderWidth = parameters.borderWidth || 4 * scaleFactor;

    context.lineWidth = borderWidth;
    context.strokeStyle = borderColor;

    // Adjust the border rectangle to fit within the canvas
    const halfBorder = borderWidth / 2;
    context.strokeRect(
      halfBorder,
      halfBorder,
      canvas.width - borderWidth,
      canvas.height - borderWidth
    );
  }

  context.fillStyle = parameters.color;
  context.textAlign = "center";
  context.textBaseline = "middle";

  // Draw text
  const padding = canvas.width * 0.1; // 10% padding
  context.fillText(message, canvas.width / 2, canvas.height / 2 - padding);

  // Create texture and sprite
  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(material);

  // Scale sprite to match text size
  //sprite.scale.set(50, 20, 10); // Adjust scale for desired size
  sprite.scale.set(100000000 / scalingFactor, 50000000 / scalingFactor, 10); // Adjust the scale to make the text more prominent

  return sprite;
}

const removeDistanceLine = (scene, distanceLine, distanceTextSprite) => {
  if (distanceLine) {
    scene.remove(distanceLine);
    distanceLine = null; // Updates the global variable
  }
  if (distanceTextSprite) {
    scene.remove(distanceTextSprite);
    distanceTextSprite = null; // Updates the global variable
  }
};

const updateDistanceLine = (
  scene,
  selectedPlanets,
  distanceLine,
  distance,
  distanceTextSprite,
  distanceLineMaterial,
  textScale,
  planetGroups
) => {
  if (selectedPlanets.length !== 2)
    return { distanceLine, distanceTextSprite, distance };

  const planet1 = planetGroups[selectedPlanets[0]].position;
  const planet2 = planetGroups[selectedPlanets[1]].position;

  // Create or update the distance line
  if (distanceLine) scene.remove(distanceLine); // Remove existing line
  const geometry = new THREE.BufferGeometry().setFromPoints([planet1, planet2]);
  distanceLine = new THREE.Line(geometry, distanceLineMaterial);
  scene.add(distanceLine);

  // Calculate distance
  distance = planet1.distanceTo(planet2);

  // Create text sprite for distance
  if (distanceTextSprite) scene.remove(distanceTextSprite); // Remove existing sprite
  const midpoint = new THREE.Vector3()
    .addVectors(planet1, planet2)
    .divideScalar(2);
  midpoint.y += 5; // Offset above the line

  // Adjust the text size based on distance
  //const textSize = Math.min(50, distance * 10);
  //distanceTextSprite = createTextSprite(`${(distance).toFixed(2)} Million km`, { fontsize: textSize });
  textScale = Math.max(4, (distance * distance) / 100); // Scale the text based on distance
  distanceTextSprite = createTextSprite(`${distance.toFixed(2)} Million km`);
  distanceTextSprite.position.copy(midpoint);

  scene.add(distanceTextSprite);

  return { distanceLine, distanceTextSprite, distance };
};

// exprot all helper functions
export {
  createPlanets,
  getOutlineMesh,
  resetOutlineMeshes,
  createTextSprite,
  removeDistanceLine,
  updateDistanceLine,
  updatePlanetVisibility,
};

// =================================================
// --------------- MAIN FUNCTION  -----------------
// =================================================

/*export async function initializeSolarSystem(
  container: HTMLElement,
  handlePlanetClick,
  planetConfigs,
  isCalculatingDistance,
  selectedPlanets,
  planetGroups
) {
  if (!container) {
    console.error("initializeSolarSystem: Container is null");
    return;
  }

  if (!planetConfigs) {
    console.error("initializeSolarSystem: Planet configs are null");
    return;
  }

  // Initialize Three.js rendering
  const { scene, camera, renderer, controls } = initializeScene(container);
  if (!scene) console.log("scene is null 1 ");

  //setCameraPosition(camera, 0, -1e10 / scalingFactor, 1e10 / scalingFactor); // Set initial camera position
  setCameraPosition(camera, 0, -5e9 / scalingFactor, 5e9 / scalingFactor);

  const planet_configs = await getPlanetConfigs();
  const planetNames = Object.keys(planet_configs);

  // Create Planets
  createPlanets(planetNames);

  let distanceTextSprite = null;
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let textScale = 4;

  // Collection of all spherical meshes (NOT outlines)
  const sphereMeshes: THREE.Group[] = [];
  const outlineMeshes: THREE.Group[] = [];

  for (const planetGroup of Object.values(planetGroups)) {
    planetGroup.children.forEach((child: THREE.Group) => {
      if (child.geometry instanceof THREE.SphereGeometry && !child.isOutline) {
        sphereMeshes.push(child);
      }
      if (child.isOutline) {
        outlineMeshes.push(child);
      }
    });
  }

  // ============================================
  // --------------- RENDER LOOP -----------------
  // ============================================

  let distanceLine = null;

  const distanceLineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

  let distance = 0;

  const renderloop = () => {
    controls.update();

    distance = 0;

    // ---- Update Functions ----

    if (!isCalculatingDistance.current) {
      resetOutlineMeshes(outlineMeshes);
      removeDistanceLine(scene, distanceLine, distanceTextSprite);
    }

    // Updates whether or not the planets are visible based on distances
    for (let planetGroup of Object.values(planetGroups))
      updatePlanetVisibility(planetGroup, camera);

    // Update the line and text for the distance calculator
    if (distanceLine) {
      const result = updateDistanceLine(
        scene,
        selectedPlanets.current,
        distanceLine,
        distance,
        distanceTextSprite,
        distanceLineMaterial,
        textScale,
        planetGroups
      );
      distanceLine = result.distanceLine;
      distanceTextSprite = result.distanceTextSprite;
      distance = result.distance;
    }

    // Rotate the planet
    rotatePlanets();

    // Render the scene
    renderer.render(scene, camera);
  };

  renderer.setAnimationLoop(renderloop);

  // ============================================
  // --------------- EVENT HANDLERS --------------
  // ============================================

  const handleSceneClicks = (event) => {
    // Convert mouse position to normalized device coordinates

    const containerRect = container.getBoundingClientRect();

    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;

    mouse.x = (mouseX / container.clientWidth) * 2 - 1;
    mouse.y = -(mouseY / container.clientHeight) * 2 + 1;

    //console.log("Clicked", mouse.x, mouse.y);

    // Use raycaster to detect intersections
    raycaster.setFromCamera(mouse, camera);

    // Use raycaster to detect intersections with sphereMeshes
    const intersects = raycaster.intersectObjects(sphereMeshes);

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object;

      // Find the planet group that contains the intersected mesh
      const planetName = Object.keys(planetGroups).find((name) =>
        planetGroups[name].children.includes(intersectedMesh)
      );

      if (planetName) {
        // ROUTE TO PLANET PAGE
        if (!isCalculatingDistance.current) {
          handlePlanetClick(planetName);
        } else {
          // Distance calculator mode

          // If the planet is already selected, reset the selection
          if (selectedPlanets.current.includes(planetName)) {
            selectedPlanets = [];
            resetOutlineMeshes(outlineMeshes);
            removeDistanceLine(scene, distanceLine, distanceTextSprite);
            return;
          }

          // There are already 2 selected planets -> reset and add new one
          if (selectedPlanets.current.length === 2) {
            selectedPlanets.current = [];
            resetOutlineMeshes(outlineMeshes);
            removeDistanceLine(scene, distanceLine, distanceTextSprite);

            selectedPlanets.current.push(planetName);
            const outlineMesh = getOutlineMesh(planetName);
            if (outlineMesh) outlineMesh.visible = true;
            return;
          }

          // Otherwise, add the selected planet
          selectedPlanets.current.push(planetName);
          const outlineMesh = getOutlineMesh(planetName);
          if (outlineMesh) outlineMesh.visible = true;

          // Calculate distance if 2 planets are selected
          if (selectedPlanets.current.length === 2) {
            if (!distanceLine) {
              const result = updateDistanceLine(
                scene,
                selectedPlanets.current,
                distanceLine,
                distance,
                distanceTextSprite,
                distanceLineMaterial,
                textScale
              );
              distanceLine = result.distanceLine;
              distanceTextSprite = result.distanceTextSprite;
              distance = result.distance;
            }
          }
        }
      }
    }
  };

  // Add click event listener for selecting planets
  container.addEventListener("click", handleSceneClicks);

  // -------- Hovering over planets --------

  // Create a popup for planet info
  const popup = document.createElement("div");
  popup.style.position = "absolute";
  popup.style.background = "rgba(0, 0, 0, 0.7)";
  popup.style.color = "white";
  popup.style.padding = "10px";
  popup.style.borderRadius = "5px";
  popup.style.display = "none";
  popup.style.pointerEvents = "none"; // Ignore mouse events on the popup itself
  document.body.appendChild(popup);

  const handleSceneHover = (event) => {
    const containerRect = container.getBoundingClientRect();

    const mouseX = event.clientX - containerRect.left;
    const mouseY = event.clientY - containerRect.top;

    mouse.x = (mouseX / container.clientWidth) * 2 - 1;
    mouse.y = -(mouseY / container.clientHeight) * 2 + 1;

    // Use raycaster to detect intersections
    raycaster.setFromCamera(mouse, camera);

    // Use raycaster to detect intersections with sphereMeshes
    const intersects = raycaster.intersectObjects(sphereMeshes);

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object;

      // Find the planet group that contains the intersected mesh
      const planetName = Object.keys(planetGroups).find((name) =>
        planetGroups[name].children.includes(intersectedMesh)
      );

      if (planetName) {
        //console.log("Hovering over: " + planetName);
        const planetGroup = planetGroups[planetName];
        const planetPosition = planetGroup.position;

        popup.style.display = "block";
        popup.textContent = planetName;
        popup.style.left = `${event.clientX + 10}px`;
        popup.style.top = `${event.clientY + 10}px`;
      }
    } else {
      popup.style.display = "none";
    }
  };

  container.addEventListener("mousemove", handleSceneHover);

  container.appendChild(renderer.domElement);

  // cleanup function
  return () => {
    // Cleanup DOM
    container.removeChild(renderer.domElement);

    document.body.removeChild(popup);

    // Cleanup Three.js
    renderer.dispose();

    container.removeEventListener("click", handleSceneClicks);
    container.removeEventListener("mousemove", handleSceneHover);
  };
}*/
