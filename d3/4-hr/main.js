console.log("HR Diagram loading...");

d3.csv("../../data/bright_star_clean.csv").then(data => {
  console.log("Data loaded:", data.length, "rows");
  
  // Parse numeric fields
  data.forEach(d => {
    d.bv_color = +d.bv_color;
    d.vmag = +d.vmag;
    d.spectral_type = d.spectral_type || "Unknown";
  });
  
  // Filter valid data
  data = data.filter(d => !isNaN(d.bv_color) && !isNaN(d.vmag));
  console.log("Valid stars for HR diagram:", data.length);
  
  // Dimensions
  const width = 1100;
  const height = 600;
  const margin = { top: 40, right: 240, bottom: 70, left: 80 };
  
  const svg = d3.select("#vis")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  // Scales - NOTE: Inverted as per astronomical convention
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.bv_color))
    .range([width - margin.right, margin.left]); // Reversed (hot on left)
  
  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.vmag))
    .range([height - margin.bottom, margin.top]); // Reversed (bright at top)
  
  // Color scale based on B-V (temperature)
  const colorScale = d3.scaleSequential()
    .domain([-0.5, 2.0])
    .interpolator(t => {
      if (t < 0.33) return d3.interpolateRgb("#9bb3ff", "#ffffff")(t * 3);
      if (t < 0.67) return d3.interpolateRgb("#ffffff", "#ffd2a1")((t - 0.33) * 3);
      return d3.interpolateRgb("#ffd2a1", "#ffcc6f")((t - 0.67) * 3);
    });
  
  // Axes
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).ticks(10))
    .style("color", "#a0aec0")
    .append("text")
    .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
    .attr("y", 40)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .text("B-V Color Index (Temperature) →");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(10))
    .style("color", "#a0aec0")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
    .attr("y", -45)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .text("← Visual Magnitude (Brightness)");
  
  // Grid
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickSize(-(height - margin.top - margin.bottom)).tickFormat(""))
    .style("stroke", "#2d3748")
    .style("stroke-opacity", 0.2);
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).tickFormat(""))
    .style("stroke", "#2d3748")
    .style("stroke-opacity", 0.2);
  
  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "rgba(26, 31, 58, 0.95)")
    .style("color", "#e2e8f0")
    .style("padding", "10px")
    .style("border", "2px solid #4a90e2")
    .style("border-radius", "6px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", "1000");
  
  // Get spectral types for legend
  const spectralTypes = Array.from(new Set(data.map(d => d.spectral_type.charAt(0))))
    .filter(t => t && t !== 'U')
    .sort();
  
  // Legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - margin.right + 20}, ${margin.top})`);
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", "#f6e05e")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Spectral Type");
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", 18)
    .attr("fill", "#a0aec0")
    .attr("font-size", "10px")
    .attr("font-style", "italic")
    .text("(Click to filter)");
  
  const spectralColors = {
    'O': '#9bb3ff',
    'B': '#aabfff',
    'A': '#cad7ff',
    'F': '#f8f7ff',
    'G': '#fff4ea',
    'K': '#ffd2a1',
    'M': '#ffcc6f'
  };
  
  const spectralInfo = {
    'O': 'Hot (>30,000K)',
    'B': 'Blue (10,000-30,000K)',
    'A': 'Blue-White (7,500-10,000K)',
    'F': 'White (6,000-7,500K)',
    'G': 'Yellow (5,200-6,000K)',
    'K': 'Orange (3,700-5,200K)',
    'M': 'Red (<3,700K)'
  };
  
  let activeFilters = new Set();
  
  spectralTypes.forEach((type, i) => {
    const yPos = 35 + i * 30;
    
    const legendItem = legend.append("g")
      .attr("class", "legend-item")
      .attr("transform", `translate(0, ${yPos})`)
      .style("cursor", "pointer");
    
    legendItem.append("circle")
      .attr("cx", 8)
      .attr("cy", 0)
      .attr("r", 6)
      .attr("fill", spectralColors[type] || "#fff")
      .attr("opacity", 0.9)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1);
    
    legendItem.append("text")
      .attr("x", 22)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .attr("fill", "#e2e8f0")
      .attr("font-size", "14px")
      .attr("font-weight", "bold")
      .text(type);
    
    legendItem.append("text")
      .attr("x", 22)
      .attr("y", 12)
      .attr("fill", "#a0aec0")
      .attr("font-size", "10px")
      .text(spectralInfo[type] || "");
    
    // Click to filter
    legendItem.on("click", function() {
      if (activeFilters.has(type)) {
        activeFilters.delete(type);
        d3.select(this).select("circle").attr("opacity", 0.9);
      } else {
        activeFilters.add(type);
        d3.select(this).select("circle").attr("opacity", 0.3);
      }
      
      // Update star visibility
      circles.attr("opacity", d => {
        if (activeFilters.size === 0) return 0.7;
        const starType = d.spectral_type.charAt(0);
        return activeFilters.has(starType) ? 0.1 : 0.7;
      });
    });
    
    // Hover effect
    legendItem.on("mouseover", function() {
      d3.select(this).select("circle")
        .attr("stroke", "#f6e05e")
        .attr("stroke-width", 2);
    }).on("mouseout", function() {
      d3.select(this).select("circle")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1);
    });
  });
  
  // Add note about main sequence
  const noteY = 35 + spectralTypes.length * 30 + 20;
  legend.append("text")
    .attr("x", 0)
    .attr("y", noteY)
    .attr("fill", "#4a90e2")
    .attr("font-size", "11px")
    .attr("font-weight", "bold")
    .text("Main Sequence:");
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", noteY + 15)
    .attr("fill", "#4a90e2")
    .attr("font-size", "10px")
    .text("The diagonal band");
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", noteY + 28)
    .attr("fill", "#4a90e2")
    .attr("font-size", "10px")
    .text("where most stars");
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", noteY + 41)
    .attr("fill", "#4a90e2")
    .attr("font-size", "10px")
    .text("reside (90%)");
  
  // Add hover instruction
  legend.append("text")
    .attr("x", 0)
    .attr("y", noteY + 65)
    .attr("fill", "#63b3ed")
    .attr("font-size", "10px")
    .attr("font-style", "italic")
    .text("Hover over stars");
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", noteY + 78)
    .attr("fill", "#63b3ed")
    .attr("font-size", "10px")
    .attr("font-style", "italic")
    .text("for details");
  
  // Stars
  const circles = svg.selectAll("circle.star")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "star")
    .attr("cx", d => xScale(d.bv_color))
    .attr("cy", d => yScale(d.vmag))
    .attr("r", 3.5)
    .attr("fill", d => colorScale(d.bv_color))
    .attr("opacity", 0.7)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.4);
  
  // Interactions
  circles
    .on("mouseover", function(event, d) {
      d3.select(this)
        .attr("r", 9)
        .attr("opacity", 1)
        .attr("stroke", "#f6e05e")
        .attr("stroke-width", 2.5);
      
      // Dim all other stars
      circles.filter(star => star !== d)
        .attr("opacity", 0.2);
      
      tooltip.style("opacity", 1).html(`
        <b>${d.name || "Unknown"}</b><br>
        Spectral Type: ${d.spectral_type}<br>
        B-V: ${d.bv_color.toFixed(3)}<br>
        Magnitude: ${d.vmag.toFixed(2)}<br>
        ${d.distance_ly ? `Distance: ${(+d.distance_ly).toFixed(1)} ly` : ""}
      `);
    })
    .on("mousemove", event => {
      tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
    })
    .on("mouseout", function() {
      d3.select(this)
        .attr("r", 3.5)
        .attr("opacity", 0.7)
        .attr("stroke", "#fff")
        .attr("stroke-width", 0.4);
      
      // Restore opacity to all stars
      circles.attr("opacity", 0.7);
      
      tooltip.style("opacity", 0);
    });
  
  console.log("✓ HR Diagram complete!");
  
}).catch(err => {
  console.error("Error loading data:", err);
  d3.select("#vis").html(`<p style="color:#ff6b6b;">Error loading data: ${err.message}</p>`);
});












