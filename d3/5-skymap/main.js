console.log("Enhanced Sky Map loading...");

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
  
  const width = 1100;
  const height = 600;
  const margin = { top: 20, right: 260, bottom: 60, left: 70 };
  
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
    .attr("y", 40)
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
    .attr("y", -45)
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
  
  // Calculate trend line (linear regression for Dec vs RA)
  const validTrendData = data.filter(d => !isNaN(d.ra_deg) && !isNaN(d.dec_deg));
  const n = validTrendData.length;
  const sumX = d3.sum(validTrendData, d => d.ra_deg);
  const sumY = d3.sum(validTrendData, d => d.dec_deg);
  const sumXY = d3.sum(validTrendData, d => d.ra_deg * d.dec_deg);
  const sumX2 = d3.sum(validTrendData, d => d.ra_deg * d.ra_deg);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  const trendLine = d3.line()
    .x(d => xScale(d))
    .y(d => yScale(slope * d + intercept));
  
  svg.append("path")
    .datum([0, 360])
    .attr("d", trendLine)
    .attr("stroke", "#63b3ed")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "8,4")
    .attr("fill", "none")
    .attr("opacity", 0.6);
  
  svg.append("text")
    .attr("x", width - margin.right + 10)
    .attr("y", yScale(slope * 360 + intercept))
    .attr("fill", "#63b3ed")
    .attr("font-size", "10px")
    .text("Trend");
  
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
  
  // Filter state
  let tempFilter = "all";
  let brightFilter = "all";
  
  // Stars
  const circles = svg.selectAll("circle.star")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "star")
    .attr("cx", d => xScale(d.ra_deg))
    .attr("cy", d => yScale(d.dec_deg))
    .attr("r", d => sizeScale(d.vmag))
    .attr("fill", d => !isNaN(d.bv_color) ? colorScale(d.bv_color) : "#fff")
    .attr("opacity", 0.8)
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.3)
    .on("mouseover", function(e, d) {
      d3.select(this).attr("r", sizeScale(d.vmag) * 1.8).attr("opacity", 1)
        .attr("stroke", "#f6e05e").attr("stroke-width", 2);
      tooltip.style("opacity", 1).html(`
        <b>${d.name || "Unknown"}</b><br>
        RA: ${d.ra_deg.toFixed(1)}°<br>
        Dec: ${d.dec_deg.toFixed(1)}°<br>
        Mag: ${d.vmag.toFixed(2)}<br>
        B-V: ${d.bv_color ? d.bv_color.toFixed(2) : "N/A"}
      `);
    })
    .on("mousemove", e => {
      tooltip.style("left", (e.pageX + 10) + "px")
             .style("top", (e.pageY - 10) + "px");
    })
    .on("mouseout", function(e, d) {
      d3.select(this).attr("r", sizeScale(d.vmag)).attr("opacity", 0.8)
        .attr("stroke", "#fff").attr("stroke-width", 0.3);
      tooltip.style("opacity", 0);
    });
  
  // Legend with filters
  const legend = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 15}, ${margin.top})`);
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("fill", "#f6e05e")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Filters");
  
  // Temperature filter
  legend.append("text")
    .attr("x", 0)
    .attr("y", 30)
    .attr("fill", "#e2e8f0")
    .attr("font-size", "13px")
    .attr("font-weight", "bold")
    .text("Temperature:");
  
  const tempOptions = [
    { label: "All", value: "all" },
    { label: "Hot (B-V < 0.5)", value: "hot" },
    { label: "Medium (0.5-1.2)", value: "medium" },
    { label: "Cool (B-V > 1.2)", value: "cool" }
  ];
  
  tempOptions.forEach((opt, i) => {
    const g = legend.append("g")
      .attr("transform", `translate(0, ${50 + i * 25})`)
      .style("cursor", "pointer")
      .on("click", function() {
        tempFilter = opt.value;
        updateFilters();
        legend.selectAll(".temp-option").attr("opacity", 0.5);
        d3.select(this).attr("opacity", 1);
      });
    
    g.append("circle")
      .attr("class", "temp-option")
      .attr("cx", 8)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", "#4a90e2")
      .attr("opacity", opt.value === "all" ? 1 : 0.5);
    
    g.append("text")
      .attr("x", 20)
      .attr("y", 4)
      .attr("fill", "#a0aec0")
      .attr("font-size", "11px")
      .text(opt.label);
  });
  
  // Brightness filter
  legend.append("text")
    .attr("x", 0)
    .attr("y", 180)
    .attr("fill", "#e2e8f0")
    .attr("font-size", "13px")
    .attr("font-weight", "bold")
    .text("Brightness:");
  
  const brightOptions = [
    { label: "All", value: "all" },
    { label: "Bright (mag < 2)", value: "bright" },
    { label: "Medium (2-4)", value: "medium" },
    { label: "Dim (mag > 4)", value: "dim" }
  ];
  
  brightOptions.forEach((opt, i) => {
    const g = legend.append("g")
      .attr("transform", `translate(0, ${200 + i * 25})`)
      .style("cursor", "pointer")
      .on("click", function() {
        brightFilter = opt.value;
        updateFilters();
        legend.selectAll(".bright-option").attr("opacity", 0.5);
        d3.select(this).attr("opacity", 1);
      });
    
    g.append("circle")
      .attr("class", "bright-option")
      .attr("cx", 8)
      .attr("cy", 0)
      .attr("r", 5)
      .attr("fill", "#f6e05e")
      .attr("opacity", opt.value === "all" ? 1 : 0.5);
    
    g.append("text")
      .attr("x", 20)
      .attr("y", 4)
      .attr("fill", "#a0aec0")
      .attr("font-size", "11px")
      .text(opt.label);
  });
  
  // Filter update function
  function updateFilters() {
    circles.attr("opacity", d => {
      let show = true;
      
      // Temperature filter
      if (tempFilter === "hot" && d.bv_color >= 0.5) show = false;
      if (tempFilter === "medium" && (d.bv_color < 0.5 || d.bv_color > 1.2)) show = false;
      if (tempFilter === "cool" && d.bv_color <= 1.2) show = false;
      
      // Brightness filter
      if (brightFilter === "bright" && d.vmag >= 2) show = false;
      if (brightFilter === "medium" && (d.vmag < 2 || d.vmag > 4)) show = false;
      if (brightFilter === "dim" && d.vmag <= 4) show = false;
      
      return show ? 0.8 : 0.1;
    });
  }
  
  // Legend info
  legend.append("text")
    .attr("x", 0)
    .attr("y", 320)
    .attr("fill", "#63b3ed")
    .attr("font-size", "10px")
    .attr("font-style", "italic")
    .text("Click to filter by");
  
  legend.append("text")
    .attr("x", 0)
    .attr("y", 335)
    .attr("fill", "#63b3ed")
    .attr("font-size", "10px")
    .attr("font-style", "italic")
    .text("temperature or brightness");
  
  console.log("✓ Enhanced Sky Map complete!");
  
}).catch(err => {
  console.error("Error:", err);
  d3.select("#vis").html(`<p style="color:red;">Error: ${err.message}</p>`);
});