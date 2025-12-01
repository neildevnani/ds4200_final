// 2 – bar chart on small dummy data

const data = [
  { type: "O", count: 2 },
  { type: "B", count: 6 },
  { type: "A", count: 9 },
  { type: "F", count: 8 },
  { type: "G", count: 7 },
  { type: "K", count: 5 },
  { type: "M", count: 4 },
];

const width = 650;
const height = 400;
const margin = { top: 50, right: 40, bottom: 60, left: 60 };

const svg = d3
  .select("#vis")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .style("background", "white");

const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

const x = d3
  .scaleBand()
  .domain(data.map((d) => d.type))
  .range([0, innerWidth])
  .padding(0.3);

const y = d3
  .scaleLinear()
  .domain([0, d3.max(data, (d) => d.count)])
  .nice()
  .range([innerHeight, 0]);

const g = svg
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

g.append("g")
  .attr("transform", `translate(0,${innerHeight})`)
  .call(d3.axisBottom(x));

g.append("g").call(d3.axisLeft(y));

g.selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("x", (d) => x(d.type))
  .attr("y", (d) => y(d.count))
  .attr("width", x.bandwidth())
  .attr("height", (d) => innerHeight - y(d.count))
  .attr("fill", "steelblue");

svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", margin.top / 2)
  .attr("text-anchor", "middle")
  .attr("font-size", 16)
  .text("Fake counts by spectral type");

svg
  .append("text")
  .attr("x", width / 2)
  .attr("y", height - 10)
  .attr("text-anchor", "middle")
  .text("Spectral type");

svg
  .append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", -height / 2)
  .attr("y", 20)
  .attr("text-anchor", "middle")
  .text("Count");