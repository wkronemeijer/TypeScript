#!/usr/bin/env node
/*
TL;DR: to not include generated files in the build output, 
we build the collector of modules and test files using JS.
*/

/////////////
// Options //
/////////////

const exportsFileName = "Modules.generated.ts";
const testsFileName   = "Tests.generated.ts";

const generatedPattern = /\.generated\.tsx?/;
const testPattern      = /\.spec\.tsx?/;
const exportPattern    = /^[^a-z].*\.tsx?/;

/////////////
// Imports //
/////////////

const { existsSync, readdirSync, writeFileSync, lstatSync } = require("node:fs");
const { join, resolve, parse, relative } = require("node:path");

/////////////
// Library //
/////////////

/**
 * @returns {never}
 */
function panic(reason) {
    process.stderr.write(reason);
    process.stderr.write('\n');
    process.exit(-1);
}

/**
 * @param {unknown} judgment
 * @param {string} reason
 * @returns {asserts judgment}
 */
function swear(judgment, reason = "failed assertion") {
    if (!judgment) {
        panic(reason);
    }
}

/**
 * @param {Date} date 
 * @returns {string}
 */
function formatDate(date) {
    const year   = date.getFullYear().toString().padStart(4, '0');
    const month  = (date.getMonth() + 1).toString().padStart(2, '0');
    const day    = date.getDate().toString().padStart(2, '0');
    const hour   = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    // Holy sh*t JS date is bad
    return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * @param {string} root 
 * @returns {Iterable<string>}
 */
function findAllFiles(root) {
    // Note that recursive readdir is not in Node 18 either
    const dirQueue = [root];
    const files = [];
    let current;
    // TODO: The order returned by this is different from 
    // what the old ps1 returned
    // Found out why it is so different.
    // swapping out for pop changes nothing. 
    while (current = dirQueue.shift()) {
        for (fileName of readdirSync(current)) {
            const file = resolve(current, fileName);
            const stat = lstatSync(file);
            if (false) {
                // when
            } else if (stat.isFile()) {
                files.push(file);
            } else if (stat.isDirectory()) {
                dirQueue.push(file);
            }
        }
    }
    return files;
}

/**
 * @param {string} file 
 * @returns {string}
 */
function removeExtension(file) {
    const { dir, name } = parse(file);
    return join(dir, name);
}

/**
 * 
 * @param {string} string 
 * @param {string} suffix 
 * @returns {string | false}
 */
function tryRemoveSuffix(string, suffix) {
    if (string.endsWith(suffix)) {
        return string.slice(0, string.length - suffix.length);
    } else {
        return false;
    }
}

/**
 * @param {number} count 
 * @param {string} string 
 * @returns {string}
 */
function agree(count, string) {
    return `${count} ${(count === 1 &&
        tryRemoveSuffix(string, "s") ||
        string
    )}`;
}

////////////
// Domain //
////////////

const toolName = parse(__filename).base;
const now = formatDate(new Date);

function portModule(root, file, reexport) {
    const rawPath = removeExtension(relative(root, file));
    const importPath = "./" + rawPath.replace(/\\/g, "/");
    const prefix = reexport ? "export * from" : "import";
    
    return `${prefix} "${importPath}";`;
}

/**
 * @param {string[]} files 
 * @param {boolean | undefined} reexport 
 * @returns {string}
 */
function portAllModules(root, files, reexport = false) {
    const lines = [];
    
    const comment = `// [${toolName}]`;
    
    lines.push(`${comment} Generated on ${now}.`);
    lines.push(`${comment} Includes ${agree(files.length, "modules")}.`);
    lines.push(`export {};`); // force module
    
    for (const file of files) {
        lines.push(portModule(root, file, reexport));
    }
    lines.push("");
    
    return lines.join("\n");
}

/**
 * 
 * @param {string} file 
 * @returns {"module" | "test" | undefined}
 */
function determineKind(fileName) {
    if (false) {
        // when
    } else if (generatedPattern.test(fileName)){
        return undefined;
    } else if (testPattern.test(fileName)) {
        return "test";
    } else if (exportPattern.test(fileName)) {
        return "module";
    }
}

///////////////////
// Finding files //
///////////////////

function main(args) {
    swear(args.length === 0, "too many args");
    
    const src = resolve("src");
    swear(existsSync(src), "missing src");
    const exportsFile = join(src, exportsFileName);
    const testsFile   = join(src, testsFileName);
    
    const exports = [];
    const tests = [];
    
    const srcFiles = findAllFiles(src);
    
    for (const srcFile of srcFiles) {
        const srcFileName = parse(srcFile).base;
        const kind = determineKind(srcFileName) ?? "";
        
        switch (kind) {
            case "test": 
                tests.push(srcFile);
                break;
            case "module":
                exports.push(srcFile);
                break;
        }
    }
    
    writeFileSync(exportsFile, portAllModules(src, exports, true ));
    writeFileSync(testsFile  , portAllModules(src, tests  , false));
}

main(process.argv.slice(2));
