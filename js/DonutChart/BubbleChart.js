//The bubble chart to show the breakdown of each food item when hover over the bar chart

BubbleChart = function (_parentElement, _data) {
  this.parentElement = _parentElement;
  this.data = _data;

  this.initVis();
};

BubbleChart.prototype.initVis = function () {
  var vis = this;

  vis.margin = { top: 80, right: 20, bottom: 30, left: 20 };

  vis.maxWidth = Math.min(window.innerWidth, 300);
  vis.maxHeight = Math.min(window.innerWidth, 600);

  vis.width = vis.maxWidth - vis.margin.left - vis.margin.right;
  vis.height = vis.maxHeight - vis.margin.top - vis.margin.bottom;

  //Data Processing
  var steps = Object.keys(vis.data).slice(2, -1);
  var values = Object.values(vis.data).slice(2, -1);

  // SVG drawing area
  vis.svg = d3
    .select("#" + vis.parentElement)
    .append("svg")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .attr("class", "bubble-svg");

  vis.svg
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("rx", "10px")
    .attr("ry", "10px")
    .attr("width", vis.width + vis.margin.left + vis.margin.right)
    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
    .attr("fill", "rgba(0,0,0,0.2)");

  vis.y = d3
    .scalePoint()
    .domain(steps)
    .range([0, vis.height * 0.7]);

  vis.x = d3.scaleLinear().domain([0, 50]).range([0, 30]);

  vis.y_Axis = d3.axisLeft().scale(vis.y).tickSize(15);

  vis.yAxis = vis.svg
    .append("g")
    .attr("class", "y-axis axis")
    .attr(
      "transform",
      "translate(" + (vis.margin.left + 80) + "," + (vis.margin.top + 50) + ")"
    )
    .call(vis.y_Axis)
    .call((g) => g.select(".domain").remove())
    .attr("font-size", "8pt");

  vis.ylabel = vis.svg
    .append("g")
    .attr("class", "ylabel")
    .attr("x", 0)
    .attr("y", 0)
    .attr(
      "transform",
      "translate(" + vis.margin.left + "," + vis.margin.top + ")"
    );

  vis.ylabel
    .append("text")
    .attr("x", 10)
    .attr("y", -10)
    .text("Emission Breakdown")
    .attr("font-size", "12pt");

  vis.ylabel
    .append("text")
    .attr("x", 10)
    .attr("y", -30)
    .text("Product: " + vis.data.Product)
    .attr("font-size", "12pt");

  vis.ylabel
    .append("text")
    .attr("x", 10)
    .attr("y", 430)
    .text("Total Emission: " + vis.data.Total + " kg CO2 eq")
    .attr("font-size", "10pt");

  //Initialize Circles
  vis.group = vis.svg
    .append("g")
    .attr("transform", "translate(200,50)")
    .attr("class", "group");

  vis.group
    .selectAll("circle")
    .data(values)
    .enter()
    .append("circle")
    .attr("class", "circles")
    .attr("cx", 20)
    .attr("cy", (d, i) => vis.margin.top + vis.y(steps[i]))
    .attr("r", (d) => Math.sqrt(vis.x(d)) * 10)
    .attr("fill", "#ea3030");

  vis.group
    .selectAll("text")
    .data(values)
    .enter()
    .append("text")
    .attr("class", "circles")
    .attr("x", (d) => Math.sqrt(vis.x(d)) * 10 + 30)
    .attr("y", (d, i) => vis.margin.top + vis.y(steps[i]) + 5)
    .text((d) => d)
    .attr("font-size", "6pt");
};
