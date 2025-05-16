import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const BarChart = ({ data, selectedPlanet }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [svgSize, setSvgSize] = useState({ width: 600, height: 400 });

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
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (!data) {
      return;
    }

    const solarSystemOrder = [
      "Mercury",
      "Venus",
      "Earth",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
      "Pluto",
    ];

    const color_map: Record<string, string> = {
      mercury: "#ffcc00",
      venus: "#ffaa33",
      earth: "#3399ff",
      mars: "#ff5733",
      jupiter: "#e4a663",
      saturn: "#f4d03f",
      uranus: "#7ed6df",
      neptune: "#34495e",
      pluto: "#8e44ad",
    };

    const sortedData = [...data].sort(
      (a, b) =>
        solarSystemOrder.indexOf(a.name) - solarSystemOrder.indexOf(b.name)
    );

    const names = sortedData.map((planet: any) => planet.name);
    const gravities = sortedData.map((planet: any) => planet.gravity);

    const width = svgSize.width;
    const height = svgSize.height;
    const margin = { top: 20, right: 20, bottom: 50, left: 100 };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(gravities) || 100])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleBand()
      .domain(names)
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    svg.selectAll("*").remove();

    // Append the x-axis at the bottom of the chart with ticks
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale) // Add ticks to the x-axis
          .tickSize(6) // Adjust tick size to your preference (default is 6)
          .tickPadding(10) // Add spacing between ticks and labels
      )
      .attr("opacity", 0)
      .attr("color", "white"); // Set tick color to match the chart's design

    // Append the y-axis to the left of the chart with ticks
    const yAxis = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yScale) // Add ticks to the y-axis
          .tickSize(6) // Adjust tick size to your preference (default is 6)
          .tickPadding(10) // Add spacing between ticks and labels
      )
      .attr("opacity", 0)
      .attr("color", "white"); // Set tick color to match the chart's design

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .attr("text-anchor", "middle")
      .text("Surface gravity in m/s²")
      .attr("fill", "white");

    xAxis.transition().duration(800).attr("opacity", 1);
    yAxis.transition().duration(800).attr("opacity", 1);

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("color", "black")
      .style(
        "font-family",
        "Gill Sans, Gill Sans MT, Calibri, Trebuchet MS, sans-serif"
      )
      .style("padding", "5px 10px")
      .style("border-radius", "4px")
      .style("box-shadow", "0px 2px 5px rgba(0, 0, 0, 0.3)")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const bars = svg
      .append("g")
      .selectAll("rect")
      .data(names)
      .enter()
      .append("rect")
      .attr("x", xScale(0))
      .attr("y", (d) => yScale(d) || 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) =>
        d.toLowerCase() === selectedPlanet ? color_map[d.toLowerCase()] : "grey"
      )
      .attr("width", 0)
      .on("mouseover", (event, d) => {
        const index = names.indexOf(d);
        const gravity = gravities[index];
        tooltip
          .style("opacity", 1)
          .html(`<strong>${d}: </strong>${gravity} m/s²`)
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + "px");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    bars
      .transition()
      .delay(800)
      .duration(800)
      .attr("width", (d, i) => xScale(gravities[i]!) - xScale(0))
      .delay((d, i) => 1000 + i * 100);
  }, [data, svgSize]);

  return <svg ref={svgRef}></svg>;
};

export default BarChart;
