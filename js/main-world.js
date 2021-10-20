var colorScale = d3.scaleOrdinal(d3.schemeCategory20);

var methaneChart;

var worldChart;

var mapData;

var worldMeatData;

var WorldVis;


//loadData();

d3.queue()
    .defer(d3.json, "data/world2.json")
    .defer(d3.csv, "data/world_meat_consumption.csv")
    .await(loadWorldData);

function loadWorldData(error, data1, data2) {

    worldDict = {};

    yearDict = {}

    mapData = data1;

    console.log(data1);


    //worldDict is a dictionary of dictionaries, where countries are first keys and
    //years are second keys with metric tons of animals produced as the value
    worldMeatData = data2;

    console.log(data2);

    worldMeatData.forEach(function(d){
        d["Year"] = +d["Year"];
        d["Value"] = +d["Value"];

        if (d.Year == 2017){
            console.log("Yes")
            yearDict[d.Area] = d.Value;
        }

        if (d.Area in worldDict) {
            worldDict[d.Area][d.Year] = d.Value;
        }
        else{
            worldDict[d.Area] = {};
            worldDict[d.Area][d.Year] = d.Value ;

        }
    });



    console.log(worldMeatData);

    console.log(yearDict);
    console.log(worldDict);

    worldChart = new WorldVis("world-vis", yearDict, mapData);

}

// d3.json("data/world.json", function(error, json) {
//     //worldDict is a dictionary of dictionaries, where countries are first keys and
//     //years are second keys with metric tons of animals produced as the value
//     mapData = json;
//
//
// });


// Render visualization
function updateVisualization() {

}