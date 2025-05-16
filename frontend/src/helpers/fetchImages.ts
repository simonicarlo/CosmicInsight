const apiUrl = import.meta.env.VITE_API_URL;
console.log("API URL: ", apiUrl); // Output: http://localhost:5000

export const fetchImageOfTheDay = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/images/apod`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching image of the day:", error);
    return {};
  }
};

export const fetchPlanetImages = async (planet) => {
  try {
    const response = await fetch(`${apiUrl}/api/images/planets/${planet}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching images for planet:", error);
    return [];
  }
};

export const fetchQueryImages = async (query) => {
  try {
    const response = await fetch(`${apiUrl}/api/images/query/${query}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching images for query:", error);
    return [];
  }
};
