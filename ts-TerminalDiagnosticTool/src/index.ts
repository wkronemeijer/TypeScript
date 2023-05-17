import { sleep, terminal } from "@local/system";

function sgr(text: string, ...commands: number[]): void {
    const code = commands.join(";");
    process.stdout.write(`\x1B[${code}m${text}\x1B[0m\n`);
}

function header(text: string): void {
    sgr(` ${text} `, 1, 44);
}

function checkSgr() {
    header("Select Graphic Rendition");

    const width = 10;
    const height = 12;

    const max = 108;

    outer: for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const cmd = y * width + x;
            if (cmd > max) { break outer; }

            const text = cmd.toString().padStart(4, ' ') + ' ';
            process.stdout.write(`\x1B[${cmd}m${text}\x1B[m`);
        }
        process.stdout.write('\n');
    }
}

async function checkCursor() {
    
}

export async function main(args = process.argv.slice(2)): Promise<void> {    
    checkSgr();
    
    header("Save cursor position");
    
    
}
