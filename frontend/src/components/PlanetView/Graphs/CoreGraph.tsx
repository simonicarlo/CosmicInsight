import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface PlanetLayer {
  name: string; //composition name
  percentageRadius: number; // composition percentage
}

interface PlanetCores {
  name: string; //planet name
  layers: PlanetLayer[]; //planet layers
}

interface CoreData {
  planets: PlanetCores[];
}

interface CoreGraphProps {
  data: CoreData;
  selectedPlanet: string;
}

const CoreGraph: React.FC<CoreGraphProps> = ({ data, selectedPlanet }) => {
  const svgRef = useRef<SVGSVGElement | null>(null); // Reference to the SVG element

  const [svgSize, setSvgSize] = useState({ width: 600, height: 400 }); // Default size

  //handle responsiveness
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector(
        ".graphic-container"
      ) as HTMLElement;

      if (container) {
        setSvgSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize); // Cleanup on unmount
    };
  }, []);

  useEffect(() => {
    if (!isCoreData(data) || !selectedPlanet) {
      console.warn("No planets data available or data is undefined.");
      return;
    }
    // Ensure planets array exists
    const planetData = data.planets.find(
      (planet) => planet.name === selectedPlanet
    );
    const layers = planetData?.layers;

    // Map of layer names to placeholder colors
    const nameToColorMap: Record<string, string> = {
      "Molten Outer Core": "#FF5733",
      "Solid Inner Core": "#FFC300",
      "Rocky Mantle": "#DAF7A6",
      "Solid Crust": "#581845",
      "Solid Anticrust": "#C70039",
      Core: "#ffdb57",
      Mantle: "#7d1b1b",
      Crust: "#d1a87b",
      "Inner Core": "#ffdb57",
      "Outer Core": "#FF5733",
      "Lithospheric Mantle": "#6e5248",
      "Middle Mantle": "#900C3F",
      "Transition Zone": "#FF5733",
      "Basal Magma Ocean": "#FFC300",
      "Metallic Hydrogen": "#8191b8",
      "Molecular Hydrogen": "#517ee8",
      "Icy Mantle": "#39cbdb",
      Atmosphere: "#a9bfc2",
      "Silicate Core": "#8f8f8f",
      "Liquid Water Ocean": "#0a00cc",
      "Water Ice Crust": "#1fbcff",
    };

    // Get max radius based on the smallest dimension of the SVG
    const maxRadius = Math.min(svgSize.width, svgSize.height) / 2 - 20;

    // Calculate radii for each layer
    let cumulativeRadius = 0;
    const arcs = layers?.map((layer) => {
      const startRadius = cumulativeRadius;
      const layerThickness = (layer.percentageRadius / 100) * maxRadius;
      cumulativeRadius += layerThickness;

      return {
        name: layer.name,
        startRadius,
        endRadius: cumulativeRadius,
      };
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Remove previous elements

    const canvas = svg
      .attr("width", svgSize.width)
      .attr("height", svgSize.height)
      .append("g")
      .attr(
        "transform",
        `translate(${svgSize.width / 2}, ${svgSize.height / 2 + maxRadius/2})`
      ); // Centering the graph in the middle of the SVG

    const arcGenerator = d3
      .arc()
      .innerRadius((d: any) => d.startRadius)
      .outerRadius((d: any) => d.endRadius)
      .startAngle(Math.PI / 2)
      .endAngle(0);

    // Draw each arc
    canvas
      .selectAll("path")
      .data(arcs!)
      .enter()
      .append("path")
      .attr("d", arcGenerator as any)
      .attr("fill", (d) => nameToColorMap[d.name] || "#ccc")
      .attr("opacity", 0) // Start with invisible arcs
      .transition() // Start a transition
      .delay((d, i) => i * 500) // Delay each arc by 500ms multiplied by its index
      .duration(1000) // Animate over 500ms
      .attr("opacity", 1); // Fade in to full opacity;

    // Add labels
    const labelArc = d3
      .arc()
      .innerRadius(
        (d: any) => d.startRadius + (d.endRadius - d.startRadius) / 2
      )
      .outerRadius(
        (d: any) => d.startRadius + (d.endRadius - d.startRadius) / 2
      )
      .startAngle(0)
      .endAngle(0);

    canvas
      .selectAll("text")
      .data(arcs!)
      .enter()
      .append("text")
      .attr("transform", (d: any) => {
        const [x, y] = labelArc.centroid(d); // Get the centroid coordinates
        return `translate(${x - 20}, ${y})`; // Center the text
      })
      .attr("text-anchor", "end") // Make sure text is centered
      .style("font-size", "16px")
      .attr("fill", "white") // Set text color to white
      .text((d) => d.name)
      .attr("opacity", 0) // Start with invisible arcs
      .transition() // Start a transition
      .delay((d, i) => i * 500) // Delay each arc by 500ms multiplied by its index
      .duration(1000) // Animate over 500ms
      .attr("opacity", 1); // Fade in to full opacity;
  }, [data, selectedPlanet, svgSize]);

  return <svg ref={svgRef}></svg>;
};

function isCoreData(data: any): data is CoreData {
  return (
    typeof data === "object" &&
    data !== null &&
    Array.isArray(data.planets) &&
    data.planets.every(
      (planet) =>
        typeof planet.name === "string" &&
        Array.isArray(planet.layers) &&
        planet.layers.every(
          (layer) =>
            typeof layer.name === "string" &&
            typeof layer.percentageRadius === "number"
        )
    )
  );
}

export default CoreGraph;
