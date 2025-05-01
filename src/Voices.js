// Voices.ts
import * as Tone from "tone";

export default class Voices {
    constructor(output) {
        this.output = output;
        this.players = new Map();

        // preload audio files
        this.load("voice1", "/trajectory/audio/Spirits_Get_Eaten.mp3");
        // this.load("voice2", "/audio/voice2.mp3");
    }

    load(name, url) {
        const player = new Tone.Player({
            url,
            autostart: false,
            onload: () => console.log(`${name} loaded.`),
        }).connect(this.output);

        this.players.set(name, player);
    }

    play(name) {
        const player = this.players.get(name);
        if (!player) {
            console.warn(`Voice "${name}" not found.`);
            return;
        }

        // Start audio context if needed
        Tone.start().then(() => {
            player.start();
        });
    }

    stop(name) {
        const player = this.players.get(name);
        if (player?.state === "started") {
            player.stop();
        }
    }
}
