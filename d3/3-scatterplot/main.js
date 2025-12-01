// 3 – simple scatterplot with toy star data

const data = [
  { name: "Sirius", distance_pc: 2.6, vmag: -1.46 },
  { name: "Canopus", distance_pc: 95, vmag: -0.74 },
  { name: "Arcturus", distance_pc: 11.3, vmag: -0.05 },
  { name: "Vega", distance_pc: 7.7, vmag: 0.03 },
  { name: "Capella", distance_pc: 13.2, vmag: 0.08 },
  { name: "Rigel", distance_pc: 264, vmag: 0.13 },
];

const width = 650;
const height = 400;
const margin = { top: 50, right: 40, bottom: 60, left: 70 };

const svg = d3
  .select("#vis")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background", "white");

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const x = d3
  .scaleLinear()
  .domain(d3.extent(data, (d) => d.distance_pc))
  .nice()
  .range([0, innerWidth]);

// smaller vmag = brighter, so we flip axis direction
const y = d3
  .scaleLinear()
  .domain(d3.extent(data, (d) => d.vmag))
  .nice()
  .range([0, innerHeight]);

const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

g.append("g")
  .attr("transform", `translate(0,${innerHeight})`)
  .call(d3.axisBottom(x));

g.append("g").call(d3.axisLeft(y));

g.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", (d) => x(d.distance_pc))
  .attr("cy", (d) => y(d.vmag))
  .attr("r", 6)
  .attr("fill", "darkorange");

g.selectAll("text.label")
  .data(data)
  .enter()
  .append("text")
  .attr("class", "label")
  .attr("x", (d) => x(d.distance_pc) + 8)
  .attr("y", (d) => y(d.vmag) - 4)
  .text((d) => d.name)
  .attr("font-size", "10px");

svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .attr("font-size", 16)
  .text("Toy scatterplot of star distance vs brightness");

svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", height - 10)
  .attr("text-anchor", "middle")
  .text("Distance (parsecs)");

svg
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", 20)
  .attr("text-anchor", "middle")
  .text("Apparent magnitude (lower = brighter)");