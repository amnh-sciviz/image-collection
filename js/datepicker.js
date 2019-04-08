'use strict';

var DatePicker = (function() {

  var opt, data, yearRange, valueRange;
  var svg, $svg;
  var svgWidth, svgHeight, graphWidth, graphHeight;
  var xRange, yRange;

  function DatePicker(config) {
    var defaults = {
      margin: {top: 20, right: 20, bottom: 30, left: 40}
    };
    opt = $.extend({}, defaults, config);
    this.init();
  }

  DatePicker.prototype.init = function(){
    this.parseData();
    this.loadUI();
  };

  DatePicker.prototype.loadUI = function(){
    $svg = $('#datepicker');
    svg = d3.select('#datepicker');
    svgWidth = $svg.width();
    svgHeight = $svg.height();

    // set graph area
    var margin = opt.margin;
    graphWidth = svgWidth - margin.left - margin.right;
    graphHeight = svgHeight - margin.top - margin.bottom;

    // set the ranges
    xRange = d3.scaleBand().range([0, graphWidth]);
    yRange = d3.scaleLinear().range([graphHeight, 0]);

    svg = svg.attr("width", svgWidth)
       .attr("height", svgHeight)
        .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Scale the range of the data in the domains
    xRange.domain(data.map(function(d) { return d.year; }));
    yRange.domain([0, d3.max(data, function(d) { return d.count; })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return xRange(d.year); })
        .attr("width", xRange.bandwidth())
        .attr("y", function(d) { return yRange(d.count); })
        .attr("height", function(d) { return graphHeight - yRange(d.count); });

        // add the x Axis
      svg.append("g")
          .attr("transform", "translate(0," + graphHeight + ")")
          .attr("class", "xaxis")
          .call(d3.axisBottom(xRange)
                  .tickFormat(d3.timeFormat("%Y")));

      d3.selectAll(".xaxis .tick")
        .each(function(d, i) {
          var year = yearRange[0] + i;
          if (year % 50 > 0) {
              this.remove();
          }
        });


      // add the y Axis
      svg.append("g")
          .call(d3.axisLeft(yRange));
  };

  DatePicker.prototype.parseData = function(){

    var rawData = opt.data;
    var flatData = _.flatten(rawData, true);
    var minYear = _.min(flatData);
    var maxYear = _.max(flatData);
    console.log("Found year range: ["+minYear+" - "+maxYear+"]");

    yearRange = [minYear, maxYear];

    data = _.times(maxYear-minYear+1, function(i){
      var year = minYear + i;
      var sum = _.reduce(flatData, function(memo, yearCmp){
        if (yearCmp===year) return memo + 1;
        else return memo;
      }, 0);
      return {
        year: new Date(year, 0),
        count: sum
      };
    });

    valueRange = [0, _.max(data, function(d){ return d.count; })];
  };

  return DatePicker;

})();
