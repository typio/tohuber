// Thomas Huber HW4

let canvas
let gl
let program

let index = 0

let points = []

let mouse = {
  prevX: 0,
  prevY: 0,

  leftDown: false,
  rightDown: false,
}

let radius = 15.0
let theta = 3
let phi = 3
let dr = 10.0 * Math.PI / 180.0

let left = -3.0
let right = 3.0
let ytop = 3.0
let bottom = -3.0

let near = 0.01
let farFactor = 3.0
let far = radius * farFactor

const threePiOver2 = 4.71238898
const piOver2 = 1.57079632679

let ctm
let ambientColor, diffuseColor, specularColor

let modelViewMatrix, projectionMatrix
let modelViewMatrixLoc, projectionMatrixLoc

let eye = vec3(
  0.7475072593072571,
  -0.705600040323574,
  4.893195426342414
)
let at = vec3(0.0, 0.0, 0.0)
let up = vec3(0.0, 1.0, 0.0)

let fov = 60.0

let playing = true



let vertices = [
  vec4(-0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, 0.5, 0.5, 1.0),
  vec4(0.5, 0.5, 0.5, 1.0),
  vec4(0.5, -0.5, 0.5, 1.0),
  vec4(-0.5, -0.5, -0.5, 1.0),
  vec4(-0.5, 0.5, -0.5, 1.0),
  vec4(0.5, 0.5, -0.5, 1.0),
  vec4(0.5, -0.5, -0.5, 1.0)
]

var texCoord = [
  vec2(0, 0),
  vec2(0, 1),
  vec2(1, 1),
  vec2(1, 0)
]

let torsoId = 0
let headId = 1
let leftUpperArmId = 2
let leftLowerArmId = 3
let rightUpperArmId = 4
let rightLowerArmId = 5
let leftUpperLegId = 6
let leftLowerLegId = 7
let rightUpperLegId = 8
let rightLowerLegId = 9

let torsoHeightId = 10
let torsoWidthId = 11
let upperArmHeightId = 12
let lowerArmHeightId = 13
let upperArmWidthId = 14
let lowerArmWidthId = 15
let upperLegWidthId = 16
let lowerLegWidthId = 17
let lowerLegHeightId = 18
let upperLegHeightId = 19
let headHeightId = 20
let headWidthId = 21

let figureTheta = [0, 0, 0, 0, 0, 0, 180, 0, 180, 0, 5.0, 1.0, 2.0, 1.5, 0.6, 0.5, 0.6, 0.5, 2.0, 3.0, 1.5, 0.8]

let torsoColor = vec4(1.0, 1.0, 1.0, 1.0)
let headColor = vec4(1.0, 1.0, 1.0, 1.0)
let upperArmColor = vec4(0.1, 0.1, 0.1, 1.0)
let lowerArmColor = vec4(0.1, 0.1, 0.1, 1.0)
let upperLegColor = vec4(0.1, 0.1, 0.1, 1.0)
let lowerLegColor = vec4(0.1, 0.1, 0.1, 1.0)

let numNodes = 10
let numAngles = 11
let angle = 0

let numVertices = 24

let stack = []

let figure = []

let vBuffer
let modelViewLoc

let pointsArray = []

let texCoordsArray = []

let audio = new Audio('Chuck-Berry.mp3')

let travolta_face_image = new Image()
travolta_face_image.crossOrigin = "data"
travolta_face_image.src = "travolta_face.jpg"

let travolta_tux_image = new Image()
travolta_tux_image.crossOrigin = "data"
travolta_tux_image.src = "travolta_tux.jpg"

let tachometer_image = new Image()
tachometer_image.crossOrigin = "data"
// i made this one
tachometer_image.src = "tachometer.png"

let travolta_face_texture
let travolta_tux_texture
let tachometer_texture

audio.play()
audio.volume = 0.2

const scale4 = (a, b, c) => {
  let result = mat4()
  result[0][0] = a
  result[1][1] = b
  result[2][2] = c
  return result
}


const createNode = (transform, render, sibling, child) => {
  let node = {
    transform: transform,
    render: render,
    sibling: sibling,
    child: child,
  }
  return node
}

for (let i = 0; i < numNodes; i++)
  figure[i] = createNode(null, null, null, null)

const initNodes = () => {

  let m = mat4()

  m = rotate(figureTheta[torsoId], 0, 1, 0)
  figure[torsoId] = createNode(m, torso, null, headId)

  m = translate(0.0, figureTheta[torsoHeightId], 0.0)
  m = mult(m, rotate(figureTheta[headId], 1, 0, 0))
  m = mult(m, rotate(figureTheta[headId], 0, 1, 0))
  figure[headId] = createNode(m, head, leftUpperArmId, null)

  m = translate(-(figureTheta[torsoWidthId] + figureTheta[upperArmWidthId]), 0.9 * figureTheta[torsoHeightId], 0.0)
  m = mult(m, rotate(figureTheta[leftUpperArmId], 1, 0, 0))
  figure[leftUpperArmId] = createNode(m, leftUpperArm, rightUpperArmId, leftLowerArmId)

  m = translate(figureTheta[torsoWidthId] + figureTheta[upperArmWidthId], 0.9 * figureTheta[torsoHeightId], 0.0)
  m = mult(m, rotate(figureTheta[rightUpperArmId], 1, 0, 0))
  figure[rightUpperArmId] = createNode(m, rightUpperArm, leftUpperLegId, rightLowerArmId)

  m = translate(-(figureTheta[torsoWidthId] + figureTheta[upperLegWidthId]), 0.1 * figureTheta[upperLegHeightId], 0.0)
  m = mult(m, rotate(figureTheta[leftUpperLegId], 1, 0, 0))
  figure[leftUpperLegId] = createNode(m, leftUpperLeg, rightUpperLegId, leftLowerLegId)

  m = translate(figureTheta[torsoWidthId] + figureTheta[upperLegWidthId], 0.1 * figureTheta[upperLegHeightId], 0.0)
  m = mult(m, rotate(figureTheta[rightUpperLegId], 1, 0, 0))
  figure[rightUpperLegId] = createNode(m, rightUpperLeg, null, rightLowerLegId)

  m = translate(0.0, figureTheta[upperArmHeightId], 0.0)
  m = mult(m, rotate(figureTheta[leftLowerArmId], 1, 0, 0))
  figure[leftLowerArmId] = createNode(m, leftLowerArm, null, null)

  m = translate(0.0, figureTheta[upperArmHeightId], 0.0)
  m = mult(m, rotate(figureTheta[rightLowerArmId], 1, 0, 0))
  figure[rightLowerArmId] = createNode(m, rightLowerArm, null, null)

  m = translate(0.0, figureTheta[upperLegHeightId], 0.0)
  m = mult(m, rotate(figureTheta[leftLowerLegId], 1, 0, 0))
  figure[leftLowerLegId] = createNode(m, leftLowerLeg, null, null)

  m = translate(0.0, figureTheta[upperLegHeightId], 0.0)
  m = mult(m, rotate(figureTheta[rightLowerLegId], 1, 0, 0))
  figure[rightLowerLegId] = createNode(m, rightLowerLeg, null, null)
}

const traverse = (Id) => {
  if (Id == null) return
  stack.push(modelViewMatrix)
  modelViewMatrix = mult(modelViewMatrix, figure[Id].transform)
  figure[Id].render()
  if (figure[Id].child != null) traverse(figure[Id].child)
  modelViewMatrix = stack.pop()
  if (figure[Id].sibling != null) traverse(figure[Id].sibling)
}

const torso = () => {
  gl.bindTexture(gl.TEXTURE_2D, travolta_tux_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * figureTheta[torsoHeightId], 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(figureTheta[torsoWidthId], figureTheta[torsoHeightId], figureTheta[torsoWidthId]))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(torsoColor))
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
}

const head = () => {
  gl.bindTexture(gl.TEXTURE_2D, travolta_face_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * figureTheta[headHeightId], 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(figureTheta[headWidthId], figureTheta[headHeightId], figureTheta[headWidthId]))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(headColor))
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
}

const leftUpperArm = () => {
  gl.bindTexture(gl.TEXTURE_2D, travolta_tux_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * figureTheta[upperArmHeightId], 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(figureTheta[upperArmWidthId], figureTheta[upperArmHeightId], figureTheta[upperArmWidthId]))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(upperArmColor))
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
}

const leftLowerArm = () => {
  gl.bindTexture(gl.TEXTURE_2D, travolta_tux_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * figureTheta[lowerArmHeightId], 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(figureTheta[lowerArmWidthId], figureTheta[lowerArmHeightId], figureTheta[lowerArmWidthId]))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(lowerArmColor))
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
}

const rightUpperArm = () => {
  gl.bindTexture(gl.TEXTURE_2D, travolta_tux_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * figureTheta[upperArmHeightId], 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(figureTheta[upperArmWidthId], figureTheta[upperArmHeightId], figureTheta[upperArmWidthId]))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(upperArmColor))
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
}

const rightLowerArm = () => {
  gl.bindTexture(gl.TEXTURE_2D, travolta_tux_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * figureTheta[lowerArmHeightId], 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(figureTheta[lowerArmWidthId], figureTheta[lowerArmHeightId], figureTheta[lowerArmWidthId]))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(lowerArmColor))

  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
}

const leftUpperLeg = () => {
  gl.bindTexture(gl.TEXTURE_2D, travolta_tux_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * figureTheta[upperLegHeightId], 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(figureTheta[upperLegWidthId], figureTheta[upperLegHeightId], figureTheta[upperLegWidthId]))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(upperLegColor))
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
}

const leftLowerLeg = () => {
  gl.bindTexture(gl.TEXTURE_2D, travolta_tux_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * figureTheta[lowerLegHeightId], 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(figureTheta[lowerLegWidthId], figureTheta[lowerLegHeightId], figureTheta[lowerLegWidthId]))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(lowerLegColor))
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
}

const rightUpperLeg = () => {
  gl.bindTexture(gl.TEXTURE_2D, travolta_tux_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * figureTheta[upperLegHeightId], 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(figureTheta[upperLegWidthId], figureTheta[upperLegHeightId], figureTheta[upperLegWidthId]))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(upperLegColor))
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
}

const rightLowerLeg = () => {
  gl.bindTexture(gl.TEXTURE_2D, travolta_tux_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, 0.5 * figureTheta[lowerLegHeightId], 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(figureTheta[lowerLegWidthId], figureTheta[lowerLegHeightId], figureTheta[lowerLegWidthId]))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(lowerLegColor))
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)
}

const quad = (a, b, c, d) => {
  pointsArray.push(vertices[a])
  texCoordsArray.push(texCoord[0])

  pointsArray.push(vertices[b])
  texCoordsArray.push(texCoord[1])

  pointsArray.push(vertices[c])
  texCoordsArray.push(texCoord[2])

  pointsArray.push(vertices[d])
  texCoordsArray.push(texCoord[3])

}

const cube = () => {
  quad(1, 0, 3, 2)
  quad(2, 3, 7, 6)
  quad(3, 0, 4, 7)
  quad(6, 5, 1, 2)
  quad(4, 5, 6, 7)
  quad(5, 4, 0, 1)

}

const init = () => {
  canvas = document.getElementById("gl-canvas")

  gl = WebGLUtils.setupWebGL(canvas)
  if (!gl) { alert("WebGL isn't available") }

  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clearColor(0.7, 0.2, 0, 1.0)

  gl.enable(gl.DEPTH_TEST)

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader")

  gl.useProgram(program)

  instanceMatrix = mat4()

  // projectionMatrix = ortho(-10.0, 10.0, -10.0, 10.0, -10.0, 10.0)
  projectionMatrix = perspective(60, 1, 0.05, 100)
  modelViewMatrix = lookAt(eye, at, up)

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix))
  gl.uniformMatrix4fv(gl.getUniformLocation(program, "projectionMatrix"), false, flatten(projectionMatrix))


  colorLoc = gl.getUniformLocation(program, "color")
  gl.uniform4fv(colorLoc, flatten(torsoColor))

  cube()
  pointsArray.push(vec4(-2.5, -2.5, 2.5, 1.0))
  pointsArray.push(vec4(-2.5, 2.5, 2.5, 1.0))
  pointsArray.push(vec4(2.5, 2.5, 2.5, 1.0))
  pointsArray.push(vec4(2.5, -2.5, 2.5, 1.0))

  vBuffer = gl.createBuffer()

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW)

  let vPosition = gl.getAttribLocation(program, "vPosition")
  gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vPosition)

  let tBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW)

  let vTexCoord = gl.getAttribLocation(program, "vTexCoord")
  gl.vertexAttribPointer(vTexCoord, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vTexCoord)


  thetaLoc = gl.getUniformLocation(program, "theta")

  initNodes()

  let playButton = document.getElementById("play-button")
  let pauseButton = document.getElementById("pause-button")
  playButton.onclick = (e) => {
    playing = true
    playButton.style.display = "none"
    pauseButton.style.display = "block"
    audio.play()
  }

  pauseButton.onclick = (e) => {
    playing = false
    pauseButton.style.display = "none"
    playButton.style.display = "block"
    audio.pause()
  }


  document.getElementById("gl-canvas").onmousedown = (event) => {
    if (event.button == 0 && !mouse.leftDown) {
      mouse.leftDown = true
      mouse.prevX = event.clientX
      mouse.prevY = event.clientY
    }
    else if (event.button == 2 && !mouse.rightDown) {
      mouse.rightDown = true
      mouse.prevX = event.clientX
      mouse.prevY = event.clientY
    }
  }

  document.getElementById("gl-canvas").onmouseup = (event) => {
    if (event.button == 0) {
      mouse.leftDown = false
    } else if (event.button == 2) {
      mouse.rightDown = false
    }
  }

  document.getElementById("gl-canvas").onmouseleave = () => {
    mouse.leftDown = false
    mouse.rightDown = false
  }

  document.getElementById("gl-canvas").onmousemove = (event) => {
    if (mouse.leftDown || mouse.rightDown) {

      let currentX = event.clientX
      let currentY = event.clientY

      let deltaX = event.clientX - mouse.prevX
      let deltaY = event.clientY - mouse.prevY

      if (mouse.leftDown) {
        if (up[1] > 0) {
          theta -= 0.01 * deltaX
          phi -= 0.01 * deltaY
        } else {
          theta += 0.01 * deltaX
          phi -= 0.01 * deltaY
        }

        let twoPi = 6.28318530718
        if (theta > twoPi) {
          theta -= twoPi
        } else if (theta < 0) {
          theta += twoPi
        }

        if (phi > twoPi) {
          phi -= twoPi
        } else if (phi < 0) {
          phi += twoPi
        }
      } else if (mouse.rightDown) {
        radius -= 0.01 * deltaX
        radius = Math.max(0.1, radius)
      }

      let r = radius * Math.sin(phi + piOver2)

      eye = vec3(
        r * Math.cos(theta + piOver2),
        radius * Math.cos(phi + piOver2),
        r * Math.sin(theta + piOver2)
      )

      for (k = 0; k < 3; k++)
        eye[k] = eye[k] + at[k]

      if (phi < piOver2 || phi > threePiOver2) {
        up = vec3(0.0, -1.0, 0.0)
      }
      else {
        up = vec3(0.0, 1.0, 0.0)
      }

      mouse.prevX = currentX
      mouse.prevY = currentY
    }
  }

  initNodes()

  travolta_face_texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, travolta_face_texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
    gl.RGB, gl.UNSIGNED_BYTE, travolta_face_image)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.uniform1i(gl.getUniformLocation(program, "texture"), 0)

  travolta_tux_texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, travolta_tux_texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
    gl.RGB, gl.UNSIGNED_BYTE, travolta_tux_image)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.uniform1i(gl.getUniformLocation(program, "texture"), 0)

  tachometer_texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, tachometer_texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
    gl.RGB, gl.UNSIGNED_BYTE, tachometer_image)
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
    gl.NEAREST_MIPMAP_LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.uniform1i(gl.getUniformLocation(program, "texture"), 0)

  render()
}

let t = 0

let danceKeyframes = [
  [45, 0, 230, 0, 180, -60, 150, 90, 120, 60, 5.0, 1.0, 2.0, 1.5, 0.6, 0.5, 0.6, 0.5, 2.0, 3.0, 1.5, 0.8],
  [45, 0, 180, -60, 230, 0, 120, 60, 150, 90, 5.0, 1.0, 2.0, 1.5, 0.6, 0.5, 0.6, 0.5, 2.0, 3.0, 2, 0.8],

]

let danceFrame = 0
let stepsBetweenFrames = 10
let step_i = 0

let lastTime = 0
let currentTime

let fps

let songSPB = 1 / 2.6166666666666667
let timer = 0


const render = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  modelViewMatrix = lookAt(eye, at, up)

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix))
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))

  if (playing) {
    step_i = (step_i + 1) % stepsBetweenFrames
    if (timer >= songSPB / 2) {
      danceFrame = (danceFrame + 1) % danceKeyframes.length
      timer = 0
    }
  }

  figureTheta = [
    figureTheta[0] + (danceKeyframes[danceFrame][0] - figureTheta[0]) / stepsBetweenFrames,
    figureTheta[1] + (danceKeyframes[danceFrame][1] - figureTheta[1]) / stepsBetweenFrames,
    figureTheta[2] + (danceKeyframes[danceFrame][2] - figureTheta[2]) / stepsBetweenFrames,
    figureTheta[3] + (danceKeyframes[danceFrame][3] - figureTheta[3]) / stepsBetweenFrames,
    figureTheta[4] + (danceKeyframes[danceFrame][4] - figureTheta[4]) / stepsBetweenFrames,
    figureTheta[5] + (danceKeyframes[danceFrame][5] - figureTheta[5]) / stepsBetweenFrames,
    figureTheta[6] + (danceKeyframes[danceFrame][6] - figureTheta[6]) / stepsBetweenFrames,
    figureTheta[7] + (danceKeyframes[danceFrame][7] - figureTheta[7]) / stepsBetweenFrames,
    figureTheta[8] + (danceKeyframes[danceFrame][8] - figureTheta[8]) / stepsBetweenFrames,
    figureTheta[9] + (danceKeyframes[danceFrame][9] - figureTheta[9]) / stepsBetweenFrames,
    figureTheta[10] + (danceKeyframes[danceFrame][10] - figureTheta[10]) / stepsBetweenFrames,
    figureTheta[11] + (danceKeyframes[danceFrame][11] - figureTheta[11]) / stepsBetweenFrames,
    figureTheta[12] + (danceKeyframes[danceFrame][12] - figureTheta[12]) / stepsBetweenFrames,
    figureTheta[13] + (danceKeyframes[danceFrame][13] - figureTheta[13]) / stepsBetweenFrames,
    figureTheta[14] + (danceKeyframes[danceFrame][14] - figureTheta[14]) / stepsBetweenFrames,
    figureTheta[15] + (danceKeyframes[danceFrame][15] - figureTheta[15]) / stepsBetweenFrames,
    figureTheta[16] + (danceKeyframes[danceFrame][16] - figureTheta[16]) / stepsBetweenFrames,
    figureTheta[17] + (danceKeyframes[danceFrame][17] - figureTheta[17]) / stepsBetweenFrames,
    figureTheta[18] + (danceKeyframes[danceFrame][18] - figureTheta[18]) / stepsBetweenFrames,
    figureTheta[19] + (danceKeyframes[danceFrame][19] - figureTheta[19]) / stepsBetweenFrames,
    figureTheta[20] + (danceKeyframes[danceFrame][20] - figureTheta[20]) / stepsBetweenFrames,
    figureTheta[21] + (danceKeyframes[danceFrame][21] - figureTheta[21]) / stepsBetweenFrames,
  ]

  traverse(torsoId)
  initNodes()

  gl.bindTexture(gl.TEXTURE_2D, tachometer_texture)
  instanceMatrix = mult(modelViewMatrix, translate(0.0, -3.6, 0.0))
  instanceMatrix = mult(instanceMatrix, scale4(40, 0.2, 40))
  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(instanceMatrix))
  gl.uniform4fv(colorLoc, flatten(vec4(1.0, 1.0, 1.0, 1.0)))
  for (let i = 0; i < 6; i++) gl.drawArrays(gl.TRIANGLE_FAN, 4 * i, 4)

  gl.drawArrays(gl.TRIANGLES, 0, 24)

  window.requestAnimFrame(render)

  currentTime = performance.now()
  fps = Math.round(1 / ((currentTime - lastTime) / 1000))
  // console.log(fps)
  timer += (currentTime - lastTime) / 1000
  lastTime = performance.now()
}

travolta_tux_image.onload = () => {
  init()

  let r = radius * Math.sin(phi + piOver2)

  eye = vec3(
    r * Math.cos(theta + piOver2),
    radius * Math.cos(phi + piOver2),
    r * Math.sin(theta + piOver2)
  )
}