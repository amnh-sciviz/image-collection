'use strict';

var DatePicker = (function() {

  var opt, data, yearRange, valueRange;
  var svg, $svg, $dwindow, $dcontainer;
  var $yearStart, $yearEnd, $bgWest, $bgEast, resizeHelperWidth;
  var svgWidth, svgHeight, graphWidth, graphHeight;
  var xRange, yRange;
  var resizeTimeout;

  function DatePicker(config) {
    var defaults = {
      margin: {top: 40, right: 20, bottom: 30, left: 40},
      resizeDelay: 500
    };
    opt = $.extend({}, defaults, config);
    this.init();
  }

  DatePicker.prototype.init = function(){
    $dcontainer = $('#datepicker-container');
    $dwindow = $('#datepicker-window');

    this.parseData();
    this.loadUI();
    this.loadListeners();
  };

  DatePicker.prototype.loadListeners = function(){
    var _this = this;

    $dwindow.draggable({
      containment: $dcontainer,
      drag: function(event, ui) {
        _this.onUIResizeOrDrag();
      }
    }).resizable({
      containment: $dcontainer,
      handles: "e, w",
      resize: function(event, ui) {
        _this.onUIResizeOrDrag();
      },
      create: function(event, ui) {
        _this.onUICreate();
      }
    });
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

      // resize the datepicker window
      $dcontainer.css({
        width: graphWidth + "px",
        height: graphHeight + "px",
        top: margin.top + "px",
        left: margin.left + "px"
      })
  };

  DatePicker.prototype.onResize = function(){
    var _this = this;
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function(){
      _this.reloadUI();
    }, opt.resizeDelay);
  };

  DatePicker.prototype.onUICreate = function(){
    $yearStart = $('<div class="year" aria-live="polite" aria-label="Filtered start year" />');
    $yearEnd = $('<div class="year" aria-live="polite" aria-label="Filtered end year" />');
    $(".ui-resizable-w").append($yearStart);
    $(".ui-resizable-e").append($yearEnd);

    $bgWest = $('<div class="resize-bg" />');
    $bgEast = $('<div class="resize-bg" />');
    $(".ui-resizable-w").append($bgWest);
    $(".ui-resizable-e").append($bgEast);

    resizeHelperWidth = $(".ui-resizable-w").width();

    this.updateDomain(yearRange[0], yearRange[1]);
  };

  DatePicker.prototype.onUIResizeOrDrag = function(){
    var cw = $dcontainer.width();
    var w = $dwindow.width();
    var nw = w / cw;
    var x = parseFloat($dwindow.css("left"))
    var nx = x / cw;

    $bgWest.width(Math.max(x - resizeHelperWidth, 0));
    $bgEast.width(Math.max(cw - w - x - resizeHelperWidth, 0));

    var yearStart = Math.round(lerp(yearRange[0], yearRange[1], nx));
    var yearEnd = Math.round(lerp(yearRange[0], yearRange[1], nx+nw));
    this.updateDomain(yearStart, yearEnd);
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

  DatePicker.prototype.reloadUI = function(){
    $svg.empty();
    this.loadUI();
    this.onUIResizeOrDrag();
  };

  DatePicker.prototype.updateDomain = function(yearStart, yearEnd){
    $yearStart.text(yearStart);
    $yearEnd.text(yearEnd);
    $(document).trigger("domain.update", [yearStart, yearEnd]);
  };

  return DatePicker;

})();
