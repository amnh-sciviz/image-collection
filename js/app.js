'use strict';

function floorToNearest(value, nearest) {
  return Math.floor(value / nearest) * nearest;
}

// https://stackoverflow.com/questions/4817029/whats-the-best-way-to-detect-a-touch-screen-device-using-javascript
function isTouchDevice() {
  var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
  var mq = function(query) {
    return window.matchMedia(query).matches;
  }

  if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
    return true;
  }

  // include the 'heartz' as a way to have a non matching MQ to help terminate the join
  // https://git.io/vznFH
  var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
  return mq(query);
}

function lerp(a, b, percent) {
  return (1.0*b - a) * percent + a;
}

function norm(value, a, b){
  var denom = (b - a);
  if (denom > 0 || denom < 0) {
    return (1.0 * value - a) / denom;
  } else {
    return 0;
  }
}

var App = (function() {

  var opt, metadata;

  function App(config) {
    var defaults = {
      metadataUrl: "data/photographic_images.json"
    };
    opt = $.extend({}, defaults, config);
    this.init();
  }

  function loadJSONData(url){
    var deferred = $.Deferred();
    $.getJSON(url, function(data) {
      console.log("Loaded data.");
      deferred.resolve(data);
    });
    return deferred.promise();
  }

  App.prototype.init = function(){
    this.loadPanzoom();
    this.loadData();
    this.loadListeners();

    if (opt.debug) this.loadDebug();
  };

  App.prototype.loadData = function(){
    var _this = this;
    var dataPromise = loadJSONData(opt.metadataUrl);
    $.when(dataPromise).done(function(results){
      _this.onDataLoad(results);
    });
  };

  App.prototype.loadDebug = function(){
    $debug = $("#debug");
    $debug.addClass("active");
  };

  App.prototype.loadListeners = function(){
    var _this = this;

    this.panzoom.loadListeners();

    $(".toggle-link").on("click", function(){
      $(this).parent().toggleClass("active");
    });

    $(window).on("resize", function(){
      _this.datePicker && _this.datePicker.onResize();
      _this.treeMap && _this.treeMap.onResize();
      _this.panzoom.onResize();
    });
  };

  App.prototype.loadPanzoom = function(){
    this.panzoom = new PanZoom({});
  };

  App.prototype.onDataLoad = function(results){
    metadata = results;

    // parse years
    metadata.yearStrings = _.map(metadata.years, function(yRange){
      var yStr = "";
      var count = yRange.length
      if (count > 1) yStr = yRange[0]+"-"+yRange[1];
      else if (count > 0) yStr = ""+yRange[0];
      return yStr;
    });

    this.panzoom.setMetadata(metadata);
    this.datePicker = new DatePicker({data: metadata.years});
    this.treeMap = new TreeMap({data: metadata.subjectMeta});
  };

  return App;

})();

$(function() {
  var app = new App({});
});
