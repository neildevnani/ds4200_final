// Sky Map Visualization
console.log("Sky Map loading...");

d3.csv("../../data/bright_star_clean.csv").then(data => {
  console.log("Data loaded:", data.length, "rows");
  
  data.forEach(d => {
    d.ra_deg = +d.ra_deg;
    d.dec_deg = +d.dec_deg;
    d.vmag = +d.vmag;
    d.bv_color = +d.bv_color;
  });
  
  data = data.filter(d => !isNaN(d.ra_deg) && !isNaN(d.dec_deg));
  console.log("Valid stars:", data.length);
  
  const width = 1000;
  const height = 600;
  const margin = { top: 20, right: 160, bottom: 50, left: 60 };
  
  const svg = d3.select("#vis")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  const xScale = d3.scaleLinear()
    .domain([0, 360])
    .range([margin.left, width - margin.right]);
  
  const yScale = d3.scaleLinear()
    .domain([-90, 90])
    .range([height - margin.bottom, margin.top]);
  
  const sizeScale = d3.scaleSqrt()
    .domain(d3.extent(data, d => d.vmag))
    .range([7, 2]);
  
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
    .call(d3.axisBottom(xScale).ticks(12))
    .style("color", "#a0aec0")
    .append("text")
    .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
    .attr("y", 35)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .text("Right Ascension (°)");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).ticks(9))
    .style("color", "#a0aec0")
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
    .attr("y", -40)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .text("Declination (°)");
  
  // Grid
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickSize(-(height - margin.top - margin.bottom)).tickFormat(""))
    .style("stroke", "#2d3748").style("stroke-opacity", 0.3);
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).tickFormat(""))
    .style("stroke", "#2d3748").style("stroke-opacity", 0.3);
  
  // Celestial equator
  svg.append("line")
    .attr("x1", xScale(0)).attr("x2", xScale(360))
    .attr("y1", yScale(0)).attr("y2", yScale(0))
    .attr("stroke", "#4a90e2")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5")
    .attr("opacity", 0.5);
  
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
  
  // Legend
  const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);
  
  // Legend title
  legend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", "#f6e05e")
    .attr("font-size", "14px")
    .attr("font-weight", "bold")
    .text("Legend");
  
  // Size legend (Brightness)
  legend.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .attr("fill", "#e2e8f0")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .text("Brightness");
  
  const brightnessSamples = [
    { mag: -1, label: "Very Bright (-1)" },
    { mag: 2, label: "Bright (2)" },
    { mag: 5, label: "Dim (5)" }
  ];
  
  brightnessSamples.forEach((sample, i) => {
    const yPos = 40 + i * 25;
    legend.append("circle")
      .attr("cx", 5)
      .attr("cy", yPos)
      .attr("r", sizeScale(sample.mag))
      .attr("fill", "#fff")
      .attr("opacity", 0.8)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.3);
    
    legend.append("text")
      .attr("x", 15)
      .attr("y", yPos + 4)
      .attr("fill", "#a0aec0")
      .attr("font-size", "11px")
      .text(sample.label);
  });
  
  // Color legend (Temperature)
  legend.append("text")
    .attr("x", 0)
    .attr("y", 130)
    .attr("fill", "#e2e8f0")
    .attr("font-size", "12px")
    .attr("font-weight", "bold")
    .text("Temperature");
  
  const tempSamples = [
    { bv: -0.3, temp: ">10,000K", label: "Hot (Blue)" },
    { bv: 0.6, temp: "~6,000K", label: "Medium (White)" },
    { bv: 1.5, temp: "<4,000K", label: "Cool (Orange)" }
  ];
  
  tempSamples.forEach((sample, i) => {
    const yPos = 145 + i * 25;
    legend.append("circle")
      .attr("cx", 5)
      .attr("cy", yPos)
      .attr("r", 5)
      .attr("fill", colorScale(sample.bv))
      .attr("opacity", 0.9)
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5);
    
    legend.append("text")
      .attr("x", 15)
      .attr("y", yPos + 4)
      .attr("fill", "#a0aec0")
      .attr("font-size", "11px")
      .text(sample.label);
  });
  
  // Additional info
  legend.append("text")
    .attr("x", 0)
    .attr("y", 235)
    .attr("fill", "#4a90e2")
    .attr("font-size", "10px")
    .attr("font-style", "italic")
    .text("Hover over stars");
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", 250)
    .attr("fill", "#4a90e2")
    .attr("font-size", "10px")
    .attr("font-style", "italic")
    .text("for details");
  
  // Stars
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.ra_deg))
    .attr("cy", d => yScale(d.dec_deg))
    .attr("r", d => sizeScale(d.vmag))
    .attr("fill", d => !isNaN(d.bv_color) ? colorScale(d.bv_color) : "#fff")
    .attr("opacity", 0.8)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.3)
    .on("mouseover", function(e, d) {
      d3.select(this).attr("r", sizeScale(d.vmag) * 1.5).attr("opacity", 1);
      tooltip.style("opacity", 1).html(`
        <b>${d.name}</b><br>
        RA: ${d.ra_deg.toFixed(1)}°<br>
        Dec: ${d.dec_deg.toFixed(1)}°<br>
        Mag: ${d.vmag.toFixed(2)}
      `);
    })
    .on("mousemove", e => {
      tooltip.style("left", (e.pageX + 10) + "px")
             .style("top", (e.pageY - 10) + "px");
    })
    .on("mouseout", function(e, d) {
      d3.select(this).attr("r", sizeScale(d.vmag)).attr("opacity", 0.8);
      tooltip.style("opacity", 0);
    });
  
  console.log("✓ Sky Map complete!");
  
}).catch(err => {
  console.error("Error:", err);
  d3.select("#vis").html(`<p style="color:red;">Error: ${err.message}</p>`);
});