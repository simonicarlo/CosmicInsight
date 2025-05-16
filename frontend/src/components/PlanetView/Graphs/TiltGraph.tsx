import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const TiltGraph = ({ data, selectedPlanet }) => {
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
      console.error("Tilt Graph: No data:" + data + " " + selectedPlanet);
      return;
    }

    const planetData = data.find(
      (planet) => planet.name.toLowerCase() === selectedPlanet
    );

    // Create the SVG element

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove(); // Clear existing elements

    const { width, height } = svgSize;
    const planetSize = width / 10; // Radius of the planet
    const tiltAngle = planetData.axis_tilt || 0; // Tilt angle of the planet
    const axisLineLength = height / 2;
    const dottedLineLength = height / 2;
    
    const planetColors = {
          mercury: "#B7B7B7", // Grayish for Mercury
          venus: "#D89F6A", // Yellowish for Venus
          earth: "blue",  // Dark Blueish for Earth
          mars: "#B94B3B", // Reddish for Mars
          jupiter: "#F2C97B", // Yellowish-brown for Jupiter
          saturn: "#C5B97D", // Beige for Saturn
          uranus: "#72A1C0", // Light blue for Uranus
          neptune: "#3A7EBB", // Dark blue for Neptune
          pluto: "#7A4B8D", // Purple for Pluto
        };
    const colorPlanet = planetColors[selectedPlanet]; // Default to blue if no match
    const colorLine = "black";
    const colorText = "white";
    const colorArc = "grey";
    const colorDottedLine = "gray";

    
    

    const textSize = "30px";

    svgElement.attr("width", width).attr("height", height);

    // Center coordinates
    const centerX = width / 2;
    const centerY = height / 2;

    // Interpolation function for correct rototion around a single point
    var interpol_rotate = d3.interpolateString(
      `rotate(0,${centerX},${centerY})`,
      `rotate(${-tiltAngle},${centerX},${centerY})`
    );

    // Draw the planet (circle)
    svgElement
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", planetSize)
      .attr("fill", colorPlanet)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Initial vertical axis
    const axisGroup = svgElement.append("g");
    //.attr("transform", `translate(${centerX}, ${centerY})`); // Set group's origin to the center

    const axisLine = axisGroup
      .append("line")
      .attr("x1", centerX)
      .attr("y1", centerY - axisLineLength / 2)
      .attr("x2", centerX)
      .attr("y2", centerY + axisLineLength / 2)
      .attr("stroke", colorLine)
      .attr("stroke-width", 2)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Rotate the axis to the tilt angle
    axisGroup
      .transition()
      .delay(1000)
      .duration(1200)
      .attrTween("transform", function (d, i, a) {
        return interpol_rotate;
      });
    //.attr("transform", `rotate(${-tiltAngle})`); //${centerX}, ${centerY})

    // Dotted vertical line (4x planet radius)
    svgElement
      .append("line")
      .attr("x1", centerX)
      .attr("y1", centerY - dottedLineLength / 2)
      .attr("x2", centerX)
      .attr("y2", centerY + dottedLineLength / 2)
      .attr("stroke", colorDottedLine)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "4, 2") //  dotted effect
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Draw arc showing tilt
    const arc = d3
      .arc()
      .innerRadius(axisLineLength / 2 + 10)
      .outerRadius(axisLineLength / 2 + 15)
      .startAngle(0)
      .endAngle((-tiltAngle * Math.PI) / 180);

    svgElement
      .append("path")
      .attr("d", arc)
      .attr("fill", colorArc)
      .attr("transform", `translate(${centerX}, ${centerY})`)
      .attr("opacity", 0)
      .transition()
      .delay(2200)
      .duration(1000)
      .attr("opacity", 1);

    // Add angle text
    svgElement
      .append("text")
      .attr("x", centerX + axisLineLength / 2 + 10)
      .attr("y", centerY - 10)
      .attr("font-size", textSize)
      .attr("fill", colorText)
      .attr("opacity", 0)
      .text(`${tiltAngle}°`)
      .transition()
      .delay(2200)
      .duration(1000)
      .attr("opacity", 1);
  }, [data, svgSize, selectedPlanet]);

  return <svg ref={svgRef}></svg>;
};

export default TiltGraph;
