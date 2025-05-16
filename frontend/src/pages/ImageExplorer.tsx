import React, { useEffect, useState } from "react";

import "./ImageExplorer.css";

import { fetchImageOfTheDay, fetchQueryImages } from "../helpers/fetchImages";

const ImageExplorer = () => {
  const [apod, setApod] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");

  const [searchResults, setSearchResults] = useState([]);

  const [loading, setLoading] = useState(false);

  const fetchSearchResults = async () => {
    const resultElements = await fetchQueryImages(searchTerm);
    setSearchResults(resultElements.map((result) => result.url));
  };

  const handleSearch = async () => {
    setLoading(true);
    await fetchSearchResults();
    setLoading(false);
  };

  useEffect(() => {
    const fetchAPOD = async () => {
      const apod = await fetchImageOfTheDay();
      setApod(apod);
    };

    fetchAPOD();
  }, []);

  return (
    <div className="view image-view">
      <div className="image-explorer">
        <h1>Image Explorer</h1>
        {apod && (
          <>
            <div className="apod">
              <h2>NASAs Astronomy Picture of the Day</h2>
              <img src={apod.url} alt="Astronomy Picture of the Day" />
              <h3>{apod.title}</h3>
              <p>{apod.explanation}</p>
              <p>{"©" + apod.copyright}</p>
            </div>
            <div className="image-search">
              <h2>Search for Images in NASAs Database</h2>
              <div className="search">
                <input
                  className="image-search-input"
                  type="text"
                  placeholder="Search for images"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <button className="image-search-button" onClick={handleSearch}>
                  Search
                </button>
              </div>

              {loading ? (
                <p>Loading...</p>
              ) : (
                <div className="result-images">
                  {searchResults.map((url, index) => {
                    return (
                      <img
                        key={index}
                        src={url}
                        alt={`Search Result ${index}`}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ImageExplorer;
