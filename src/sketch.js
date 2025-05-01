import * as Tone from "tone";
import Music from "./Music";
import Voices from "./Voices";

/**
 * @param {import('p5')} p
 */
const sketch = (p) => {
    let scl = 30,
        terrain,
        sun,
        masterBus,
        music,
        voices;
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        masterBus = new Tone.Gain().toDestination();
        music = new Music(masterBus, p);
        terrain = new Terrain(p.windowWidth, p.windowHeight);
        sun = new Sun();
        voices = new Voices(masterBus);
        p.pixelDensity(1);
        p.frameRate(20);
        p.mousePressed = async () => {
            if (music?.mousePressed) {
                await music.mousePressed();
            } else {
                console.warn("music.mousePressed is not defined");
            }
        };
        p.keyPressed = () => {
            if (p.key === " ") {
                voices?.play("voice1");
            }
        };
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
    // ============
    // SUN
    // ============
    class Sun {
        constructor() {
            this.fill = p.color(252, 3, 65);
            this.stroke = p.color(255, 110, 150);
            this.radius = 400;
            this.location = p.createVector(0, -450, -1000);
            this.gSize = this.radius * 2.4;
            this.sphereGraphic = this.createSphereGraphic(this.createGraphic(p.WEBGL));
            this.blurGraphic = this.createBlurGraphic(this.createGraphic());
            this.tintGraphic = this.createGraphic();
            this.barGraphic = this.createBarGraphic(this.createGraphic(p.WEBGL));
            this.direction = 1;
            this.scale = 1;
        }
        /**
         * @param {import('p5')} g
         */
        createSphereGraphic(g) {
            g.clear();
            g.stroke(230);
            g.fill(255);
            g.sphere(this.radius, 24, 24);
            return g;
        }
        createBarGraphic(g) {
            g.clear();
            let boxSize = 5;
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
    // =============
    // TERRAIN
    // =============
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
            this.shiftingAltitudes = true;
            this.fadeIn = 0;
            this.setAltitudes(0, 0);
            for (let y = 0; y < this.rows; y++) {
                let row = [];
                for (let x = 0; x < this.cols; x++) {
                    row.push(0); // or initial value with noise if you want
                }
                this.terrain.push(row);
            }
            console.log(this.terrain);
        }
        update() {
            this.flying -= 0.05;
            if (this.fadeIn < 1) {
                this.fadeIn += 0.0001;
            }
            if (p.frameCount % 10 === 0) {
                let tick = (p.frameCount / 10) * 0.001;
                let min = p.lerp(p.map(p.noise(tick, 0), 0, 1, -500, 100), 0, this.fadeIn);
                let max = p.lerp(0, p.map(p.noise(tick, 1000), 0, 1, 100, 2000), this.fadeIn);
                this.setAltitudes(min, max);
            }
            this.terrain.pop();
            const newRow = [];
            let yoff = this.flying + this.rows * 0.05;
            var xoff = 0;
            for (var x = 0; x < this.cols; x++) {
                let center = this.cols / 2;
                let distanceFromMiddle = p.abs(x - center);
                let maxDistance = center;
                let heightMultiplier = distanceFromMiddle / maxDistance;
                if (heightMultiplier > 20) {
                    heightMultiplier = 1;
                }
                const h = p.map(p.noise(xoff, yoff), 0, 1, this.lowAltitude, this.highAltitude) * heightMultiplier;
                newRow.push(h);
                xoff += 0.05;
            }
            this.terrain.unshift(newRow);
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
            for (let y = 0; y < this.rows - 1; y++) {
                p.beginShape(p.TRIANGLE_STRIP);
                for (let x = 0; x < this.cols; x++) {
                    p.vertex(x * scl, y * scl, this.terrain[y][x]);
                    p.vertex(x * scl, (y + 1) * scl, this.terrain[y + 1][x]);
                }
                p.endShape();
            }
            p.pop();
        }
    }
};

export default sketch;
