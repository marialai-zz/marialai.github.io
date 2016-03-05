
// layout vars
var margin = {top: 5, right: 5, bottom: 27, left: 50},
        width = 550 - margin.left - margin.right,
            width2 = 275 - margin.left - margin.right,
                height = 500- margin.top - margin.bottom;

// Load CSV file
d3.csv("data/data.csv", function(data){

    // Converting variables
    for (var i = 0; i < data.length; i++) {
        var format = d3.time.format("%Y-%m-%d");
        data[i].date = format.parse(data[i].date);
        data[i].population = +data[i].population;
    }

    // Creating and appending svg elements
    var achart = d3.select("#area-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    var bchart = d3.select("#bar-chart").append("svg")
        .attr("width", width2 + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom);

    // AREA CHART IMPLEMENTATION
    var timeScale = d3.time.scale()
        .domain([d3.min(data, function(d) {return d.date;}),
            d3.max(data, function(d) {return d.date;})])
        .range([0, width]);

    var populationScale = d3.scale.linear()
        .domain([0,d3.max(data, function(d) {return d.population;})])
        .range([height, 5]);

    var line = d3.svg.line()
        .x(function(d) { return timeScale(d.date)+margin.left; })
        .y(function(d) { return populationScale(d.population); });

    var area = d3.svg.area()
        .x(function(d) { return timeScale(d.date)+margin.left; })
        .y0(height)
        .y1(function(d) { return populationScale(d.population); });

    // DYNAMIC TOOLTIP IMPLEMENTATION

    var bisectDate = d3.bisector(function(d) { return d.date; }).left;

    var timeFormat = d3.time.format("%d %b %Y");

    function mousemove() {
        var x0 = timeScale.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        focus.select("circle.y")
            .attr("transform",
                "translate(" + (timeScale(d.date) + margin.left) + "," +
                populationScale(d.population) + ")");

        focus.select(".poptext")
            .text("Population: "+d0.population);


        focus.select(".datetext")
            .text(timeFormat(d.date));
    }

    var lineSvg = achart.append("g");

    achart.append("path")
        .datum(data)
        .attr("class", "area")
        .attr("d", area);

    lineSvg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    var focus = achart.append("g")
        .style("display", "none");

    focus.append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", "blue")
        .attr("r", 4);

    focus.append("text")
        .attr("class", "poptext")
        .attr("text-anchor", "middle")
        .attr("y", 30)
        .attr("x", 400)
        .style("font-size", "16px");

    focus.append("text")
        .attr("class", "datetext")
        .attr("text-anchor", "middle")
        .attr("y", 40)
        .attr("x", 400)
        .style("font-size", "12px");

    achart.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    // creating axes
    var xAxis = d3.svg.axis()
        .scale(timeScale)
        .orient("bottom")
        .tickFormat(d3.time.format("%b '%y"));

    var yAxis = d3.svg.axis()
        .scale(populationScale)
        .orient("left");

    // draw axes
    achart.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate("+margin.left+"," + height + ")")
        .call(xAxis);

    achart.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", "translate("+margin.left+",0)")
        .call(yAxis);

    // axis labels
    achart.append("text")
        .attr("x", width/2+margin.left)
        .attr("y", height+margin.bottom)
        .style("text-anchor", "middle")
        .text("Time");

    achart.append("text")
        .attr("x", -height/2) //x and y positions swap after rotation
        .attr("y", 0)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Population");

    // BAR CHART IMPLEMENTATION

    var shelterData = [{type:"Caravans", percent: 79.68},
        {type:"Combination", percent: 10.81},{type:"Tents",percent: 9.51}];

    var shelterScale = d3.scale.linear()
        .domain([0,100])
        .range([0,height]);

    var axisScale = d3.scale.linear()
        .domain([1,0])
        .range([0,height]);

    var catScale = d3.scale.ordinal()
        .domain(["Caravans", "Combination", "Tents"])
        .rangeRoundBands([0, width2],.2, .2);

    bchart.selectAll("rect")
        .data(shelterData)
        .enter()
        .append("rect")
        .attr("class","bar")
        .attr("y", function(d) {return height - shelterScale(d.percent);})
        .attr("x", function(d) {return catScale(d.type);})
        .attr("height", function(d) {return shelterScale(d.percent);})
        .attr("width", catScale.rangeBand())
        .attr("transform", "translate("+margin.left+","+margin.top+")");

    // creating axes

    var xBar = d3.svg.axis()
        .scale(catScale)
        .orient("bottom");

    var yBar = d3.svg.axis()
        .scale(axisScale)
        .orient("left")
        .tickFormat(d3.format("%"));

    // draw axes

    bchart.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate("+margin.left+","+(height+margin.top)+")")
        .call(xBar);

    bchart.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", "translate("+margin.left+","+margin.top+")")
        .call(yBar);

    // axis labels

    bchart.append("text")
        .attr("x", width2/2 + margin.left)
        .attr("y", height+margin.bottom)
        .attr("id", "type-shelter")
        .style("text-anchor", "middle")
        .text("Type of Shelter");

    bchart.append("text")
        .attr("x", -height/2) //x and y positions swap after rotation
        .attr("y", 0)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Percentage");

    // percent labels above bars

    bchart.selectAll(".bartext")
        .data(shelterData)
        .enter()
        .append("text")
        .attr("class", "bartext")
        .attr("text-anchor", "middle")
        .attr("y", function(d) {return height - shelterScale(d.percent);})
        .attr("x", function(d) {return catScale(d.type)+catScale.rangeBand()/2+margin.left;})
        .text(function(d){return d.percent+"%";});
});