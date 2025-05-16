import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { text } from "stream/consumers";

const NetworkGraph = ({ data, selectedPlanet }) => {
  const svgRef = useRef<SVGSVGElement | null>(null); // Reference to the SVG element

  const [svgSize, setSvgSize] = useState({ width: 600, height: 400 }); // Default size

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
    if (!selectedPlanet || !data) {
      return;
    }

    const planetData = data.find(
      (planet) => planet.name.toLowerCase() === selectedPlanet
    );

    if (!planetData) return;

    // ---------------- Parameters ---------------
    const planetName =
      selectedPlanet.charAt(0).toUpperCase() + selectedPlanet.slice(1); // Capitalize planet name

    const textDistance = 20; // Distance between node and label

    // Hard coded planet colors:
    const planetColors = {
      sun: "orange",
      mercury: "gray",
      venus: "#523d1a",
      earth: "#4083ff",
      mars: "#a64d4e",
      jupiter: "orange",
      saturn: "#6d6354",
      uranus: "#9bbfcc",
      neptune: "#475a7d",
      pluto: "#5b3837",
    };

    const moonColor = "lightblue"; // Color for moons

    // -------------------------------------------

    const moons = planetData.moons || [];
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove(); // Clear existing elements

    const { width, height } = svgSize;

    svgElement.attr("width", width).attr("height", height);

    // Nodes (planet and moons)
    const nodes = [
      { id: selectedPlanet, group: 0, x: width / 2, y: height / 2 }, // Planet at center
      ...moons.map((moon, i) => ({
        id: moon,
        group: 1,
        x: width / 2 + Math.cos((2 * Math.PI * i) / moons.length) * 100,
        y: height / 2 + Math.sin((2 * Math.PI * i) / moons.length) * 100,
      })),
    ];

    // Links (planet to each moon)
    const links = moons.map((moon) => ({
      source: selectedPlanet,
      target: moon,
    }));

    // Force simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2));

    // Links: lines connecting nodes
    const link = svgElement
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 2);

    // Nodes: circles for planet and moons
    const node = svgElement
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => (d.group === 0 ? 20 : 10)) // Larger radius for the planet
      .attr("fill", (d) =>
        d.group === 0 ? planetColors[selectedPlanet] : moonColor
      )
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Add labels for each node
    svgElement
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("dy", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("pointer-events", "none") // Prevent text from being selectable
      .text((d) => d.id);

    // Update positions on simulation tick
    // Add labels for each node
    const labels = svgElement
      .append("g")
      .selectAll("text")
      .data(nodes)
      .enter()
      .append("text")
      .attr("x", (d) => d.x) // Position label horizontally
      .attr("y", (d) => d.y - textDistance) // Position label slightly above the node
      .attr("text-anchor", "middle") // Center the label
      .style("font-size", "14px") // Font size for legibility
      .style("fill", "white") // Text color
      .style("font-family", "Arial, sans-serif") // Clear font family
      .style("pointer-events", "none") // Prevent text from being selectable
      .text((d) => d.id.charAt(0).toUpperCase() + d.id.slice(1)); // Set the label text to the node ID

    // Update positions on simulation tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);

      labels
        .attr("x", (d) => d.x) // Update label x position
        .attr("y", (d) => d.y - 25); // Update label y position
    });

    simulation.force(
      "charge",
      d3.forceManyBody().strength(-500) // Increase negative value to repel more strongly
    );

    // Drag event handlers
    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop(); // Cleanup
  }, [data, svgSize, selectedPlanet]);

  return <svg ref={svgRef}></svg>;
};

export default NetworkGraph;
