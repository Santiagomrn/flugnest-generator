#!/usr/bin/env node
import _ from "lodash";
import { AppGenerator } from "./AppGenerator.mjs";
import { program } from "commander" ;
import { ModuleGenerator } from "./ModuleGenerator.mjs";

async function main() {
    program
    .command('app')
    .argument('<projectName>','name of the project')
    .action((projectName,options)=>{
        new AppGenerator(projectName).run()
    })

    program
    .command('module')
    .argument('<moduleName>', 'name of the module')
    .action((moduleName,options)=>{
        new ModuleGenerator(moduleName).run()
    })



    await program.parseAsync(process.argv);
}
main();