// Color-Magnitude Scatterplot with Real Data
console.log("Loading Color-Magnitude Scatterplot...");

d3.csv("../../data/bright_star_clean.csv").then(data => {
  console.log("✓ Data loaded:", data.length, "stars");
  
  // Parse numeric fields
  data.forEach(d => {
    d.bv_color = +d.bv_color;
    d.vmag = +d.vmag;
  });
  
  // Filter to valid data
  data = data.filter(d => !isNaN(d.bv_color) && !isNaN(d.vmag));
  console.log("✓ Filtered to", data.length, "valid stars");
  
  // Dimensions
  const width = 750;
  const height = 500;
  const margin = { top: 30, right: 140, bottom: 70, left: 80 };
  
  // Create SVG without background (transparent)
  const svg = d3.select("#vis")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  // No background fill - stays transparent
  
  // Create scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.bv_color))
    .nice()
    .range([margin.left, width - margin.right]);
  
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.vmag))
    .nice()
    .range([height - margin.bottom, margin.top]);
  
  // Add X-axis
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(10))
    .style("color", "#a0aec0")
    .style("font-size", "11px")
    .selectAll("line, path")
    .style("stroke", "#a0aec0");
  
  // X-axis label (WHITE)
  svg.append("text")
    .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
    .attr("y", height - margin.bottom + 45)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("B-V Color Index (temperature proxy)");
  
  // Add Y-axis
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(12))
    .style("color", "#a0aec0")
    .style("font-size", "11px")
    .selectAll("line, path")
    .style("stroke", "#a0aec0");
  
  // Y-axis label (WHITE)
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
    .attr("y", margin.left - 55)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-weight", "bold")
    .text("Apparent Magnitude (brighter ↑)");
  
  // Add grid lines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(10).tickSize(-(height - margin.top - margin.bottom)).tickFormat(""))
    .style("stroke", "#2d3748")
    .style("stroke-opacity", 0.3);
  
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(12).tickSize(-(width - margin.left - margin.right)).tickFormat(""))
    .style("stroke", "#2d3748")
    .style("stroke-opacity", 0.3);
  
  // Create tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(26, 31, 58, 0.95)")
    .style("color", "#e2e8f0")
    .style("padding", "10px 12px")
    .style("border", "2px solid #4a90e2")
    .style("border-radius", "6px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", "1000")
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.5)");
  
  // Plot stars
  const stars = svg.selectAll("circle.star")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "star")
    .attr("cx", d => xScale(d.bv_color))
    .attr("cy", d => yScale(d.vmag))
    .attr("r", 3.5)
    .attr("fill", "#4a90e2")  // Star-blue
    .attr("opacity", 0.75)
    .attr("stroke", "#63b3ed")  // Cosmic-teal
    .attr("stroke-width", 0.5)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      // Highlight selected star
      d3.select(this)
        .transition()
        .duration(150)
        .attr("r", 7)
        .attr("opacity", 1)
        .attr("stroke-width", 2)
        .attr("stroke", "#f6e05e");  // Stardust-gold
      
      // Dim other stars
      stars.filter(star => star !== d)
        .transition()
        .duration(150)
        .attr("opacity", 0.2);
      
      // Show tooltip
      const spectralType = d.spectral_main || "Unknown";
      const brightnessClass = d.brightness_class || "Unknown";
      
      tooltip
        .style("opacity", 1)
        .html(`
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px; color: #63b3ed;">
            ${d.name}
          </div>
          <div style="line-height: 1.6;">
            <strong>Spectral Type:</strong> ${spectralType}<br>
            <strong>B-V Color:</strong> ${d.bv_color.toFixed(3)}<br>
            <strong>Magnitude:</strong> ${d.vmag.toFixed(2)} (${brightnessClass})
          </div>
        `);
    })
    .on("mousemove", event => {
      tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 15) + "px");
    })
    .on("mouseout", function() {
      // Restore selected star
      d3.select(this)
        .transition()
        .duration(150)
        .attr("r", 3.5)
        .attr("opacity", 0.75)
        .attr("stroke-width", 0.5)
        .attr("stroke", "#63b3ed");
      
      // Restore all other stars
      stars
        .transition()
        .duration(150)
        .attr("opacity", 0.75);
      
      tooltip.style("opacity", 0);
    });
  
  // Add Legend
  const legendX = width - margin.right + 15;
  const legendY = margin.top + 20;
  
  // Legend background
  svg.append("rect")
    .attr("x", legendX - 10)
    .attr("y", legendY - 15)
    .attr("width", 120)
    .attr("height", 160)
    .attr("fill", "rgba(26, 31, 58, 0.7)")
    .attr("stroke", "#4a90e2")
    .attr("stroke-width", 1)
    .attr("rx", 6);
  
  // Legend title (WHITE)
  svg.append("text")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("fill", "#e2e8f0")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text("Legend");
  
  // Point section
  svg.append("text")
    .attr("x", legendX)
    .attr("y", legendY + 25)
    .attr("fill", "#a0aec0")
    .style("font-size", "11px")
    .style("font-weight", "bold")
    .text("Point:");
  
  // Normal star example
  svg.append("circle")
    .attr("cx", legendX + 10)
    .attr("cy", legendY + 40)
    .attr("r", 3.5)
    .attr("fill", "#4a90e2")
    .attr("opacity", 0.75)
    .attr("stroke", "#63b3ed")
    .attr("stroke-width", 0.5);
  
  svg.append("text")
    .attr("x", legendX + 25)
    .attr("y", legendY + 44)
    .attr("fill", "#a0aec0")
    .style("font-size", "11px")
    .text("Star");
  
  // Interaction section
  svg.append("text")
    .attr("x", legendX)
    .attr("y", legendY + 70)
    .attr("fill", "#a0aec0")
    .style("font-size", "11px")
    .style("font-weight", "bold")
    .text("On Hover:");
  
  // Normal state
  svg.append("circle")
    .attr("cx", legendX + 10)
    .attr("cy", legendY + 88)
    .attr("r", 3.5)
    .attr("fill", "#4a90e2")
    .attr("opacity", 0.75)
    .attr("stroke", "#63b3ed")
    .attr("stroke-width", 0.5);
  
  svg.append("text")
    .attr("x", legendX + 25)
    .attr("y", legendY + 92)
    .attr("fill", "#a0aec0")
    .style("font-size", "10px")
    .text("Normal");
  
  // Hover state
  svg.append("circle")
    .attr("cx", legendX + 10)
    .attr("cy", legendY + 108)
    .attr("r", 7)
    .attr("fill", "#4a90e2")
    .attr("opacity", 1)
    .attr("stroke", "#f6e05e")
    .attr("stroke-width", 2);
  
  svg.append("text")
    .attr("x", legendX + 25)
    .attr("y", legendY + 112)
    .attr("fill", "#a0aec0")
    .style("font-size", "10px")
    .text("Selected");
  
  // Instruction note
  svg.append("text")
    .attr("x", legendX + 50)
    .attr("y", legendY + 138)
    .attr("fill", "#63b3ed")
    .attr("text-anchor", "middle")
    .style("font-size", "10px")
    .style("font-style", "italic")
    .text("Hover to explore");
  
  console.log("✓ Color-Magnitude Scatterplot complete!");
  
}).catch(error => {
  console.error("❌ Error:", error);
  d3.select("#vis")
    .append("div")
    .style("color", "#ff6b6b")
    .style("background", "rgba(26, 31, 58, 0.9)")
    .style("padding", "20px")
    .style("border-radius", "8px")
    .style("border", "2px solid #ff6b6b")
    .style("text-align", "center")
    .html(`
      <h3>Error Loading Data</h3>
      <p>${error.message}</p>
      <p style="font-size: 12px; margin-top: 10px;">
        Make sure <code>data/bright_star_clean.csv</code> exists
      </p>
    `);
});