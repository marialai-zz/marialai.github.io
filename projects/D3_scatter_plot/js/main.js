
// SVG Size
var width = 800,
        height = 500;


// Load CSV file
d3.csv("data/wealth-health-2014.csv", function(data){

    // Converting strings to ints for number variables
    for (var i = 0; i < data.length; i++) {
        data[i].Income = +data[i].Income;
        data[i].LifeExpectancy = +data[i].LifeExpectancy;
        data[i].Population = +data[i].Population;
    }

    // Creating and appending svg element to #chart-area
    var svg = d3.select("#chart-area").append("svg")
        .attr("width", width)
        .attr("height", height);

    // creating x and y scales + population & color scales
    var padding = 30;

    var incomeScale = d3.scale.linear()
        .domain([d3.min(data, function(d) {return d.Income;}),
            d3.max(data, function(d) {return d.Income;})])
        .range([padding, width - padding]);

    var lifeExpectancyScale = d3.scale.linear()
        .domain([d3.min(data, function(d) {return d.LifeExpectancy;}),
            d3.max(data, function(d) {return d.LifeExpectancy;})])
        .range([height - padding, padding]);

    var populationScale = d3.scale.linear()
        .domain([d3.min(data, function(d) {return d.Population;}),
            d3.max(data, function(d) {return d.Population;})])
        .range([4, 30]);

    var colorScale = d3.scale.category10();
    colorScale.domain(data.map(function(d) {
            return d.Region;}));

    // sort data by population, descending.
    var sortedData = data.sort( function(a,b) {
        return b.Population - a.Population;
    });

    // plotting income and life expectancy

    var group = svg.append("g")
        .attr("id", "scatter-points")
        .attr("transform", "translate(4,-4)");

    group.selectAll("circle")
        .data(sortedData)
        .enter()
        .append("circle")
        .attr("cx", function(d){ return incomeScale(d.Income); })
        .attr("cy", function(d){ return lifeExpectancyScale(d.LifeExpectancy); })
        .attr("r", function(d){ return populationScale(d.Population); })
        .attr("fill", function(d){ return colorScale(d.Region); })
        .attr("stroke", "teal");

    // creating axes
    var xAxis = d3.svg.axis();
    xAxis.scale(incomeScale);
    xAxis.orient("bottom");

    var yAxis = d3.svg.axis();
    yAxis.scale(lifeExpectancyScale);
    yAxis.orient("left");

    // draw axes
    svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + (height-padding) + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis y-axis")
        .attr("transform", "translate(" + padding + ",0)")
        .call(yAxis);

    // axis labels
    svg.append("text")
        .attr("x", width/2)
        .attr("y", height)
        .style("text-anchor", "middle")
        .text("Income per Person");

    svg.append("text")
        .attr("x", -height/2)
        .attr("y", 0)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("Life Expectancy (Years)");

    console.log(colorScale.range());

});