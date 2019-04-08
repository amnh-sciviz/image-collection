'use strict';

function floorToNearest(value, nearest) {
  return Math.floor(value / nearest) * nearest;
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
    this.panzoom.loadListeners();
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
  };

  return App;

})();

$(function() {
  var app = new App({});
});
