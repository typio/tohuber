var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Composites = Matter.Composites,
    Common = Matter.Common,
    Vertices = Matter.Vertices,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint;

  var engine;
  var world;
  var cells = [];
  var flask = [];
  var sun = [];
  var water = [];
  var showWaterText = true;
  var showSunText = false;
  var waterPlaced = false;
  var cellsLimit = 800;

  var mouseConstraint;

function setup() {
  createCanvas(windowWidth - 20, windowHeight - 20);
  engine = Engine.create();
  world = engine.world;

  var b = new Boundary(width/2, height + 50, width, 102);

  drawWater();
  newCell();

  var mouse = Mouse.create(canvas.elt);
  var mouseParams = {
    mouse : mouse,
    constraint : {
      stiffness: 0.1,
    }
  }

  mouseConstraint = MouseConstraint.create(engine, mouseParams);
  mouseConstraint.mouse.pixelRatio = pixelDensity();
  World.add(world, mouseConstraint);
}

function drawFlask() {
  var w = new Flask((width/2 + width/6) + (width/8), height - 100, 20, width/4);
  flask.push(w);
  var w = new Flask((width/2 + width/6) - (width/8), height - 100, 20, width/4);
  flask.push(w);
  var w = new Flask(width/2 + width/6, height + 30, width/4, 100);
  flask.push(w);
}

function newCell() {
  var p = new Cell(width/2 + width/6, height/2 + height/3, 10);
  cells.push(p);
}

function drawSun() {
  var s = new Sun(width/2 - width/4 + width/6, height/2, 60);
  sun.push(s);
}

function drawWater() {
  var l = new Water(width/2 - width/4 + width/6, height/2, 20);
  water.push(l);
}

function draw() {
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  //make new cell every 5 frames

  if (flask.length == 0) {
    drawFlask();
  }

  if (sun.length == 0 && waterPlaced == true) {
    drawSun();
  }

  //set background
  background(236, 240, 241);

  //updates engine repeatedly
  Engine.update(engine);

  for (var i = 0; i < flask.length; i++) {
    flask[i].show();
  }

  for (var i = 0; i < sun.length; i++) {
    sun[i].show();
  }

  for (var i = 0; i < water.length; i++) {
    water[i].show();
  }

  if (sun.length > 0) {
    if (sun[0].isPlaced() && waterPlaced == true) {
      showWaterText = false;
      if (frameCount % 30 == 0) {
        console.log("Sun is above algae");
      }
      if (cells.length < cellsLimit && cells.length < 450) {
        newCell();
      }
    }
  }

  if (water[0].isPlaced()) {
    waterPlaced = true;
    showWaterText = false;
    showSunText = true;
    if (frameCount % 30 == 0) {
      console.log("Water is in");
    }
  } else {
    waterPlaced = false;
  }

  if (cells.length >= 200) {
    showSunText = false;
    showWaterText = false;
    showFinalText = true;
  }

  if (showWaterText == true) {
    textSize(width/50);
    noStroke();
    fill(0);
    textStyle(NORMAL);
    textFont("Courier New");
    text("Algae needs water to grow, add the water to the algae.", width/2, height/2 - height/3);
  } else if (showSunText == true) {
    textSize(width/50);
    noStroke();
    fill(0);
    textStyle(NORMAL);
    textFont("Courier New");
    text("Algae also needs light, hold the sun above the algae.", width/2, height/2 - height/3);
  } else if (showFinalText == true){
    textSize(width/10);
    noStroke();
    fill(0);
    textStyle(BOLD);
    textFont("Helvetica");
    text("Yay, algae.", width/2, height/2);
  }

  for (var i = 0; i < cells.length; i++) {
    cells[i].show();
    if (cells[i].isOffScreen()) {
      //removes cell from matter.js
      World.remove(world, cells[i].body);
      //removes cell from array
      cells.splice(i, 1);
      i--;
    }
  }

  var a = mouseConstraint.constraint.pointA;
  var bodyB = mouseConstraint.constraint.bodyB;

}
