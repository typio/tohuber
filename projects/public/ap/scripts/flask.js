function Flask(x, y, w, h) {
  var options = {
    isStatic: true
  };
  this.body = Bodies.rectangle(x, y, w, h, options);
  //adds body to world
  this.w = w;
  this.h = h;
  World.add(world, this.body);
}

Flask.prototype.show = function() {
  fill(51);
  noStroke();
  var pos = this.body.position;
  push();
  translate(pos.x, pos.y);
  rect(0, 0, this.w, this.h);
  pop();
}
