import { glob } from "glob";
import path from "path";
import * as fs from "fs/promises";
import chalk from "chalk";
import { spawnSync } from "child_process";
export class Generator{
    async copyResources(srcDir, destDir, opts={ ignore: "**/*.template.js"}) {
        // Use glob to get a list of all the files in the source directory
        const files = await glob( [srcDir+'/**/*',srcDir+'/.*'],opts);
        // console.log(files)
        for (const srcPath of files) {
          // Construct the full path to the destination file
          const destPath =path.resolve(path.resolve(srcPath).replace(path.resolve(srcDir), path.resolve(destDir)));
          // Check if the file is a directory
          const stats = await fs.stat(srcPath);
    
          if (stats.isDirectory()) {
            // If the file is a directory, create it in the destination
            await fs.mkdir(destPath, { recursive: true });
          } else {
            // If the file is a regular file, copy it
            await fs.copyFile(srcPath, destPath);
          }
        }
        
      }
    
      async saveFile(dir,name, template) {
        const filename = path.join(dir, name);
        await fs.writeFile(filename, template);
      };

      install(){
        const spawnConfig={cwd:this.destinationPath,stdio:'inherit',shell:true}
        console.log('\n'+chalk.green('Installing dependencies \n '))
        spawnSync('npm',['i'],spawnConfig)
    
      }
}