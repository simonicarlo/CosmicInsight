import * as THREE from "three";
import { getPlanetConfigs, getPlanetPositions } from "../helpers/fetchData.ts";

const scalingFactor = 1e6; // Scaling factor for everything that has size or position

// days it takes for each planet to complete an orbit around the sun
const orbitalPeriods: { [key: string]: number } = {
  mercury: 88,
  venus: 225,
  earth: 365.25,
  mars: 687,
  jupiter: 4333,
  saturn: 10759,
  uranus: 30687,
  neptune: 60190,
  pluto: 90560,
};

const orbitalParameters = {
  mercury: {
    semiMajor: 57909050,
    semiMinor: 56995045,
    eccentricity: 0.206,
    inclination: 7.005,
  },
  venus: {
    semiMajor: 108208000,
    semiMinor: 108207996,
    eccentricity: 0.007,
    inclination: 3.394,
  },
  earth: {
    semiMajor: 149598023,
    semiMinor: 149577870,
    eccentricity: 0.017,
    inclination: 0,
  },
  mars: {
    semiMajor: 227939200,
    semiMinor: 227668751,
    eccentricity: 0.093,
    inclination: 1.85,
  },
  jupiter: {
    semiMajor: 778340821,
    semiMinor: 776987436,
    eccentricity: 0.049,
    inclination: 1.305,
  },
  saturn: {
    semiMajor: 1433529000,
    semiMinor: 1429435080,
    eccentricity: 0.057,
    inclination: 2.485,
  },
  uranus: {
    semiMajor: 2875040000,
    semiMinor: 2873722406,
    eccentricity: 0.046,
    inclination: 0.772,
  },
  neptune: {
    semiMajor: 4495060000,
    semiMinor: 4494604848,
    eccentricity: 0.01,
    inclination: 1.768,
  },
  pluto: {
    semiMajor: 5906380000,
    semiMinor: 5779308264,
    eccentricity: 0.249,
    inclination: 17.16,
  },
};

// Import planet positions
let getPlanets = async () => {
  const planets = await getPlanetConfigs();
  let planetNames = Object.keys(planets);
  // Remove sun since there is no data for it
  planetNames = planetNames.filter((name) => name !== "sun");
  return planetNames;
};

// --------- OLD IMPLEMENTATION ---------
// (multiple overlapping lines for each planet, displays all data points)

// Creates orbits for each planet
// const createPlanetPositionsObject = async (planetPositions) => {
//   const planetNames = await getPlanets();
//   const planet_orbits = {};
//   sfor (let day in planetPositions) {
//     for (let planet of planetNames) {
//       if (planet_orbits[planet]) {
//         planet_orbits[planet].push(planetPositions[day][planet]);
//       } else {
//         planet_orbits[planet] = [planetPositions[day][planet]];
//       }
//     }
//   }
//   return planet_orbits;
// };

// const drawOrbitByPlanet = (planet, planet_orbits, scene) => {
//   const geometry = new THREE.BufferGeometry();

//   // Flatten and scale the positions
//   const positions = new Float32Array(
//     planet_orbits[planet].flat().map((coord) => coord / scalingFactor) // Scale each coordinate
//   );

//   geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//   const material = new THREE.LineBasicMaterial({ color: "gray" });
//   const line = new THREE.Line(geometry, material);
//   if (!scene) console.log("orbit.ts: Scene is null");
//   scene.add(line);
// };

// export const drawOrbits = async (scene) => {
//   const planetPositions = await getPlanetPositions();
//   const planet_orbits = await createPlanetPositionsObject(planetPositions);

//   const planetNames = await getPlanets();
//   for (let planet of planetNames)
//     drawOrbitByPlanet(planet, planet_orbits, scene);
// };
// -------------------------------------

// --------- NEW IMPLEMENTATION ---------
// (single line for each planet, displays a interpolating curve orbit)

// Create planet orbit with sampled positions
const createPlanetOrbit = (planet, planetPositions) => {
  const period = orbitalPeriods[planet]; // Get orbital period
  const positions = [];

  const dateKeys = Object.keys(planetPositions);
  const newPeriod = Math.floor(period / 5); // Sample smaller period for efficiency

  for (let day = 0; day < newPeriod; day++) {
    if (day >= dateKeys.length) {
      console.error(
        `Day ${day} exceeds the number of dates in the dataset for ${planet}`
      );
      break;
    }

    const dateKey = dateKeys[day];
    const planetLowercase = planet.toLowerCase();
    const position = planetPositions[dateKey][planetLowercase];

    if (position) {
      // Add position (scaled for Three.js)
      positions.push(
        new THREE.Vector3(
          position[0] / scalingFactor,
          position[1] / scalingFactor,
          position[2] / scalingFactor
        )
      );
    } else {
      console.error(
        `Position for planet "${planetLowercase}" not found on date "${dateKey}"`
      );
    }
  }

  return positions;
};

// Draw smooth orbit using CatmullRomCurve3
const drawOrbitByPlanet = (planet, planetOrbit, scene) => {
  // Create a Catmull-Rom spline curve from the positions
  const curve = new THREE.CatmullRomCurve3(planetOrbit, true); // Closed loop

  // Generate points along the curve
  const curvePoints = curve.getPoints(300); // Increase for more smoothness

  // Create geometry from the curve points
  const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);

  // Create a material for the orbit
  const material = new THREE.LineBasicMaterial({ color: "gray", linewidth: 1 });

  // Create the line object and add it to the scene
  const line = new THREE.Line(geometry, material);
  if (!scene) console.error("orbit.ts: Scene is null");
  scene.add(line);
};

export const drawOrbits = async (scene) => {
  const planetPositions = await getPlanetPositions(); // JSON data
  const planetNames = await getPlanetConfigs(); // List of planet names
  const planetList = Object.keys(planetNames).filter((name) => name !== "sun");

  for (let planet of planetList) {
    // Create a single orbit path for each planet based on the orbital period
    const planetOrbit = createPlanetOrbit(planet, planetPositions);

    // Draw the smooth orbit in the scene
    drawOrbitByPlanet(planet, planetOrbit, scene);
    addStars(scene, 20000, 1000);
  }
};

const addStars = (
  scene: THREE.Scene,
  radius: number = 10000,
  starCount: number = 500
) => {
  const geometry = new THREE.SphereGeometry(1, 8, 8); // Small spheres for stars/dust
  const material = new THREE.MeshBasicMaterial({ color: 0xffffff }); // White color for stars

  for (let i = 0; i < starCount; i++) {
    // Generate random position within the radius
    const x = Math.random() * 2 * radius - radius;
    const y = Math.random() * 2 * radius - radius;
    const z = Math.random() * 2 * radius - radius;

    // Generate a random size for each star
    const size = Math.random() * 8 + 0.5; // Random size between 0.5 and 2

    const star = new THREE.Mesh(geometry, material);
    star.position.set(x, y, z);
    star.scale.set(size, size, size); // Set random scale (size)

    scene.add(star);
  }
};

// --------- SINGLE LINE IMPLEMENTATION ---------
// Implmentation of orbits with just straight lines and a single line for each planet (NOT SMOOTH)

// const createPlanetOrbit = (planet, planetPositions) => {
//   const period = orbitalPeriods[planet]; // Get orbital period
//   const positions = [];

//   // Get the dates from planetPositions (assuming dates are sequential)
//   const dateKeys = Object.keys(planetPositions);

//   const newPeriod = period/4.98;

//   // We want to sample one full orbit, so we loop for one full period
//   for (let day = 0; day < newPeriod ; day++) {
//     if(day >= dateKeys.length) {
//       console.error(`Day ${day} exceeds the number of dates in the dataset for` + planet);
//       break;
//     }

//     const dateKey = dateKeys[day];

//     // Ensure planet name is lowercase before accessing the positions
//     const planetLowercase = planet.toLowerCase();

//     // Directly access the planet position for the given date
//     const position = planetPositions[dateKey][planetLowercase];
//     if (position) {
//       positions.push(position);
//     } else {
//       console.error(`Position for planet "${planetLowercase}" not found on date "${dateKey}"`);
//     }
//   }

//   console.log("Positions for one full orbit: " + planet + " ", positions);
//   return positions;
// };

// const drawOrbitByPlanet = (planet, planetOrbit, scene) => {
//   const geometry = new THREE.BufferGeometry();

//   // Flatten and scale the positions
//   const positions = new Float32Array(
//     planetOrbit.flat().map((coord) => coord / scalingFactor) // Scale each coordinate
//   );

//   geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
//   const material = new THREE.LineBasicMaterial({ color: "gray", linewidth: 100000 });
//   const line = new THREE.Line(geometry, material);

//   if (!scene) console.log("orbit.ts: Scene is null");
//   scene.add(line);
// };

// export const drawOrbits = async (scene) => {
//   const planetPositions = await getPlanetPositions(); // JSON data
//   const planetNames = await getPlanets(); // List of planet names

//   for (let planet of planetNames) {
//     // Create a single orbit path for each planet based on the orbital period
//     const planetOrbit = createPlanetOrbit(planet, planetPositions);

//     // Draw the orbit in the scene
//     drawOrbitByPlanet(planet, planetOrbit, scene);
//   }
// };
