import {StringBuilder, max, swear} from "@wkronemeijer/system";

type Table = readonly (readonly string[])[];

const ansiPattern = /\x1b\[\d+m/g;

/** Measures the length of a string with all decorations removed. */
function measure(cell: string) {
    return cell.replaceAll(ansiPattern, "").length;
}

/** Pads the start of a string to reach a certain length of the **undecorated** string. */
function leftpad(
    string: string, 
    length: number, 
): string {
    const actualLength = measure(string);
    const desiredLength = length;
    if (actualLength >= desiredLength) {
        return string;
    } else {
        const missing = max(0, desiredLength - actualLength);
        return ' '.repeat(missing) + string;
    }
}

function getColumnWidths(table: Table): number[] {
    const result = new Array<number>;
    outer: 
    for (let colIdx = 0; /*---*/; colIdx++) {
        result[colIdx] = 0;
        for (const row of table) {
            if (colIdx >= row.length) { break outer; }
            const cell = row[colIdx]!;
            const cellSize = measure(cell);
            if (cellSize > result[colIdx]!) {
                result[colIdx] = cellSize;
            }
        }
    }
    return result;
}

export function formatTable(f: StringBuilder, table: Table): void {
    const [header, ...rows] = table;
    swear(header && rows.length >= 1, 
        "must be atleast a header and 1 row of values"
    );
    const widths = getColumnWidths(table);
    
    for (let rowIdx = 0; rowIdx < table.length; rowIdx++) {
        const row = table[rowIdx]!;
        for (let colIdx = 0; colIdx < row.length; colIdx++) {
            const cell = row[colIdx]!;
            const desiredWidth = widths[colIdx]!;
            const value = leftpad(cell, desiredWidth);
            f.append(value);
            f.append(" ");
        }
        f.appendLine();
    }
}
