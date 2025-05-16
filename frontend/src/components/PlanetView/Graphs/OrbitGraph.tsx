import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const OrbitGraph = ({ data, selectedPlanet }) => {
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
      console.error(
        "Orbit Graph: No planet data available or data is undefined."
      );
      return;
    }

    const planetData = data.find(
      (planet) => planet.name.toLowerCase() === selectedPlanet
    );

    if (!planetData) {
      console.error(
        `Orbit Graph: No data available for planet ${selectedPlanet}.`
      );
      return;
    }

    const selfOrbitSpeed = planetData.self_orbit_speed || 0;
    const sunOrbitSpeed = planetData.sun_orbit_speed || 0;
    const perihelion = planetData.perihelion || 0;
    const aphelion = planetData.aphelion || 0;

    // Create the SVG element

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove(); // Clear existing elements

    const { width, height } = svgSize;

    const sunSize = width / 20; // Radius of the sun
    const planetSize = width / 20; // Radius of the planet

    const colorPlanet = "blue";
    const colorLine = "white";
    const colorText = "white";
    const colorArc = "orange";
    const colorSun = "yellow";

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

    // Oval-shaped orbit
    const semiMajorAxis = 200; // Long side (aphelion distance)
    const semiMinorAxis = 100; // Short side (perihelion distance)

    const lineOffset = 120;

    const sunDistance = 30;

    const textSize = "30px";

    const planetSpeed = 0.001; // Speed of the planet in radians

    const ringThickness = 2; // Adjust thickness as needed
    const ringColor = "white"; // Ring color

    svgElement.attr("width", width).attr("height", height);

    // Center coordinates
    const centerX = width / 2;
    const centerY = height / 2;

    // Transition Times:
    const sunTransitionTime = 1000;
    const ellipseTransitionTime = 1000;
    const planetTransitionTime = 1000;
    const lineTransitionTime = 1000;
    const textTransitionTime = 1000;

    const sunDelayTime = 0;
    const ellipseDelayTime = 1000;
    const planetDelayTime = 2000;
    const lineDelayTime = 3000;
    const textDelayTime = 4000;

    // Ellipse representing the orbit
    svgElement
      .append("ellipse")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("rx", semiMajorAxis)
      .attr("ry", semiMinorAxis)
      .style("fill", "none")
      .style("stroke", colorArc)
      .style("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .delay(ellipseDelayTime)
      .duration(ellipseTransitionTime)
      .attr("opacity", 1);

    // Line to the perihelion (closest point)
    svgElement
      .append("line")
      .attr("x1", centerX)
      .attr("y1", centerY + lineOffset)
      .attr("x2", centerX - semiMajorAxis) // Perihelion is at the left end of the semi-major axis
      .attr("y2", centerY + lineOffset)
      .style("stroke", colorLine)
      .style("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .delay(lineDelayTime)
      .duration(lineTransitionTime)
      .attr("opacity", 1);

    // Perhelion end line
    svgElement
      .append("line")
      .attr("x1", centerX - semiMajorAxis)
      .attr("y1", centerY + lineOffset - 5)
      .attr("x2", centerX - semiMajorAxis) // Perihelion is on the left side
      .attr("y2", centerY + lineOffset + 5)
      .style("stroke", colorLine)
      .style("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .delay(lineDelayTime)
      .duration(lineTransitionTime)
      .attr("opacity", 1);

    // Line to the aphelion (farthest point)
    svgElement
      .append("line")
      .attr("x1", centerX)
      .attr("y1", centerY + lineOffset)
      .attr("x2", centerX + semiMajorAxis) // Aphelion is on the right side
      .attr("y2", centerY + lineOffset)
      .style("stroke", colorLine)
      .style("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .delay(lineDelayTime)
      .duration(lineTransitionTime)
      .attr("opacity", 1);

    // Aphelion end line
    svgElement
      .append("line")
      .attr("x1", centerX + semiMajorAxis)
      .attr("y1", centerY + lineOffset - 5)
      .attr("x2", centerX + semiMajorAxis) // Perihelion is on the left side
      .attr("y2", centerY + lineOffset + 5)
      .style("stroke", colorLine)
      .style("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .delay(lineDelayTime)
      .duration(lineTransitionTime)
      .attr("opacity", 1);

    // Sun position line
    svgElement
      .append("line")
      .attr("x1", centerX - sunDistance)
      .attr("y1", centerY + lineOffset - 5)
      .attr("x2", centerX - sunDistance) // Perihelion is on the left side
      .attr("y2", centerY + lineOffset + 5)
      .style("stroke", colorLine)
      .style("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .delay(lineDelayTime)
      .duration(lineTransitionTime)
      .attr("opacity", 1);

    // Add text labels for perihelion and aphelion with actual distances
    svgElement
      .append("text")
      .attr("x", centerX - semiMajorAxis / 2) // Position near perihelion
      .attr("y", centerY + lineOffset)
      .attr("dy", 20) // Offset slightly to avoid overlap
      .attr("text-anchor", "middle")
      .attr("fill", colorText)
      .text(`Perihelion:`)
      .attr("opacity", 0)
      .transition()
      .delay(textDelayTime)
      .duration(textTransitionTime)
      .attr("opacity", 1);

    svgElement
      .append("text")
      .attr("x", centerX - semiMajorAxis / 2) // Position near perihelion
      .attr("y", centerY + lineOffset)
      .attr("dy", 40) // Offset slightly to avoid overlap
      .attr("text-anchor", "middle")
      .attr("fill", colorText)
      .text(`${perihelion} km`)
      .attr("opacity", 0)
      .transition()
      .delay(textDelayTime)
      .duration(textTransitionTime)
      .attr("opacity", 1);

    svgElement
      .append("text")
      .attr("x", centerX + semiMajorAxis / 2) // Position near aphelion
      .attr("y", centerY + lineOffset)
      .attr("dy", 20) // Offset slightly to avoid overlap
      .attr("text-anchor", "middle")
      .attr("fill", colorText)
      .text(`Aphelion:`)
      .attr("opacity", 0)
      .transition()
      .delay(textDelayTime)
      .duration(textTransitionTime)
      .attr("opacity", 1);

    svgElement
      .append("text")
      .attr("x", centerX + semiMajorAxis / 2) // Position near aphelion
      .attr("y", centerY + lineOffset)
      .attr("dy", 40) // Offset slightly to avoid overlap
      .attr("text-anchor", "middle")
      .attr("fill", colorText)
      .text(`${aphelion} km`)
      .attr("opacity", 0)
      .transition()
      .delay(textDelayTime)
      .duration(textTransitionTime)
      .attr("opacity", 1);

    // Sun
    svgElement
      .append("circle")
      .attr("cx", centerX - sunDistance)
      .attr("cy", centerY)
      .attr("r", sunSize)
      .style("fill", colorSun)
      .attr("opacity", 0)
      .transition()
      .delay(sunDelayTime)
      .duration(sunTransitionTime)
      .attr("opacity", 1);

    // Add the planet with opacity transition
    const planet = svgElement
      .append("circle")
      .attr("cx", centerX + semiMajorAxis) // Start at aphelion
      .attr("cy", centerY)
      .attr("r", planetSize / 2)
      .attr("fill", planetColors[selectedPlanet])
      .attr("opacity", 0);

    const ringLine =
      selectedPlanet === "saturn" || selectedPlanet === "uranus"
        ? svgElement
            .append("line")
            .attr("x1", centerX + semiMajorAxis - planetSize)
            .attr("y1", centerY)
            .attr("x2", centerX + semiMajorAxis + planetSize)
            .attr("y2", centerY)
            .style("stroke", ringColor)
            .style("stroke-width", ringThickness)
            .attr("opacity", 0)
        : null;

    // Animate the planet's orbit
    let angle = 0;
    d3.timer((elapsed) => {
      angle = planetSpeed * elapsed; // Calculate the angle for the orbit
      const x = centerX + semiMajorAxis * Math.cos(angle); // X position based on the major axis
      const y = centerY + semiMinorAxis * Math.sin(angle); // Y position based on the minor axis

      // Update the position of the planet during the orbit
      planet.attr("cx", x).attr("cy", y);

      // Update the position of the ring line if it exists
      if (ringLine) {
        if (selectedPlanet === "saturn") {
          ringLine
            .attr("x1", x - planetSize / 1.5)
            .attr("x2", x + planetSize / 1.5)
            .attr("y1", y - planetSize / 1.5)
            .attr("y2", y + planetSize / 1.5);
        } else if (selectedPlanet === "uranus") {
          ringLine
            .attr("x1", x - planetSize / 3)
            .attr("x2", x + planetSize / 3)
            .attr("y1", y + planetSize / 1.5)
            .attr("y2", y - planetSize / 1.5);
        }
      }
      if (
        elapsed < planetDelayTime + planetTransitionTime &&
        elapsed > planetDelayTime
      ) {
        let opac = elapsed / (planetDelayTime + planetTransitionTime);
        planet.attr("opacity", opac);
        if (ringLine) ringLine.attr("opacity", opac);
      }
    });

    // Create Sun
  }, [data, svgSize, selectedPlanet]);

  return <svg ref={svgRef}></svg>;
};

export default OrbitGraph;
