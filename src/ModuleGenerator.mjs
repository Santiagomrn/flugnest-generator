import _ from "lodash";
import enquirer from "enquirer";
import * as fs from "fs";
import path from "path";
import os from "os";
import url from "url";
import chalk from "chalk";
import { spawnSync } from "child_process";
import boxen from "boxen";
import { Generator } from "./Generator.mjs";
import { generateController } from "./generators/module/generateController.js";
import { generateService } from "./generators/module/generateService.js";
import { generateRepository } from "./generators/module/generateRepository.js";
import { generateEntity } from "./generators/module/genertateEntity.js";
import {
  generateControllerE2E,
  generateControllerSpec,
  generateFactories,
} from "./generators/module/generateSpecs.js";
import { generateModule } from "./generators/module/generateModule.js";
import { generateCreateDto, generateUpdateDto } from "./generators/module/generateDtos.js";
import ora from "ora";
import promiseSpawn from "@npmcli/promise-spawn";

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ModuleGenerator extends Generator {
  moduleName;
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
        name: "moduleName",
        message: "Your module name:",
        initial: this.appName,
      },
      {
        type: "confirm",
        name: "belongsUser",
        message: "your module belongs to user?:",
        initial: true,
      },
      {
        type: "multiselect",
        name: "files",
        message: "Select files to create:",
        hint: "(Use <space> to select, <Enter> to continue)",
        initial: [0, 1, 2, 3, 4, 5],
        choices: [
          {
            name: "Controller",
            enabled: true,
          },
          {
            name: "Service",
            enabled: true,
          },
          {
            name: "Repository",
            enabled: true,
          },
          {
            name: "Entity",
            enabled: true,
          },
          {
            name: "Dtos",
            enabled: true,
          },
          {
            name: "Specs",
            enabled: true,
          },
        ],
      },
    ];
  }
  async run() {
    console.log(
      chalk.green(this.logo) + "\nWelcome to the " + chalk.red("flugnest") + " generator\n",
    );
    const responses = await enquirer.prompt(this.prompts);
    responses.moduleName =
      responses.moduleName.charAt(0).toUpperCase() + responses.moduleName.slice(1);
    this.moduleName = responses.moduleName;
    const lowerCaseModuleName = responses.moduleName.toLowerCase();
    this.responses = responses;
    this.originPath = __dirname + "/generators/module";
    const MODULES_DIR = path.join(process.cwd(), "/src/modules");
    const MODULE_DIR = path.join(MODULES_DIR, "/" + lowerCaseModuleName);
    this.destinationPath = MODULE_DIR;
    const options = {
      controller: responses.files.includes("Controller"),
      service: responses.files.includes("Service"),
      entity: responses.files.includes("Entity"),
      dto: responses.files.includes("Dtos"),
      belongsUser: responses.files.includes("Specs"),
      specs: responses.belongsUser,
    };
    if (!fs.existsSync(MODULES_DIR)) {
      fs.mkdirSync(MODULES_DIR);
    }
    if (fs.existsSync(MODULE_DIR)) {
      return;
    }
    fs.mkdirSync(MODULE_DIR);
    if (responses.files.includes("Controller")) await this.copyController(responses);
    if (responses.files.includes("Service")) await this.copyService(responses);
    if (responses.files.includes("Entity")) {
      await this.copyEntity(responses);
    }
    if (responses.files.includes("Repository")) await this.copyRepository(responses);
    if (responses.files.includes("Specs")) {
      await this.copySpecs(responses);
    }
    if (responses.files.includes("Dtos")) {
      await this.copyDtos(responses);
    }
    await this.copyModule({ ...responses, options });
    await this.end();
  }
  async copyController(data) {
    const template = generateController({ name: data.moduleName, belongsUser: data.belongsUser });
    await this.saveFile(
      this.destinationPath,
      data.moduleName.toLowerCase() + ".controller.ts",
      template,
    );
  }
  async copyService(data) {
    const template = generateService({ name: data.moduleName, belongsUser: data.belongsUser });
    await this.saveFile(
      this.destinationPath,
      data.moduleName.toLowerCase() + ".service.ts",
      template,
    );
  }

  async copyRepository(data) {
    const template = generateRepository({ name: data.moduleName, belongsUser: data.belongsUser });
    await this.saveFile(
      this.destinationPath,
      data.moduleName.toLowerCase() + ".repository.ts",
      template,
    );
  }

  async copyEntity(data) {
    const ENTITIES_DIR = path.join(this.destinationPath, "/entities");
    fs.mkdirSync(ENTITIES_DIR);
    const template = generateEntity({ name: data.moduleName, belongsUser: data.belongsUser });

    await this.saveFile(ENTITIES_DIR, data.moduleName.toLowerCase() + ".entity.ts", template);
  }

  async copyRepository(data) {
    const template = generateRepository({ name: data.moduleName, belongsUser: data.belongsUser });
    await this.saveFile(
      this.destinationPath,
      data.moduleName.toLowerCase() + ".repository.ts",
      template,
    );
  }

  async copyDtos(data) {
    const DTO_DIR = path.join(this.destinationPath, "/dto");
    fs.mkdirSync(DTO_DIR);
    const createDtoTemplate = generateCreateDto({
      name: data.moduleName,
      belongsUser: data.belongsUser,
    });
    const updateDtoTemplate = generateUpdateDto({
      name: data.moduleName,
      belongsUser: data.belongsUser,
    });

    await this.saveFile(
      DTO_DIR,
      "create-" + data.moduleName.toLowerCase() + ".dto.ts",
      createDtoTemplate,
    );
    await this.saveFile(
      DTO_DIR,
      "update-" + data.moduleName.toLowerCase() + ".dto.ts",
      updateDtoTemplate,
    );
  }

  async copySpecs(data) {
    const TESTS_DIR = path.join(this.destinationPath, "/tests");
    fs.mkdirSync(TESTS_DIR);
    const factoryTemplate = generateFactories({
      name: data.moduleName,
      belongsUser: data.belongsUser,
    });
    const controllerSpecTemplate = generateControllerSpec({
      name: data.moduleName,
      belongsUser: data.belongsUser,
    });
    const controllerE2ETemplate = generateControllerE2E({
      name: data.moduleName,
      belongsUser: data.belongsUser,
    });

    await this.saveFile(
      TESTS_DIR,
      data.moduleName.toLowerCase() + ".factories.ts",
      factoryTemplate,
    );

    await this.saveFile(
      TESTS_DIR,
      data.moduleName.toLowerCase() + ".controller.spec.ts",
      controllerSpecTemplate,
    );

    await this.saveFile(
      TESTS_DIR,
      data.moduleName.toLowerCase() + ".e2e-spec.ts",
      controllerE2ETemplate,
    );
  }

  async copyModule(data) {
    const moduleTemplate = generateModule({
      name: data.moduleName,
      belongsUser: data.belongsUser,
      options: data.options,
    });
    await this.saveFile(
      this.destinationPath,
      data.moduleName.toLowerCase() + ".module.ts",
      moduleTemplate,
    );
  }

  async end() {
    try {
      const spawnConfig = { cwd: this.destinationPath, shell: true, stdio: "ignore" };
      const spinner = ora(chalk.green("Formatting Files ...")).start();
      await promiseSpawn("npm", ["run", "format"], spawnConfig);
      spinner.succeed();
    } catch (error) {
      console.log(error);
    }
    const content = `${chalk.green("Your module is ready!")}
Don´t forget register you new ${this.moduleName} module into the app.module file.

${chalk.blue(`@Module({
  imports: [DatabaseModule, EmailModule, UserModule, AuthModule, NoteModule, ${this.moduleName}Module], // your new module
  controllers: [AppController],
  providers: [AppService],
})`)}

    `;
    const msg = boxen(content, { padding: 1, borderStyle: "round" });
    console.log(msg);
  }
}
