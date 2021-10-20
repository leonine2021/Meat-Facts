//Pie chart for part 3

PieChart = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
}

PieChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 5, bottom: 20, left: 20 };

    vis.width = 500 - vis.margin.left - vis.margin.right,
    vis.height = 500 - vis.margin.top - vis.margin.bottom;
    vis.radius= Math.min(vis.width, vis.height) / 2,

    vis.width1 = 600 - vis.margin.left - vis.margin.right,
    vis.height1 = 50 - vis.margin.top - vis.margin.bottom;
    /*
    // Dropdown Menu
    */
    //Data Processing
    var data_meat=vis.data.filter(d=>d.Category=="Meat")
    var data_grain=vis.data.filter(d=>d.Category=="Grain")
    var data_veg=vis.data.filter(d=>d.Category=="vegetable"||d.Category=="Fruit")

    var dropdown_list1=data_meat.map(d=>d.Product)
    var dropdown_list2=data_grain.map(d=>d.Product)
    var dropdown_list3=data_veg.map(d=>d.Product)

    //console.log(dropdown_list3)

    //Insert select object into html
    var dropdown1 = d3.select("#dropdown")
        .selectAll("optgroup")
        .data(["Meat","Grain","Vegetables_and_Fruit"])
        .enter()
        .append("optgroup")
        .attr("label",d=>d)
        .attr("id",d=>d)

    var dpn_meat=d3.select("#Meat")
        .selectAll("option")
        .data(dropdown_list1)
        .enter()
        .append("option")
        .attr("value",d=>d)
        .text(d=>d)

    var dpn_grain=d3.select("#Grain")
        .selectAll("option")
        .data(dropdown_list2)
        .enter()
        .append("option")
        .attr("value",d=>d)
        .text(d=>d)

    var dpn_veg=d3.select("#Vegetables_and_Fruit")
        .selectAll("option")
        .data(dropdown_list3)
        .enter()
        .append("option")
        .attr("value",d=>d)
        .text(d=>d)
    //console.log(dpn_meat)

    //jquery multiselect dropdown menu
    vis.dropdown=$('#dropdown').multiselect({
        columns:2,
        placeholder:"What did you eat today?",
        maxHeight: 500,
        buttonWidth: '150px',
        dropUp: true,
        //limit the maximum selection to make the piechart effective
    onOptionClick: function( element, option ) {
        var maxSelect = 10;

        // too many selected, deselect this option
        if( $(element).val().length > maxSelect ) {
            if( $(option).is(':checked') ) {
                var thisVals = $(element).val();

                thisVals.splice(
                    thisVals.indexOf( $(option).val() ), 1
                );

                $(element).val( thisVals );

                $(option).prop( 'checked', false ).closest('li')
                    .toggleClass('selected');
                }
            }
         }
    });
    //Reset button
    d3.select("#btn").on("click",function(){
        Remove_options();
        console.log(vis.displayData)
    })

    function Remove_options()
    {
        $("#dropdown option:selected").prop("selected", false);

        var all_checkboxes = $(':checkbox');
        all_checkboxes.prop('checked', false);

        $(":button span").text("What did you eat today?").prop("color","#e9e9e9")

        $("#dropdown").multiselect('refresh');
        d3.select(".bubble-svg").remove();
        vis.wrangleData();
    }

    //Get display data for piechart
    $('#dropdown').siblings()
        .on("click",function(){
            vis.wrangleData()
        })

    //SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

    vis.pie_group = vis.svg.append("g")
        .attr("transform", "translate(" + (vis.width / 2+vis.margin.left+5) + "," + (vis.height / 2+vis.margin.top-30) + ")");

    vis.color = d3.scaleOrdinal(d3.schemeCategory20);

    //Background Drawings
    var circle1=vis.pie_group.append("circle")
        .attr("cx",0)
        .attr("cy",0)
        .attr("r",vis.radius)
        .attr("fill","None")
        .attr("stroke","Black")
        .attr("stroke-width","3pt")

    var circle2=vis.pie_group.append("circle")
        .attr("cx",0)
        .attr("cy",0)
        .attr("r",vis.radius/2.5)
        .attr("fill","None")
        .attr("stroke","#e9e9e9")
        .attr("stroke-width","3pt")


}

PieChart.prototype.wrangleData = function(){
    var vis = this;
    //Get selected data
    var selectedValue = vis.dropdown.siblings().siblings().val()
    vis.displayData=[]
    for(var i=0;i<selectedValue.length;i++){
        vis.displayData.push(vis.data.filter(d=>d.Product==selectedValue[i])[0])
    }
    var total_emission=vis.displayData.map(d=>d.Total)
    vis.sum=total_emission.reduce( (sum, current) => sum + current, 0 ).toFixed(1)
    vis.sum_food=vis.displayData.length;
    //console.log(vis.displayData)
    vis.updateVis();
}


PieChart.prototype.updateVis = function(){
    var vis = this;
    d3.select("#instruction").remove()

    vis.pie = d3.pie()
    console.log(vis.pie(vis.displayData.map(d=>d.Total)))

    // Generate the arcs
    var arc = d3.arc()
        .innerRadius(vis.radius/2.4)
        .outerRadius(vis.radius/1.2);

    var arcs = vis.pie_group.selectAll(".arcs")
        .data(vis.pie(vis.displayData.map(d=>d.Total)))

    arcs.enter()
        .append("path")
        .merge(arcs)
        .attr("class", "arcs")
        .attr("id",(d,i)=>i)
        .attr("d",arc)
        .attr("fill",(d,i)=>vis.color(i))
        .on("mouseover",function(){
            //CSS change
            d3.select(this).attr("fill","#ea3030")

            //Add detail info
            var selectedID=this.id
            var selectedData=vis.displayData[selectedID]

            var bubble=new BubbleChart("tooltip",selectedData)
        })
        .on("mouseout",function(){
            d3.select(this).attr("fill",vis.color.range()[this.id])
            d3.select(".bubble-svg").remove()
        })

    arcs.exit().remove();

    if(vis.displayData.length!=0){
        d3.select("#weight")
            .remove();
        vis.pie_group
            .append("text")
            .attr("x",-60)
            .attr("y",vis.height-195)
            .text("Total weight of food picked: "+vis.sum_food+" kg")
            .attr("id","weight")

        vis.pie_group
            .append("text")
            .attr("x",-110)
            .attr("y",vis.height-175)
            .text("Hover over the pie chart to see the emission breakdown.")
            .attr("id","instruction")

        d3.select(".total-emission")
            .remove();
        var text=vis.pie_group.append("text")
            .attr("x",-35)
            .attr("y",-15)
            .attr("class","total-emission");

        text.append("tspan")
            .attr("x",-30)
            .attr("dy",10)
            .text("Total Emission: ")

        text.append("tspan")
            .attr("x",-30)
            .attr("dy",20)
            .text(vis.sum+"(kg CO2 eq)")
    }
    else{
        d3.select(".total-emission")
            .remove();
        d3.select("#weight")
            .remove();
    }

}



