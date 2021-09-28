function Cell(x, y, r) {
  var options = {
    restitution: 1
  };

  this.body = Bodies.circle(x, y, r, options);
  //adds body to world
  this.r = r;
  World.add(world, this.body);
}

Cell.prototype.isOffScreen = function() {
  var x = this.body.position.x;
  return (x < -50 || x > width + 50);
}

Cell.prototype.show = function() {
  fill(41, 128, 80);
  noStroke();
  var pos = this.body.position;
  push();
  translate(pos.x, pos.y);
  ellipse(0, 0, this.r * 2);
  pop();
}
