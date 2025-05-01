import * as Tone from "tone";
class Music {
    /**
     * @param {import('p5')} p
     */
    constructor(output, p) {
        this.p = p;
        this.output = output;
        this.transport = Tone.getTransport();
        this.transport.bpm.value = 60;
        this.counter = 0;
        this.hasStarted = false;
        this.bassSynth = new Tone.MembraneSynth().connect(this.output);
        this.amSynth = new Tone.AMSynth({
            harmonicity: 2 / 3,
            modulationEnveloper: {
                attack: 0.005,
            },
        }).connect(this.output);

        this.fmSynth = new Tone.FMSynth({
            harmonicity: 6,
        }).connect(this.output);

        this.pluckSynth = new Tone.PluckSynth().connect(this.output);
        this.pluckSynth.attackNoise = 0.05;
        this.cymbalSynth = new Tone.MetalSynth({
            envelope: {
                attack: 0.001,
                decay: 0.01,
                release: 0.2,
            },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5,
            frequency: 250,
        }).toDestination();
        // this.song = () => {};
        this.loopBeat = new Tone.Loop((t) => this.song(t), "16n");
        // analyzer = new Tone.Analyser("waveform", 256);
        // amSynth.connect(analyzer);
    }
    async mousePressed() {
        if (!this.hasStarted) {
            await Tone.start();
            this.hasStarted = true;
            console.log("AUDIO STARTING");
        }
        if (this.transport.state === "started") {
            this.transport.stop();
            this.loopBeat.stop();
        } else {
            this.transport.start();
            this.loopBeat.start();
        }
    }
    song(time) {
        console.log("SONG!");
        let melodyLine = ["c3", "c3", "d3", "e3"];
        let otherLine = ["e3", "e3", "f3", "g3"];
        // const measureCount = 2;
        // console.log(counter);
        const position = this.transport.position;
        console.log(position);
        // const measure = position.split(":");
        // const [measure] = position.split(":").map((n) => Number.parseFloat(n));
        // console.log(`measure: ${measure}; beat: ${beat}`);

        this.playOnBeat([0], this.counter, () => {
            this.bassSynth.triggerAttackRelease("C1", "8n", time, 0.2);
        });
        this.playOnBeat([0, 2], this.counter, () => {
            this.cymbalSynth.triggerAttackRelease("A3", "32n", time, 0.05);
        });
        // playOnBeat([0], counter, () => {
        //     amSynth.triggerAttackRelease("c3", "16n", time, 0.8);
        // });
        if (this.counter === 0) {
            let index = this.p.floor(this.p.random(melodyLine.length));
            melodyLine[index] = this.getNote();
            // let secIndex = this.p.floor(this.p.random(otherLine.length));
            otherLine[index] = this.getNote(2);
        }
        this.playLine(melodyLine, this.counter, (n) => {
            this.fmSynth.triggerAttackRelease(n, "16n", time, 0.3);
            this.amSynth.triggerAttackRelease(n, "16n", time, 0.8);
        });
        // playLine(otherLine, counter, (n) => {
        //     pluckSynth.triggerAttackRelease(n, "16n", time, 0.001);
        // });

        this.counter = (this.counter + 1) % 4;
    }
    playOnBeat(arr, beat, fn) {
        if (arr.includes(beat)) {
            fn();
        }
    }
    getNote(octave = 3) {
        let l = this.p.random(["a", "c", "d", "e", "g", ""]);
        return l === "" ? null : l.concat(octave);
        // console.log(l.concat(octave));
    }
    playLine(arr, beat, fn) {
        // console.log(arr[beat]);
        if (arr[beat] !== null && beat < arr.length) {
            fn(arr[beat]);
        }
    }
}
export default Music;
