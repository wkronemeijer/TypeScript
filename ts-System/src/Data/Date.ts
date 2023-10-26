// I'm sure you can coax toLocaleString to produce this, but meh

function clockDigit(number: number): string {
    return (
        number
        .toString()
        .padStart(2, "0")
    );
}

export function Date_toHHmm(self: Date): string {
    return `${
        clockDigit(self.getHours())
    }:${
        clockDigit(self.getMinutes())
    }`;
}
