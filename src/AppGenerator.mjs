import _ from "lodash";
import enquirer from "enquirer";
import * as fs from "fs/promises";
import path from "path";
import os from 'os'
import url from 'url';
import { generatePackageJson } from "./generators/app/package.json.template.js";
import { generateDockerCompose } from "./generators/app/docker-compose.yml.template.js";
import { generateDockerComposeEnv } from "./generators/app/.docker-compose.env.template.js";
import {generateIndex} from "./generators/app/src/config/index.template.js"
import { generateEnvExample } from "./generators/app/env.example.template.js";
import { createRequire } from "module";
import chalk from "chalk";
import { spawnSync } from "child_process";
import boxen from "boxen";
import { Generator } from "./Generator.mjs";

const require = createRequire(import.meta.url);
const pjson = require("../package.json");


const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class AppGenerator extends Generator{
   appName;
   defaultAuthor;
   prompts;
   destinationPath;
   originPath;
   responses;
   logo=`   
    ______ __    __  __ ______ _   __ ______ _____ ______
   / ____// /   / / / // ____// | / // ____// ___//_  __/
  / /_   / /   / / / // / __ /  |/ // __/   \\__ \\  / /   
 / __/  / /___/ /_/ // /_/ // /|  // /___  ___/ / / /    
/_/    /_____/\\____/ \\____//_/ |_//_____/ /____/ /_/  
v${pjson.version}
`

  constructor(projectName) {
    super();
    this.appName = _.kebabCase(projectName);
    this.defaultAuthor =os.userInfo().username;
    this.prompts = [
      {
        type: "input",
        name: "name",
        message: "Your project name",
        initial: this.appName,
      },
      {
        type: "input",
        name: "author",
        message: "Author:",
        initial: this.defaultAuthor,
      },
      {
        type: "Select",
        name: "dbType",
        message: "Database type:",
        initial: "sqlite",
        choices: [
          { message: "SQLite", value: "sqlite" },
          { message: "PostgreSQL", value: "postgres" },
          { message: "SQL Server", value: "mssql" },
        ],
      },
      {
        type: "input",
        name: "dbname",
        message: "Database name:",
        initial: this.appName,
        skip: function () {
          console.log(this.enquirer.answers.dbType);
          return this.enquirer.answers.dbType == "sqlite";
        },
      },
    ];
  }
  async run() {
    console.log( chalk.green(this.logo) + "\nWelcome to the " + chalk.red("flugnest") + " generator\n")
    const responses= await enquirer.prompt(this.prompts);
    this.responses=responses;
    this.destinationPath =process.cwd()+"/"+this.appName;
    this.originPath= __dirname+'/generators/app'
    try {
      await fs.mkdir( path.resolve(this.destinationPath));

      await this.copyResources( this.originPath,this.destinationPath)
      await Promise.all([
        this.copyPackageJson(responses),
        this.copyEnvExample(responses),
        this.copyDockerCompose(responses),
        this.copyIndex(responses)
      ]) 
      this.install()
      this.end()
    } catch (error) {
        console.error(error)
    }

  }



  async copyPackageJson(data){
    const template=generatePackageJson(data)
    await this.saveFile(this.destinationPath,'package.json',template)
  }
  async copyEnvExample(data){
    const template= generateEnvExample(data)
    await this.saveFile(this.destinationPath,'.env.example',template)
  }
  async copyDockerCompose(data){
    const template =generateDockerCompose(data)
    await this.saveFile(this.destinationPath,'docker-compose.yml',template)
  }
  async copyDockerComposeEnv(data){
    const template =generateDockerComposeEnv(data)
    await this.saveFile(this.destinationPath,'docker-compose.env',template)
  }
  async copyIndex(data){
    const template = generateIndex(data)
    await this.saveFile(this.destinationPath,'src/config/index.ts',template)
  }

  end(){
    const spawnConfig={cwd:this.destinationPath,shell:true}
    
    console.time('\n'+chalk.green('Formatting Files')); 
    spawnSync('npm',['run','format'],spawnConfig)
    console.timeEnd('\n'+chalk.green('Formatting Files')); 

    console.time('\n'+chalk.green('Setting up Git')); 
    spawnSync("git", ["init", "--quiet"],spawnConfig);
    spawnSync("git", ["add", "."],spawnConfig);
    spawnSync("git", ["commit", "-m", "Initial Project Setup"],spawnConfig);
    console.timeEnd('\n'+chalk.green('Setting up Git')); 

    const content = `${chalk.green("Your project is ready!")}
For instructions on how to get started, please see README.md
Run it with: \n
${chalk.blue("cd "+this.appName)}
${chalk.blue("npm run start:dev")}
    `;
      const msg = boxen(content, { padding: 1, borderStyle: "round" });
      console.log(msg);
    }

}
