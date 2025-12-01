// VISUALIZATION 4: Interactive Celestial Sky Map
// Shows the actual positions of stars in the sky with RA and Dec coordinates

d3.csv("data/bright_star_clean.csv").then(data => {
  // Parse numeric fields
  data.forEach(d => {
    d.ra_deg = +d.ra_deg;
    d.dec_deg = +d.dec_deg;
    d.vmag = +d.vmag;
    d.distance_ly = +d.distance_ly;
    d.bv_color = +d.bv_color;
  });

  // Filter valid data
  data = data.filter(d => 
    !isNaN(d.ra_deg) && 
    !isNaN(d.dec_deg) && 
    !isNaN(d.vmag)
  );

  console.log(`Loaded ${data.length} stars for sky map`);

  // Set up dimensions
  const width = 850;
  const height = 500;
  const margin = { top: 50, right: 120, bottom: 60, left: 70 };

  // Create SVG
  const svg = d3.select("#viz-4")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "linear-gradient(to bottom, #0a0e27 0%, #1a1f3a 100%)");

  // Create scales
  const xScale = d3.scaleLinear()
    .domain([0, 360])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([-90, 90])
    .range([height - margin.bottom, margin.top]);

  // Size scale based on brightness (smaller vmag = brighter = larger dot)
  const sizeScale = d3.scaleSqrt()
    .domain(d3.extent(data, d => d.vmag))
    .range([8, 2]); // Inverted: bright stars are bigger

  // Color scale based on B-V color index
  const colorScale = d3.scaleSequential()
    .domain([-0.5, 2.0])
    .interpolator(t => {
      // Blue to white to orange/red gradient
      if (t < 0.25) return d3.interpolateRgb("#9bb3ff", "#ffffff")(t * 4);
      if (t < 0.5) return d3.interpolateRgb("#ffffff", "#fff4ea")((t - 0.25) * 4);
      if (t < 0.75) return d3.interpolateRgb("#fff4ea", "#ffd2a1")((t - 0.5) * 4);
      return d3.interpolateRgb("#ffd2a1", "#ffcc6f")((t - 0.75) * 4);
    });

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("fill", "#e2e8f0")
    .text("Celestial Sky Map - Star Positions");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 42)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("fill", "#a0aec0")
    .text("Right Ascension vs Declination • Size = Brightness • Color = Temperature");

  // Add axes
  const xAxis = d3.axisBottom(xScale)
    .ticks(12)
    .tickFormat(d => `${d}°`);
  
  const yAxis = d3.axisLeft(yScale)
    .ticks(9)
    .tickFormat(d => `${d}°`);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .style("color", "#a0aec0")
    .style("font-size", "11px")
    .append("text")
    .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
    .attr("y", 40)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text("Right Ascension (degrees)");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .style("color", "#a0aec0")
    .style("font-size", "11px")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
    .attr("y", -45)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text("Declination (degrees)");

  // Add grid
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(12).tickSize(-(height - margin.top - margin.bottom)).tickFormat(""))
    .style("stroke", "#2d3748")
    .style("stroke-opacity", 0.3);

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(9).tickSize(-(width - margin.left - margin.right)).tickFormat(""))
    .style("stroke", "#2d3748")
    .style("stroke-opacity", 0.3);

  // Create tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(26, 31, 58, 0.95)")
    .style("color", "#e2e8f0")
    .style("padding", "12px")
    .style("border", "2px solid #4a90e2")
    .style("border-radius", "8px")
    .style("font-size", "13px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("box-shadow", "0 4px 12px rgba(0,0,0,0.5)");

  // Add celestial equator line
  svg.append("line")
    .attr("x1", xScale(0))
    .attr("x2", xScale(360))
    .attr("y1", yScale(0))
    .attr("y2", yScale(0))
    .attr("stroke", "#4a90e2")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0.5);

  svg.append("text")
    .attr("x", width - margin.right + 5)
    .attr("y", yScale(0))
    .attr("fill", "#4a90e2")
    .style("font-size", "11px")
    .text("Celestial Equator");

  // Plot stars
  const stars = svg.selectAll("circle.star")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "star")
    .attr("cx", d => xScale(d.ra_deg))
    .attr("cy", d => yScale(d.dec_deg))
    .attr("r", d => sizeScale(d.vmag))
    .attr("fill", d => !isNaN(d.bv_color) ? colorScale(d.bv_color) : "#ffffff")
    .attr("opacity", 0.9)
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 0.5)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      d3.select(this)
        .transition()
        .duration(150)
        .attr("r", sizeScale(d.vmag) * 2)
        .attr("opacity", 1)
        .attr("stroke-width", 2)
        .attr("stroke", "#f6e05e");

      const spectralType = d.spectral_main || "Unknown";
      const distanceLy = !isNaN(d.distance_ly) ? d.distance_ly.toLocaleString(undefined, {maximumFractionDigits: 0}) : "Unknown";
      const bvColor = !isNaN(d.bv_color) ? d.bv_color.toFixed(2) : "N/A";
      const brightnessClass = d.brightness_class || "Unknown";

      tooltip
        .style("opacity", 1)
        .html(`
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px; color: #63b3ed;">
            ${d.name}
          </div>
          <div style="line-height: 1.6;">
            <strong>Position:</strong> RA ${d.ra_deg.toFixed(2)}°, Dec ${d.dec_deg.toFixed(2)}°<br>
            <strong>Magnitude:</strong> ${d.vmag.toFixed(2)} (${brightnessClass})<br>
            <strong>Spectral Type:</strong> ${spectralType}<br>
            <strong>B-V Color:</strong> ${bvColor}<br>
            <strong>Distance:</strong> ${distanceLy} light-years
          </div>
        `);
    })
    .on("mousemove", event => {
      tooltip
        .style("left", (event.pageX + 15) + "px")
        .style("top", (event.pageY - 15) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .transition()
        .duration(150)
        .attr("r", d => sizeScale(d.vmag))
        .attr("opacity", 0.9)
        .attr("stroke-width", 0.5)
        .attr("stroke", "#ffffff");

      tooltip.style("opacity", 0);
    });

  // Add legend
  const legendX = width - margin.right + 15;
  const legendY = margin.top + 50;

  // Size legend
  svg.append("text")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("fill", "#e2e8f0")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("Brightness");

  const brightnesses = [
    { vmag: -1, label: "Very Bright" },
    { vmag: 2, label: "Bright" },
    { vmag: 5, label: "Moderate" }
  ];

  brightnesses.forEach((b, i) => {
    svg.append("circle")
      .attr("cx", legendX + 10)
      .attr("cy", legendY + 20 + i * 22)
      .attr("r", sizeScale(b.vmag))
      .attr("fill", "#ffffff")
      .attr("opacity", 0.8);

    svg.append("text")
      .attr("x", legendX + 25)
      .attr("y", legendY + 24 + i * 22)
      .attr("fill", "#a0aec0")
      .style("font-size", "11px")
      .text(b.label);
  });

  // Color legend
  svg.append("text")
    .attr("x", legendX)
    .attr("y", legendY + 95)
    .attr("fill", "#e2e8f0")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("Star Color");

  const colorLegend = [
    { color: "#9bb3ff", label: "Blue (Hot)" },
    { color: "#ffffff", label: "White" },
    { color: "#ffd2a1", label: "Orange" },
    { color: "#ffcc6f", label: "Red (Cool)" }
  ];

  colorLegend.forEach((c, i) => {
    svg.append("circle")
      .attr("cx", legendX + 10)
      .attr("cy", legendY + 115 + i * 20)
      .attr("r", 5)
      .attr("fill", c.color)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 0.5);

    svg.append("text")
      .attr("x", legendX + 25)
      .attr("y", legendY + 119 + i * 20)
      .attr("fill", "#a0aec0")
      .style("font-size", "10px")
      .text(c.label);
  });

  console.log("✓ Sky map visualization complete");
});
