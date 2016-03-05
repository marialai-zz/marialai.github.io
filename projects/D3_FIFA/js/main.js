
// SVG drawing area

var margin = {top: 40, right: 40, bottom: 60, left: 60};

var width = 600 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

var svg = d3.select("#chart-area").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Date parser (https://github.com/mbostock/d3/wiki/Time-Formatting)
var formatDate = d3.time.format("%Y");


// Initialize data
loadData();

// FIFA world cup
var data;

// Scales
var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

// Axes

var xAxis = d3.svg.axis()
    .orient("bottom");

var yAxis = d3.svg.axis()
    .orient("left");

var xAxisGroup = svg.append("g")
    .attr("class", "x-axis axis")
    .attr("transform", "translate(0, "+height+")");

var yAxisGroup = svg.append("g")
    .attr("class", "y-axis axis");

// axis labels

var xLabel = svg.append("text")
    .attr("class","axis-label")
    .attr("x", width/2)
    .attr("y", height+margin.top)
    .style("text-anchor", "middle");

var yLabel = svg.append("text")
    .attr("class","axis-label")
    .attr("x", -height/2) //x and y positions swap after rotation
    .attr("y", -60)
    .attr("dy", "1em")
    .attr("transform", "rotate(-90)")
    .style("text-anchor", "middle");

xLabel.transition().duration(800).text("Time");

// Load CSV file
function loadData() {
	d3.csv("data/fifa-world-cup.csv", function(error, csv) {

		csv.forEach(function(d){
			// Convert string to 'date object'
			d.YEAR = formatDate.parse(d.YEAR);
			
			// Convert numeric values to 'numbers'
			d.TEAMS = +d.TEAMS;
			d.MATCHES = +d.MATCHES;
			d.GOALS = +d.GOALS;
			d.AVERAGE_GOALS = +d.AVERAGE_GOALS;
			d.AVERAGE_ATTENDANCE = +d.AVERAGE_ATTENDANCE;
		});

		// Store csv data in global variable
		data = csv;

		// Draw the visualization for the first time
		updateVisualization(data);
	});
}

var linep = svg.append("g").append("path");

// Render visualization
function updateVisualization(data) {

	console.log(data);

    var selectedValue = d3.select("#y-selection").property("value");

    x.domain(d3.extent(data, function(d) {return d.YEAR;}));
    y.domain([0, d3.max(data, function(d) {return d[selectedValue];})]);

    var line = d3.svg.line()
        .x(function(d) { return x(d.YEAR); })
        .y(function(d) { return y(d[selectedValue]); })
        .interpolate("linear");

    linep
        .datum(data)
        .attr("class", "line")
        .transition().duration(800)
        .attr("d", line);

    xAxis.scale(x);
    yAxis.scale(y);

    svg.select(".x-axis").transition().duration(800)
        .call(xAxis);
    svg.select(".y-axis").transition().duration(800)
        .call(yAxis);

    yLabel.transition().duration(800).text("Goals");

    // EMPHASIZING DATA

    // Data-join (circle now contains the update selection)
    var circle = svg.selectAll("circle")
        .data(data);

    // Enter (initialize the newly added elements)
    circle.enter().append("circle")
        .attr("class", "circle");

    // Update (set the dynamic properties of the elements)
    circle
        .transition().duration(800)
        .attr("r", 10)
        .attr("cx", function(d) { return x(d.YEAR); })
        .attr("cy", function(d) { return y(d[selectedValue]); });

    // Exit
    circle.exit().transition().duration(800).remove();

    // TOOL TIP IMPLEMENTATION

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) { return "Edition: "+ d.EDITION + "<br>" + selectedValue + ": " + d[selectedValue]; });

    svg.call(tip);

    circle
        .on("mouseover", tip.show)
        .on('mouseout', tip.hide);

    circle
        .on("click", function(d) {showEdition(d);});
}

document.getElementById("filter").onclick = function(){
    var from = formatDate.parse(document.getElementById("fromDate").value);
    var to = formatDate.parse(document.getElementById("toDate").value);

    var Fdata = data.filter( function(value) {
        return (value.YEAR <= to) && (value.YEAR >= from);
    });

    updateVisualization(Fdata);
}

// Show details for a specific FIFA World Cup
function showEdition(d){
    var displayHTML = '';
    displayHTML += '<h3>' + d.EDITION + '</h3>';
    displayHTML += '<div id="edition-info">Winner: ' + d.WINNER;
    displayHTML += '<br>Goals: ' + d.GOALS;
    displayHTML += '<br>Average Goals: ' + d.AVERAGE_GOALS;
    displayHTML += '<br>Matches: ' + d.MATCHES;
    displayHTML += '<br>Teams: ' + d.TEAMS;
    displayHTML += '<br>Average Attendance: ' + d.AVERAGE_ATTENDANCE + '</div>';
    document.getElementById("info").innerHTML = displayHTML;
}