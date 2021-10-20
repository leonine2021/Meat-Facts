

/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */

BarChart = function(_parentElement, _dropdown_parent, _data){
	this.parentElement = _parentElement;
	this.dropdown=_dropdown_parent;
    this.data = _data;
    this.displayData = []; // see data wrangling

    // DEBUG RAW DATA
    //console.log(this.data);

    this.initVis();
}



/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

BarChart.prototype.initVis = function(){
	var vis = this;

	vis.margin = { top: 40, right: 60, bottom: 30, left: 20 };

	vis.width = 350 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    //Dropdown Menu
    var dropdown = d3.select("."+vis.dropdown)
        .insert("select", "svg")

    dropdown.selectAll("option")
        .data(vis.data)
        .enter().append("option")
        .attr("value", d=>d.Product)
        .text(d=>d.Product);

	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width + vis.margin.left + vis.margin.right)
	    .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

	vis.y=d3.scalePoint()
        .domain(Object.keys(vis.data[0]).slice(2))
        .range([0,vis.height])
    vis.x=d3.scaleLinear()
        .domain([0,d3.max(vis.data,d=>d.Total+5)])
        .range([0,vis.width])

    vis.y_Axis=d3.axisLeft()
        .scale(vis.y)

    //Initialize Bars
    var h=20;
	vis.bars=vis.svg.selectAll("rect")
        .data(Object.keys(vis.data[0]).slice(2))
        .enter()
        .append("rect")
        .attr("y",d=>vis.margin.top+vis.y(d)-h/2)
        .attr("x",30)
        .attr("height",h)
        .attr("width",d=>vis.x(vis.data[0][d]))
        .attr("fill","#c994c7")
    vis.text=vis.svg.selectAll(".emission-value")
        .data(Object.keys(vis.data[0]).slice(2))
        .enter().append("text")
        .attr("class","emission-value")
        .attr("x",d=>vis.x(vis.data[0][d])+40)
        .attr("y",d=>vis.margin.top+vis.y(d)-h/2+15)
        .text(d=>vis.x(vis.data[0][d]).toFixed(1))
        .attr("font-size","8pt")

    //vis.wrangleData();
	dropdown.on("change",function(){
	    vis.wrangleData()
    })
}

BarChart.prototype.wrangleData = function(){
    var vis = this;

    //var selectBox = document.getElementById("selection");
    var selectBox = document.getElementsByClassName(vis.dropdown)[0].firstChild;
    var selectedValue = selectBox[selectBox.selectedIndex].value;
    vis.displayData=vis.data.filter(d=>d.Product==selectedValue)
    console.log(vis.displayData[0])
    //console.log(Object.keys(vis.displayData[0]).slice(2))

    // Update the visualization
    vis.updateVis();
}


BarChart.prototype.updateVis = function(){
	var vis = this;

	//Update the bars
    var h=20;
    var bars=vis.svg.selectAll("rect").data(Object.keys(vis.displayData[0]).slice(2));

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("y",d=>vis.margin.top+vis.y(d)-h/2)
        .attr("x",30)
        .attr("height",h)
        .transition()
        .duration(500)
        .attr("width",d=>vis.x(vis.displayData[0][d]))
        .attr("fill","#c994c7");

   bars.exit().remove();

   var text=vis.svg.selectAll(".emission-value")
        .data(Object.keys(vis.displayData[0]).slice(2));

   text.enter().append("text")
       .merge(text)
       .attr("class","emission-value")
       .transition()
       .duration(500)
       .attr("x",d=>vis.x(vis.displayData[0][d])+40)
       .attr("y",d=>vis.margin.top+vis.y(d)-h/2+15)
       .text(d=>vis.x(vis.displayData[0][d]).toFixed(1))
       .attr("font-size","8pt")

}

