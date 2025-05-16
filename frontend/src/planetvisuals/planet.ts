import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { getFresnelMat } from "./getFresnelMat.js";

import { type PlanetConfig } from "../helpers/fetchData.ts";

/*// Configure texture loader & lighting
const textureLoader = new THREE.TextureLoader(); //loads textures onto geometry from image

const loadTexture = async (loader, texturePath) => {
  return new Promise((resolve, reject) => {
    loader.load(
      texturePath, // Relative URL to the texture
      (texture) => resolve(texture), // On success
      undefined, // Optional onProgress callback
      (error) => {
        console.error(`Failed to load texture from ${texturePath}:`, error);
        reject(error); // On error
      }
    );
  });
};

// Function to create planets

async function create_planet(
  planetName,
  config: PlanetConfig
): Promise<THREE.Group> {
  const planet_group = new THREE.Group();
  planet_group.rotation.z = (config.tilt * Math.PI) / 180;

  const geometry = new THREE.IcosahedronGeometry(30, 16);
  const mat = new THREE.MeshStandardMaterial({
    map: textureLoader.load(config.texture),
    //wireframe: true,
  });

  const mainTexture = await loadTexture(textureLoader, config.texture);

  if (!mainTexture) {
    console.error(`No main texture found for planet: ${planetName}`);
    return;
  }

  let mat;
  if (planetName === "earth") {
    const bumpTexture = await loadTexture(textureLoader, config.bumpTextures);
    const specularTexture = await loadTexture(
      textureLoader,
      config.specularTextures
    );

    mat = new THREE.MeshStandardMaterial({
      map: mainTexture,
      /*bumpMap: bumpTexture,
      bumpScale: 0.04,
    });
  } else if (planetName === "sun") {
    mat = new THREE.MeshStandardMaterial({
      map: mainTexture,
      emissive: 0xffffff,
      emissiveIntensity: 1,
      emissiveMap: mainTexture,
    });
  } else {
    mat = new THREE.MeshStandardMaterial({
      map: mainTexture,
    });
  }

  const planet = new THREE.Mesh(geometry, mat);
  planet_group.add(planet);

  if (planetName === "earth") {
    const earthTextures = {
      clouds: await loadTexture(textureLoader, config.cloudTextures),
      cloudAlpha: await loadTexture(textureLoader, config.cloudAlphaTextures),
      light: await loadTexture(textureLoader, config.lightTextures),
      specular: await loadTexture(textureLoader, config.specularTextures),
      bump: await loadTexture(textureLoader, config.bumpTextures),
    };

    const lights_mat = new THREE.MeshStandardMaterial({
      map: earthTextures.light,
      blending: THREE.AdditiveBlending,
      emissive: 0xffffff,
      emissiveMap: earthTextures.light,
      emissiveIntensity: 0.5,
    });
    const earth_lights = new THREE.Mesh(geometry, lights_mat);
    planet_group.add(earth_lights);

    // Add clouds
    const cloud_mat = new THREE.MeshStandardMaterial({
      map: earthTextures.clouds,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      alphaMap: earthTextures.cloudAlpha,
    });
    const clouds = new THREE.Mesh(geometry, cloud_mat);
    clouds.scale.setScalar(1.003);
    planet_group.add(clouds);

    // Get cool blue glow
    const fresnelMat = getFresnelMat();
    const glow_mesh = new THREE.Mesh(geometry, fresnelMat);
    glow_mesh.scale.setScalar(1.01);
    planet_group.add(glow_mesh);
  }

  if (config.ring) {
    const ringTexture = await loadTexture(textureLoader, config.ringTexture);

    const ring_geo = new THREE.RingGeometry(
      config.innerRadius,
      config.outerRadius,
      32
    );
    const ring_mat = new THREE.MeshBasicMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
    });
    const planet_ring = new THREE.Mesh(ring_geo, ring_mat);
    planet_ring.rotation.x = -0.5 * Math.PI;
    planet_group.add(planet_ring);
  }

  return planet_group;
}

export const renderPlanet = async (container, planet): Promise<() => void> => {
  console.log("renderPlanet called on planet:", planet);

  // Create a new scene each time due to async loading
  // Set Up Renderer
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping; //sets it to nicer color grading
  renderer.outputColorSpace = THREE.SRGBColorSpace; //sets RGB color space

  //Set Up Camera
  const camera = new THREE.PerspectiveCamera(
    75, //field of View
    window.innerWidth / window.innerHeight, //aspect (always width/height)
    0.1, //near clipping plane
    1000 //far clipping plane
  );

  const orbit = new OrbitControls(camera, renderer.domElement); //allows for the interaction

  orbit.enableZoom = false; // disables zoom
  orbit.enablePan = false; // disables pan

  camera.position.set(7.7, 5.25, 78.65);
  orbit.update(); //must update orbit whenever you change camera position
  const scene = new THREE.Scene();

  if (!container) {
    console.error("No container found");
    return () => null;
  }

  const planetConfigs: PlanetConfigs = await getPlanetConfigs();

  const planetConfig = planetConfigs[planet];

  if (!planetConfig) {
    console.error(`No configuration found for planet: ${planet}`);
    return () => null;
  }

  // clear previous scene & animation

  renderer.setAnimationLoop(null);

  // Lighting
  if (planet !== "sun") {
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight(0x404040, 20);
    directLight.decay = 0;
    directLight.position.set(-3, 2, 2);
    scene.add(directLight);
  }

  // Remove background
  scene.background = null;

  // create planet: TODO
  let rotateTargets: {
    planet?: THREE.Mesh;
    earth_lights?: THREE.Mesh;
    clouds?: THREE.Mesh;
    glow_mesh?: THREE.Mesh;
    ring?: THREE.Mesh;
  } = {};

  let planet_group: THREE.Group; // Declare planet_group outside

  planet_group = await create_planet(planet, planetConfig);
  scene.add(planet_group);
  if (planet === "earth") {
    rotateTargets = {
      planet: planet_group.children[0],
      earth_lights: planet_group.children[1],
      clouds: planet_group.children[2],
      glow_mesh: planet_group.children[3],
    };
  } else if (planetConfig.ring) {
    rotateTargets = {
      planet: planet_group.children[0],
      ring: planet_group.children[1],
    };
  } else {
    rotateTargets = { planet: planet_group.children[0] };
  }

  // Animation loop
  function animate() {
    if (!planetConfig) return;
    if (rotateTargets.planet)
      rotateTargets.planet.rotateY(planetConfig.rotationSpeed);
    if (rotateTargets.earth_lights)
      rotateTargets.earth_lights.rotateY(planetConfig.rotationSpeed);
    if (rotateTargets.clouds)
      rotateTargets.clouds.rotateY(planetConfig.rotationSpeed * 1.5);
    if (rotateTargets.glow_mesh)
      rotateTargets.glow_mesh.rotateY(planetConfig.rotationSpeed);
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);

  const handleResize = () => {
    const { clientWidth, clientHeight } = container;

    // Update camera aspect ratio
    camera.aspect = clientWidth / clientHeight;

    // Ensure renderer matches the container size
    renderer.setSize(clientWidth, clientHeight);

    // Dynamically adjust camera position
    const fovRadians = (camera.fov * Math.PI) / 180; // Convert FOV to radians
    const planetSize = planetConfig.ring
      ? planetConfig.outerRadius
        ? planetConfig.outerRadius
        : 30
      : 30; // Use ring size if available
    const containerAspect = clientWidth / clientHeight;

    // Calculate camera distance based on the wider dimension
    const cameraDistance =
      containerAspect >= 1 // Wider viewport
        ? planetSize / Math.tan(fovRadians / 2)
        : planetSize / Math.tan(fovRadians / 2) / containerAspect;

    camera.position.z = cameraDistance + planetSize * 0.5; // Add padding for better visibility
    camera.updateProjectionMatrix();

    //console.log(`Camera Distance: ${cameraDistance}, Aspect: ${camera.aspect}`);
  };
  // Responsive to window size
  handleResize();
  window.addEventListener("resize", handleResize);

  container.appendChild(renderer.domElement);

  return () => {
    console.log("cleanup function called");
    if (container) {
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    }
  };
};
*/

const textureLoader = new THREE.TextureLoader();

// Texture loader wrapper for async functionality
export const loadTexture = async (loader, texturePath) => {
  return new Promise((resolve, reject) => {
    loader.load(
      texturePath,
      (texture) => resolve(texture),
      undefined,
      (error) => reject(error)
    );
  });
};

export const getScene = () => {
  // Set up the renderer and scene
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  const orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableZoom = false;
  orbit.enablePan = false;

  camera.position.set(7.7, 5.25, 78.65);
  orbit.update();
  const scene = new THREE.Scene();

  return { renderer, camera, orbit, scene };
};

// Helper function to create the planet
export async function createPlanet(
  planetName,
  config: PlanetConfig
): Promise<THREE.Group> {
  const planet_group = new THREE.Group();
  planet_group.rotation.z = (config.tilt * Math.PI) / 180;

  const geometry = new THREE.IcosahedronGeometry(30, 16);

  const mainTexture = await loadTexture(textureLoader, config.texture);

  if (!mainTexture) {
    console.error(`No main texture found for planet: ${planetName}`);
    return;
  }

  let mat;
  if (planetName === "earth") {
    const bumpTexture = await loadTexture(textureLoader, config.bumpTextures);
    const specularTexture = await loadTexture(
      textureLoader,
      config.specularTextures
    );

    mat = new THREE.MeshStandardMaterial({
      map: mainTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.04,
    });
  } else if (planetName === "sun") {
    mat = new THREE.MeshStandardMaterial({
      map: mainTexture,
      emissive: 0xffffff,
      emissiveIntensity: 1,
      emissiveMap: mainTexture,
    });
  } else {
    mat = new THREE.MeshStandardMaterial({
      map: mainTexture,
    });
  }

  const planet = new THREE.Mesh(geometry, mat);
  planet_group.add(planet);

  if (planetName === "earth") {
    const earthTextures = {
      clouds: await loadTexture(textureLoader, config.cloudTextures),
      cloudAlpha: await loadTexture(textureLoader, config.cloudAlphaTextures),
      light: await loadTexture(textureLoader, config.lightTextures),
      specular: await loadTexture(textureLoader, config.specularTextures),
      bump: await loadTexture(textureLoader, config.bumpTextures),
    };

    const lights_mat = new THREE.MeshStandardMaterial({
      map: earthTextures.light,
      blending: THREE.AdditiveBlending,
      emissive: 0xffffff,
      emissiveMap: earthTextures.light,
      emissiveIntensity: 0.5,
    });
    const earth_lights = new THREE.Mesh(geometry, lights_mat);
    planet_group.add(earth_lights);

    // Add clouds
    const cloud_mat = new THREE.MeshStandardMaterial({
      map: earthTextures.clouds,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      alphaMap: earthTextures.cloudAlpha,
    });
    const clouds = new THREE.Mesh(geometry, cloud_mat);
    clouds.scale.setScalar(1.003);
    planet_group.add(clouds);

    // Get cool blue glow
    const fresnelMat = getFresnelMat();
    const glow_mesh = new THREE.Mesh(geometry, fresnelMat);
    glow_mesh.scale.setScalar(1.01);
    planet_group.add(glow_mesh);
  }

  if (config.ring) {
    const ringTexture = await loadTexture(textureLoader, config.ringTexture);

    const ring_geo = new THREE.RingGeometry(
      config.innerRadius,
      config.outerRadius,
      32
    );
    const ring_mat = new THREE.MeshStandardMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
    });
    const planet_ring = new THREE.Mesh(ring_geo, ring_mat);
    planet_ring.rotation.x = -0.5 * Math.PI;
    planet_group.add(planet_ring);
  }

  return planet_group;
}
