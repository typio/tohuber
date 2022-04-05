// Thomas Huber HW3

let canvas
let gl
let program

let index = 0

let points = []
let normals = []

let mouse = {
  prevX: 0,
  prevY: 0,

  leftDown: false,
  rightDown: false,
}

let radius = 5.0
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

let lightPosition = vec4(20.0, 20.0, 20.0, 1.0)

let lightAmbient = vec4(0.6, 0.6, 0.6, 1.0)
let lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0)
let lightSpecular = vec4(0.0, 0.0, 1.0, 1.0)

let animateLight = true

const material_emerald = {
  ambient: vec4(0x50 / 0xFF, 0xc8 / 0xFF, 0x78 / 0xFF, 1.0),
  diffuse: vec4(0x50 / 0xFF, 0xc8 / 0xFF, 0x78 / 0xFF, 1.0),
  specular: vec4(1, 1, 1, 1.0),
  shininess: 50.0,
}

const material_gold = {
  ambient: vec4(0xFF / 0xFF, 0xD7 / 0xFF, 0x00 / 0xFF, 1.0),
  diffuse: vec4(0xFF / 0xFF, 0xD7 / 0xFF, 0x00 / 0xFF, 1.0),
  specular: vec4(1, 1, 1, 1.0),
  shininess: 100.0,
}

const material_paper = {
  ambient: vec4(0xFB / 0xFF, 0xFB / 0xFF, 0xF8 / 0xFF, 1.0),
  diffuse: vec4(0xFB / 0xFF, 0xFB / 0xFF, 0xF8 / 0xFF, 1.0),
  specular: vec4(1, 1, 1, 1.0),
  shininess: 5,
}

let materialAmbient = vec4(0.0, 0.0, 0.0, 1.0)
let materialDiffuse = vec4(0.0, 0.0, 0.0, 1.0)
let materialSpecular = vec4(0.0, 0.0, 0.0, 1.0)
let materialShininess = 1.0

const setMaterial = (mat) => {
  materialAmbient = mat.ambient
  materialDiffuse = mat.diffuse
  materialSpecular = mat.specular
  materialShininess = mat.shininess
}

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

console.log("Eye:", eye)
console.log("At:", at)
console.log("Up:", up)
console.log("Perspective:", fov, 1, near, far)
console.log("Light Position:", lightPosition)

const updateLighting = () => {
  ambientProduct = mult(lightAmbient, materialAmbient)
  diffuseProduct = mult(lightDiffuse, materialDiffuse)
  specularProduct = mult(lightSpecular, materialSpecular)

  points = points.slice(0, -3)
  normals = normals.slice(0, -3)

  points.push(lightPosition[0])
  points.push(lightPosition[1])
  points.push(lightPosition[2])

  normals.push(1.0)
  normals.push(0.0)
  normals.push(0.0)

  gl.uniform4fv(gl.getUniformLocation(program,
    "ambientProduct"), flatten(ambientProduct))
  gl.uniform4fv(gl.getUniformLocation(program,
    "diffuseProduct"), flatten(diffuseProduct))
  gl.uniform4fv(gl.getUniformLocation(program,
    "specularProduct"), flatten(specularProduct))
  gl.uniform4fv(gl.getUniformLocation(program,
    "lightPosition"), flatten(lightPosition))
  gl.uniform1f(gl.getUniformLocation(program,
    "shininess"), materialShininess)
}

const hexColorToVec4 = (hex) => {
  hex = parseInt(hex.substring(1), 16)
  let r = (hex >> 16) & 0xFF
  let g = (hex >> 8) & 0xFF
  let b = hex & 0xFF
  return vec4(r / 255.0, g / 255.0, b / 255.0, 1.0)
}

const vec4ToHexColor = (vec) => {
  let r = Math.floor(vec[0] * 255).toString(16)
  let g = Math.floor(vec[1] * 255).toString(16)
  let b = Math.floor(vec[2] * 255).toString(16)
  return "#" + r + g + b
}

const init = () => {
  canvas = document.getElementById("gl-canvas")

  gl = WebGLUtils.setupWebGL(canvas)
  if (!gl) { alert("WebGL isn't available") }

  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.clearColor(0, 0, 0, 0.0)

  gl.enable(gl.DEPTH_TEST)

  //
  //  Load shaders and initialize attribute buffers
  //
  program = initShaders(gl, "vertex-shader", "fragment-shader")
  gl.useProgram(program)

  setMaterial(material_emerald)

  createShapeFromFunction(cylinderFunction, 0.5, 3, 0.01, ((2 * Math.PI) / 360 * 5), 1, 0, 0)

  createShapeFromFunction(squareWave, 0.5, 3, 0.01, ((2 * Math.PI) / 360 * 10), -1, 0, 0)

  points.push(lightPosition[0])
  points.push(lightPosition[1])
  points.push(lightPosition[2])

  normals.push(1.0)
  normals.push(0.0)
  normals.push(0.0)

  let nBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW)

  let vNormal = gl.getAttribLocation(program, "vNormal")
  gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vNormal)

  let vBuffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW)

  let vPosition = gl.getAttribLocation(program, "vPosition")
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(vPosition)

  modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix")
  projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix")

  updateLighting()

  let shininessSelect = document.getElementById("shininess-select")
  shininessSelect.value = materialShininess
  shininessSelect.onchange = (e) => {
    materialShininess = parseFloat(shininessSelect.value)
    updateLighting()
  }

  let materialSelect = document.getElementById("material-select")
  materialSelect.value = "emerald"
  materialSelect.onchange = (e) => {
    console.log(materialSelect.value)
    switch (materialSelect.value) {
      case "emerald":
        setMaterial(material_emerald)
        break
      case "gold":
        setMaterial(material_gold)
        break
      case "paper":
        setMaterial(material_paper)
        break
      default:
        break
    }
    shininessSelect.value = materialShininess
    updateLighting()
  }

  let fovValue = document.getElementById("fov-value")
  let fovSlider = document.getElementById("fov-slider")
  fovSlider.value = fov
  fovSlider.onmousemove = (e) => {
    fov = parseFloat(fovSlider.value)
    fovValue.innerHTML = fov + "°"
  }

  let ambientColorSelect = document.getElementById("ambient-color")
  ambientColorSelect.value = "#999999"
  let diffuseColorSelect = document.getElementById("diffuse-color")
  diffuseColorSelect.value = "#ffffff"
  let specularColorSelect = document.getElementById("specular-color")
  specularColorSelect.value = "#0000ff"
  ambientColorSelect.onchange = (e) => {
    lightAmbient = hexColorToVec4(ambientColorSelect.value)
    updateLighting()
  }
  diffuseColorSelect.onchange = (e) => {
    lightDiffuse = hexColorToVec4(diffuseColorSelect.value)
    updateLighting()
  }
  specularColorSelect.onchange = (e) => {
    lightSpecular = hexColorToVec4(specularColorSelect.value)
    updateLighting()
  }

  let moveLightToEyeButton = document.getElementById("move-light-to-eye")
  moveLightToEyeButton.onclick = (e) => {
    lightPosition = vec4(eye[0], eye[1], eye[2], 1.0)
    updateLighting()
  }

  let sorSelect = document.getElementById("sor-select")
  sorSelect.value = "line-square"
  sorSelect.onchange = (e) => {
    points = []
    normals = []
    index = 0
    switch (sorSelect.value) {
      case "line-square":
        createShapeFromFunction(cylinderFunction, 0.5, 3, 0.01, ((2 * Math.PI) / 360 * 5), 1, 0, 0)

        createShapeFromFunction(squareWave, 0.5, 3.4, 0.01, ((2 * Math.PI) / 360 * 10), -1, 0, 0)
        break
      case "line":
        createShapeFromFunction(cylinderFunction, 0.5, 3, 0.01, ((2 * Math.PI) / 360 * 5), 0, 0, 0)
        break
      case "square-wave":
        createShapeFromFunction(squareWave, 0.5, 3.4, 0.01, ((2 * Math.PI) / 360 * 10), 0, 0, 0)
        break
      case "sine":
        createShapeFromFunction(sinFunction, 0.5, 3.4, 0.01, ((2 * Math.PI) / 360 * 10), 0, 0, 0)
        break
    }

    points.push(lightPosition[0])
    points.push(lightPosition[1])
    points.push(lightPosition[2])

    normals.push(1.0)
    normals.push(0.0)
    normals.push(0.0)

    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW)

    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vNormal)

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW)

    gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(vPosition)
  }

  let animateLightButton = document.getElementById("animate-light")
  animateLightButton.onclick = (e) => {
    animateLight = !animateLight
    if (animateLight) {
      animateLightButton.innerHTML = "Stop Light"
    } else {
      animateLightButton.innerHTML = "Animate Light"
    }
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
        up = vec3(0.0, 1.0, 0.0)
      }
      else {
        up = vec3(0.0, -1.0, 0.0)
      }

      mouse.prevX = currentX
      mouse.prevY = currentY
    }
  }

  render()
}

let t = 0

const render = () => {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  modelViewMatrix = lookAt(eye, at, up)
  projectionMatrix = perspective(fov, 1, near, far)

  if (animateLight) {
    t += Math.PI / 180 * 1
    lightPosition[0] = Math.cos(t) * 20
    lightPosition[1] = 0
    lightPosition[2] = Math.sin(t) * 20
    updateLighting()
  }

  gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix))
  gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix))

  gl.uniform1i(gl.getUniformLocation(program, "colorFlag"), 1)

  for (let i = 0; i < index; i += 3)
    gl.drawArrays(gl.TRIANGLES, i, 3)

  gl.uniform1i(gl.getUniformLocation(program, "colorFlag"), 0)
  gl.drawArrays(gl.POINTS, index, 1)

  window.requestAnimFrame(render)
}

init()