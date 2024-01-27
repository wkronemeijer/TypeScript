declare global {
    interface NodeModule {
        _compile(sourceCode: string, fileName: string): void;
    }
}

export function requireString(filePath: string, sourceCode: string): NodeModule {
    // from https://stackoverflow.com/a/47002752
    const mod: NodeModule = new (module.constructor as any)();
    mod.paths = module.paths;
    mod._compile(sourceCode, filePath);
    return mod;
}
