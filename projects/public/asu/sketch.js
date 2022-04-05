// Djikstra's Algorithm

let citiesJSON, cities;

let numberOfCitiesSlider;
let numberOfCities = 50;

let selected1, selected2;
let lastSelected = 2;

const fontSize = 16;

function preload() {
    // JSON of 1000 largest USA cities
    let url = 'https://raw.githubusercontent.com/typio/Dijkstra/master/cities.json'
    citiesJSON = loadJSON(url);
}

function setup() {
    c = createCanvas(windowWidth, windowHeight);
    numberOfCitiesSlider = createSlider(2, 1000, 50);
    numberOfCitiesSlider.position(windowWidth * .4, windowHeight * .95);

    noStroke();
    textSize(fontSize);
    textAlign(LEFT, TOP);

    resetSketch(numberOfCities);
}

function resetSketch(num) {
    cities = [];

    numberOfCities = numberOfCitiesSlider.value();

    for (let i = 0; i < num; i++) {
        let n = citiesJSON[i].city;

        let x = mercX(citiesJSON[i].longitude);
        let y = mercY(citiesJSON[i].latitude);

        // http://en.wikipedia.org/wiki/Extreme_points_of_the_United_States
        // map x to fit screen using min and max usa coordinate values to screen size (with margins)
        x = map(x, mercX(-124.7844079), mercX(-66.9513812), width / 9, width / 1.1);
        // y version of ^
        y = map(y, mercY(24.7433195), mercY(49.3457868), height / 1.1, height / 9);

        let r = map(citiesJSON[i].population, 36877, 8405837, 2.5, 10);
        cities.push({
            n,
            x,
            y,
            r
        })
    }
}

// isn't run if browser is maximized but putting resetSketch() in draw() would be too intrusive
window.onresize = function () {
    c.size(windowWidth, windowHeight);
    resetSketch(numberOfCitiesSlider.value());
};

function draw() {
    // clear screen
    background(242, 243, 244)

    // text explaining slider
    fill(0);
    text('change number of cities (' + numberOfCitiesSlider.value() + ') from 2 to 1000', numberOfCitiesSlider.x + numberOfCitiesSlider.width + 15, numberOfCitiesSlider.y - 28);

    // draw cities
    fill(255, 34, 51);
    for (let i = 0; i < numberOfCities; i++) {
        ellipse(cities[i].x, cities[i].y, cities[i].r);
    }

    // draw line connecting cities
    if (selected1 != undefined && selected2 != undefined) {
        stroke(255, 34, 51);
        line(selected1.x, selected1.y, selected2.x, selected2.y);
        noStroke();
    }

    // text labels for selected cities
    if (lastSelected === 2) {
        drawSelected1();
        drawSelected2();
    } else {
        drawSelected2();
        drawSelected1();
    }

    if (numberOfCitiesSlider.value() != numberOfCities) {
        resetSketch(numberOfCitiesSlider.value());
    }
}

// these are in functions so they can be arranged such that the most recently changed is drawn on top without writing the same code 2x in draw()
function drawSelected1() {
    if (selected1 != undefined) {
        let w = textWidth(selected1.n);
        let x = selected1.x + 10
        let y = selected1.y - fontSize / 2
        fill(0);
        rect(x - 2, y - 2, w + 4, fontSize + 4);
        fill(255);
        text(selected1.n, x, y);
    }
}

function drawSelected2() {
    if (selected2 != undefined) {
        let w = textWidth(selected2.n);
        let x = selected2.x + 10
        let y = selected2.y - fontSize / 2
        fill(0);
        rect(x - 2, y - 2, w + 4, fontSize + 4);
        fill(255);
        text(selected2.n, x, y);
    }
}

// functionality for selecting cities
function mousePressed() {
    selectCity();
}

function mercX(lon) {
    lon = radians(lon);
    var a = (256 / PI) * 2 ** 1; // the 1 is zoom, totally unnecessary here because i map the values but it is part of the equation
    let b = lon + PI;
    return a * b;
}

function mercY(lat) {
    lat = radians(lat);
    let a = (256 / PI) * 2 ** 1; // here too
    let b = tan(PI / 4 + lat / 2);
    let c = PI - log(b);
    return a * c;
}

function distance(x1, x2, y1, y2) {
    // distance isn't in any regular units but that's ok bc it's consistent and is the forms the same ratios
    return sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

function selectCity() {
    let ds = [];

    for (let i = 0; i < cities.length; i++) {
        let d = distance(mouseX, cities[i].x, mouseY, cities[i].y)
        ds.push(d);
    }

    const min = Math.min(...ds)
    if (min < 20) {
        console.log(cities[ds.indexOf(min)]);

        if (lastSelected === 2) {
            if (selected2 != cities[ds.indexOf(min)]) {
                selected1 = cities[ds.indexOf(min)];
                lastSelected = 1
            }
        } else {
            if (selected1 != cities[ds.indexOf(min)]) {
                selected2 = cities[ds.indexOf(min)];
                lastSelected = 2
            }
        }
    }
}