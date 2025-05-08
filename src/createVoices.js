// Voices.ts
import * as Tone from "tone";
const getPath = (filename) => `/trajectory/audio/${filename}`;
class VoiceFile {
    constructor(name, filename, props = {}) {
        this.name = name;
        this.filename = filename;
        let propKeys = Object.keys(props);
        if (propKeys.includes("cuts")) {
            this.startTimes = [];
            let prevCut = 0;
            for (let i = 0; i < props.cuts.length; i++) {
                this.startTimes.push({ start: prevCut, duration: props.cuts[i] - prevCut });
                prevCut = props.cuts[i];
            }
        } else if (propKeys.includes("startTimes")) {
            this.startTimes = [{ start: 0 }, ...props.startTimes];
        } else {
            this.startTimes = [{ start: 0 }];
        }
    }
    getRandomStart() {
        let i = Math.floor(Math.random() * this.startTimes.length);
        let start = this.startTimes[i];
        let hasDuration = Object.keys(start).includes("duration");
        return {
            ...start,
            hasDuration,
        };
    }
}
export const voiceFiles = {
    SPIRITS_GET_EATEN: new VoiceFile("SPIRITS GET EATEN", "Spirits_Get_Eaten.mp3", {
        startTimes: [{ start: 12 }, { start: 13.75 }],
    }),
    JFK_DECLARATION: new VoiceFile("JFK DECLARATION", "JFK_declaration.mp3", {
        cuts: [
            30,
            152,
            164,
            183,
            201,
            216,
            226,
            253,
            270,
            283,
            293,
            304,
            313,
            320, // long clause
            413,
            422,
            429,
            451,
            466, // start of indian clause
            485,
            507,
            562,
        ],
    }),
};
export default function createVoices() {
    const filter = new Tone.Filter(1000, "lowpass"); // or .connect(globalOutput)
    const reverb = new Tone.Reverb(2);
    const output = new Tone.Gain().connect(filter).connect(reverb).toDestination();
    const players = new Map();
    const voiceList = Object.values(voiceFiles);
    let lastPlayed = null;
    let hasInteracted = false;
    let isPlaying = false;
    let isStopped = false;
    let currentPlayer = null;
    // Preload
    voiceList.forEach((vf) => {
        const player = new Tone.Player({
            url: getPath(vf.filename),
            autostart: false,
            onload: () => console.log(`${vf.name} loaded.`),
            onstop: () => {
                isPlaying = false;
            },
        }).connect(output);
        players.set(vf.name, player);
    });

    function pickNewVoice() {
        const options = voiceList.filter((v) => v !== lastPlayed);
        return options[Math.floor(Math.random() * options.length)];
    }

    async function play(vf) {
        if (!hasInteracted || isPlaying || isStopped) return;

        await Tone.start();

        const player = players.get(vf.name);
        if (!player) {
            console.warn(`No player found for voice: ${vf.name}`);
            return;
        }

        const clip = vf.getRandomStart();

        // ✅ Do NOT call stop() unless already started
        if (player.state === "started") {
            try {
                player.stop(); // only safe if it's currently playing
            } catch (err) {
                console.warn("Error stopping player:", err);
            }
        }

        // ✅ Wait until player is loaded
        if (!player.loaded) {
            console.warn("Player not loaded yet:", vf.name);
            return;
        }

        try {
            if (clip.hasDuration) {
                player.start(Tone.now(), clip.start, clip.duration);
            } else {
                player.start(Tone.now(), clip.start);
            }
        } catch (err) {
            console.error("Error starting player:", err);
            return;
        }

        isPlaying = true;
        lastPlayed = vf;
        currentPlayer = player;
    }

    function draw() {
        if (!hasInteracted || isPlaying || isStopped) return;

        const next = pickNewVoice();
        play(next);
    }

    function start() {
        hasInteracted = true;
        isStopped = false;
        Tone.start().then(() => console.log("Audio context resumed."));
    }
    function stop() {
        isStopped = true;
        if (currentPlayer && currentPlayer.state === "started") {
            currentPlayer.stop();
        }
        isPlaying = false;
    }
    return {
        draw,
        start, // Exposed so user must trigger this (e.g., from mousePressed)
        isStopped,
        stop,
    };
}
