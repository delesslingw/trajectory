/**
 * @param {import('p5')} p
 */
function createSun(p) {
    let fill = p.color(252, 3, 65);
    // const stroke = p.color(255, 110, 150);
    const radius = 400;
    // const location = p.createVector(0, -450, -1000);
    const direction = 1;
    const scale = 1;
    const gSize = radius * 2.4;
    const sphereGraphic = createSphereGraphic(createGraphic(p.WEBGL));
    const blurGraphic = createBlurGraphic(createGraphic());
    // const tintGraphic = createGraphic();
    const barGraphic = createBarGraphic(createGraphic(p.WEBGL));
    /**
     * @param {import('p5')} g
     */
    function createSphereGraphic(g) {
        g.clear();
        g.stroke(230);
        g.fill(255);
        g.sphere(radius, 24, 24);
        return g;
    }
    function createBarGraphic(g) {
        g.clear();
        let boxSize = 5;
        let scrollOffset = (p.frameCount * 0.5) % (boxSize * 4); // scroll speed
        for (let i = -radius + 10; i < radius + 50; i += boxSize * 4) {
            g.push();
            let offset = -(i + scrollOffset) * direction;
            g.translate(0, offset || i, radius / 5);
            g.noStroke();
            g.fill(0);
            g.box(gSize, boxSize);
            g.pop();
        }
        return g;
    }
    function createBlurGraphic(g) {
        g.image(sphereGraphic, 0, 0);
        g.filter(g.BLUR, 10);
        return g;
    }
    function createGraphic(mode) {
        if (mode === p.WEBGL) {
            return p.createGraphics(gSize, gSize, mode);
        } else {
            return p.createGraphics(gSize, gSize);
        }
    }
    function update() {
        p.colorMode(p.HSB, 360, 100, 100);
        let hue = (p.frameCount * 1) % 360;
        fill = p.color(hue, 255, 255);
        p.colorMode(p.RGB);
        createBarGraphic(barGraphic);
    }
    function draw() {
        p.push();
        p.scale(scale);
        p.translate(0, 0, -800);
        p.imageMode(p.CENTER);
        p.tint(fill);
        p.push();
        p.image(sphereGraphic, 0, 0);
        p.pop();
        p.push();
        p.image(barGraphic, 0, 0);
        p.pop();
        p.push();
        p.tint(255, 100);
        p.image(blurGraphic, 0, 0);
        p.pop;
        p.pop();
    }
    return {
        draw,
        update,
    };
}

export default createSun;
