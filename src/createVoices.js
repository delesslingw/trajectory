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
        startTimes: [{ start: 12 }, { start: 3 }, { start: 10 }, { start: 14 }, { start: 0, duration: 5 }],
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
function createVoices(output) {
    const players = new Map();
    // const files = voiceFiles;

    // preload audio files
    Object.keys(voiceFiles).forEach((v) => {
        v = voiceFiles[v];
        load(v.name, getPath(v.filename));
    });
    function load(name, url) {
        const player = new Tone.Player({
            url,
            autostart: false,
            onload: () => console.log(`${name} loaded.`),
        }).connect(output);

        players.set(name, player);
    }
    function play(vFile) {
        stopAll();
        let name = vFile.name;
        const player = players.get(name);
        if (!player) {
            console.warn(`Voice "${name}" not found.`);
            return;
        }
        let clip = vFile.getRandomStart();
        console.log(clip);
        // Start audio context if needed
        if (clip.hasDuration) {
            Tone.start().then(() => {
                player.start(Tone.now(), clip.start, clip.duration);
            });
        } else {
            Tone.start().then(() => {
                player.start(Tone.now(), clip.start);
            });
        }
    }
    function stopAll() {
        players.forEach((player) => {
            if (player.state === "started") {
                player.stop();
            }
        });
    }
    function stop(name) {
        const player = this.players.get(name);
        if (player?.state === "started") {
            player.stop();
        }
    }
    return {
        load,
        play,
        stop,
        stopAll,
    };
}
// export default class Voices {
//     constructor(output) {
//         this.output = output;
//         this.players = new Map();
//         this.files = voiceFiles;
//         // preload audio files
//         Object.keys(voiceFiles).forEach((v) => {
//             v = voiceFiles[v];
//             this.load(v.name, getPath(v.filename));
//         });
//         // this.load("voice2", "/audio/voice2.mp3");
//     }

//     load(name, url) {
//         const player = new Tone.Player({
//             url,
//             autostart: false,
//             onload: () => console.log(`${name} loaded.`),
//         }).connect(this.output);

//         this.players.set(name, player);
//     }

//     play(vFile) {
//         this.stopAll();
//         let name = vFile.name;
//         const player = this.players.get(name);
//         if (!player) {
//             console.warn(`Voice "${name}" not found.`);
//             return;
//         }
//         let clip = vFile.getRandomStart();
//         console.log(clip);
//         // Start audio context if needed
//         if (clip.hasDuration) {
//             Tone.start().then(() => {
//                 player.start(Tone.now(), clip.start, clip.duration);
//             });
//         } else {
//             Tone.start().then(() => {
//                 player.start(Tone.now(), clip.start);
//             });
//         }
//     }
//     stopAll() {
//         this.players.forEach((player) => {
//             if (player.state === "started") {
//                 player.stop();
//             }
//         });
//     }
//     stop(name) {
//         const player = this.players.get(name);
//         if (player?.state === "started") {
//             player.stop();
//         }
//     }
// }

export default createVoices;
