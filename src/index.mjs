#!/usr/bin/env node
import _ from "lodash";
import { AppGenerator } from "./AppGenerator.mjs";
import { program } from "commander" ;

async function main() {
    program
    .command('app')
    .argument('<projectName>','name of the project')
    .action((projectName,options)=>{
        new AppGenerator(projectName).run()
    })
    await program.parseAsync(process.argv);
}
main();