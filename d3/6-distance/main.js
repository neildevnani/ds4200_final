console.log("Stellar Density Map loading...");

d3.csv("../../data/bright_star_clean.csv").then(data => {
  console.log("Data loaded:", data.length, "rows");
  
  // Parse RA and Dec - same as Vis4
  const validData = data
    .map(d => ({
      ra: +d.ra_deg,
      dec: +d.dec_deg,
      vmag: +d.vmag,
      name: d.name || "Star"
    }))
    .filter(d => !isNaN(d.ra) && !isNaN(d.dec));
  
  console.log("Valid stars:", validData.length);
  
  if (validData.length === 0) {
    d3.select("#vis").html(`<p style="color:#ff6b6b; padding: 40px;">No valid RA/Dec data found.</p>`);
    return;
  }
  
  // Dimensions
  const width = 1100;
  const height = 600;
  const margin = { top: 60, right: 150, bottom: 70, left: 80 };
  
  const svg = d3.select("#vis")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  // Scales
  const xScale = d3.scaleLinear()
    .domain([0, 360])
    .range([margin.left, width - margin.right]);
  
  const yScale = d3.scaleLinear()
    .domain([-90, 90])
    .range([height - margin.bottom, margin.top]);
  
  // Create contour density - this IS built into D3!
  const densityData = d3.contourDensity()
    .x(d => xScale(d.ra))
    .y(d => yScale(d.dec))
    .size([width, height])
    .bandwidth(20)
    .thresholds(15)
    (validData);
  
  console.log("Created", densityData.length, "contours");
  
  // Color scale
  const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
    .domain([0, d3.max(densityData, d => d.value)]);
  
  // Draw contours
  svg.append("g")
    .selectAll("path")
    .data(densityData)
    .enter()
    .append("path")
    .attr("d", d3.geoPath())
    .attr("fill", d => colorScale(d.value))
    .attr("opacity", 0.6)
    .attr("stroke", "#1a1f3a")
    .attr("stroke-width", 0.5);
  
  // Grid
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickSize(-(height - margin.top - margin.bottom)).tickFormat(""))
    .selectAll("line")
    .style("stroke", "#2d3748")
    .style("stroke-opacity", 0.3);
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).tickFormat(""))
    .selectAll("line")
    .style("stroke", "#2d3748")
    .style("stroke-opacity", 0.3);
  
  // Celestial equator
  svg.append("line")
    .attr("x1", xScale(0))
    .attr("x2", xScale(360))
    .attr("y1", yScale(0))
    .attr("y2", yScale(0))
    .attr("stroke", "#4a90e2")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0.6);
  
  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(12))
    .style("color", "#a0aec0")
    .append("text")
    .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
    .attr("y", 45)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("Right Ascension (°) →");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(9))
    .style("color", "#a0aec0")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
    .attr("y", -50)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .attr("font-size", "14px")
    .text("← Declination (°)");
  
  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("fill", "#f6e05e")
    .attr("font-size", "18px")
    .attr("font-weight", "bold")
    .text("Stellar Density Across the Celestial Sphere");
  
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 48)
    .attr("text-anchor", "middle")
    .attr("fill", "#63b3ed")
    .attr("font-size", "12px")
    .text("Contour map reveals where stars concentrate most densely");
  
  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", "#f6e05e")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text("Density");
  
  const legendHeight = 200;
  const legendWidth = 20;
  
  const defs = svg.append("defs");
  const gradient = defs.append("linearGradient")
    .attr("id", "density-gradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%");
  
  const maxDensity = d3.max(densityData, d => d.value);
  
  gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", colorScale(0));
  
  gradient.append("stop")
    .attr("offset", "50%")
    .attr("stop-color", colorScale(maxDensity / 2));
  
  gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", colorScale(maxDensity));
  
  legend.append("rect")
    .attr("x", 0)
    .attr("y", 20)
    .attr("width", legendWidth)
    .attr("height", legendHeight)
    .style("fill", "url(#density-gradient)")
    .attr("stroke", "#fff")
    .attr("stroke-width", 1);
  
  legend.append("text")
    .attr("x", legendWidth + 8)
    .attr("y", 25)
    .attr("fill", "#e2e8f0")
    .attr("font-size", "11px")
    .text("High");
  
  legend.append("text")
    .attr("x", legendWidth + 8)
    .attr("y", 20 + legendHeight / 2 + 4)
    .attr("fill", "#e2e8f0")
    .attr("font-size", "11px")
    .text("Medium");
  
  legend.append("text")
    .attr("x", legendWidth + 8)
    .attr("y", 20 + legendHeight + 4)
    .attr("fill", "#e2e8f0")
    .attr("font-size", "11px")
    .text("Low");
  
  // Note about contours
  legend.append("text")
    .attr("x", 0)
    .attr("y", 250)
    .attr("fill", "#4a90e2")
    .attr("font-size", "10px")
    .attr("font-weight", "bold")
    .text("Contour Lines:");
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", 264)
    .attr("fill", "#4a90e2")
    .attr("font-size", "9px")
    .text("Show regions of");
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", 276)
    .attr("fill", "#4a90e2")
    .attr("font-size", "9px")
    .text("similar stellar");
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", 288)
    .attr("fill", "#4a90e2")
    .attr("font-size", "9px")
    .text("concentration");
  
  console.log("✓ Density map complete!");
  
}).catch(err => {
  console.error("Error:", err);
  d3.select("#vis").html(`<p style="color:#ff6b6b; padding: 40px;">Error: ${err.message}</p>`);
});