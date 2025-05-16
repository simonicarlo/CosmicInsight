import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

import * as THREE from "three";

import { getPlanetConfigs } from "../helpers/fetchData.ts";
import { createPlanet, getScene } from "../planetvisuals/planet.ts";

import "./Planet.css";

import DataView from "../components/PlanetView/DataView.tsx";
import Toolbar from "../components/PlanetView/Toolbar.tsx";
import PlanetNavigation from "../components/PlanetNavigation.tsx";

import { useAppState } from "../contexts/appState.tsx";

const planetImages = import.meta.glob("../assets/planets/planet-*.png", {
  eager: true,
});

export default function Planet() {
  const { appState } = useAppState();

  // Get Current Planet from URL
  const [selectedPlanet, setSelectedPlanet] = useState("earth"); //state for selected planet

  const { planet } = useParams();

  useEffect(() => {
    if (planet) setSelectedPlanet(planet);
  }, [planet]);

  // Current Data View

  const [selectedDataType, setSelectedDataType] = useState("Overview"); // state for selected data type
  const handleSelection = (selection: string) => {
    setSelectedDataType(selection);
  };

  // Fallback image

  if (!planetImages) {
    console.error("No planet images found");
    return;
  }
  const planetImageModule = (planetImages[
    `../assets/planets/planet-${selectedPlanet}.png`
  ] || planetImages[`../assets/planets/planet-placeholder.png`]) as {
    default: string;
  };

  if (!planetImageModule) {
    console.error("No planet image found");
    return;
  }

  const planetImage = planetImageModule.default;

  // Helper Function
  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Variables needed for rendering
  const [planetConfigs, setPlanetConfigs] = useState(null);

  const planetConfig = useRef(null);
  const rotateTargets = useRef(null);

  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const orbitControlsRef = useRef(null);

  const planetSize = useRef(0);

  // Resize Handler
  // Handle window resize
  const handleResize = () => {
    const container = document.getElementById("planet-container");
    const { clientWidth, clientHeight } = container;

    // Update camera aspect ratio
    cameraRef.current.aspect = clientWidth / clientHeight;

    // Ensure renderer matches the container size
    rendererRef.current.setSize(clientWidth, clientHeight);

    // Dynamically adjust camera position
    const fovRadians = (cameraRef.current.fov * Math.PI) / 180; // Convert FOV to radians
    const containerAspect = clientWidth / clientHeight;

    // Calculate camera distance based on the wider dimension
    const cameraDistance =
      containerAspect >= 1 // Wider viewport
        ? planetSize.current / Math.tan(fovRadians / 2)
        : planetSize.current / Math.tan(fovRadians / 2) / containerAspect;

    cameraRef.current.position.z = cameraDistance + planetSize.current * 0.5; // Add padding for better visibility
    cameraRef.current.updateProjectionMatrix();

    // Update orbit controls
    orbitControlsRef.current.update();
  };

  useEffect(() => {
    const container = document.getElementById("planet-container");
    const { renderer, scene, orbit, camera } = getScene();

    rendererRef.current = renderer;
    sceneRef.current = scene;
    cameraRef.current = camera;
    orbitControlsRef.current = orbit;

    container.appendChild(renderer.domElement);

    const fetchAndSetPlanetConfigs = async () => {
      const planetConfigs = await getPlanetConfigs();
      setPlanetConfigs(planetConfigs);
    };

    fetchAndSetPlanetConfigs();

    // Animation loop
    const animate = () => {
      if (!planetConfig.current) return;
      if (!rotateTargets.current) return;
      if (rotateTargets.current.planet)
        rotateTargets.current.planet.rotateY(
          planetConfig.current.rotationSpeed
        );
      if (rotateTargets.current.earth_lights)
        rotateTargets.current.earth_lights.rotateY(
          planetConfig.current.rotationSpeed
        );
      if (rotateTargets.current.clouds)
        rotateTargets.current.clouds.rotateY(
          planetConfig.current.rotationSpeed * 1.5
        );
      if (rotateTargets.current.glow_mesh)
        rotateTargets.current.glow_mesh.rotateY(
          planetConfig.current.rotationSpeed
        );
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    rendererRef.current.setAnimationLoop(animate);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      rendererRef.current.setAnimationLoop(null);
      container.removeChild(rendererRef.current.domElement);
      rendererRef.current.dispose();
    };
  }, []);

  useEffect(() => {
    if (!planetConfigs) return;

    planetConfig.current = planetConfigs[selectedPlanet];

    const updatePlanet = async () => {
      const planet = await createPlanet(selectedPlanet, planetConfig.current);

      // Clear the scene
      sceneRef.current.children = [];
      sceneRef.current.background = null;
      sceneRef.current.add(planet);

      // Reset the Camera
      cameraRef.current.position.set(7.7, 5.25, 78.65);

      // Reset Controls
      orbitControlsRef.current.update();

      // Lighting
      if (selectedPlanet !== "sun") {
        const ambientLight = new THREE.AmbientLight(0x404040, 2);
        sceneRef.current.add(ambientLight);

        if (selectedPlanet == "saturn") {
          const directLight = new THREE.DirectionalLight(0x404040, 20);
          directLight.position.set(-5, 20, 2);
          sceneRef.current.add(directLight);
        } else {
          const directLight = new THREE.DirectionalLight(0x404040, 20);
          directLight.position.set(-5, 2, 2);
          sceneRef.current.add(directLight);
        }
      }

      // Set planet size
      planetSize.current = planetConfig.current.ring
        ? planetConfig.current.outerRadius
          ? planetConfig.current.outerRadius
          : 30
        : 30;

      if (selectedPlanet === "earth") {
        const targets = {
          planet: planet.children[0],
          earth_lights: planet.children[1],
          clouds: planet.children[2],
          glow_mesh: planet.children[3],
        };
        rotateTargets.current = targets;
      } else if (planetConfig.current.ring) {
        const targets = {
          planet: planet.children[0],
          ring: planet.children[1],
        };
        rotateTargets.current = targets;
      } else {
        const targets = { planet: planet.children[0] };
        rotateTargets.current = targets;
      }

      handleResize();
    };

    updatePlanet();
  }, [planetConfigs, selectedPlanet]);
  return (
    <div className="view planet">
      <div className="heading">
        <h1>{capitalize(selectedPlanet)}</h1>
      </div>
      <div id="planet-container" className="visual"></div>

      <div className="information">
        <Toolbar
          selectedPlanet={selectedPlanet}
          onSelection={handleSelection}
        />
        <DataView selectedPlanet={selectedPlanet} type={selectedDataType} />
      </div>
      {!appState.mobile && <PlanetNavigation />}
    </div>
  );
}
