// 0 – basic SVG drawing

const svg = d3
  .select("#vis")
  .append("svg")
  .attr("width", 600)
  .attr("height", 400)
  .style("background", "black");

// sun
svg
  .append("circle")
  .attr("r", 60)
  .attr("cx", 120)
  .attr("cy", 200)
  .attr("fill", "gold");

// planet orbit
svg
  .append("circle")
  .attr("r", 140)
  .attr("cx", 120)
  .attr("cy", 200)
  .attr("fill", "none")
  .attr("stroke", "gray")
  .attr("stroke-dasharray", "4 4");

// planet
svg
  .append("circle")
  .attr("r", 20)
  .attr("cx", 120 + 140)
  .attr("cy", 200)
  .attr("fill", "skyblue");

// light beam (line)
svg
  .append("line")
  .attr("x1", 120)
  .attr("y1", 200)
  .attr("x2", 350)
  .attr("y2", 80)
  .attr("stroke", "white")
  .attr("stroke-width", 2);

// label
svg
  .append("text")
  .attr("x", 20)
  .attr("y", 40)
  .text("Simple solar system with D3")
  .attr("fill", "white");