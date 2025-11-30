d3.csv("data/bright_star_clean.csv").then(data => {
  // choose fields from your CSV
  const xField = "bv_color";   // proxy for temperature
  const yField = "vmag";       // brightness (magnitude)

  // convert to numbers and drop missing
  data.forEach(d => {
    d[xField] = +d[xField];
    d[yField] = +d[yField];
  });
  data = data.filter(d => !isNaN(d[xField]) && !isNaN(d[yField]));

  const width = 600;
  const height = 400;
  const margin = { top: 40, right: 30, bottom: 50, left: 60 };

  const svg = d3.select("#d3-viz-1")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // x: color index
  const x = d3.scaleLinear()
    .domain(d3.extent(data, d => d[xField]))
    .nice()
    .range([margin.left, width - margin.right]);

  // y: magnitude (smaller = brighter) → brighter at top
  const y = d3.scaleLinear()
    .domain(d3.extent(data, d => d[yField]))
    .nice()
    .range([margin.top, height - margin.bottom]);

  // axes
  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .append("text")
    .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
    .attr("y", 35)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("B-V Color Index (proxy for temperature)");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
    .attr("y", -40)
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .text("Apparent Magnitude (V)");

  // title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Star Brightness vs Color (B-V)");

  // tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("background", "#f4f4f4")
    .style("padding", "6px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("opacity", 0);

  // points
  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => x(d[xField]))
    .attr("cy", d => y(d[yField]))
    .attr("r", 3)
    .attr("fill", "steelblue")
    .attr("opacity", 0.8)
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(
          `Name: ${d.name}<br>` +
          `B-V: ${d[xField].toFixed(2)}<br>` +
          `Vmag: ${d[yField].toFixed(2)}`
        );
    })
    .on("mousemove", event => {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => tooltip.style("opacity", 0));
});
