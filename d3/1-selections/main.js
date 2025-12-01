// 1 – selections and DOM updates

// highlight Betelgeuse row
d3.select("tbody tr:nth-child(2)").classed("highlight", true);

// change the "Random Star" row to a real star
d3.select("tbody tr:last-child .name").text("Altair");
d3.select("tbody tr:last-child .constellation").text("Aquila");
d3.select("tbody tr:last-child .spectral").text("A7V");
d3.select("tbody tr:last-child .rate").text("8");

// change all ratings to 10 for fun
d3.selectAll(".rate").text("10");

// remove the Rigel row (third row)
d3.select("tbody tr:nth-child(3)").remove();