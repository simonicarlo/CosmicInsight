import React, { useEffect } from "react";

import { fetchPlanetImages } from "../../helpers/fetchImages";

import "./PlanetImages.css";
import { url } from "inspector";
import { desc } from "motion/react-client";
import { title } from "process";

export default function PlanetImages(props: { selectedPlanet: string }) {
  const [images, setImages] = React.useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      const imageElements = await fetchPlanetImages(props.selectedPlanet);
      setImages(imageElements.map((element) => ({
        url: element.url,
        desc: element.description,
        title: element.title
      })));
    };

    fetchImages();
  }, [props.selectedPlanet]);

  return (
    <div className="planet-images">
      {images.map((image, index) => (
        <img key={index} src={image.url} alt={image.title} title={image.description} />
      ))}
    </div>
  );
}
