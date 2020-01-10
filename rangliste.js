/// <reference path="./libraries/p5.global-mode.d.ts" />
var data = [];
var futureData = [];
var income = [];
var region = [];
var ready = false;
var map;
var font;

// Scales
var regionColorScale = d3.scaleOrdinal(); // Region zu Farbe
var yByIncome = d3.scaleOrdinal(); // Income to Y
var surfaceScale = d3.scaleLinear(); // Surface to Radius
var rankScale = d3.scaleLinear(); // Value to Rank / X

// Design Variables
var divider;
var quarter;

// Class Specific Var
var countryByRank = []; // Class Placeholder

var currentYear; // Raw Year Number
var currentYearReference; // Reference to Energy Number
var nextYear; // Raw next Year Number
var nextYearReference; // Reference to Energy Number

var sortedData;
var nextSortedData;

var comparedIndex = [];

var doSave = false;

var counter = 0;

function preload() {
  map = loadImage('img/weltkarte.png');
  font = loadFont('font/Montserrat-SemiBold.ttf');
}

async function setup() {
  createCanvas(4 * 1920, 1080);
  //  frameRate(1);
  frameRate(30);
  noStroke();

  // Load Data
  data = await loadData('renewables_pop.csv'); // Current Data for sortedData
  futureData = await loadData('renewables_pop.csv'); // Current Data for nextSortedData
  //  console.log(data);



  divider = (height - 150) / 4;

  // Move IncomeGroup to Array
  //  for (var i = 0; i < data.length; i++) {
  //    if(!income.includes(data[i].IncomeGroup)){ // Check if Value already Exists
  //      income.push(data[i].IncomeGroup); // Add new Value to Array
  //    }
  //  }
  income = ['High income', 'Upper middle income', 'Lower middle income', 'Low income'];

  // Move Region to Array
  //  for (var i = 0; i < data.length; i++) {
  //    if(!region.includes(data[i].Region)){ // Check if Value already Exists
  //      region.push(data[i].Region); // Add new Value to Array
  //    }
  //  }
  region = ["South Asia", "Europe & Central Asia", "Middle East & North Africa", "Sub-Saharan Africa", "Latin America & Caribbean", "East Asia & Pacific", "North America"];

  /********** Scale Setup **********/

  // Latin America & Caribbean | Sub-Saharan Africa | Middle East & North Africa | Europe & Central Asia | East Asia & Pacific | North America | South Asia
  regionColorScale.domain(region)
    .range(['29, 114, 137',   // South Asia
            '195, 114, 206',  // Europe & Central Asia
            '221, 81, 3',     // Middle East & North Africa
            '242, 172, 41',   // Sub-Saharan Africa
            '105, 186, 91',   // Latin America & Caribbean
            '172, 235, 242',  // East Asia & Pacific
            '46, 89, 2']);    // North America

  // Fix it
  yByIncome.domain(income)
    .range([(divider * 0) + (divider / 2), (divider * 1) + (divider / 2), (divider * 2) + (divider / 2), (divider * 3) + (divider / 2)])
  //    .range([(100) + (divider * 0) + (divider / 2), (100) +  (divider * 3) + (divider / 2), (100) +  (divider * 2) + (divider / 2), (100) +  (divider * 1) + (divider / 2)])


  // Value Range
  //    var minSize = 10;
  var minSize = d3.min(data, function (d) { return d.Surface; });
  //    var maxSize = 100;
  var maxSize = d3.max(data, function (d) { return d.Surface; });

  // Value Scale Radius
  surfaceScale.domain([minSize, maxSize])
    .range([10, 50]);

  // Ranking Scale    
  rankScale.domain([0, data.length])
    .range([40, width - 80]);



  // Class Setup
  currentYear = 1990;
  currentYearReference = 'E1990';
  sortedData = sortArray(data, currentYearReference);

  nextYear = 1991;
  nextYearReference = 'E1991';
  nextSortedData = sortArray(futureData, nextYearReference);

  compareSortedData(); // Fill Comparison Array

  textFont(font);

  ready = true;
}


/******************************* DRAW ********************************/

function draw() {
  // First Setup
  if(frameCount < 10){
    if (!ready) {
      background(0);
      return;
    } else {
      background(0);
    }
    gridLine();
    drawRanking(); // Call first Drawing
  }

  reDraw();

  if (doSave) {
    counter++;
    var saveName = 'rangliste_' + counter + '.png';
    saveCanvas(saveName);
  }

} // End of function draw()



// Update on Click
function mouseClicked() {
  updateYear();
  updateData();
}


/******************** Update Rank Data usw. ********************/
function updateData(){

  for(var i = 0; i < data.length; i++){
    var myObject = countryByRank[i];
    var currentCode = sortedData[i].Code;

    myObject.currentRanking = myObject.nextRank;

    for(var j = 0; j < data.length; j++){
      if(myObject.code == nextSortedData[j].Code){
        myObject.nextRank = j;
        myObject.targetX = rankScale(myObject.currentRanking);
      }
    }
  }

}

/******************** reDraw / animate all Objects ********************/
function reDraw(){
  background(0);
  imageMode(CENTER);
  image(map, 280, 300, 400, 400);
  //  image(map, 280, 180, 400, 400);
  gridLine();

  for(var i = 0; i < sortedData.length; i++){
    countryByRank[i].moveCountry();  
    countryByRank[i].display();
  }
  textAlign(LEFT);
  noStroke();
  fill(255, 255, 255, 180);
  textSize(35);
  // 7105.114285714286
  var yearX = (width - 7105) / 2;
  text(currentYear, width - yearX, height - 40);
  text('Erneuerbare Energie', 80, 100);
  textSize(25);
  text('Eine Rangliste der Energieanteile', 80, 135);
}

function drawRanking(){
  background(0);

  for (var i = 0; i < data.length; i++) {
    countryByRank[i] = new Country(sortedData[i], i, currentYearReference);
    countryByRank[i].display();

  } // End Data for()
}


function compareSortedData(){
  for(var i = 0; i < sortedData.length; i++){
    comparedIndex[i] = nextSortedData.findIndex(x => x.Code === sortedData[i].Code);
  }
}


// Change Value to new Year until == 2015
function updateYear(){
  if(currentYear < 2014){
    // Change current Nr.
    currentYear++; // Add 1 to current Year
    currentYearReference = "E" + currentYear;

    // Change Future Nr.
    nextYear++;
    nextYearReference  = "E" + nextYear;

    // Update Sorted Array
    updateArrays(currentYearReference, nextYearReference);
  }else if(currentYear == 2014){
    // Change current Nr.
    currentYear++; // Add 1 to current Year
    currentYearReference = "E" + currentYear;

    // Change Future Nr.
    nextYear = 1990;
    nextYearReference  = "E" + nextYear;

    // Update Sorted Array
    updateArrays(currentYearReference, nextYearReference);   
  }else if(currentYear == 2015){
    currentYear = 1990; // Add 1 to current Year
    currentYearReference = "E" + currentYear;

    // Change Future Nr.
    nextYear++;
    nextYearReference  = "E" + nextYear;

    // Update Sorted Array
    updateArrays(currentYearReference, nextYearReference);
  }
}

// Update Array Sorting to new Year
function updateArrays(newYear, nextYearReference) {    
  sortedData = sortArray(data, newYear);
  nextSortedData = sortArray(futureData, nextYearReference);
}

// Sort Arrays
function sortArray(array, year) {
  array.sort((a, b) => (a[year] < b[year]) ? 1 : ((b[year] < a[year]) ? -1 : 0)); 
  return array;
}



function gridLine(){
  //    rankScale
  var gridValue = 15;
  var cycles = Math.floor(data.length / gridValue);

  for(var i = 0; i <= cycles + 1; i++){
    var tempX = rankScale(gridValue * i - 1);
    var tempYearX = rankScale((gridValue * i - 1) - 10);
    var tempText = 'Rang: ' + (gridValue * i);

    stroke(255, 255, 255, 180);
    strokeWeight(2);

    if(i != 0 && i != cycles + 1){
      //      line(tempX, 0, tempX, 80);
      line(tempX, height - 80, tempX, height);

      // SetUp Text
      noStroke();
      textSize(16);
      textAlign(CENTER);
      fill(255, 255, 255, 180);

      //      text(tempText, tempX, 100);
      text(tempText, tempX, height - 100);
      console.log(tempText);
      console.log(tempX);
    }

  }

  // Add Height Information
  for(var i = 0; i < income.length; i++ ){
    push();
    noStroke();
    textSize(20);
    translate(width - 50, yByIncome(income[i]));
    angleMode(DEGREES);
    rotate(-90);
    fill(255, 255, 255, 180);

    switch(income[i]){
      case 'High income':
        text(income[i], 0, 0);
        break;
      case 'Upper middle income':
        text('Upper middle\nincome', 0, 0);
        break;
      case 'Lower middle income':
        text('Lower middle\nincome', 0, 0);
        break;
      case 'Low income':
        text(income[i], 0, 0);
        break;
      default:
        break;
    }
    pop();
  }
}

class Country { // Klare Namenswahl hilft
  /******************************* CLASS CONSTRUCTOR ********************************/
  constructor(countryData, countryRank, myYear) {     
    // Getting Data
    this.countryData = countryData;
    this.code = this.countryData.Code;
    this.value = this.countryData[myYear].toFixed(2); 

    // Choosing Color
    this.incomeGroup = this.countryData.IncomeGroup;
    this.regionColorGroup = regionColorScale(this.countryData.Region);
    this.regionColors = this.regionColorGroup.split(",");
    this.red = this.regionColors[0];
    this.green = this.regionColors[1];
    this.blue = this.regionColors[2];


    // Ranking
    this.currentRanking = countryRank;
    this.nextRank = comparedIndex[countryRank];

    // Position & Size
    this.x = rankScale(this.currentRanking); // Berechnung mit d3 Scale (rankScale) Domain: 0 - anzahl Länder, SclaeLinear
    this.targetX = rankScale(this.currentRanking); // Target Position
    this.y = yByIncome(this.incomeGroup);
    this.r = 12;
    //    this.r = surfaceScale(this.countryData['Surface']);
  }

  /******************** ANIMATE RANKING ********************/
  moveCountry(){
    this.x = ease(this.x, this.targetX); // Move Target

  }

  /******************** DISPLAY OBJECTS ********************/
  display() {
    // Draw Point
    //    stroke('rgba(255, 255, 255, 0.3)');
    stroke(this.red, this.green, this.blue);
    strokeWeight(2);


    line(this.x, this.y - 40, this.x, this.y + 40);

    this.value = this.countryData[currentYearReference].toFixed(1); 

    noStroke();
    fill(this.red, this.green, this.blue);
    ellipse(this.x, this.y, this.r, this.r);

    // Write Codename
    textSize(12);
    textAlign(CENTER);
    // text(this.currentRanking + 1, this.x, this.y + 60);
    text(this.value + '%', this.x, this.y + 60);
    text(this.code, this.x, this.y + 75);    

  }

}

/* Easing Function */
function ease(n, target) {
  var easing = 0.1;
  var d = target - n;
  return n + d * easing;
}

// Save Function
//function keyPressed() {
//  if(keyCode == UP_ARROW){
//    //    save('myCanvas.jpg');
//    doSave = !doSave;
//  }
//}