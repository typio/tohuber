function Sun(x, y, r) {
  this.body = Bodies.circle(x, y, r);
  //adds body to world
  this.r = r;
  World.add(world, this.body);
}

Sun.prototype.isPlaced = function() {
  var x = this.body.position.x;
  var y = this.body.position.y;
  return (x > width/2 && x < width/2 + width/3);
}

Sun.prototype.show = function() {
  fill(255, 242, 0);
  strokeWeight(15);
  stroke(255, 144, 0)
  var pos = this.body.position;
  push();
  translate(pos.x, pos.y);
  ellipse(0, 0, this.r * 2);
  pop();
}
