import _ from "lodash";
import enquirer from "enquirer";
import * as fs from "fs/promises";
import path from "path";
import os from "os";
import url from "url";
import { generatePackageJson } from "./generators/templates/package.json.template.js";
import { generateDockerCompose } from "./generators/templates/docker-compose.yml.template.js";
import { generateDockerComposeEnv } from "./generators/templates/.docker-compose.env.template.js";
import { generateIndex } from "./generators/templates/index.template.js";
import { generateEnvExample } from "./generators/templates/env.example.template.js";
import chalk from "chalk";
import boxen from "boxen";
import { Generator } from "./Generator.mjs";
import ora from "ora";
import promiseSpawn from "@npmcli/promise-spawn";
import { generateAppModule } from "./generators/templates/app.module.template.js";
import { generateMain } from "./generators/templates/main.template.js";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class AppGenerator extends Generator {
  appName;
  defaultAuthor;
  prompts;
  destinationPath;
  originPath;
  responses;

  constructor(projectName) {
    super();
    this.appName = _.kebabCase(projectName);
    this.defaultAuthor = os.userInfo().username;
    this.prompts = [
      {
        type: "input",
        name: "name",
        message: "Your project name:",
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
          return this.enquirer.answers.dbType == "sqlite";
        },
      },
      {
        type: "confirm",
        name: "serviceBus",
        message: "Include Azure Service Bus Module?:",
        initial: false,
      },
      {
        type: "confirm",
        name: "websocket",
        message: "Include websocket/socket.io Module?:",
        initial: false,
      },
    ];
  }
  async run() {
    console.log(
      chalk.green(this.logo) + "\nWelcome to the " + chalk.red("flugnest") + " generator\n",
    );
    const responses = await enquirer.prompt(this.prompts);
    this.responses = responses;
    this.destinationPath = process.cwd() + "/" + this.appName;
    this.originPath = __dirname + "/generators/app";
    try {
      await fs.mkdir(path.resolve(this.destinationPath));

      await this.copyResources(this.originPath, this.destinationPath);
      if (responses.serviceBus == true) {
        await this.copyQueueModule();
      }
      if (responses.websocket == true) {
        await this.copyWebsocketModule();
      }
      await Promise.all([
        this.copyPackageJson(responses),
        this.copyEnvExample(responses),
        this.copyDockerCompose(responses),
        this.copyIndex(responses),
        this.copyAppModule(responses),
        this.copyMain(responses),
      ]);
      await this.install();
      await this.end();
    } catch (error) {
      console.error(error);
    }
  }
  async copyQueueModule() {
    const queueModuleDestinationPath = this.destinationPath + "/src/modules/queue";
    await fs.mkdir(path.resolve(queueModuleDestinationPath));
    await this.copyResources(__dirname + "/generators/queueModule", queueModuleDestinationPath);
  }
  async copyWebsocketModule() {
    const websocketModuleDestinationPath = this.destinationPath + "/src/modules/websocket";
    await fs.mkdir(path.resolve(websocketModuleDestinationPath));
    await this.copyResources(
      __dirname + "/generators/websocketModule",
      websocketModuleDestinationPath,
    );
  }
  async copyPackageJson(data) {
    const template = generatePackageJson(data);
    await this.saveFile(this.destinationPath, "package.json", template);
  }
  async copyEnvExample(data) {
    const template = generateEnvExample(data);
    await this.saveFile(this.destinationPath, ".env.example", template);
  }
  async copyDockerCompose(data) {
    const template = generateDockerCompose(data);
    await this.saveFile(this.destinationPath, "docker-compose.yml", template);
  }
  async copyDockerComposeEnv(data) {
    const template = generateDockerComposeEnv(data);
    await this.saveFile(this.destinationPath, "docker-compose.env", template);
  }
  async copyIndex(data) {
    const template = generateIndex(data);
    try {
      await fs.mkdir(path.resolve(this.destinationPath + "/src/config"));
    } catch (e) {}
    await this.saveFile(this.destinationPath, "src/config/index.ts", template);
  }
  async copyAppModule(data) {
    const template = generateAppModule(data);
    await this.saveFile(this.destinationPath, "src/app.module.ts", template);
  }
  async copyMain(data) {
    const template = generateMain(data);
    await this.saveFile(this.destinationPath, "src/main.ts", template);
  }

  async end() {
    const spawnConfig = { cwd: this.destinationPath, shell: true, stdio: "ignore" };

    const formattingFilesSpinner = ora(chalk.green("Formatting Files ...")).start();
    await promiseSpawn("npm", ["run", "format"], spawnConfig);
    formattingFilesSpinner.succeed();
    const settingUpGitSpinner = ora(chalk.green("Setting up Git ...")).start();
    await promiseSpawn("git", ["init", "--quiet"], spawnConfig);
    await promiseSpawn("git", ["add", "."], spawnConfig);
    await promiseSpawn("git", ["commit", "-m", "Initial Project Setup"], spawnConfig);
    settingUpGitSpinner.succeed();
    console.log("\n");
    const content = `${chalk.green("Your project is ready!")}
For instructions on how to get started, please see README.md
Run it with: \n
${chalk.blue("cd " + this.appName)}
${chalk.blue("npm run test")}
${chalk.blue("npm run start:dev")}
    `;
    const msg = boxen(content, { padding: 1, borderStyle: "round" });
    console.log(msg);
  }
}
