export function getConstructorName(value: unknown): string {
    switch (typeof value) {
        case "undefined":
            return "undefined";
        case "function":
        case "object":
            return value?.constructor?.name ?? "null";
        default: 
            return typeof value;    
    }
}
