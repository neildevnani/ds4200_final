// VISUALIZATION 3: Enhanced Hertzsprung-Russell Diagram
// Color-Magnitude Diagram with spectral type filtering

d3.csv("data/bright_star_clean.csv").then(data => {
  // Parse numeric fields
  data.forEach(d => {
    d.bv_color = +d.bv_color;
    d.vmag = +d.vmag;
    d.distance_ly = +d.distance_ly;
  });

  // Filter valid data
  data = data.filter(d => !isNaN(d.bv_color) && !isNaN(d.vmag));
  
  console.log(`Loaded ${data.length} stars for HR diagram`);

  // Set up dimensions
  const width = 800;
  const height = 550;
  const margin = { top: 50, right: 150, bottom: 60, left: 70 };

  // Create SVG
  const svg = d3.select("#viz-3")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)");

  // Create scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.bv_color).reverse()) // Reverse: hot stars on left
    .nice()
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.vmag))
    .nice()
    .range([height - margin.bottom, margin.top]); // Inverted: bright at top

  // Color scale for spectral types
  const spectralColors = {
    'O': '#9bb3ff',
    'B': '#aabfff',
    'A': '#cad7ff',
    'F': '#f8f7ff',
    'G': '#fff4ea',
    'K': '#ffd2a1',
    'M': '#ffcc6f',
    'other': '#cccccc'
  };

  const getSpectralColor = (type) => spectralColors[type] || spectralColors['other'];

  // Add title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 25)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("fill", "#e2e8f0")
    .text("Hertzsprung-Russell Diagram");

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 42)
    .attr("text-anchor", "middle")
    .style("font-size", "13px")
    .style("fill", "#a0aec0")
    .text("Stellar Classification • Temperature vs Brightness");

  // Add axes
  const xAxis = d3.axisBottom(xScale).ticks(8);
  const yAxis = d3.axisLeft(yScale).ticks(10);

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
    .text("B-V Color Index (← Hotter  |  Cooler →)");

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
    .text("Apparent Magnitude (↑ Brighter)");

  // Add grid
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(8).tickSize(-(height - margin.top - margin.bottom)).tickFormat(""))
    .style("stroke", "#2d3748")
    .style("stroke-opacity", 0.3);

  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(10).tickSize(-(width - margin.left - margin.right)).tickFormat(""))
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

  // Plot stars
  const stars = svg.selectAll("circle.star")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "star")
    .attr("cx", d => xScale(d.bv_color))
    .attr("cy", d => yScale(d.vmag))
    .attr("r", 4)
    .attr("fill", d => getSpectralColor(d.spectral_main))
    .attr("opacity", 0.8)
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 0.5)
    .style("cursor", "pointer")
    .on("mouseover", function(event, d) {
      // Highlight this star
      d3.select(this)
        .transition()
        .duration(150)
        .attr("r", 8)
        .attr("opacity", 1)
        .attr("stroke-width", 2)
        .attr("stroke", "#f6e05e");

      // Dim all other stars
      stars.filter(star => star !== d)
        .transition()
        .duration(150)
        .attr("opacity", 0.2);

      const spectralType = d.spectral_main || "Unknown";
      const brightnessClass = d.brightness_class || "Unknown";
      const distanceLy = !isNaN(d.distance_ly) ? d.distance_ly.toLocaleString(undefined, {maximumFractionDigits: 0}) : "Unknown";

      tooltip
        .style("opacity", 1)
        .html(`
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px; color: #63b3ed;">
            ${d.name}
          </div>
          <div style="line-height: 1.6;">
            <strong>Spectral Type:</strong> ${spectralType}<br>
            <strong>B-V Color:</strong> ${d.bv_color.toFixed(3)}<br>
            <strong>Magnitude:</strong> ${d.vmag.toFixed(2)} (${brightnessClass})<br>
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
      // Restore this star
      d3.select(this)
        .transition()
        .duration(150)
        .attr("r", 4)
        .attr("opacity", 0.8)
        .attr("stroke-width", 0.5)
        .attr("stroke", "#ffffff");

      // Restore all other stars
      stars.transition()
        .duration(150)
        .attr("opacity", 0.8);

      tooltip.style("opacity", 0);
    });

  // Add legend
  const legendX = width - margin.right + 20;
  const legendY = margin.top + 30;

  svg.append("text")
    .attr("x", legendX)
    .attr("y", legendY)
    .attr("fill", "#e2e8f0")
    .style("font-size", "13px")
    .style("font-weight", "bold")
    .text("Spectral Types");

  const spectralTypes = [
    { type: 'O', label: 'O - Very Hot' },
    { type: 'B', label: 'B - Hot' },
    { type: 'A', label: 'A - Hot' },
    { type: 'F', label: 'F - Medium' },
    { type: 'G', label: 'G - Sun-like' },
    { type: 'K', label: 'K - Cool' },
    { type: 'M', label: 'M - Very Cool' }
  ];

  // Make legend items interactive
  spectralTypes.forEach((spec, i) => {
    const legendGroup = svg.append("g")
      .attr("class", "legend-item")
      .style("cursor", "pointer")
      .on("click", function() {
        const isActive = d3.select(this).classed("active");
        
        if (isActive) {
          // Deactivate - show all stars
          d3.selectAll(".legend-item").classed("active", false);
          stars.transition()
            .duration(300)
            .attr("opacity", 0.8)
            .attr("r", 4);
        } else {
          // Activate - filter to this spectral type
          d3.selectAll(".legend-item").classed("active", false);
          d3.select(this).classed("active", true);
          
          stars.transition()
            .duration(300)
            .attr("opacity", d => d.spectral_main === spec.type ? 0.9 : 0.1)
            .attr("r", d => d.spectral_main === spec.type ? 5 : 3);
        }
      });

    legendGroup.append("circle")
      .attr("cx", legendX + 10)
      .attr("cy", legendY + 25 + i * 25)
      .attr("r", 6)
      .attr("fill", spectralColors[spec.type])
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1);

    legendGroup.append("text")
      .attr("x", legendX + 25)
      .attr("y", legendY + 29 + i * 25)
      .attr("fill", "#a0aec0")
      .style("font-size", "12px")
      .text(spec.label);
  });

  // Add instruction text
  svg.append("text")
    .attr("x", legendX)
    .attr("y", legendY + 210)
    .attr("fill", "#63b3ed")
    .style("font-size", "11px")
    .style("font-style", "italic")
    .text("Click legend to filter");

  // Add annotations for main sequence
  svg.append("text")
    .attr("x", xScale(0.3))
    .attr("y", yScale(3))
    .attr("fill", "#4a90e2")
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text("Main Sequence");

  svg.append("line")
    .attr("x1", xScale(1.5))
    .attr("y1", yScale(8))
    .attr("x2", xScale(-0.3))
    .attr("y2", yScale(-1))
    .attr("stroke", "#4a90e2")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0.4);

  console.log("✓ HR Diagram visualization complete");
});