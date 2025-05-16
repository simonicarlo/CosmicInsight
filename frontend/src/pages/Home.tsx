import React, { useEffect, useRef, useState } from "react";

import * as THREE from "three";

// Routing
import { useNavigate } from "react-router-dom";

import { BackgroundAnimation } from "../components/BackgroundAnimation.tsx";

// Styles
import "./Home.css";

// Solar System Controls
import { SolarControls } from "../components/solarControls/solarControls.tsx";
import { initializeScene } from "../solarsystem/scene.ts";
import { rotatePlanets } from "../solarsystem/planet.ts";

import {
  createPlanets,
  getOutlineMesh,
  resetOutlineMeshes,
  removeDistanceLine,
  updateDistanceLine,
  updatePlanetVisibility,
} from "../solarsystem/solarSystem.ts";

import { getPlanetConfigs } from "../helpers/fetchData.ts";
import { drawOrbits } from "../solarsystem/orbits.ts";
import { use } from "motion/react-client";

export default function Home() {
  const navigate = useNavigate(); // Hook to get the navigate function

  // ------ SOLAR SYSTEM STATE --------

  const [planetConfigs, setPlanetConfigs] = useState({}); // State for planet configs

  const selectedPlanets = useRef<string[]>([]); // Ref for selected planets
  const isCalculatingDistance = useRef(false); // Ref for distance calculation flag

  // Camera, Scene, Renderer Refs
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<THREE.OrbitControls>(null);

  // Planet Groups Ref
  const [planetGroups, setPlanetGroups] = useState<{
    [key: string]: THREE.Group;
  }>({});
  const planetGroupsRef = useRef<{ [key: string]: THREE.Group }>({});

  useEffect(() => {
    planetGroupsRef.current = planetGroups;
  }, [planetGroups]);

  // Sphere and Outline Meshes
  const sphereMeshes = useRef<THREE.Group[]>([]);
  const outlineMeshes = useRef<THREE.Group[]>([]);

  // ------ SOLARSYSTEM META PARAMETERS --------

  const planetVisibilityDistance = 5e9; // Distance at which to switch between sphere and point representation
  const scalingFactor = 1e6; // Scaling factor for everything that has size or position

  const sunRadius = 1.5e7 / scalingFactor;
  const planetRadius = 1e7 / scalingFactor;

  // ------ HELPER FUNCTIONS --------

  const handlePlanetClick = (planet: string) => {
    console.log("Clicked on planet:", planet);
    navigate(`/planets/${planet.toLowerCase()}`);
  };

  // ------ INITIALIZE SOLAR SYSTEM --------

  useEffect(() => {
    if (!planetGroups || !sceneRef.current || !cameraRef.current) {
      return;
    }

    // Clear previous scene and parameters
    sceneRef.current.clear();
    outlineMeshes.current = [];
    sphereMeshes.current = [];

    // Add ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    sceneRef.current.add(ambientLight);

    // Add planetGroups to scene
    Object.values(planetGroups).forEach((planetGroup: THREE.Group) => {
      sceneRef.current.add(planetGroup);
    });

    drawOrbits(sceneRef.current);

    // Collection of all spherical meshes (NOT outlines)

    for (const planetGroup of Object.values(planetGroups)) {
      planetGroup.children.forEach((child: THREE.Group) => {
        if (
          child.geometry instanceof THREE.SphereGeometry &&
          !child.isOutline
        ) {
          sphereMeshes.current.push(child);
        }
        if (child.isOutline) {
          outlineMeshes.current.push(child);
        }
      });
    }
  }, [planetConfigs]);

  useEffect(() => {
    // Get Planet Configs
    const containerInitial = spaceDivRef.current;

    if (!containerInitial) {
      return;
    }

    {
      // Scope to avoid leaking variables
      const { scene, camera, renderer, controls } =
        initializeScene(containerInitial);
      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;
      controlsRef.current = controls;
    }

    cameraRef.current.position.set(
      0,
      -5e9 / scalingFactor,
      5e9 / scalingFactor
    );

    containerInitial.appendChild(rendererRef.current.domElement);

    const fetchAndSetPlanetConfigs = async () => {
      const planetConfigs = await getPlanetConfigs();
      setPlanetConfigs(planetConfigs);

      // Create Planet Groups
      const planetNames = Object.keys(planetConfigs);
      const planetGroups = createPlanets(planetNames);
      setPlanetGroups(planetGroups);
    };

    fetchAndSetPlanetConfigs();

    let distanceLine = null;
    const distanceLineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
    });
    let distance = 0;

    let distanceTextSprite = null;
    const mouse = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    let textScale = 4;

    const renderloop = () => {
      controlsRef.current.update();
      distance = 0;

      if (
        !rendererRef.current ||
        !sceneRef.current ||
        !cameraRef.current ||
        !planetConfigs ||
        !planetGroupsRef.current ||
        !selectedPlanets.current ||
        !outlineMeshes.current ||
        !sphereMeshes.current
      ) {
        return;
      }

      // ---- Update Functions ----

      if (!isCalculatingDistance.current) {
        resetOutlineMeshes(outlineMeshes.current);
        removeDistanceLine(sceneRef.current, distanceLine, distanceTextSprite);
      }

      // Updates whether or not the planets are visible based on distances
      for (let planetGroup of Object.values(planetGroupsRef.current)) {
        updatePlanetVisibility(planetGroup, cameraRef.current);
      }

      // Update the line and text for the distance calculator
      if (distanceLine) {
        const result = updateDistanceLine(
          sceneRef.current,
          selectedPlanets.current,
          distanceLine,
          distance,
          distanceTextSprite,
          distanceLineMaterial,
          textScale,
          planetGroupsRef.current
        );
        distanceLine = result.distanceLine;
        distanceTextSprite = result.distanceTextSprite;
        distance = result.distance;
      }

      // Rotate the planet
      rotatePlanets(planetGroupsRef.current);

      // Render the scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    rendererRef.current.setAnimationLoop(renderloop);

    // -------------------------
    // Event Listeners
    // -------------------------

    const handleSceneClicks = (event) => {
      console.log("Clicked on scene");
      const container = spaceDivRef.current;
      // Convert mouse position to normalized device coordinates

      if (!sceneRef.current || !cameraRef.current || !planetGroupsRef.current) {
        return;
      }

      const containerRect = container.getBoundingClientRect();

      const mouseX = event.clientX - containerRect.left;
      const mouseY = event.clientY - containerRect.top;

      mouse.x = (mouseX / container.clientWidth) * 2 - 1;
      mouse.y = -(mouseY / container.clientHeight) * 2 + 1;

      // Use raycaster to detect intersections
      raycaster.setFromCamera(mouse, cameraRef.current);

      // Use raycaster to detect intersections with sphereMeshes
      const intersects = raycaster.intersectObjects(sphereMeshes.current);

      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;

        // Find the planet group that contains the intersected mesh
        const planetName = Object.keys(planetGroupsRef.current).find((name) =>
          planetGroupsRef.current[name].children.includes(intersectedMesh)
        );

        if (planetName) {
          // ROUTE TO PLANET PAGE
          if (!isCalculatingDistance.current) {
            handlePlanetClick(planetName);
          } else {
            // Distance calculator mode
            // If the planet is already selected, reset the selection
            if (selectedPlanets.current.includes(planetName)) {
              selectedPlanets.current = [];
              resetOutlineMeshes(outlineMeshes.current);
              removeDistanceLine(
                sceneRef.current,
                distanceLine,
                distanceTextSprite
              );
              return;
            }

            const outlineMesh = getOutlineMesh(
              planetName,
              planetGroupsRef.current
            );
            // There are already 2 selected planets -> reset and add new one
            if (selectedPlanets.current.length === 2) {
              selectedPlanets.current = [];
              resetOutlineMeshes(outlineMeshes.current);
              removeDistanceLine(
                sceneRef.current,
                distanceLine,
                distanceTextSprite
              );

              selectedPlanets.current.push(planetName);
              if (outlineMesh) outlineMesh.visible = true;
              return;
            }

            // Otherwise, add the selected planet
            selectedPlanets.current.push(planetName);

            if (outlineMesh) outlineMesh.visible = true;

            // Calculate distance if 2 planets are selected
            if (selectedPlanets.current.length === 2) {
              if (!distanceLine) {
                const result = updateDistanceLine(
                  sceneRef.current,
                  selectedPlanets.current,
                  distanceLine,
                  distance,
                  distanceTextSprite,
                  distanceLineMaterial,
                  textScale,
                  planetGroupsRef.current
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
    containerInitial.addEventListener("click", handleSceneClicks);

    // -------- Hovering over planets --------

    // Create a popup for planet info
    const popup = document.createElement("div");
    popup.style.position = "absolute";
    popup.style.background = "rgba(0, 0, 0, 0.5)";
    popup.style.color = "white";
    popup.style.paddingLeft = "30px";
    popup.style.paddingRight = "30px";
    popup.style.paddingTop = "10px";
    popup.style.paddingBottom = "10px";
    popup.style.border = "3px solid white"; // Add white border outline
    popup.style.borderRadius = "5px";
    popup.style.display = "block"; // or another suitable value
    popup.style.fontFamily = "'Gill Sans', sans-serif !important";
    popup.style.fontSize = "15px"; // Adjust font size if needed
    popup.style.pointerEvents = "none"; // Ignore mouse events on the popup itself
    popup.style.setProperty(
      "font-family",
      "'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif",
      "important"
    );

    document.body.appendChild(popup);

    const handleSceneHover = (event) => {
      const container = spaceDivRef.current;
      const containerRect = container.getBoundingClientRect();

      const mouseX = event.clientX - containerRect.left;
      const mouseY = event.clientY - containerRect.top;

      mouse.x = (mouseX / container.clientWidth) * 2 - 1;
      mouse.y = -(mouseY / container.clientHeight) * 2 + 1;

      // Use raycaster to detect intersections
      raycaster.setFromCamera(mouse, cameraRef.current);

      // Use raycaster to detect intersections with sphereMeshes
      const intersects = raycaster.intersectObjects(sphereMeshes.current);

      if (intersects.length > 0) {
        const intersectedMesh = intersects[0].object;

        // Find the planet group that contains the intersected mesh
        const planetName = Object.keys(planetGroupsRef.current).find((name) =>
          planetGroupsRef.current[name].children.includes(intersectedMesh)
        );

        if (planetName) {
          const planetGroup = planetGroupsRef.current[planetName];
          const planetPosition = planetGroup.position;

          popup.style.display = "block";
          popup.textContent =
            planetName.charAt(0).toUpperCase() + planetName.slice(1);
          popup.style.fontFamily = "'Gill Sans', sans-serif !important";
          popup.style.left = `${event.clientX + 15}px`;
          popup.style.top = `${event.clientY + 15}px`;
        }
      } else {
        popup.style.display = "none";
      }
    };

    containerInitial.addEventListener("mousemove", handleSceneHover);

    return () => {
      containerInitial.removeChild(rendererRef.current.domElement);
      containerInitial.removeEventListener("click", handleSceneClicks);
      containerInitial.removeEventListener("mousemove", handleSceneHover);
      document.body.removeChild(popup);
      rendererRef.current.dispose();
    };
  }, []);

  const spaceDivRef = useRef<HTMLDivElement>(null); // Ref for the scace div

  return (
    <BackgroundAnimation>
      <div className="space-view" ref={spaceDivRef}>
        <SolarControls
          isCalculatingDistance={isCalculatingDistance}
          //setIsCalculatingDistance={setIsCalculatingDistance}
          selectedPlanets={selectedPlanets}
          planetGroups={planetGroups}
        />
      </div>
    </BackgroundAnimation>
  );
}
