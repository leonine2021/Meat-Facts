/*
 * WorldVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

// var colorMap;

//

WorldVis = function (_parentElement, _data, _mapData) {
  this.parentElement = _parentElement;
  this.data = _data;
  this.mapData = _mapData;
  this.initVis();
};

WorldVis.prototype.initVis = function () {
  var vis = this;
  vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

  vis.width = 800;
  vis.height = 800;

  vis.innerWidth = 800 - vis.margin.left - vis.margin.right;
  vis.innerHeight = 800 - vis.margin.top - vis.margin.bottom;

  vis.colorScale = d3
    .scaleQuantile()
    // .domain([d3.min(Object.values(vis.data)), d3.max(Object.values(vis.data))])
    .domain([50000, 5000000])
    .range([
      "#fee3d6",
      "#fdc9b4",
      "#fcaa8e",
      "#fc8a6b",
      "#f9694c",
      "#ef4533",
      "#d92723",
      "#bb151a",
      "#970b13",
      "#67000d",
    ]);

  //   console.log(vis.colorScale.domain(), vis.colorScale.quantiles());

  // SVG drawing area
  vis.svg = d3
    .select("#" + vis.parentElement)
    .append("svg")
    .attr("width", vis.width)
    .attr("height", vis.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + vis.margin.left + "," + vis.margin.top + ")"
    );

  vis.state = {
    x: vis.innerWidth / 2 - 50,
    y: vis.innerHeight / 2 - 75,
    scale: vis.innerHeight / 3,
  };

  vis.projection = d3
    .geoOrthographic()
    .scale(vis.state.scale)
    .translate([vis.state.x, vis.state.y]);

  //Define path generator, using the Albers USA projection
  vis.path = d3.geoPath().projection(vis.projection);
  vis.createVisualization();
};

//WorldVis.prototype.createVisualization = function(error, data1, data2){

WorldVis.prototype.createVisualization = function () {
  // Visualize data1 and data2

  var vis = this;
  // Convert TopoJSON to GeoJSON (target object = 'states')
  var worldTopo = topojson.feature(
    vis.mapData,
    vis.mapData.objects.countries
  ).features;

  // div for tooltip
  var toolTip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacoty", 0);

  // Render the world by using the path generator
  var gradiantColors = ["white", "lightgray"];
  var offsets = ["0%", "100%"];
  vis.svg
    .append("defs")
    .append("radialGradient")
    .attr("id", "mygrad")
    .attr("spreadMethod", "pad")
    .selectAll("stop")
    .data(gradiantColors)
    .enter()
    .append("stop")
    .attr("offset", (d, i) => offsets[i])
    .attr("stop-color", (d) => d);

  vis.svg
    .append("path")
    .attr("d", vis.path({ type: "Sphere" }))
    .attr("fill", "url(#mygrad)");
  // .attr("stroke-width", 10)
  // .attr("stroke", "url(#mygrad)");

  vis.svg
    .selectAll("path")
    .data(worldTopo)
    .enter()
    .append("path")
    .attr("class", "mark-countries")
    .attr("d", vis.path)
    .attr("fill", function (d) {
      var countryName = d.properties.name;
      if (vis.data[countryName] != undefined) {
        return vis.colorScale(vis.data[countryName]);
      } else {
        return "gray";
      }
    })
    .on("mouseover", function (d) {
      let country = d.properties.name;
      let value = vis.data[country];
      d3.select(this).attr("opacity", 0.5);

      toolTip.style("opacity", 0.9);
      toolTip
        .html(
          typeof value === "undefined"
            ? "Country: " +
                country +
                "<br/>" +
                "Production [ton/y]: " +
                "No Data"
            : "Country: " + country + "<br/>" + "Production [ton/y]: " + value
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on("mouseout", function (d) {
      toolTip.style("opacity", 0);
      d3.select(this).attr("opacity", 1);
    });

  // legend
  let legendGroup = vis.svg
    .append("g")
    .attr("id", "color-legend")
    .attr(
      "transform",
      `translate(${vis.innerWidth - 150},${vis.innerHeight - 375})`
    );

  let bounds = [
    vis.colorScale.domain()[0],
    ...vis.colorScale.quantiles(),
    vis.colorScale.domain()[1],
  ];
  legendGroup
    .selectAll("rect")
    .data(bounds)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => 15 * (bounds.length - 1 - i))
    .attr("width", "12px")
    .attr("height", "12px")
    .attr("fill", (d) => vis.colorScale(d));

  legendGroup
    .selectAll("text")
    .attr("calss", "text-color-legend")
    .data(bounds)
    .enter()
    .append("text")
    .attr("x", 18)
    .attr("y", (d, i) => 15 * (bounds.length - 1 - i))
    .text((d, i) => {
      if (i === 0) {
        return `<${d}`;
      }
      return `${bounds[i - 1]} ~ ${bounds[i]}`;
    })
    .attr("dy", "8px")
    .attr("font-size", "6pt");

  var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
    r0, // Projection rotation as Euler angles at start.
    q0; // Projection rotation as versor at start.

  var drag = d3
    .drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  vis.svg.call(drag);

  function dragstarted() {
    var mouse_pos = d3.mouse(this);

    v0 = versor.cartesian(vis.projection.invert(mouse_pos));
    r0 = vis.projection.rotate();
    q0 = versor(r0);

    vis.svg
      .insert("path")
      .datum({ type: "Point", coordinates: vis.projection.invert(mouse_pos) })
      .attr("class", "point point-mouse");
  }

  function dragged() {
    var mouse_pos = d3.mouse(this);

    var v1 = versor.cartesian(vis.projection.rotate(r0).invert(mouse_pos)),
      q1 = versor.multiply(q0, versor.delta(v0, v1)),
      r1 = versor.rotation(q1);

    if (r1) {
      vis.projection.rotate(r1);
      vis.svg.selectAll("path.mark-countries").attr("d", vis.path);

      vis.svg.selectAll(".point-mouse").datum({
        type: "Point",
        coordinates: vis.projection.invert(mouse_pos),
      });
    }
  }

  function dragended() {
    vis.svg.selectAll(".point").remove();
  }
  //Mouse events
  //
  var countryTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "countryTooltip");
  countryList = d3
    .select("body")
    .append("select")
    .attr("name", "countries")
    .on("mouseover", function (d) {
      //   console.log(d)
      countryTooltip
        .text(countryById[d.id])
        .style("left", d3.event.pageX + 7 + "px")
        .style("top", d3.event.pageY - 15 + "px")
        .style("display", "block")
        .style("opacity", 1);
    })
    .on("mouseout", function (d) {
      countryTooltip.style("opacity", 0).style("display", "none");
    })
    .on("mousemove", function (d) {
      countryTooltip
        .style("left", d3.event.pageX + 7 + "px")
        .style("top", d3.event.pageY - 15 + "px");
    });
};
