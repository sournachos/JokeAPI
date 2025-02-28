#!/usr/bin/env node

const yargs = require("yargs");
const importFresh = require("import-fresh");
const { colors, Errors } = require("svcorelib");
const { resolve } = require("path");
const dotenv = require("dotenv");

const settings = require("../settings");

const { exit } = process;
const col = colors.fg;


/** Absolute path to JokeAPI's root directory */
const rootDir = resolve(__dirname, "../"); // if this file is moved, make sure to change this accordingly


//#SECTION run

async function run()
{    
    try
    {
        // ensure cwd is correct if the binary is called in a global context
        process.chdir(rootDir);

        dotenv.config();

        const argv = prepareCLI();


        /** @type {string|null} */
        const command = argv && argv._ ? argv._[0] : null;

        let file, action;

        // TODO: (v2.4) remove comments below
        switch(command)
        {
        case "start":
        case "run":
            file = "../JokeAPI.js";
            break;
        case "submissions":
        case "sub":
        case "s":
            action = "Joke submissions";
            file = "./submissions.js";
            break;
        case "info":
        case "i":
            file = "./info.js";
            break;
        case "add-joke":
        case "aj":
        case "j":
            action = "Add joke";
            file = "./add-joke.js";
            break;
        case "reassign-ids":
        case "ri":
            action = "Reassign IDs";
            file = "./reassign-ids.js";
            break;
        case "add-token":
        case "at":
        case "t":
            action = "Add API token";
            file = "./add-token.js";
            break;
        case "validate-ids":
        case "vi":
            action = "Validate IDs";
            file = "./validate-ids.js";
            break;
        case "validate-jokes":
        case "vj":
            action = "Validate jokes";
            file = "./validate-jokes.js";
            break;
        case "generate-changelog":
        case "cl":
            action = "Generate changelog";
            file = "./generate-changelog.js";
            break;
        // case "stresstest": case "str":
        //     action = "Stress test";
        //     file = "./stresstest.js";
        //     break;
        case "test":
            action = "Unit tests";
            file = "./test.js";
            break;
        // case "ip-info": case "ip":
        //     action = "IP info";
        //     file = "./ip-info.js";
        case undefined:
        case null:
        case "":
            console.log(`${settings.info.name} CLI v${settings.info.version}\n`);
            return yargs.showHelp();
        default:
            return warn(`Unrecognized command '${command}'\nUse '${argv.$0} -h' to see a list of commands`);
        }

        if(!file)
            throw new Error(`Command '${command}' (${action.toLowerCase()}) didn't yield an executable file`);

        action && console.log(`${settings.info.name} CLI - ${action}`);

        return importFresh(file);
    }
    catch(err)
    {
        return error(err);
    }
}

/**
 * Prepares the CLI so it can show help
 * @returns {yargs.Argv<*>}
 */
function prepareCLI()
{
    //#SECTION general
    yargs.scriptName("jokeapi")
        .usage("Usage: $0 <command>")
        .version(`${settings.info.name} v${settings.info.version} - ${settings.info.projGitHub}`)
            .alias("v", "version")
        .help()
            .alias("h", "help");

    //#SECTION commands
    // TODO: (v2.4) remove comments below
    yargs.command([ "start", "run" ], `Starts ${settings.info.name} (equivalent to 'npm start')`);

    yargs.command([ "info", "i" ], `Prints information about ${settings.info.name}, like the /info endpoint`);

    yargs.command([ "submissions", "sub", "s" ], "Goes through all joke submissions, prompting to edit, add or delete them");

    yargs.command([ "add-joke", "aj", "j" ], "Runs an interactive prompt that adds a joke");

    yargs.command([ "reassign-ids", "ri", "r" ], "Goes through each joke file and reassigns IDs to each one, consecutively");

    yargs.command([ "add-token [amount]", "at", "t" ], "Generates one or multiple API tokens to be used to gain unlimited access to the API", cmd => {
        cmd.positional("amount", {
            describe: "Specifies the amount of tokens to generate - min is 1, max is 10",
            type: "number",
            default: 1
        });

        // cmd.option("no-copy", {
        //     alias: "nc",
        //     describe: "Disables auto-copying the token to the clipboard (if amount = 1)",
        //     type: "boolean"
        // });
    });

    yargs.command([ "validate-ids", "vi" ], "Goes through each joke file and makes sure the IDs are correct (no duplicates or skipped IDs & correct order)");

    yargs.command([ "validate-jokes", "vj" ], "Goes through each joke file and checks the validity of each joke and whether they can all be loaded to memory");

    yargs.command([ "generate-changelog", "cl" ], "Turns the changelog.txt file into a markdown file (changelog.md)", cmd => {
        cmd.option("generate-json", {
            alias: "j",
            describe: "Use this argument to generate a changelog-data.json file in addition to the markdown file",
            type: "boolean"
        });
    });

    // yargs.command([ "ip-info", "ip" ], "Starts a server at '127.0.0.1:8074' that just prints information about each request's IP", cmd => {
    //     cmd.option("color-cycle", {
    //         alias: "c",
    //         describe: "Cycles the color of the output after each request (to make spotting a new request easier)",
    //         type: "boolean"
    //     });
    // });

    // yargs.command([ "stresstest", "str" ], `Sends lots of requests to ${settings.info.name} to stresstest it (requires the API to run in another process on the same machine)`);

    yargs.command("test", `Runs ${settings.info.name}'s unit tests`, cmd => {
        cmd.option("colorblind", {
            alias: "c",
            describe: "Include this argument to replace the colors green with cyan and red with magenta",
            type: "boolean"
        });
    });

    yargs.wrap(Math.min(100, process.stdout.columns));

    return yargs.argv;
}


//#SECTION on execute

try
{
    if(!process.stdin.isTTY)
        throw new Errors.NoStdinError("The process doesn't have an stdin channel to read input from");
    else
        run();
}
catch(err)
{
    return error(err);
}

/**
 * @param {Error} err
 */
function error(err)
{
    console.error(`${col.red}${settings.info.name} CLI - ${err.name}:${col.rst}\n${err.stack}\n`);
    exit(1);
}

/**
 * @param {string} warning
 * @param {string} [type]
 */
function warn(warning, type = "Warning")
{
    console.log(`${col.yellow}${settings.info.name} CLI - ${type}:${col.rst}\n${warning}\n`);
    exit(1);
}
