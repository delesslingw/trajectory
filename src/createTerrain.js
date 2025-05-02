/**
 * @param {import('p5')} p
 */
function createTerrain(p, { scl }) {
    let flying = 0;
    let terrain = [];
    const width = p.width * 2;
    const height = p.height * 2;
    const cols = Math.floor(width / scl) + 1;
    const rows = Math.floor(height / scl) + 2;
    let stroke = p.color(150, 0, 255);
    let fill = p.color(0, 150, 255);
    let viewAngle = 85;
    // let shiftingAltitudes = true;
    let fadeIn = 0.005;
    let lowAltitude = 0;
    let highAltitude = 10;

    let yoff = flying;
    for (let y = 0; y < rows; y++) {
        const row = generateTerrainRow(yoff);
        terrain.push(row);
        yoff += 0.05;
    }
    // console.log(terrain);
    function setAltitudes(low, high) {
        lowAltitude = low;
        highAltitude = high;
    }
    function generateTerrainRow(yoff, low = lowAltitude, high = highAltitude) {
        const row = [];
        let xoff = 0;
        for (let x = 0; x < cols; x++) {
            let center = cols / 2;
            let distanceFromMiddle = p.abs(x - center);
            let maxDistance = center;
            let heightMultiplier = distanceFromMiddle / maxDistance;
            if (heightMultiplier > 20) {
                heightMultiplier = 1;
            }
            const h = p.map(p.noise(xoff, yoff), 0, 1, low, high) * heightMultiplier;
            row.push(h);
            xoff += 0.05;
        }
        return row;
    }
    function update() {
        flying -= 0.05;
        if (fadeIn < 1) {
            fadeIn += 0.001;
        }
        if (p.frameCount % 10 === 0) {
            let tick = (p.frameCount / 10) * 0.001;
            let min = p.lerp(p.map(p.noise(tick, 0), 0, 1, -500, 100), 0, fadeIn);
            let max = p.lerp(0, p.map(p.noise(tick, 1000), 0, 1, 100, 2000), fadeIn);
            setAltitudes(min, max);
        }
        terrain.pop();
        let yoff = flying + rows * 0.05;
        const newRow = generateTerrainRow(yoff);
        terrain.unshift(newRow);
    }
    function draw() {
        p.push();
        p.rotateX(p.radians(viewAngle));
        p.fill(fill);
        p.stroke(stroke);
        // let zOffset = p.height * 0.000001;
        let zOffset = -150;

        p.translate(-(width / 2 + scl / 2), -height / 2);
        p.translate(0, 50, zOffset);
        for (let y = 0; y < rows - 1; y++) {
            p.beginShape(p.TRIANGLE_STRIP);
            for (let x = 0; x < cols; x++) {
                p.vertex(x * scl, y * scl, terrain[y][x]);
                p.vertex(x * scl, (y + 1) * scl, terrain[y + 1][x]);
            }
            p.endShape();
        }
        p.pop();
    }
    return {
        setAltitudes,
        update,
        draw,
    };
}

export default createTerrain;
