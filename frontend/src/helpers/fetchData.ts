export type PlanetConfig = {
  id: number;
  name: string;
  radius: number;
  mass: number;
  tilt: number;
  rotationSpeed: number;
  ring: boolean;
  innerRadius?: number;
  outerRadius?: number;
  texture: string;
  ringTexture?: string;
  specularTextures?: string;
  bumpTextures?: string;
  lightTextures?: string;
  cloudTextures?: string;
  cloudAlphaTextures?: string;
};

export type PlanetConfigs = {
  [key: string]: PlanetConfig;
};

const apiUrl = import.meta.env.VITE_API_URL;
console.log("API URL: ", apiUrl); // Output: http://localhost:5000

export const getPlanetConfigs = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/solarsystem/planetconfigs`);
    const planetConfigs: PlanetConfigs = await response.json();
    return planetConfigs;
  } catch (error) {
    console.error("Error fetching planet configs:", error);
    return {};
  }
};

export const getPlanetPositions = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/solarsystem/planetpositions`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching planet positions:", error);
    return {};
  }
};

let planetPositionsDaily = {};

export const getPlanetPositionsDaily = async () => {
  try {
    if (Object.keys(planetPositionsDaily).length === 0) {
      const response = await fetch(
        `${apiUrl}/api/solarsystem/planetpositions_daily`
      );
      planetPositionsDaily = await response.json();
    }
    return planetPositionsDaily;
  } catch (error) {
    console.error("Error fetching daily planet positions:", error);
    return {};
  }
};

export const getAllOverviewData = async () => {
  try {
    const res = await fetch(`${apiUrl}/api/planets/overviewdata`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching overview data:", error);
    return {};
  }
};

export const getBasicPlanetData = async () => {
  try {
    const res = await fetch(`${apiUrl}/api/planets/basic`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching overview data:", error);
    return {};
  }
};

export const getPlanetOverviewData = async (planet: string) => {
  try {
    const res = await fetch(`${apiUrl}/api/planets/overviewdata/${planet}`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching overview data:", error);
    return {};
  }
};

export const getPlanetData = async () => {
  try {
    const res = await fetch(`${apiUrl}/api/syssolaire/`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching planet data:", error);
    return {};
  }
};

export const getPlanetCoreData = async () => {
  try {
    const res = await fetch(`${apiUrl}/api/planets/coredata`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching planet core data:", error);
    return {};
  }
};

export const getPlanetAtmosData = async () => {
  try {
    const res = await fetch(`${apiUrl}/api/planets/atmospheredata`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching planet atmosphere data:", error);
    return {};
  }
};

/* LATER IMPLEMENT PER YEAR MAYBE 

export const getPlanetPositionsPerYear = async (year: number) => {
  const response = await fetch(`/api/planet-positions-per-year?year=${year}`);
        const data = await response.json();
        return data;
};

*/
