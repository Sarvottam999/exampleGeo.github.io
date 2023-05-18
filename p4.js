var polylines = [];
var polylineLayer = L.layerGroup().addTo(map);
var isDrawing = false;
var currentPolyline = null;
var previousPolyline = null;















 
// =============================  form operation =====================

function addPolyline(e) {
  e.preventDefault();

  var lat1 = parseFloat(document.getElementById("lat1").value);
  var lng1 = parseFloat(document.getElementById("lng1").value);
  var lat2 = parseFloat(document.getElementById("lat2").value);
  var lng2 = parseFloat(document.getElementById("lng2").value);

  var polyline = [
    L.latLng(lat1, lng1),
    L.latLng(lat2, lng2),
  ];

  polylines.push(polyline);
  currentPolyline = polyline; // Update currentPolyline with the new polyline

  redrawPolyline();
}





document.getElementById("coordinateForm").addEventListener(
  "submit",
  addPolyline
);

document
  .getElementById("clearPreviousPolyline")
  .addEventListener("click", function () {
    if (polylines.length > 0) {
      polylines.pop();
      redrawPolyline();
    }
  });
  // ---------------------------------------------------------

function handleMapClick(e) {
  if (isDrawing) {
    var latLng = e.latlng;
    currentPolyline.push(latLng);
    redrawPolyline();
  }
}

function redrawPolyline() {
  polylineLayer.clearLayers();

  polylines.forEach(function (polyline) {
    drawPolyline(polyline, polylineLayer);
  });
}

function drawPolyline(polyline, layer) {
  var marker_lines = [
    { distance: 3, height: 150, color: "red", start_after: 0.003 },
    { distance: 6, height: 300, color: "green", start_after: 0.006 },
    { distance: 9, height: 450, color: "blue", start_after: 0.009 }
  ];

  for (var i = 0; i < polyline.length - 1; i++) {
    var start = [polyline[i].lat, polyline[i].lng];
    var end = [polyline[i + 1].lat, polyline[i + 1].lng];

    for (var j = 0; j < marker_lines.length; j++) {
      drawLine(start, end, marker_lines[j], layer);
    }
  }
}

function drawLine(start, end, marker_lines, layer) {
  var pointsIn2meters = [];
  var currentDistance = 0;
  var options = { units: 'kilometers' };

  var turfpoint1 = turf.point(start.slice().reverse());
  var turfpoint2 = turf.point(end.slice().reverse());
  var polyline1 = L.polyline([start, end], { color: 'black' }).addTo(layer);
  // layer.fitBounds(polyline1.getBounds());

  var bearing = turf.bearing(turfpoint1, turfpoint2);

  var turfnewpoint1 = turf.destination(turfpoint1, marker_lines.start_after, bearing, options);
  var newpoint1Marker = turfnewpoint1.geometry.coordinates.slice().reverse();

  var turfnewpoint2 = turf.destination(turfpoint2, -marker_lines.start_after, bearing, options);
  var newpoint2Marker = turfnewpoint2.geometry.coordinates.slice().reverse();
  var polyline2 = L.polyline([newpoint1Marker, newpoint2Marker], { color: marker_lines.color }).addTo(layer);

  var totalLineDistanceInMetre = kmToMeters(turf.distance(turfnewpoint1, turfnewpoint2, options));

  while (currentDistance <= totalLineDistanceInMetre) {
    calcutedPoint = turf.destination(turfnewpoint1, metersToKilometers(currentDistance), bearing, options).geometry.coordinates.slice().reverse();
    pointsIn2meters.push(calcutedPoint);
    currentDistance += 2;
  }

  for (var i = 0; i < pointsIn2meters.length; i++) {
    if (i % 2 === 0) {
      const leftpt = turf.rhumbDestination(pointsToTurf(pointsIn2meters[i]), cmToKm(marker_lines.height), bearing - 90);
      L.polyline([pointsIn2meters[i], getLeafletCoords(leftpt)]).setStyle({ color: marker_lines.color, weight: 5 }).addTo(layer);
    } else {
      const rightpt = turf.rhumbDestination(pointsToTurf(pointsIn2meters[i]), cmToKm(marker_lines.height), bearing + 90);
      L.polyline([pointsIn2meters[i], getLeafletCoords(rightpt)]).setStyle({ color: marker_lines.color, weight: 5 }).addTo(layer);
    }
  }
}

map.on('click', handleMapClick);

var startButton = document.getElementById('startDrawing');
var stopButton = document.getElementById('stopDrawing');
var clearPrevButton = document.getElementById('clearPreviousPolyline');
var clearAllButton = document.getElementById('clearAllPolylines');

startButton.addEventListener('click', function () {
  isDrawing = true;
  startButton.disabled = true;
  stopButton.disabled = false;
  clearPrevButton.disabled = true;
  clearAllButton.disabled = true;

  currentPolyline = [];
  polylines.push(currentPolyline);
});

stopButton.addEventListener('click', function () {
  isDrawing = false;
  startButton.disabled = false;
  stopButton.disabled = true;
  clearPrevButton.disabled = false;
  clearAllButton.disabled = false;
  currentPolyline = null;
});

clearPrevButton.addEventListener('click', function () {
  if (polylines.length > 1) {
    polylines.pop(); // Remove the last drawn polyline
    redrawPolyline();
  }
});

clearAllButton.addEventListener('click', function () {
  polylines = []; // Clear all polylines
  redrawPolyline();
});

// Utilities

function metersToKilometers(meters) {
  var kilometers = meters / 1000;
  return kilometers;
}

function kmToMeters(kilometers) {
  return kilometers * 1000;
}

function cmToKm(cm) {
  var km = cm / 100000; // Divide centimeters by 100,000 to get kilometers
  return km;
}

function pointsToTurf(point) {
  return point.slice().reverse();
}

function getLeafletCoords(point) {
  return turf.getCoords(point).slice().reverse();
}
