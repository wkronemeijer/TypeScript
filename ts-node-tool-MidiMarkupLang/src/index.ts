import {sleep, swear} from "@wkronemeijer/system";
import {jazz} from "./lib";
import {} from "@wkronemeijer/system-node";

function pickOutput(access: (
    | WebMidi.MIDIAccess
)): WebMidi.MIDIOutput {
    const [output, ...surplus] = access.outputs.values();
    swear(output, "no output found");
    swear(surplus.length === 0, "too many outputs");
    return output;
}

export async function main(_: readonly string[]): Promise<void> {
    process.stdout.write("searching devices...");
    const access = await jazz.requestMIDIAccess({
        software: true,
        sysex: false,
    });
    process.stdout.write("done\n");
    const output = pickOutput(access);
    
    
    const NOTE_ON  = 0x90;
    const NOTE_OFF = 0x80;
    
    const channel = 0;
    const notePitch = 60; // C4
    const velocity = 64;
    const durationMs = 1000.0;
    
    console.log("now playing...");
    const now = performance.now();
    output.send([NOTE_ON  + channel, notePitch, velocity], now);
    output.send([NOTE_OFF + channel, notePitch, velocity], now + durationMs);
    
    await sleep(now + durationMs + 1000);
    jazz.close();
}
