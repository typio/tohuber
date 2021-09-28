function Water(x, y, r) {
  this.body = Bodies.circle(x, y, r);
  //adds body to world
  this.r = r;
  World.add(world, this.body);
}

Water.prototype.isPlaced = function() {
  var x = this.body.position.x;
  var y = this.body.position.y;
  return (x > width/2 && x < width/2 + width/3  && y > height/1.5);
}

Water.prototype.show = function() {
  fill(33, 150, 243);
  noStroke();
  var pos = this.body.position;
  push();
  translate(pos.x, pos.y);
  ellipse(0, 0, this.r * 2);
  pop();
}
