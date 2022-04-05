// Thomas Huber

const addTriangle = (a, b, c) => {
    normals.push(a)
    normals.push(b)
    normals.push(c)

    points.push(a)
    points.push(b)
    points.push(c)

    index += 3
}

const divideTriangle = (a, b, c, count) => {
    if (count > 0) {

        let ab = normalize(mix(a, b, 0.5), false)
        let ac = normalize(mix(a, c, 0.5), false)
        let bc = normalize(mix(b, c, 0.5), false)

        divideTriangle(a, ab, ac, count - 1)
        divideTriangle(ab, b, bc, count - 1)
        divideTriangle(bc, c, ac, count - 1)
        divideTriangle(ab, bc, ac, count - 1)
    }
    else {
        addTriangle(a, b, c)
    }
}

const addTetrahedron = (a, b, c, d, n) => {
    divideTriangle(a, b, c, n)
    divideTriangle(d, c, b, n)
    divideTriangle(a, d, b, n)
    divideTriangle(a, c, d, n)
}

const squareWave = (x, radius) => {
    x += 0.25
    const limit = 100
    let sum = 0
    for (let n = 1; n < limit; n++) {
        sum += (Math.sin(2 * Math.PI * (2 * n - 1) * radius * x * 2)) / (2 * n - 1)
    }
    return ((4 / Math.PI) * sum) / 5 + radius
}

const cylinderFunction = (x, radius) => {
    return radius
}

const sinFunction = (x, radius) => {
    return radius * Math.sin(3 * x)
}

createShapeFromFunction = (fn, radius, height, zRes, thetaRes, cx, cy, cz) => {
    let inner = true // true for inner, false for outer

    let min = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]
    let max = [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]

    let pointA, pointB, pointC

    // add points in z-direction
    for (let z = -height / 2; z < height / 2; z += zRes) {
        for (let theta = 0; theta < 2 * Math.PI; theta += thetaRes) {
            if (inner) {
                pointA = [ // bottom left
                    Math.cos(theta) * fn(z, radius) + cx,
                    z + cz,
                    Math.sin(theta) * fn(z, radius) + cy,

                ]
                pointB = [ // bottom right
                    Math.cos(theta + thetaRes) * fn(z, radius) + cx,
                    z + cz,
                    Math.sin(theta + thetaRes) * fn(z, radius) + cy,

                ]
                pointC = [ // top
                    Math.cos((theta + thetaRes / 2)) * fn(z + zRes * 2, radius) + cx,
                    z + zRes * 2 + cz,
                    Math.sin((theta + thetaRes / 2)) * fn(z + zRes * 2, radius) + cy,
                ]

            } else {
                // upside down (aka inner) triangle
                pointA = [ // bottom
                    Math.cos((theta + thetaRes / 2 + (thetaRes / 2))) * fn(z - zRes, radius) + cx,
                    z - zRes + cz,
                    Math.sin((theta + thetaRes / 2 + (thetaRes / 2))) * fn(z - zRes, radius) + cy,
                ]
                pointB = [ // top left
                    Math.cos(theta + thetaRes / 2) * fn(z + zRes, radius) + cx,
                    z + zRes + cz,
                    Math.sin(theta + thetaRes / 2) * fn(z + zRes, radius) + cy,

                ]
                pointC = [ // top right
                    Math.cos((theta + thetaRes / 2 + thetaRes)) * fn(z + zRes, radius) + cx,
                    z + zRes + cz,
                    Math.sin((theta + thetaRes / 2 + thetaRes)) * fn(z + zRes, radius) + cy,
                ]
            }
            // find bounding box
            if (pointA[0] < min[0]) min[0] = pointA[0]
            if (pointA[1] < min[1]) min[1] = pointA[1]
            if (pointA[2] < min[2]) min[2] = pointA[2]
            if (pointA[0] > max[0]) max[0] = pointA[0]
            if (pointA[1] > max[1]) max[1] = pointA[1]
            if (pointA[2] > max[2]) max[2] = pointA[2]

            if (pointB[0] < min[0]) min[0] = pointB[0]
            if (pointB[1] < min[1]) min[1] = pointB[1]
            if (pointB[2] < min[2]) min[2] = pointB[2]
            if (pointB[0] > max[0]) max[0] = pointB[0]
            if (pointB[1] > max[1]) max[1] = pointB[1]
            if (pointB[2] > max[2]) max[2] = pointB[2]

            if (pointC[0] < min[0]) min[0] = pointC[0]
            if (pointC[1] < min[1]) min[1] = pointC[1]
            if (pointC[2] < min[2]) min[2] = pointC[2]
            if (pointC[0] > max[0]) max[0] = pointC[0]
            if (pointC[1] > max[1]) max[1] = pointC[1]
            if (pointC[2] > max[2]) max[2] = pointC[2]

            // add points
            addTriangle(
                pointA,
                pointB,
                pointC
            )
        }
        inner = !inner
    }
    console.log("Minmax Bounding Box Dimensions (x, y, z): ", [max[0] - min[0], max[1] - min[1], max[2] - min[2]])
}