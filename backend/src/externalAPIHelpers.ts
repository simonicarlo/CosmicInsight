// Function to fetch Wikipedia summaries
export const fetchWikipediaSummary = async (planetName: string) => {
  // Check if the planet is Mercury and set the custom URL for it
  const apiUrl =
    planetName === "Mercury"
      ? "https://en.wikipedia.org/api/rest_v1/page/summary/Mercury_(planet)"
      : `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          planetName
        )}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch Wikipedia summary for ${planetName}`);
    }
    const data = await response.json();
    return data.extract || "No summary available.";
  } catch (error) {
    console.error(`Error fetching Wikipedia summary for ${planetName}:`, error);
    return "No summary available.";
  }
};
