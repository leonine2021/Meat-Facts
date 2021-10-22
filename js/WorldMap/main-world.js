d3.queue()
  .defer(d3.json, "./data/world2.json")
  .defer(d3.csv, "./data/world_meat_consumption.csv")
  .await((error, data1, data2) => {
    if (!error) loadWorldData(data1, data2);
  });

function loadWorldData(data1, data2) {
  worldDict = {};

  yearDict = {};

  mapData = data1;

  //worldDict is a dictionary of dictionaries, where countries are first keys and
  //years are second keys with metric tons of animals produced as the value
  worldMeatData = data2;

  worldMeatData.forEach(function (d) {
    d["Year"] = +d["Year"];
    d["Value"] = +d["Value"];

    if (d.Year == 2017) {
      yearDict[d.Area] = d.Value;
    }

    if (d.Area in worldDict) {
      worldDict[d.Area][d.Year] = d.Value;
    } else {
      worldDict[d.Area] = {};
      worldDict[d.Area][d.Year] = d.Value;
    }
  });
  worldChart = new WorldVis("world-vis", yearDict, mapData);
}

// Render visualization
function updateVisualization() {}
