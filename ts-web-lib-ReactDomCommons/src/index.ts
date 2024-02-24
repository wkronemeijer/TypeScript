export const __SYSTEM_WEB = {};

declare module 'react' {
    interface CSSProperties {
        [key: `--${string}`]: string | number;
    }
}

export * from "./Modules.generated";
