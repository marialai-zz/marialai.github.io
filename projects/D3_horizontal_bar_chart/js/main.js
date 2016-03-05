d3.csv("data/buildings.csv", function(data) {

    var Fdata = data.sort( function(a,b) {
        //sort by height, descending.
        return b.height_m - a.height_m;
    });

    // making height_px into a number type
    for (var i = 0; i < Fdata.length; i++) {
        Fdata[i].height_px = +Fdata[i].height_px;
    }

    // creating svg element and assigning it to var svg
    var svg = d3.select("#chart-area").append("svg")
        .attr("width", 500)
        .attr("height", 500);

    // add horizontal rectangles
    svg.selectAll("rect")
        .data(Fdata)
        .enter()
        .append("rect")
        .attr("x", function(d) {return 225;})
        .attr("y", function(d, index) {return index * 30;})
        .attr("height", 20)
        .attr("width", function(d) {return d.height_px;})
        .attr("fill","#C3FDB8")
        // call displayInfo and pass on d + index after mouse click
        .on("click", function(d, index) {displayInfo(d, index+1);})

    // add building labels
    svg.selectAll("text")
        .data(Fdata)
        .enter()
        .append("text")
        .attr("class","building-label")
        .text( function(d) {
            return d.building;})
        .attr("x", function(d) {return 210;})
        .attr("y", function(d, index) {return index * 30 + 16;})
        // call displayInfo and pass on d + index after mouse click
        .on("click", function(d, index) {displayInfo(d, index+1);})

    // add height labels
    svg.selectAll("span")
        .data(Fdata)
        .enter()
        .append("text")
        .attr("class","height-label")
        .text( function(d) {
            return d.height_m;})
        .attr("x", function(d) {return 200 + d.height_px;})
        .attr("y", function(d, index) {return index * 30 + 16;})

    function displayInfo (d, i) {
        var displayHTML = '';
        displayHTML += '<div class="row"><div class="col-md-5">' +
            '<img src="img/' + i + '.jpg"></div>';
        displayHTML += '<div class="col-md-7"><h1>' + d.building + '</h1>';
        displayHTML += '<div id="building-info">Height: ' + d.height_m + 'm';
        displayHTML += '<br>City: ' + d.city;
        displayHTML += '<br>Country: ' + d.country;
        displayHTML += '<br>Floors: ' + d.floors;
        displayHTML += '<br>Completed: ' + d.completed + '</div></div>';
        document.getElementById("info-area").innerHTML = displayHTML;
    }
});