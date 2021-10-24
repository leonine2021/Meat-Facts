/*
 * WorldVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */

// var colorMap;

//

WorldVis = function (_parentElement, _data, _mapData) {
  this.parentElement = _parentElement;
  this.year = 1961;
  this.data = _data;
  this.mapData = _mapData;
  // console.log(_data);
  this.initVis();
};

WorldVis.prototype.initVis = function () {
  var vis = this;
  vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

  vis.width = 800;
  vis.height = 650;

  vis.innerWidth = 800 - vis.margin.left - vis.margin.right;
  vis.innerHeight = 800 - vis.margin.top - vis.margin.bottom;

  vis.colorScale = d3
    .scaleQuantile()
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

  // SVG drawing area
  vis.svg = d3
    .select("#" + vis.parentElement)
    .append("svg")
    .attr("class", "svg world-map")
    .attr("width", vis.width)
    .attr("height", vis.height)
    .append("g")
    .attr(
      "transform",
      "translate(" + vis.margin.left + "," + vis.margin.top + ")"
    );

  vis.state = {
    x: vis.innerWidth / 2 - 100,
    y: vis.innerHeight / 2 - 50,
    scale: vis.innerHeight / 3,
  };

  vis.projection = d3
    .geoOrthographic()
    .scale(vis.state.scale)
    .translate([vis.state.x, vis.state.y]);

  vis.path = d3.geoPath().projection(vis.projection);
  vis.worldTopo = topojson.feature(
    vis.mapData,
    vis.mapData.objects.countries
  ).features;

  // div for tooltip
  var toolTip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip wm")
    .style("opacity", 0);

  // Render the world by using the path generator
  var gradiantColors = ["white", "lightblue"];
  var offsets = ["0%", "100%"];
  vis.svg
    .append("defs")
    .append("radialGradient")
    .attr("id", "mygrad")
    .selectAll("stop")
    .data(gradiantColors)
    .enter()
    .append("stop")
    .attr("offset", (d, i) => offsets[i])
    .attr("stop-color", (d) => d);

  vis.svg
    .append("circle")
    .attr("cx", vis.state.x)
    .attr("cy", vis.state.y)
    .attr("r", vis.state.scale)
    .attr("fill", "url(#mygrad)");

  vis.svg
    .selectAll("path")
    .data(vis.worldTopo)
    .enter()
    .append("path")
    .attr("class", "mark-countries")
    .attr("d", vis.path)
    .attr("fill", function (d) {
      var countryName = d.properties.name;
      if (
        vis.data[countryName] != undefined &&
        vis.data[countryName][vis.year] != undefined
      ) {
        return vis.colorScale(vis.data[countryName][vis.year]);
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
          typeof value === "undefined" || typeof value[vis.year] === "undefined"
            ? "Country: " +
                country +
                "<br/>" +
                "Production [ton/y]: " +
                "No Data"
            : "Country: " +
                country +
                "<br/>" +
                "Production [ton/y]: " +
                value[vis.year]
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on("mouseout", function (d) {
      toolTip.style("opacity", 0);
      d3.select(this).attr("opacity", 1);
    });

  //   vis.svg
  //     .append("text")
  //     .attr("id", "world-map-title")
  //     .attr("x", vis.innerWidth / 2 - 190)
  //     .attr("y", vis.margin.top + 20)
  //     .text("GLOBAL MEAT PRODUCTION")
  //     .attr("fill", "white");

  // legend
  let legendGroup = vis.svg
    .append("g")
    .attr("id", "color-legend")
    .attr(
      "transform",
      `translate(${vis.innerWidth - 150},${vis.innerHeight - 350})`
    );

  let bounds = [...vis.colorScale.quantiles(), vis.colorScale.domain()[1]];
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
      if (i === bounds.length - 1) {
        return `> ${bounds[i]}`;
      }
      return `${bounds[i - 1]} ~ ${bounds[i]}`;
    })
    .attr("dy", "9px")
    .attr("fill", "#aaa")
    .attr("font-size", "6pt");
  // legend for no data
  legendGroup
    .append("rect")
    .attr("x", 0)
    .attr("y", 15 * 10)
    .attr("width", "12px")
    .attr("height", "12px")
    .attr("fill", "gray");
  legendGroup
    .append("text")
    .attr("x", 18)
    .attr("y", 15 * 10)
    .text("No Data")
    .attr("dy", "10px")
    .attr("fill", "#aaa")
    .attr("font-size", "6pt");
  legendGroup
    .append("text")
    .attr("x", 0)
    .attr("y", -18)
    .text("Legend[tons/y]")
    .attr("dy", "10px")
    .attr("fill", "#aaa")
    .attr("font-size", "8pt");

  let years = d3.range(0, 12).map(function (d, i) {
    return (1960 + i * 5).toString();
  });
  var sliderTime = d3
    .sliderBottom()
    .min(1961)
    .max(2017)
    .step(1)
    .width(500)
    .tickFormat(d3.format("d"))
    .tickValues(years)
    .default(1961)
    .on("onchange", (val) => {
      vis.year = val;
      vis.updateWorldMap();
    });

  var gTime = d3
    .select("div#world-vis")
    .append("svg")
    .attr("class", "timeline")
    .attr("width", 3000)
    .attr("height", 100)
    .append("g")
    .attr("transform", `translate(75,30)`);

  gTime.call(sliderTime);

  d3.select("svg.timeline")
    .select("g")
    .append("text")
    .attr("x", -5)
    .attr("y", -12)
    .attr("fill", "#aaa")
    .attr("font-size", 10)
    .text("timeline");

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
  var countryTooltip = d3
    .select("body")
    .append("div")
    .attr("class", "countryTooltip");
  countryList = d3
    .select("body")
    .append("select")
    .attr("name", "countries")
    .on("mouseover", function (d) {
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

WorldVis.prototype.updateWorldMap = function () {
  vis = this;
  // console.log("called!");
  let newSvg = d3
    .select(".svg.world-map")
    .selectAll("path")
    .data(vis.worldTopo);
  newSvg
    .enter()
    .append("path")
    .merge(newSvg)
    .attr("class", "mark-countries")
    .attr("d", vis.path)
    .attr("fill", function (d) {
      var countryName = d.properties.name;
      if (
        vis.data[countryName] != undefined &&
        vis.data[countryName][vis.year] != undefined
      ) {
        return vis.colorScale(vis.data[countryName][vis.year]);
      } else {
        return "gray";
      }
    });
  newSvg.exit().remove();
};
