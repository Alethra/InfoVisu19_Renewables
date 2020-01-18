// ---- VARIABLEN -----
/// <reference path="./libraries/p5.global-mode.d.ts" />

var data = [];
var income = [];
var years = ['1990','1991','1992','1993','1994','1995','1996','1997','1998','1999','2000','2001','2002','2003','2004','2005','2006','2007','2008','2009','2010','2011','2012','2013','2014','2015'];
var counter = 0;
var jahr = 1990;
var d = 0;

//Kreise
var circles = [];
var circle;
var distance;
var difference;
var shift;
var vDirection;

// Bools
var ready = false;
var stop = false;

// Border Distances
var borderDistanceYOben = 100;
var borderDistanceYUnten = 250;
var borderDistanceX = 100;

// Scales
var latScale = d3.scaleLinear(); // West - East (X)
var lonScale = d3.scaleLinear(); // North - South (y)
var colorScale = d3.scaleOrdinal(); // Income zu Farbe
var valueScale = d3.scaleLinear(); // Value to Radius


// ---- SETUP -----
async function setup() {
  createCanvas(4 * 1920,1080);

  data = await loadData('../renewables.csv');
  ready = true;

  // Latitude Range
  var minLat = d3.min(data, function (d) { return d.Lat; });
  var maxLat = d3.max(data, function (d) { return d.Lat; });

  //Longitude Range
  var minLon = d3.min(data, function (d) { return d.Lon; });
  var maxLon = d3.max(data, function (d) { return d.Lon; });

  // Value Range
  var minRad = d3.min(data, function (d) { return d['1990']; });
  var maxRad = d3.max(data, function (d) { return d['1990']; });

  // Move IncomeValues
  for (var i = 0; i < data.length; i++) {
    if(!income.includes(data[i].IncomeGroup)){ // Check if Value already Exists
      income.push(data[i].IncomeGroup); // Add new Value to Array
    }
  }

  frameRate(1);
  angleMode(DEGREES);
  ellipseMode(CENTER);

  // Domain Setup
  lonScale.domain([minLon, maxLon])
    .range([0 + borderDistanceX, width - borderDistanceX]);

  latScale.domain([minLat, maxLat])
    .range([height - borderDistanceYUnten, 0 + borderDistanceYOben]);

  // High income | Low income | Lower middle income | Upper middle income
  colorScale.domain(income)
    //.range(['rgba(255, 218, 56, 1)', 'rgba(255, 135, 191, 1)', 'rgba(63, 223, 255, 1)', 'rgba(50, 255, 153, 1)'])
    //.range(['rgba(255, 255, 255, 1)', 'rgba(157, 129, 137, 1)', 'rgba(244, 172, 183, 1)', 'rgba(255, 202, 212, 1)'])
    .range(['rgba(210, 255, 168, 1)', 'rgba(255, 215, 209, 1)', 'rgba(188, 152, 145, 1)', 'rgba(153, 183, 121, 1)'])

  valueScale.domain([minRad, maxRad])
    .range([0, 100]);
  
    
// NO OVERLAP 
  for (var i = 0; i < data.length; i++) {
    d = data[i];
    circle = {
      vec: createVector(lonScale(d.Lon), latScale(d.Lat)),
      r: 10,
      incomeColor: colorScale(d.IncomeGroup),
      rings: Math.floor(d['1990'] / 5),
      maxDiameter: 10 * Math.floor(d['1990'] / 5),
      country: d.CountryName,
  };
  
  circles.push(circle);
  }

  // for (var l = 0; l<26; l++) {
    //   jahr = years[l];
    //   console.log(jahr);
    // }

  for (var k = 0; k < 200; k++) { 

    for (var i = 0; i < data.length; i++) {

      for (var j = 0; j < circles.length; j++) {

        var other = circles[j];

        distance = p5.Vector.dist(circles[i].vec, other.vec);
        difference = ((circles[i].maxDiameter/2)+(other.maxDiameter/2) - distance)+2;
        shift = (difference/2)+2;

        vDirection = p5.Vector.sub(circles[i].vec, other.vec);
        vDirection.normalize();
        vDirection.mult(shift);

        if(circles[i].rings != 0) {
          // Hat mindestens 1 Ring
          if(difference >= 0) {
            //console.log('overlap 1');
            circles[i].vec = p5.Vector.add(circles[i].vec, vDirection);
            circles[j].vec = p5.Vector.sub(other.vec, vDirection);
          } else {
              //console.log('no overlap 1');
              //do nothing
          } //end if (difference)
        } else {
          // Hat 0 Ringe 
          circles[i].maxDiameter = 1 * circles[i].r;
          difference = ((circles[i].maxDiameter/2)+(other.maxDiameter/2) - distance);
          if(difference >= 0) {
            circles[i].vec = p5.Vector.add(circles[i].vec, vDirection);
            circles[j].vec = p5.Vector.sub(other.vec, vDirection);
          } else {
            //console.log('no overlap 2');
            //do nothing
          } //end if (difference)
        } //end if (rings)
      } //end for (j) 
    } //end for (i)
  } //end for (k)
 } //end Setup

// ---- DRAW ----
function draw() {
  background(0);
  noFill();
  strokeWeight(1);
  
  
  jahr++;
  if (jahr>2015) {
    jahr = 1990;
  }
  //console.log(jahr);

    // circles[i].rings = Math.floor(d[year] / 5);
    // console.log(circles[i].rings);

  // circles[i].maxDiameter = 10 * Math.floor(d[year] / 5); 

  //Kreise zeichnen
  for (var i = 0; i < circles.length; i++) {
    // erster Kreis zeichnen (10)
    noFill();
    //stroke('white');
    stroke(circles[i].incomeColor);
    ellipse(circles[i].vec.x, circles[i].vec.y, circles[i].r);
    // Show Country Names
    // fill('white');
    // text(circles[i].country, circles[i].vec.x + 10, circles[i].vec.y);

    for (var a = 1; a < circles[i].rings + 1; a++) { 
      // restliche Kreise zeichnen
      noFill();
      ellipse(circles[i].vec.x, circles[i].vec.y, circles[i].r * a, circles[i].r * a);
      
    } //end for (a)

   } //end for (i)
} // End of function draw()


// ---- FUNKTIONEN -----
//Save Function
//function mouseClicked() {
//save('myCanvas.png');
//}

  //  //Hover: Anzeige Land 
  //  abstand = p5.Vector.dist(circles[i].vec, mouseX);
  //  //Mouse Event Tooltip <- Working :D
  //  if (abstand < 20){
  //  noStroke();
  //  fill('white');
  //  text(d.CountryName, circles[i].vec.x, circles[i].vec.y+40);
  //  }