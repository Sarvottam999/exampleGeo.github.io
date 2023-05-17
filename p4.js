// =========================================================
 

// =========================================================
// Coordinates of the start and destination points
// var start = [31.537027, 75.039944];  //amrithser
// var end = [31.336238, 75.678700];// JALANDER
 

var start = [31.783615, 75.766709] // thakur sell
var end = [31.780005, 75.767342]// guru dwara guru ravudas ji
 // Example array of objects
var marker_lines = [
    { distance: 3, height: 150, color: "red" , start_after : 0.003},
    { distance: 6, height: 300, color: "green" , start_after :0.006},
    { distance: 9, height: 450, color: "blue" , start_after: 0.009}
  ];



  function draw_line(start,end,marker_lines){

    var pointsIn2meters = [] ;
    var currentDistance = 0;
    var options = {units: 'kilometers'};


    var turfpoint1 = turf.point(start.slice().reverse());
    var turfpoint2 = turf.point(end.slice().reverse());
    var polyline1 = L.polyline([start,end
    ], { color: 'black' }).addTo(map);
    map.fitBounds(polyline1.getBounds());





    var bearing = turf.bearing(turfpoint1, turfpoint2);
    console.log("bearing =>  " + bearing)

    var turfnewpoint1 = turf.destination(turfpoint1, marker_lines.start_after, bearing, options );
    var newpoint1Marker = turfnewpoint1.geometry.coordinates.slice().reverse();

    var turfnewpoint2 = turf.destination(turfpoint2, -marker_lines.start_after, bearing, options );
    var newpoint2Marker = turfnewpoint2.geometry.coordinates.slice().reverse();
    var polyline2 = L.polyline([newpoint1Marker,newpoint2Marker], { color: marker_lines.color }).addTo(map);
 
    
   // Calculate the distance between the start and destination points
var totalLineDistanceInMetre = kmToMeters(turf.distance(turfnewpoint1, turfnewpoint2, options));

console.log(totalLineDistanceInMetre);
    
    // Create the line with repeating markers
    while (currentDistance <= totalLineDistanceInMetre) {
      
      calcutedPoint = turf.destination(turfnewpoint1, metersToKilometers(currentDistance), bearing,options ).geometry.coordinates.slice().reverse();
      pointsIn2meters.push(calcutedPoint);
      // L.marker(calcutedPoint).addTo(map);
 
      currentDistance += 2;
    }
    
 
    
    // Add the repeating markers to the map
    // pointsIn2meters.forEach(function(point) {
    
    //   // L.marker(point).addTo(map);
    //   if () {
    //   const rightpt = turf.rhumbDestination(pointsToTurf(point), cmToKm(marker_lines.height), bearing+90);
    //   L.polyline([getLeafletCoords(leftpt), getLeafletCoords(rightpt)]).setStyle({color: marker_lines.color, weight: 5}).addTo(map);

        
    //   }else{
    //     const  leftpt = turf.rhumbDestination(pointsToTurf(point), cmToKm(marker_lines.height), bearing-90);
    //     L.polyline([getLeafletCoords(leftpt), getLeafletCoords(rightpt)]).setStyle({color: marker_lines.color, weight: 5}).addTo(map);

    //   }
    
    // });
    

    for (var i = 0; i < pointsIn2meters.length; i++) {
            if (i% 2 === 0) {
              const  leftpt = turf.rhumbDestination(pointsToTurf(pointsIn2meters[i]), cmToKm(marker_lines.height), bearing-90);
              L.polyline([pointsIn2meters[i], getLeafletCoords(leftpt)]).setStyle({color: marker_lines.color, weight: 5}).addTo(map);
        
      }else{
       
        const rightpt = turf.rhumbDestination(pointsToTurf(pointsIn2meters[i]), cmToKm(marker_lines.height), bearing+90);
        L.polyline([pointsIn2meters[i], getLeafletCoords(rightpt)]).setStyle({color: marker_lines.color, weight: 5}).addTo(map);
  
      }
    }
    
  
    




  }


   




  document.getElementById("locationForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission
    var place1latitude = document.getElementById("Place1latitude").value;
    var place1longitude = document.getElementById("Place1longitude").value;  
 

    var place2latitude = document.getElementById("Place2latitude").value;
    var place2longitude = document.getElementById("Place2longitude").value;


var start = [place1latitude,place1longitude];
var end = [place2latitude,place2longitude];

    for (var i = 0; i < marker_lines.length; i++) {
      draw_line(start, end,marker_lines[i]);
       
      }
  });
 
// 31.783016, 75.766283

// 31.781198, 75.767010



// ==============    utilities   ==================

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
    return point.slice().reverse()
    
  }
  function getLeafletCoords(point) {
    return turf.getCoords(point).slice().reverse();
  }

 