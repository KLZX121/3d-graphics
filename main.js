const g = document.getElementById.bind(document);

class Point {
    x = 0;
    y = 0;
    z = 0;

    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

class Shape {
    // index of shape in shapes array
    index = 0;
    // true coordinates of points
    points = [];
    // pairs of point index pairings
    lines = [];

    constructor(index) {
        this.index = index;
    }
}

class Camera {
    position = new Point();
    // fov in degrees
    fov = 120;

    constructor(position = null) {
        if (position) {
            this.position = position;
        }
    }
}

class DrawingCanvas {
    camera = new Camera();
    size = {
        width: 1500,
        height: 800
    }
    shapes = [];
    pointSize = 5;

    constructor(canvas, size = null) {
        this.canvas = canvas;

        if (size) {
            this.size = size;
        }
        this.canvas.width = this.size.width;
        this.canvas.height = this.size.height;

        this.ctx = this.canvas.getContext('2d');
    }

    // style functions
    setStrokeStyle({colour = '#000', lineWidth = 1}) {
        this.ctx.strokeStyle = colour;
        this.ctx.lineWdith = lineWidth;
    }
    setFillStyle({colour = '#000'}) {
        this.ctx.fillStyle = colour;
    }

    // clearing functions
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // rendering functions
    drawPoints(points) {
        points.forEach(point => {
            this.ctx.fillRect(this.convertCoord(point.x, 'x') - this.pointSize / 2, this.convertCoord(point.y, 'y') - this.pointSize / 2, this.pointSize, this.pointSize);
        });
    }
    drawLine(pointOne, pointTwo) {
        this.ctx.beginPath();
        this.ctx.moveTo(this.convertCoord(pointOne.x, 'x'), this.convertCoord(pointOne.y, 'y'));
        this.ctx.lineTo(this.convertCoord(pointTwo.x, 'x'), this.convertCoord(pointTwo.y, 'y'));
        this.ctx.stroke();
    }
    renderShapes() {
        this.shapes.forEach(shape => {
            // translate 3d to 2d
            let images = this.convertPoints(shape.points);
            
            // draw points
            this.drawPoints(images);

            // draw lines
            shape.lines.forEach(pair => {
                this.drawLine(images[pair[0]], images[pair[1]]);
            })
        }) 
    }

    // converts point coordinates to canvas coordinates
    convertCoord(value, axis) {
        switch (axis) {
            case 'x':
                return value + this.canvas.width / 2;
            case 'y':
                return this.canvas.height / 2 - value;
        }
    }
    // converts 3d points to 2d canvas
    convertPoints(points) {
        let images = [];
        points.forEach(point => {
            let image = new Point();
            const screenWidth = this.canvas.width;
            const screenHeight = this.canvas.height;

            image.x = screenWidth * point.x / (screenWidth + 2 * point.z * Math.tan(this.camera.fov * (Math.PI / 180) / 2));
            image.y = screenHeight * point.y / (screenHeight + 2 * point.z * Math.tan(this.camera.fov * (Math.PI / 180) / 2));

            images.push(image);
        })
        return images;
    }

    // shape generators
    // centered boolean sets if startPoint is centre of cube or one point (lowest x,y,z vertex)
    cube(startPoint, sideLength, centered = false) {
        let newCube = new Shape(this.shapes.length);

        // set points
        if (centered) {
            startPoint.x = startPoint.x - sideLength/2;
            startPoint.y = startPoint.y - sideLength/2;
            startPoint.z = startPoint.z - sideLength/2;
        }

        for (let i = 0; i < 4; i++) {
            let x = startPoint.x + (i % 2) * sideLength;
            let y = startPoint.y + Math.floor(i / 2) * sideLength;
            let newPoint = new Point(x, y, startPoint.z);
            newCube.points.push(newPoint);
        }
        for (let i = 0; i < 4; i++) {
            let oldPoint = newCube.points[i];
            let newPoint = new Point(oldPoint.x, oldPoint.y, oldPoint.z + sideLength);
            newCube.points.push(newPoint);
        }
        // set lines
        for (let i = 0; i <= 6; i += Math.ceil((6 - i) / 2)) {
            for (let j = 0; j < 3; j++) {
                let pairing = 0;
                switch (j) {
                    case 0:
                        pairing = 1 + (i==6);
                        break;
                    case 1:
                        pairing = 2 + 2 * (i >= 5);
                        break;
                    case 2:
                        pairing = 4 + 3 * (i >= 3);
                        break;
                }
                newCube.lines.push([i, pairing])         
            }

            if (i == 6) break;
        }

        this.shapes.push(newCube);
        return newCube;
    }
}

const mainCanvas = g('mainCanvas');

let canv = new DrawingCanvas(mainCanvas);

canv.cube(new Point(), 100, true);
canv.cube(new Point(-150, -100), 20, true);
canv.cube(new Point(0, 125), 50, true);
canv.cube(new Point(150, 50), 100, true);
canv.cube(new Point(-200), 100, true);
canv.cube(new Point(300, -200, 500), 120, true);
canv.cube(new Point(-200), 100, true);
canv.cube(new Point(0, -150, -10), 50, true);



canv.renderShapes();

