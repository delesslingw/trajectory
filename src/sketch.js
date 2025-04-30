/**
 * @param {import('p5')} p
 */
const sketch = (p) => {
    let scl = 30,
        terrain,
        sun;
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        terrain = new Terrain(p.windowWidth, p.windowHeight);
        sun = new Sun();
        p.pixelDensity(1);
        p.frameRate(20);
    };
    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };

    p.draw = () => {
        p.background(0);
        p.translate(15, 0, 0);
        terrain.update();
        terrain.draw();
        sun.update();
        sun.draw();
    };
    class Sun {
        constructor() {
            this.fill = p.color(252, 3, 65);
            this.stroke = p.color(255, 110, 150);
            this.radius = p.width * 0.4;
            this.location = p.createVector(0, -450, -1000);
            this.gSize = this.radius * 2.4;
            this.sphereGraphic = this.createSphereGraphic(this.createGraphic(p.WEBGL));
            this.blurGraphic = this.createBlurGraphic(this.createGraphic());
            this.tintGraphic = this.createGraphic();
            this.barGraphic = this.createBarGraphic(this.createGraphic(p.WEBGL));
            this.direction = 1;
            this.scale = 1;
        }
        createSphereGraphic(g) {
            g.clear();
            g.stroke(230);
            g.fill(255);
            g.sphere(this.radius, 20);
            return g;
        }
        createBarGraphic(g) {
            g.clear();
            let boxSize = 3;
            let scrollOffset = (p.frameCount * 0.5) % (boxSize * 4); // scroll speed
            for (let i = -this.radius + 10; i < this.radius + 50; i += boxSize * 4) {
                g.push();
                let offset = -(i + scrollOffset) * this.direction;
                g.translate(0, offset || i, this.radius / 5);
                g.noStroke();
                g.fill(0);
                g.box(this.gSize, boxSize);
                g.pop();
            }
            return g;
        }
        createBlurGraphic(g) {
            g.image(this.sphereGraphic, 0, 0);
            g.filter(g.BLUR, 10);
            return g;
        }
        createGraphic(mode) {
            if (mode === p.WEBGL) {
                return p.createGraphics(this.gSize, this.gSize, mode);
            } else {
                return p.createGraphics(this.gSize, this.gSize);
            }
        }
        update() {
            p.colorMode(p.HSB, 360, 100, 100);
            let hue = (p.frameCount * 1) % 360;
            this.fill = p.color(hue, 255, 255);
            p.colorMode(p.RGB);
            this.createBarGraphic(this.barGraphic);
        }
        draw() {
            p.push();
            p.scale(this.scale);
            p.translate(0, 0, -800);
            p.imageMode(p.CENTER);
            p.tint(this.fill);
            p.push();
            p.image(this.sphereGraphic, 0, 0);
            p.pop();
            p.push();
            p.image(this.barGraphic, 0, 0);
            p.pop();
            p.push();
            p.tint(255, 100);
            p.image(this.blurGraphic, 0, 0);
            p.pop;
            p.pop();
        }
    }
    class Terrain {
        constructor() {
            this.flying = 0;
            this.terrain = [];
            this.width = p.width * 2;
            this.height = p.height * 2;
            this.cols = Math.floor(this.width / scl) + 1;
            this.rows = Math.floor(this.height / scl) + 2;
            this.stroke = p.color(150, 0, 255);
            this.fill = p.color(0, 150, 255);
            this.viewAngle = 85;
            this.setAltitudes(-200, 500);
            for (var x = 0; x < this.cols; x++) {
                this.terrain[x] = [];
                for (var y = 0; y < this.rows; y++) {
                    this.terrain[x][y] = 0; //specify a default value for now
                }
            }
        }
        update() {
            this.flying -= 0.05;
            var yoff = this.flying;
            for (var y = 0; y < this.rows; y++) {
                var xoff = 0;
                for (var x = 0; x < this.cols; x++) {
                    let center = this.cols / 2;
                    let distanceFromMiddle = p.abs(x - center);
                    let maxDistance = center;
                    let heightMultiplier = distanceFromMiddle / maxDistance;
                    if (heightMultiplier > 20) {
                        heightMultiplier = 1;
                    }
                    this.terrain[x][y] =
                        p.map(p.noise(xoff, yoff), 0, 1, this.lowAltitude, this.highAltitude) * heightMultiplier;
                    xoff += 0.05;
                }
                yoff += 0.05;
            }
        }
        setAltitudes(low, high) {
            this.lowAltitude = low;
            this.highAltitude = high;
        }
        draw() {
            p.push();
            p.rotateX(p.radians(this.viewAngle));
            p.fill(this.fill);
            p.stroke(this.stroke);
            // let zOffset = p.height * 0.000001;
            let zOffset = -150;

            p.translate(-(this.width / 2 + scl / 2), -this.height / 2);
            p.translate(0, 50, zOffset);
            for (let y = 0; y < this.rows; y++) {
                p.beginShape(p.TRIANGLE_STRIP);
                for (let x = 0; x < this.cols; x++) {
                    p.vertex(x * scl, y * scl, this.terrain[x][y]);
                    p.vertex(x * scl, (y + 1) * scl, this.terrain[x][y + 1]);
                }
                p.endShape();
            }
            p.pop();
        }
    }
};

export default sketch;
