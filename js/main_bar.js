
// Will be used to the save the loaded JSON data
var allData = [];

d3.json("data/allFoods1.json", function(error, jsonData){
    if(!error){
        allData = jsonData;
        var pie=new PieChart("chart-area1",allData);
    }
});




