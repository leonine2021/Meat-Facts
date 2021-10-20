var units = "Mt";

// set the dimensions and margins of the graph
var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = 500 - margin.left - margin.right,
    height = 400- margin.top - margin.bottom;

// format variables
var formatNumber = d3.format(",.0f"),    // zero decimal places
    format = function(d) { return formatNumber(d) + " " + units; },
    color = d3.scaleOrdinal(d3.schemeCategory20c);
// color=d3.scaleOrdinal(d3.schemeSet3);

// append the svg object to the body of the page
var svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(40)
    .size([width, height]);

var path = sankey.link();

// load the data
d3.csv("data/sankey2.csv", function(error, data) {

    //set up graph in same style as original example but empty
    graph = {"nodes" : [], "links" : []};

    data.forEach(function (d) {
        graph.nodes.push({ "name": d.source });
        graph.nodes.push({ "name": d.target });
        graph.links.push({ "source": d.source,
            "target": d.target,
            "value": +d.value });
    });

    // return only the distinct / unique nodes
    graph.nodes = d3.keys(d3.nest()
        .key(function (d) { return d.name; })
        .object(graph.nodes));

    // loop through each link replacing the text with its index from node
    graph.links.forEach(function (d, i) {
        graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
        graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
    });

    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    graph.nodes.forEach(function (d, i) {
        graph.nodes[i] = { "name": d };
    });

    sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);

    // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", path)
        .style("stroke-width", function(d) { return Math.max(1, d.dy); })
        .sort(function(a, b) { return b.dy - a.dy; });

    // add the link titles
    link.append("title")
        .text(function(d) {
            return d.source.name + " → " +
                d.target.name + "\n" + format(d.value); });

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")"; })
        .call(d3.drag()
            .subject(function(d) {
                return d;
            })
            .on("start", function() {
                this.parentNode.appendChild(this);
            })
            .on("drag", dragmove));

    // add the rectangles for the nodes
    node.append("rect")
        .attr("height", function(d) { return d.dy; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function(d) {
            return d.color = color(d.name.replace(/ .*/, "")); })
        // .style("stroke", function(d) {
        //     return d3.rgb(d.color).darker(2); })
        .append("title")
        .text(function(d) {
            return d.name + "\n" + format(d.value); });

    // add in the title for the nodes
    node.append("text")
        .attr("x", -6)
        .attr("y", function(d) { return d.dy / 2; })
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < width / 2; })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");



    // 2* add gradient to links
    const defs = svg.append('defs');

    link.style('stroke', (d, i) => {
        console.log('d from gradient stroke func', d);

        // make unique gradient ids
        const gradientID = `gradient${i}`;

        const startColor = d.source.color;
        const stopColor = d.target.color;

        console.log('startColor', startColor);
        console.log('stopColor', stopColor);

        const linearGradient = defs.append('linearGradient')
            .attr('id', gradientID);

        linearGradient.selectAll('stop')
            .data([
                {offset: '60%', color: startColor },
                {offset: '90%', color: stopColor }
            ])
            .enter().append('stop')
            .attr('offset', d => {
                console.log('d.offset', d.offset);
                return d.offset;
            })
            .attr('stop-color', d => {
                console.log('d.color', d.color);
                return d.color;
            });

        return `url(#${gradientID})`;
    })


    // the function for moving the nodes
    function dragmove(d) {
        d3.select(this)
            .attr("transform",
                "translate("
                + d.x + ","
                + (d.y = Math.max(
                    0, Math.min(height - d.dy, d3.event.y))
                ) + ")");
        sankey.relayout();
        link.attr("d", path);
    }
});

//add annotation
// var svgbottomtext = d3.select("body").append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform",
//         "translate(" + margin.left + ",50)");
//
// svgbottomtext.append("text")
//     .attr('class','annotation')
//
//     .text('The US feed-to-food protein flux from the three feed classes (left) into edible animal products (right). ' +
//         'On the right, parenthetical percentages are the food-protein-out/feed-protein-in conversion efficiencies of ' +
//         'individual livestock categories. Protein values are in Mt (109 kg). Overall, 63 Mt of feed protein yield edible animal ' +
//         'products containing 4.7 Mt protein, an 8% weighted mean protein conversion efficiency.')
//
//     .attr("text-anchor", "start");
