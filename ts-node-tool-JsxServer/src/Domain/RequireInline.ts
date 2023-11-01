declare global {
    interface NodeModule {
        _compile(sourceCode: string, fileName: string): void;
    }
}

interface requireInline_Options {
    readonly filePath: string;
    readonly sourceCode: string;
}

export function requireInline(options: requireInline_Options): any {
    const { filePath, sourceCode } = options;
    // from https://stackoverflow.com/a/47002752
    const mod: NodeModule = new (module.constructor as any)();
    mod.paths = module.paths;
    mod._compile(sourceCode, filePath);
    return mod;
}
