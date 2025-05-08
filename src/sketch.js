import * as Tone from "tone";
import Music from "./Music";
import createVoices, { voiceFiles } from "./createVoices";
import createTerrain from "./createTerrain";
import createSun from "./createSun";

/**
 * @param {import('p5')} p
 */
const sketch = (p) => {
    let scl = 30,
        terrain,
        sun,
        masterBus,
        music,
        voices,
        isRunning = false;
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight, p.WEBGL);
        masterBus = new Tone.Gain().toDestination();
        music = new Music(masterBus, p);
        terrain = createTerrain(p, { scl });
        sun = createSun(p);
        voices = createVoices(masterBus);
        p.pixelDensity(1);
        p.frameRate(20);
        p.mousePressed = async () => {
            if (!isRunning) {
                voices.start();
                isRunning = true;
            } else {
                voices.stop();
                isRunning = false;
            }
            if (music?.mousePressed) {
                await music.mousePressed();
            } else {
                console.warn("music.mousePressed is not defined");
            }
        };
        // p.keyPressed = () => {
        //     if (p.key === " ") {
        //         voices?.play(voiceFiles.JFK_DECLARATION);
        //     }
        // };
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
        voices.draw();
    };
};

export default sketch;
