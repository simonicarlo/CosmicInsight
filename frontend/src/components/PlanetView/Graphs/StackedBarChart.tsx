import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

interface Elements {
  name: string;
  percentage: number;
}

interface PlanetAtmos {
  name: string;
  atmosphere: Elements[];
}

interface AtmosphereData {
  planets: PlanetAtmos[];
}

interface AtmosGraphProps {
  data: AtmosphereData;
  selectedPlanet: string;
}

const StackedBarChart: React.FC<AtmosGraphProps> = ({
  data,
  selectedPlanet,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [svgSize, setSvgSize] = useState({ width: 600, height: 400 });

  // Handle responsiveness
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
    if (!data || !data.planets) {
      console.warn("No planets data available or data is undefined.");
      return;
    }

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = svgSize.width - margin.left - margin.right - 50;
    const height = svgSize.height - margin.top - margin.bottom - 60;

    const x = d3.scaleBand().range([0, width]).padding(0.1);
    const y = d3.scaleLinear().range([height, 0]);

    // Custom color map for atmospheric components
    const colorMap: Record<string, string> = {
      "Carbon Dioxide": "#B4B8B9", // Light Gray
      "Nitrogen": "#4C9ED9",       // Soft Blue
      "Sulphuric Acid": "#FFB74D",  // Soft Orange
      "Oxygen": "#66BB6A",          // Light Green
      "Other": "#D1D1D1",           // Light Gray (for "Other" category)
      "Helium": "#E57373",          // Soft Pink
      "Methane": "#81C784",         // Mint Green
      "Hydrogen": "#64B5F6",        // Light Blue
      "Argon": "#9C27B0",           // Purple
    };

    const atmos_components = Object.keys(colorMap);

    // Prepare data for stacking
    const stackedData = d3.stack().keys(atmos_components)(
      data.planets.map((planet) =>
        atmos_components.reduce((acc, comp) => {
          const compData = planet.atmosphere?.find(
            (item) => item.name === comp
          );
          acc[comp] = compData ? compData.percentage : 0;
          return acc;
        }, {} as Record<string, number>)
      )
    );

    x.domain(data.planets.map((d) => d.name));

    y.domain([
      0,
      d3.max(stackedData, (d) => d3.max(d, (d) => d[1]))!,
    ]);



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

    const canvas = svg
      .attr("width", svgSize.width)
      .attr("height", svgSize.height)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Add bars for the stacked data with animation
    canvas
      .selectAll(".bar")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("fill", (d) => colorMap[d.key as string]! )
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d, i) => x(data.planets[i]!.name) as number)
      .on("mouseover", function (event, d) {
        const percentage = (d[1]-d[0]).toFixed(2) + "%";
        tooltip
          .html(`Percentage: ${percentage}`)
          .style("visibility", "visible")
          .style("opacity", 1)  // Make sure opacity is set to 1 to show it
          .style("top", event.pageY + 10 + "px")
          .style("left", event.pageX + 10 + "px");
    })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      })
      .attr("y", height) // Start bars from the bottom
      .attr("height", 0) // Start with zero height
      .attr("width", x.bandwidth())
      .transition()
      .delay((d, i) => i * 100)
      .duration(2000)
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      ;

    // Add x-axis
    canvas
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    // Add y-axis
    canvas.append("g").attr("class", "y-axis").call(d3.axisLeft(y));

    // Add legend with a white background, padding, and rounded corners
    
    const itemsPerRow = 3;
    const legendItemWidth = 120;
    const legendItemHeight = 20;

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr(
        "transform",
        `translate(${(svgSize.width - (itemsPerRow * legendItemWidth)) / 2}, ${
          height + margin.bottom + 10
        })`
      );

    // Background for the entire legend
    legend
      .append("rect")
      .attr("width", itemsPerRow * legendItemWidth + 5)
      .attr("height", Math.ceil(atmos_components.length / itemsPerRow) * legendItemHeight + 5)
      .attr("fill", "white")
      .attr("rx", 10) // Rounded corners
      .attr("ry", 10) // Rounded corners
      .attr("stroke", "black");

    atmos_components.forEach((component, index) => {
      const rowIndex = Math.floor(index / itemsPerRow);
      const colIndex = index % itemsPerRow;

      const legendRow = legend
        .append("g")
        .attr(
          "transform",
          `translate(${colIndex * legendItemWidth}, ${rowIndex * legendItemHeight})`
        );

      // Add the colored legend box
      legendRow
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorMap[component]!)
        .attr("x", 8)
        .attr("y", 6)
        .attr("rx", 10) // Rounded corners
        .attr("ry", 10) // Rounded corners;

      // Add centered text
      legendRow
        .append("text")
        .attr("x", 32)
        .attr("y", 15) 
        .text(component)
        .attr("font-size", "12px")
        .attr("fill", "#000")
        .attr("dominant-baseline", "middle") // Vertically center the text
        .attr("text-anchor", "start"); // Align the text to the left of the rectangle
    });
  }, [data, selectedPlanet, svgSize]);

  return <svg ref={svgRef}></svg>;
};

export default StackedBarChart;
