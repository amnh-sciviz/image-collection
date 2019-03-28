'use strict';

var PanZoom = (function() {

  var viewer, tracker, opt;
  var imageW, imageH, cellW, cellH, ncellW, ncellH;
  var lastWebPoint, isAnimating, animateTimeout;
  var $highlight, $debug;

  function PanZoom(config) {
    var defaults = {
      tileSources: "img/photographic_matrix.dzi",
      prefixUrl: "img/openseadragon/",
      debug: false,
      cols: 114,
      rows: 116,
      highlightDelay: 10
    };
    opt = $.extend({}, defaults, config);
    this.init();
  }

  function floorToNearest(value, nearest) {
    return Math.floor(value / nearest) * nearest;
  }

  function getViewportDetails(){
    if (lastWebPoint===undefined) return false;

    var webPoint = lastWebPoint;
    var viewportPoint = viewer.viewport.pointFromPixel(webPoint);
    var imagePoint = viewer.viewport.viewportToImageCoordinates(viewportPoint);
    var imageOffset = viewer.viewport.viewportToImageCoordinates(viewer.viewport.pointFromPixel(new OpenSeadragon.Point(0,0))).negate();
    var zoom = viewer.viewport.getZoom(true);
    var imageZoom = viewer.viewport.viewportToImageZoom(zoom);
    var viewportSize = viewer.viewport.getContainerSize();

    return {
      "webPoint": webPoint,
      "viewportSize": viewportSize,
      "viewportPoint": viewportPoint,
      "imagePoint": imagePoint,
      "imageOffset": imageOffset,
      "imageZoom": imageZoom
    }
  }

  PanZoom.prototype.init = function(){
    viewer = OpenSeadragon({
        id: "panzoom",
        prefixUrl: opt.prefixUrl,
        tileSources: opt.tileSources
    });

    this.loadListeners();

    if (opt.debug) this.loadDebug();
  };

  PanZoom.prototype.loadDebug = function(){
    $debug = $("#debug");
  };

  // https://openseadragon.github.io/examples/viewport-coordinates/
  PanZoom.prototype.loadListeners = function(){
    var _this = this;

    viewer.addHandler('open', function() {
      tracker = new OpenSeadragon.MouseTracker({
          element: viewer.container,
          moveHandler: function(e) {
            lastWebPoint = e.position;
            _this.onMouseMove();
          }
      });

      var imageSize = viewer.world.getItemAt(0).getContentSize();
      imageW = imageSize.x;
      imageH = imageSize.y;
      console.log("Image size: "+imageSize.toString());

      ncellW = 1.0 / opt.cols;
      ncellH = 1.0 / opt.rows;
      cellW = 1.0 * imageW / opt.cols;
      cellH = 1.0 * imageH / opt.rows;

      $(".openseadragon-canvas").append($('<a href="#" id="highlight" class="highlight" />'));
      $highlight = $("#highlight");
      $highlight.on("click", function(e){
        console.log("highlightClicked")
      });

      viewer.addHandler('canvas-click', function(e){
        e.preventDefaultAction = true;
      });

      tracker.setTracking(true);

      viewer.addHandler('animation', function(){
        _this.onAnimation();
      });
    });
  };

  PanZoom.prototype.onAnimation = function(e){
    isAnimating = true;
    $highlight.removeClass("active");

    if (animateTimeout) clearTimeout(animateTimeout);
    animateTimeout = setTimeout(function(){
      isAnimating = false;
    }, opt.highlightDelay);

    this.onMouseMove();
  };

  PanZoom.prototype.onMouseMove = function(){
    var vp = getViewportDetails();
    if (!vp) return false;

    this.renderDebug(vp);
    if (!isAnimating) this.renderHighlight(vp);

  };

  PanZoom.prototype.renderDebug = function(details){
    if (!opt.debug) return false;
    
    details = details || getViewportDetails();
    if (!details) return false;

    var html = '<strong>Web:</strong> ' + details.webPoint.toString();
    html += '<br /><strong>Viewport:</strong> ' + details.viewportPoint.toString();
    html += '<br /><strong>Image:</strong> ' + details.imagePoint.toString();
    html += '<br /><strong>Offset:</strong> ' + details.imageOffset.toString();
    html += '<br /><strong>Image Zoom:</strong> ' + (Math.round(details.imageZoom * 100) / 100);

    $debug.html(html);
  };

  PanZoom.prototype.renderHighlight = function(details){
    details = details || getViewportDetails();
    if (!details) return false;

    // first check if mouse is within the image
    if (details.imagePoint.x < 0 || details.imagePoint.y < 0 ||
        details.imagePoint.x > imageW || details.imagePoint.y > imageH) {
      $highlight.removeClass("active");
      return false;
    }

    var cellX = floorToNearest(details.imagePoint.x, cellW);
    var cellY = floorToNearest(details.imagePoint.y, cellH);

    // normalize image point and offset
    var nImageX = cellX / imageW;
    var nImageY = cellY / imageH;

    var nOffsetX = details.imageOffset.x / imageW;
    var nOffsetY = details.imageOffset.y / imageH;

    // get the perceived/scaled width/height
    var scale = details.imageZoom;
    var sImageW = imageW * scale;
    var sImageH = imageH * scale;
    var sCellW = cellW * scale;
    var sCellH = cellH * scale;

    // get the position within the viewport
    var vpX = nImageX * sImageW + nOffsetX * sImageW;
    var vpY = nImageY * sImageH + nOffsetY * sImageH;

    // check to see if cell is within viewport
    if ((vpX+sCellW) < 0 || (vpY+sCellH) < 0 ||
        vpX > details.viewportSize.x || vpY > details.viewportSize.y) {
      $highlight.removeClass("active");
      return false;
    }

    // transform and activate
    $highlight.css({
      "transform": "translate3d("+vpX+"px, "+vpY+"px, 0) scale3d("+scale+","+scale+","+scale+")"
    })
    $highlight.addClass("active");
  }


  return PanZoom;

})();

$(function() {
  var app = new PanZoom({});
});
