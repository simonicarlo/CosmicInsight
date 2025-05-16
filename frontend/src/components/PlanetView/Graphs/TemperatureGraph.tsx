import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const TemperatureGraph = ({ data, selectedPlanet }) => {
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
        "Temparature Graph: No data: " + data + " " + selectedPlanet
      );
      return;
    }

    const planetData = data.find(
      (planet) => planet.name.toLowerCase() === selectedPlanet
    );

    console.log("Planet Data: ", planetData);

    const temperatureKelvin = planetData.temperature || 0;

    // Create the SVG element

    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove(); // Clear existing elements

    // Temperature data

    const temperatureCelsius = temperatureKelvin - 273.15;
    const temperatureFahrenheit = (temperatureKelvin - 273.15) * 1.8 + 32;

    const maxTemperature = 1000; // Maximum temperature for the thermometer scale

    // SVG dimensions
    const { width, height } = svgSize;
    const thermometerWidth = width / 10;
    const thermometerHeight = height * 0.6;
    const bulbRadius = thermometerWidth / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    const fontSizeThemometer = "20px";
    const fontSizeTemperature = "20px";

    const distanceZerotoBulbTop = bulbRadius;

    const colorText = "white";
    const colorTextOther = "gray";
    const colorThermometerRed = "red";

    svgElement.attr("width", width).attr("height", height);

    // Define temperature scale
    // Define temperature scale
    const tempScale = d3
      .scaleLinear()
      .domain([0, maxTemperature]) // Start from 0K to 400K (higher than the boiling point of water for flexibility)
      .range([0, thermometerHeight - bulbRadius - distanceZerotoBulbTop]);

    // Thermometer outline
    // svgElement.append("rect")
    //   .attr("x", centerX - thermometerWidth / 3)
    //   .attr("y", centerY - thermometerHeight / 2 - 5)
    //   .attr("width", thermometerWidth / 1.5)
    //   .attr("height", thermometerHeight + 10)
    //   .attr("rx", 10) // Rounded corners
    //   .attr("ry", 10)
    //   .attr("fill", "none")
    //   .attr("stroke", "#333")
    //   .attr("stroke-width", 3)
    //   .attr("opacity", 0)
    //   .transition()
    //   .duration(1000)
    //   .attr("opacity", 1);
    svgElement
      .append("path")
      .attr(
        "d",
        `
                M ${centerX - thermometerWidth / 5}, ${
          centerY - thermometerHeight / 2 - 5
        } 
                h ${thermometerWidth / 2.5} 
                a 10,10 0 0 1 10,10 
                v ${thermometerHeight} 
                a 10,10 0 0 1 -10,10 
                h -${thermometerWidth / 2.5} 
                a 10,10 0 0 1 -10,-10 
                v -${thermometerHeight} 
                a 10,10 0 0 1 10,-10
                Z
            `
      )
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 3)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Thermometer bulb outline
    svgElement
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY + thermometerHeight / 2)
      .attr("r", bulbRadius + 5)
      .attr("fill", "none")
      .attr("stroke", "#333")
      .attr("stroke-width", 3)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Thermometer bulb (red fill)
    svgElement
      .append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY + thermometerHeight / 2)
      .attr("r", bulbRadius)
      .attr("fill", "red")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Thermometer tube background
    svgElement
      .append("rect")
      .attr("x", centerX - thermometerWidth / 4)
      .attr("y", centerY - thermometerHeight / 2)
      .attr("width", thermometerWidth / 2)
      .attr("height", thermometerHeight - bulbRadius)
      .attr("fill", "#ccc")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Themoeter bottom (until 0)
    svgElement
      .append("rect")
      .attr("x", centerX - thermometerWidth / 4)
      .attr(
        "y",
        centerY + thermometerHeight / 2 - bulbRadius - distanceZerotoBulbTop
      )
      .attr("width", thermometerWidth / 2)
      .attr("height", bulbRadius * 2)
      .attr("fill", colorThermometerRed)
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Thermometer fill animation
    const fillHeight = tempScale(temperatureKelvin);

    svgElement
      .append("rect")
      .attr("x", centerX - thermometerWidth / 4)
      .attr(
        "y",
        centerY + thermometerHeight / 2 - bulbRadius - distanceZerotoBulbTop
      )
      .attr("width", thermometerWidth / 2)
      //.attr("height", thermometerHeight - bulbRadius - fillHeight)
      .attr("height", 0)
      .attr("fill", "red")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1)
      .transition()
      .duration(2000)
      .attr(
        "y",
        centerY +
          thermometerHeight / 2 -
          bulbRadius -
          distanceZerotoBulbTop -
          tempScale(temperatureKelvin)
      )
      .attr("height", tempScale(temperatureKelvin));

    // Thermometer scale ticks
    const scaleTicks = d3.range(0, maxTemperature + 100, 100); // Create ticks every 50K
    svgElement
      .selectAll(".scale-tick")
      .data(scaleTicks)
      .enter()
      .append("line")
      .attr("x1", centerX - thermometerWidth / 2)
      .attr("x2", centerX)
      .attr("y1", (d) => centerY - thermometerHeight / 2 + tempScale(d))
      .attr("y2", (d) => centerY - thermometerHeight / 2 + tempScale(d))
      .attr("stroke", "#000")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Thermometer scale text
    svgElement
      .selectAll(".scale-text")
      .data(scaleTicks)
      .enter()
      .append("text")
      .attr("x", centerX - thermometerWidth / 2 - 5)
      .attr(
        "y",
        (d) =>
          centerY +
          thermometerHeight / 2 -
          bulbRadius -
          distanceZerotoBulbTop -
          tempScale(d) +
          4
      )
      .attr("font-size", fontSizeThemometer)
      .attr("fill", colorText)
      .attr("text-anchor", "end")
      .text((d) => d + " K")
      .attr("opacity", 0)
      .transition()
      .duration(1000)
      .attr("opacity", 1);

    // Display temperature values (ON THE SIDE)
    const temperatureText = [
      { label: "K", value: temperatureKelvin },
      { label: "°C", value: temperatureCelsius.toFixed(2) },
      { label: "°F", value: temperatureFahrenheit.toFixed(2) },
    ];
    temperatureText.forEach((temp, index) => {
      svgElement
        .append("text")
        .attr("x", centerX + thermometerWidth)
        .attr("y", centerY + (index + 1) * 20)
        .attr("font-size", fontSizeTemperature)
        .attr("fill", colorText)
        .text(`${temp.value} ${temp.label}`)
        .attr("opacity", 0)
        .transition()
        .delay(2000)
        .duration(1000)
        .attr("opacity", 1);
    });

    // svgElement.append("circle")
    // .attr("cx", centerX)
    // .attr("cy", centerY)
    // .attr("r", 5)
    // .attr("fill", "white");

    // svgElement.append("circle")
    // .attr("cx", centerX)
    // .attr("cy", centerY + thermometerHeight / 2 - bulbRadius)
    // .attr("r", 5)
    // .attr("fill", "blue");
  }, [data, svgSize, selectedPlanet]);

  return <svg ref={svgRef}></svg>;
};

export default TemperatureGraph;
