console.log("Density Plot loading...");

d3.csv("../../data/bright_star_clean.csv").then(data => {
  console.log("Data loaded:", data.length, "rows");
  
  // Parse numeric fields
  data.forEach(d => {
    d.bv_color = +d.bv_color;
    d.vmag = +d.vmag;
  });
  
  // Filter valid data
  const tempData = data.filter(d => !isNaN(d.bv_color));
  const magData = data.filter(d => !isNaN(d.vmag));
  
  console.log("Valid temperature data:", tempData.length);
  console.log("Valid brightness data:", magData.length);
  
  // Dimensions
  const width = 1100;
  const height = 650;
  const margin = { top: 70, right: 240, bottom: 90, left: 80 };
  const chartHeight = (height - margin.top - margin.bottom - 50) / 2; // 50px gap between charts
  
  const svg = d3.select("#vis")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  
  // ==================== TEMPERATURE DISTRIBUTION ====================
  
  const tempY = margin.top;
  
  // Temperature scale (B-V Color Index)
  const xScaleTemp = d3.scaleLinear()
    .domain(d3.extent(tempData, d => d.bv_color))
    .range([margin.left, width - margin.right]);
  
  // Create histogram bins for temperature
  const tempBins = d3.bin()
    .domain(xScaleTemp.domain())
    .thresholds(50)
    (tempData.map(d => d.bv_color));
  
  // Y scale for temperature density
  const yScaleTemp = d3.scaleLinear()
    .domain([0, d3.max(tempBins, d => d.length)])
    .range([tempY + chartHeight, tempY]);
  
  // Temperature area
  const tempArea = d3.area()
    .x(d => xScaleTemp((d.x0 + d.x1) / 2))
    .y0(tempY + chartHeight)
    .y1(d => yScaleTemp(d.length))
    .curve(d3.curveBasis);
  
  // Draw temperature distribution
  svg.append("path")
    .datum(tempBins)
    .attr("class", "density-area")
    .attr("fill", "#4a90e2")
    .attr("d", tempArea);
  
  // Temperature axes
  svg.append("g")
    .attr("transform", `translate(0,${tempY + chartHeight})`)
    .call(d3.axisBottom(xScaleTemp).ticks(10))
    .style("color", "#a0aec0");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScaleTemp).ticks(6))
    .style("color", "#a0aec0");
  
  // Temperature grid
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${tempY + chartHeight})`)
    .call(d3.axisBottom(xScaleTemp).tickSize(-chartHeight).tickFormat(""));
  
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScaleTemp).tickSize(-(width - margin.left - margin.right)).tickFormat(""));
  
  // Temperature labels
  svg.append("text")
    .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
    .attr("y", tempY + chartHeight + 45)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("B-V Color Index (Temperature) →");
  
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(tempY + chartHeight / 2))
    .attr("y", margin.left - 55)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Number of Stars");
  
  // Temperature title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", tempY - 30)
    .attr("text-anchor", "middle")
    .attr("fill", "#f6e05e")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Distribution of Stellar Temperatures");
  
  // Temperature annotation
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", tempY - 12)
    .attr("text-anchor", "middle")
    .attr("fill", "#63b3ed")
    .attr("font-size", "11px")
    .text("Cooler (red) stars ← → Hotter (blue) stars");
  
  // Add mean line for temperature
  const tempMean = d3.mean(tempData, d => d.bv_color);
  svg.append("line")
    .attr("x1", xScaleTemp(tempMean))
    .attr("x2", xScaleTemp(tempMean))
    .attr("y1", tempY)
    .attr("y2", tempY + chartHeight)
    .attr("stroke", "#f6e05e")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");
  
  svg.append("text")
    .attr("x", xScaleTemp(tempMean) + 5)
    .attr("y", tempY + 15)
    .attr("fill", "#f6e05e")
    .attr("font-size", "11px")
    .text(`Mean: ${tempMean.toFixed(2)}`);
  
  // ==================== BRIGHTNESS DISTRIBUTION ====================
  
  const magY = tempY + chartHeight + 90;
  
  // Brightness scale (Visual Magnitude) - inverted so bright stars are on right
  const xScaleMag = d3.scaleLinear()
    .domain(d3.extent(magData, d => d.vmag).reverse()) // Reversed
    .range([margin.left, width - margin.right]);
  
  // Create histogram bins for brightness
  const magBins = d3.bin()
    .domain(d3.extent(magData, d => d.vmag))
    .thresholds(50)
    (magData.map(d => d.vmag));
  
  // Y scale for brightness density
  const yScaleMag = d3.scaleLinear()
    .domain([0, d3.max(magBins, d => d.length)])
    .range([magY + chartHeight, magY]);
  
  // Brightness area
  const magArea = d3.area()
    .x(d => xScaleMag((d.x0 + d.x1) / 2))
    .y0(magY + chartHeight)
    .y1(d => yScaleMag(d.length))
    .curve(d3.curveBasis);
  
  // Draw brightness distribution
  svg.append("path")
    .datum(magBins)
    .attr("class", "density-area")
    .attr("fill", "#f6e05e")
    .attr("d", magArea);
  
  // Brightness axes
  svg.append("g")
    .attr("transform", `translate(0,${magY + chartHeight})`)
    .call(d3.axisBottom(xScaleMag).ticks(10))
    .style("color", "#a0aec0");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScaleMag).ticks(6))
    .style("color", "#a0aec0");
  
  // Brightness grid
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${magY + chartHeight})`)
    .call(d3.axisBottom(xScaleMag).tickSize(-chartHeight).tickFormat(""));
  
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScaleMag).tickSize(-(width - margin.left - margin.right)).tickFormat(""));
  
  // Brightness labels
  svg.append("text")
    .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
    .attr("y", magY + chartHeight + 50)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Visual Magnitude (Brightness) →");
  
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(magY + chartHeight / 2))
    .attr("y", margin.left - 55)
    .attr("fill", "#e2e8f0")
    .attr("text-anchor", "middle")
    .attr("class", "axis-label")
    .text("Number of Stars");
  
  // Brightness title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", magY - 30)
    .attr("text-anchor", "middle")
    .attr("fill", "#f6e05e")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .text("Distribution of Stellar Brightness");
  
  // Brightness annotation
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", magY - 12)
    .attr("text-anchor", "middle")
    .attr("fill", "#63b3ed")
    .attr("font-size", "11px")
    .text("Dimmer stars ← → Brighter stars");
  
  // Add mean line for brightness
  const magMean = d3.mean(magData, d => d.vmag);
  svg.append("line")
    .attr("x1", xScaleMag(magMean))
    .attr("x2", xScaleMag(magMean))
    .attr("y1", magY)
    .attr("y2", magY + chartHeight)
    .attr("stroke", "#4a90e2")
    .attr("stroke-width", 2)
    .attr("stroke-dasharray", "5,5");
  
  svg.append("text")
    .attr("x", xScaleMag(magMean) + 5)
    .attr("y", magY + 15)
    .attr("fill", "#4a90e2")
    .attr("font-size", "11px")
    .text(`Mean: ${magMean.toFixed(2)}`);
  
  // ==================== LEGEND ====================
  
  const legendX = width - margin.right + 20;
  const legendY = 30;
  
  // Legend background
  svg.append("rect")
    .attr("x", legendX - 10)
    .attr("y", legendY - 5)
    .attr("width", 220)
    .attr("height", 70)
    .attr("fill", "rgba(26, 31, 58, 0.9)")
    .attr("stroke", "#4a90e2")
    .attr("stroke-width", 1)
    .attr("rx", 5);
  
  // Legend title
  svg.append("text")
    .attr("x", legendX)
    .attr("y", legendY + 15)
    .attr("fill", "#f6e05e")
    .attr("font-size", "13px")
    .attr("font-weight", "bold")
    .text("Legend");
  
  // Temperature legend item
  svg.append("rect")
    .attr("x", legendX)
    .attr("y", legendY + 25)
    .attr("width", 20)
    .attr("height", 12)
    .attr("fill", "#4a90e2")
    .attr("opacity", 0.7);
  
  svg.append("text")
    .attr("x", legendX + 25)
    .attr("y", legendY + 35)
    .attr("fill", "#e2e8f0")
    .attr("font-size", "11px")
    .text("Temperature");
  
  // Brightness legend item
  svg.append("rect")
    .attr("x", legendX)
    .attr("y", legendY + 45)
    .attr("width", 20)
    .attr("height", 12)
    .attr("fill", "#f6e05e")
    .attr("opacity", 0.7);
  
  svg.append("text")
    .attr("x", legendX + 25)
    .attr("y", legendY + 55)
    .attr("fill", "#e2e8f0")
    .attr("font-size", "11px")
    .text("Brightness");
  
  console.log("✓ Density plots complete!");
  
}).catch(err => {
  console.error("Error loading data:", err);
  d3.select("#vis").html(`<p style="color:#ff6b6b;">Error loading data: ${err.message}</p>`);
});