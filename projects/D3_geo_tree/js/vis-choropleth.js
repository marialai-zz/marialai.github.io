var width = 800,
    height = 800,
    margin = { "left": 160, "top": 80 };

var svg = d3.select("#choropleth").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geo.mercator()
    .scale(500)
    .translate([width / 2.5, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var quantize = d3.scale.quantize();

// domain variables
var extent = {
    Malaria_cases: [1,8],
    Suspected_malaria_cases: [1,8],
    At_high_risk: [0,100],
    At_risk: [0,100]};

var africaMap, malariaDataByCountryId = {};

// make legend
var legend = svg.append("g")
    //.attr("transform", "translate ("+margin.left+","+margin.top+")")
    .attr("class", "legend");

var boxmargin = 4,
    lineheight = 14,
    keyheight = 10,
    keywidth = 40,
    boxwidth = {
        Malaria_cases: 4.5*keywidth,
        Suspected_malaria_cases: 4.5*keywidth,
        At_high_risk: 2.5*keywidth,
        At_risk: 2.5*keywidth,
        UN_population: 3*keywidth
    },
    formatPercent = d3.format(".1%");

var title = {Malaria_cases: ['Diagnosed Malaria Cases','(cases)'],
        Suspected_malaria_cases: ['Suspected Malaria Cases','(cases)'],
        At_high_risk: ['At High Risk','(% of population)'],
        At_risk: ['At Risk','(% of population)'],
        UN_population: ['Population according to the UN','(people)']},
    titleheight = title.Suspected_malaria_cases.length*lineheight + boxmargin;

var legendTitle, li, legendBox;

// get range length of scale
var ranges = 7;

// Use the Queue.js library to read two files
queue()
  .defer(d3.json, "data/africa.topo.json")
  .defer(d3.csv, "data/global-malaria-2015.csv")
  .await(function(error, mapTopJson, malariaDataCsv){

    // --> PROCESS DATA

      var africaData = malariaDataCsv.filter( function(value) {
          return value.WHO_region == "African";});

      africaData.forEach(function(d){
          // Convert numeric values to 'numbers'
          d.At_high_risk = +d.At_high_risk;
          d.At_risk = +d.At_risk;
          d.Malaria_cases = +d.Malaria_cases;
          d.Suspected_malaria_cases = +d.Suspected_malaria_cases;
          d.UN_population = +d.UN_population;

          //if (isNaN(d.UN_population)) {
          //    d.Suspected_malaria_cases = -1;
          //}

          malariaDataByCountryId[d.Code] = d;

      });

      extent.UN_population = [0,
          d3.max(africaData, function(d) {return d.UN_population;})];

      // Draw Africa Map
      // Convert TopoJSON to GeoJSON (target object = 'collection')
      var africa = topojson.feature(mapTopJson, mapTopJson.objects.collection).features

      // Render the map by using the path generator
      var map = svg.append("g")
          .attr("class","map");

      // draw countries
      africaMap = map.selectAll("path")
          .data(africa)
          .enter()
          .append("path")
          .attr("d", path);

      // draw white country borders
      var borders = svg.append("g")
          .attr("id","borders");

      borders.append("path")
          .datum(topojson.mesh(mapTopJson, mapTopJson.objects.collection))
          .attr("d", path)
          .attr("class", "subunit-boundary");

      // Draw legend
      legendTitle = legend.selectAll("text")
          .data(title.Malaria_cases)
          .enter().append("text")
          .attr("class", "legend-title")
          .attr("y", function(d, i) { return (i+1)*lineheight-2; });

      // make legend box
      legendBox = legend
          .append("rect")
          .attr("transform", "translate (0,"+titleheight+")")
          .attr("class", "legend-box")
          .attr("width", boxwidth.Malaria_cases)
          .attr("height", ranges*lineheight+2*boxmargin+lineheight-keyheight);

      // make quantized key legend items
      li = legend.append("g")
          .attr("transform", "translate (8,"+(titleheight+boxmargin)+")")
          .attr("class", "legend-items");

      // Update choropleth
      updateChoropleth();
  });

function updateChoropleth() {

    // log10 function for encoding cases data
    function log10(val) {
        return Math.log(val) / Math.LN10;
    }

    // get selected value from combo box
    var selectedValue = d3.select("#data-attr").property("value");

    // updating scale's domain and range
    quantize
        .domain(extent[selectedValue]);

    if (selectedValue == "UN_population") {
        quantize
            .range((d3.range(7).map(function(i) { return "p" + i + "-7"; })));
    } else {
        quantize
            .range(d3.range(7).map(function(i) { return "q" + i + "-7"; }));
    }

    // change fill color
    africaMap
        .attr("class", function (d) {
            if (malariaDataByCountryId[d.properties.adm0_a3_us]) {
                var value = malariaDataByCountryId[d.properties.adm0_a3_us][selectedValue];
                if ((selectedValue == "Malaria_cases") ||
                    (selectedValue == "Suspected_malaria_cases")) {
                    value = log10(value);
                }
                if (isNaN(value)) {
                    return "gray";
                }
                return quantize(value);
            } else {
                return "gray";
            }
        });

    // UPDATE LEGEND

    // update legend title
    legendTitle
        .data(title[selectedValue])
        .text(function(d) { return d; });

    var legendDomain = {
        Malaria_cases: [1,2,3,4,5,6,7],
        Suspected_malaria_cases: [1,2,3,4,5,6,7],
        At_risk: [14,28,42,56,70,84,98],
        At_high_risk: [14,28,42,56,70,84,98],
        UN_population: [25000000,50000000,75000000,100000000,125000000,150000000,1750000000]};

    var legendKey = {
        Malaria_cases: ["11-100","101-1,000","1,001-10,000","10,001-100,000","100,000-1,000,000","1,000,001-10,000,000","10,000,001-100,000,000"],
        Suspected_malaria_cases: ["11-100","101-1,000","1,001-10,000","10,001-100,000","100,000-1,000,000","1,000,001-10,000,000","10,000,001-100,000,000"],
        At_risk: [".143",".286",".429",".572",".715",".858","1"],
        At_high_risk: [".143",".286",".429",".572",".715",".858","1"],
        UN_population: ["25,350,000","50,700,000","76,050,000","101,400,000","126,750,000","152,100,000","177,450,000"]
    };

    legendBox
        .attr("width", boxwidth[selectedValue]);

    // Data-join (rect now contains the update selection)
    var rect = li.selectAll("rect")
        .data(legendDomain[selectedValue]);

    var text = li.selectAll("text")
        .data(legendKey[selectedValue]);

    // Enter (initialize the newly added elements)
    rect
        .enter().append("rect")
        .attr("y", function(d, i) { return i*lineheight+lineheight-keyheight; })
        .attr("width", keywidth)
        .attr("height", keyheight);

    text
        .enter().append("text")
        .attr("x", 48)
        .attr("y", function(d, i) { return (i+1)*lineheight-2; });

    // Update (set the dynamic properties of the elements)
    rect
        .transition().duration(800)
        .attr("class", function(d) { return quantize(d); });

    text
        .transition().duration(800)
        .text(function(d) {
            if ((selectedValue == "At_risk") || (selectedValue == "At_high_risk")) {
                return formatPercent(d);
            } else {
                return d;
            }
        });

    // Exit
    rect.exit().transition().duration(800).remove();
    text.exit().transition().duration(800).remove();

    // TOOL TIP IMPLEMENTATION

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function(d) {
            var val = malariaDataByCountryId[d.properties.adm0_a3_us];
            if (val) {
                return val.Country + "<br>" +
                    "Diagnosed Malaria Cases: " + val.Malaria_cases + "<br>" +
                    "Suspected Malaria Cases: " + val.Suspected_malaria_cases + "<br>" +
                    "At Risk: " + formatPercent(val.At_risk/100) + "<br>" +
                    "At High Risk: " + formatPercent(val.At_high_risk/100) + "<br>" +
                    "UN Population: " + val.UN_population;
            } else {
                return "Data not available";
            }
        });

    svg.call(tip);

    africaMap
        .on("mouseover", tip.show)
        .on('mouseout', tip.hide);

}