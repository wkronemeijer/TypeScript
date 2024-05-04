export {};

/////////
// Lib //
/////////

const echo = (s: string) => process.stdout.write(s);
const cr = () => echo("\n");

function sgr(text: string, ...commands: number[]): void {
    const code = commands.join(";");
    echo(`\x1B[${code}m${text}\x1B[0m\n`);
}

function header(text: string): void {
    cr();
    sgr(` ${text} `, 1, 44);
}

//////////////
// Checkers //
//////////////

const TABLE_WIDTH = 10;
const TABLE_HEIGHT = 12;

function checkSgr() {
    header("Select Graphic Rendition (3/4 bit color)");
    
    const max = 108;
    outer: for (let y = 0; y < TABLE_HEIGHT; y++) {
        for (let x = 0; x < TABLE_WIDTH; x++) {
            const cmd = y * TABLE_WIDTH + x;
            if (cmd > max) { break outer; }

            const text = cmd.toString().padStart(4, " ") + " ";
            echo(`\x1B[${cmd}m${text}\x1B[0m`);
        }
        cr();
    }
    cr();
}

function check8bit() {
    header("8-bit color");
    
    for (let i = 0; i <= 0xFF; i++) {
        const msg = i.toString().padStart(3) + ' ';
        echo(`\x1B[38;5;${i}m${msg}\x1B[0m`);
        
        // TODO: See if : works as well
        if (i % 0x10 === 0 && i !== 0) {
            cr();
        }
    }
}

function check24bit() {
    header("24-bit color");

    const step = Math.floor((0xFF + 1) / 5);
    const valuesPerRow = 16;

    let valuesThisRow = 0;
    for (let r = 0; r <= 0xFF; r += step) {
    for (let g = 0; g <= 0xFF; g += step) {
    for (let b = 0; b <= 0xFF; b += step) {
        const i = (r << 16) + (g << 8) + b;
        const msg = ` ${i.toString(16).toUpperCase().padStart(6, '0')} `;
        
        echo(`\x1B[48;2;${r};${g};${b}m${msg}\x1B[0m`);

        if (++valuesThisRow >= valuesPerRow) {
            cr();
            valuesThisRow = 0;
        }
    }}}
}

export async function main(args = process.argv.slice(2)): Promise<void> {    
    checkSgr();
    // check8bit();
    // check24bit();
}
