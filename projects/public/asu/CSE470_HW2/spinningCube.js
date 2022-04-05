let canvas;
let gl;
let ext;

let points = []; // filled by createCube in createCube.js
let colors = [];

let numVertices = 36;

let axes = [
  [1, 0, 0], // x
  [0, 1, 0], // y
  [0, 0, 1] // z
];
let theta = 0.5;

let modelViewLoc;

let cubes = [];

let m = mat4();

window.onload = function init() {
  canvas = document.getElementById("gl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) { alert("WebGL isn't available"); }

  createCube();

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.0, 1.0, 1.0, 1.0);

  gl.enable(gl.DEPTH_TEST);

  //
  //  Load shaders and initialize attribute buffers
  //
  let program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

  let vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  modelView = gl.getUniformLocation(program, "modelView");

  //event listeners for buttons
  document.getElementById("xButton").onclick = function () {
    console.log("pressed x");
    cubes.forEach(cube => {
      cube.rotationAxis = axes[0];
    });
  };
  document.getElementById("yButton").onclick = function () {
    console.log("pressed y");
    cubes.forEach(cube => {
      cube.rotationAxis = axes[1];
    });
  };
  document.getElementById("zButton").onclick = function () {
    console.log("pressed z");
    cubes.forEach(cube => {
      cube.rotationAxis = axes[2];
    });
  };
  document.getElementById("randomRotation").onclick = function () {
    console.log("pressed random");
    cubes.forEach(cube => {
      cube.rotationAxis = [Math.random(), Math.random(), Math.random()];
    });
  };
  document.getElementById("randomSpeed").onclick = function () {
    console.log("pressed random");
    cubes.forEach(cube => {
      cube.speed = Math.random() * 10 - 5;
    });
  };
  document.getElementById("clear").onclick = function () {
    cubes = [];
  };

  canvas.onclick = (e) => {
    xPos = 2 * ((e.pageX - canvas.offsetLeft) / canvas.width) - 1;
    yPos = 2 * (1 - (e.pageY - canvas.offsetTop) / canvas.width) - 1;
    console.log(xPos + ", " + yPos);
    cubes.push({
      rotationAxis: axes[Math.floor(Math.random() * 3)],
      theta: 0,
      speed: Math.random() * 10 - 5,
      position: [xPos, yPos, Math.random()],
      scale: Math.floor(Math.random() * 5 + 1) / 20
    }
    )
  }

  cubes.push({
    rotationAxis: axes[Math.floor(Math.random() * 3)],
    theta: 0,
    speed: Math.random() * 10 - 5,
    position: [0, 0, Math.random()],
    scale: Math.floor(Math.random() * 5 + 1) / 10
  }
  )
  render();
}


function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  cubes.forEach(cube => {
    let t = translate(cube.position[0], cube.position[1], cube.position[2]);
    let s = scalem(cube.scale, cube.scale, cube.scale);
    m = mult(t, s);
    m = mult(m, rotate(cube.theta, cube.rotationAxis[0], cube.rotationAxis[1], cube.rotationAxis[2]))
    cube.theta += cube.speed;

    gl.uniformMatrix4fv(modelView, false, flatten(m));

    gl.drawArrays(gl.TRIANGLES, 0, numVertices);
  });

  requestAnimFrame(render);
}

