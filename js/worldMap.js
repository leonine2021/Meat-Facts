/*
 * WorldVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 */


var colorMap;

var colorScale = d3.scaleLinear()
    .range(["#43a5cb", "#317793"]);



WorldVis = function(_parentElement, _data, _mapData) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.mapData = _mapData;
    this.filteredData = this.data;

    this.initVis();
};



WorldVis.prototype.initVis = function(){
    var vis = this;


    vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 800 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.state = {
        x: 0,
        y: 0,
        scale: vis.height / 2
    };


    vis.projection = d3.geoOrthographic()
        .scale(vis.state.scale)
        .clipAngle(90)
        .translate([vis.width / 2, vis.height / 2-100])
        .scale(250);




    //Define path generator, using the Albers USA projection
    vis.path = d3.geoPath()
        .projection(vis.projection);

    //vis.createVisualization(d3.json("data/world.json"), worldDict);

    vis.createVisualization();

    //vis.wrangleData();
};


//WorldVis.prototype.createVisualization = function(error, data1, data2){

WorldVis.prototype.createVisualization = function(){
    // Visualize data1 and data2

    var vis = this;

    console.log(vis.data);

    console.log(vis.mapData);

    console.log(vis.filteredData);






    // Convert TopoJSON to GeoJSON (target object = 'states')
    var worldTopo = topojson.feature(mapData, mapData.objects.countries).features;


    console.log(worldTopo);

    var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");


    // Render the world by using the path generator
    myMap = vis.svg.selectAll("path")
        .data(worldTopo)
        .enter().append("path")
        .attr("d", vis.path)
        .attr("fill", function(d){
            //console.log(d.properties.name);
            var countryName = d.properties.name;
            //console.log(console.log(vis.filteredData[countryName]));

            console.log(countryName, vis.filteredData[countryName]);

            if (vis.filteredData[countryName] != undefined) {


                var rangeArray = [200000, 10000000];

                var range = rangeArray[1] - rangeArray[0];
                var incr = range / 5;

                colorScale.domain(rangeArray);

                return colorScale(vis.filteredData[countryName]);
            }
            else {
                return "#ddf2d8";
            }
        })
        .on("mouseover", function(d) {
            console.log(d)
            console.log(d.properties.name);
            countryTooltip.text(d.properties.name +  ": "  + vis.filteredData[d.properties.name])
            //.text(vis.filteredData[d.properties.name])
                .style("left", (d3.event.pageX + 7) + "px")
                .style("top", (d3.event.pageY - 15) + "px")
                .style("display", "block")
                .style("opacity", 1);
        })
        .on("mouseout", function(d) {
            countryTooltip.style("opacity", 0)
                .style("display", "none");
        })
        .on("mousemove", function(d) {
            countryTooltip.style("left", (d3.event.pageX + 7) + "px")
                .style("top", (d3.event.pageY - 15) + "px");
        });



    var v0, // Mouse position in Cartesian coordinates at start of drag gesture.
        r0, // Projection rotation as Euler angles at start.
        q0; // Projection rotation as versor at start.


    var drag = d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);

    vis.svg.call(drag);

    function dragstarted(){

        var mouse_pos = d3.mouse(this);

        v0 = versor.cartesian(vis.projection.invert(mouse_pos));
        r0 = vis.projection.rotate();
        q0 = versor(r0);

        vis.svg.insert("path")
            .datum({type: "Point", coordinates: vis.projection.invert(mouse_pos)})
            .attr("class", "point point-mouse")
            .attr("d", vis.path)


    }

    function dragged(){

        var mouse_pos = d3.mouse(this);

        var v1 = versor.cartesian(vis.projection.rotate(r0).invert(mouse_pos)),
            q1 = versor.multiply(q0, versor.delta(v0, v1)),
            r1 = versor.rotation(q1);

        if (r1){
            update(r1);

            vis.svg.selectAll("path").attr("d", vis.path);

            vis.svg.selectAll(".point-mouse")
                .datum({type: "Point", coordinates: vis.projection.invert(mouse_pos)});
        }

    }

    function dragended(){
        vis.svg.selectAll(".point").remove();
    }

    d3.selectAll("input").on("input", function(){
        // get all values
        var nums = [];
        d3.selectAll("input").each(function(d, i){
            nums.push(+d3.select(this).property("value"));
        });
        update(nums);

        vis.svg.selectAll("path").attr("d", path);

    });

    function update(eulerAngles){
        // angles.forEach(function(angle, index){
        //     d3.select(".angle-label-" + index + " span").html(Math.round(eulerAngles[index]))
        //     d3.select(".angle-" + index).property("value", eulerAngles[index])
        // });

        vis.projection.rotate(eulerAngles);
    }




    //Mouse events
    //
    // var countryTooltip = d3.select("body").append("div").attr("class", "countryTooltip");
    //     //countryList = d3.select("body").append("select").attr("name", "countries");
    //
    // .on("mouseover", function(d) {
    //     console.log(d)
    //     // countryTooltip.text(countryById[d.id])
    //     //     .style("left", (d3.event.pageX + 7) + "px")
    //     //     .style("top", (d3.event.pageY - 15) + "px")
    //     //     .style("display", "block")
    //     //     .style("opacity", 1);
    // })
    //     .on("mouseout", function(d) {
    //         countryTooltip.style("opacity", 0)
    //             .style("display", "none");
    //     })
    //     .on("mousemove", function(d) {
    //         countryTooltip.style("left", (d3.event.pageX + 7) + "px")
    //             .style("top", (d3.event.pageY - 15) + "px");
    //     });





};