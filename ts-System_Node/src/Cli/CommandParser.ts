import { ExpandType, swear } from "@wkronemeijer/system";
import { CliParameterLabel } from "./Parameters/ParameterLabel";
import { CliParseResult, CliCommandTree_Translate } from "./ParseResult";
import { CliSubcommandTree, CliCommandTree } from "./CommandTree";
import { CliSubcommandParser } from "./SubcommandParser";

export interface CliCommandParser<T extends CliCommandTree> {
    /**
     * Parses the given list of arguments.
     * Defaults to "argv".
     */
    parse(args?: readonly string[]): ExpandType<CliCommandTree_Translate<T>>;
    
    generateHelp(): string;
}

interface CliCommandParserConstructor {
    new<const T extends CliCommandTree>(tree: T): CliCommandParser<T>;
}

export const CliCommandParser
:            CliCommandParserConstructor 
= class      CliCommandParserImplementation<const T extends CliCommandTree>
implements   CliCommandParser<T> {
    readonly subparsersByLabel = new Map<CliParameterLabel, CliSubcommandParser>;
    readonly defaultSubparser: CliSubcommandParser;
    
    private registerSubcommand(
        name: Extract<keyof T, string>, 
        subcommand: CliSubcommandTree,
    ): CliSubcommandParser {
        const token     = CliParameterLabel(name);
        const subParser = new CliSubcommandParser(name, subcommand);
        this.subparsersByLabel.set(token, subParser);
        return subParser;
    }
    
    constructor(tree: T) {
        let defaultSubcmd: CliSubcommandParser | undefined;
        
        for (const name in tree) {
            const subcommand = tree[name];
            if (subcommand) {
                const subParser = this.registerSubcommand(name, subcommand);
                if (name === "default") {
                    defaultSubcmd = subParser;
                }
            }
        }
        
        swear(defaultSubcmd, "Default subcommand must be provided.");
        this.defaultSubparser = defaultSubcmd;
    }
    
    private typedParse(args: readonly string[]): CliParseResult {
        let restParser = this.defaultSubparser;
        let restArgs   = args;
        
        const discriminator = args[0];
        if (discriminator) {
            const discriminatorToken = CliParameterLabel(discriminator);
            for (const [parserToken, parser] of this.subparsersByLabel) {
                if (discriminatorToken === parserToken) {
                    restParser = parser;
                }
            }
            restArgs = args.slice(1);
        }
        
        return restParser.parse(restArgs);
    }
    
    parse(args = process.argv.slice(2)): ExpandType<CliCommandTree_Translate<T>> {
        return this.typedParse(args) as any;
        // Note:
        // The cast 
        //     CliParseResult -> TranslateCommandTree 
        // is impossible to check.
        // Testing will weed out the bugs. 
    }
    
    generateHelp(): string {
        return "(help not yet implemented)";
    }
};
