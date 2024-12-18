import { promises as fs } from "fs";
import { join } from "path";
import readline from "readline";
import { exec } from "child_process";

const astroConfigPath = join("astro.config.mjs");
const sourcePath = join("keystatic.config.tsx");
const destinationDir = join("scripts", "deleted");
const destinationPath = join(destinationDir, sourcePath);

async function removeKeystatic() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const userConfirmed = await new Promise((resolve) => {
    rl.question(
      "Are you sure you want to remove keystatic from this project? (y/n): ",
      (answer) => {
        resolve(answer.toLowerCase() === "y");
      },
    );
  });

  if (!userConfirmed) {
    console.log("Operation cancelled by the user.");
    process.exit(0);
  }

  const changeRendering = await new Promise((resolve) => {
    rl.question(
      "Do you want to change from hybrid rendering to static and remove the adapter? (y/n): ",
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "y");
      },
    );
  });

  // newline
  console.log();

  try {
    // Check if the destination directory exists
    await fs.access(destinationDir).catch(async () => {
      // Create the directory if it does not exist
      await fs.mkdir(destinationDir, { recursive: true });
      console.log(`Created directory ${destinationDir}`);
    });

    // Move the file
    await fs.rename(sourcePath, destinationPath);
    console.log(`Moved ${sourcePath} to ${destinationPath}`);

    // move "src/components/KeystaticComponents" folder to "scripts/deleted/KeystaticComponents"
    const sourceComponentsDir = join(
      "src",
      "components",
      "KeystaticComponents",
    );
    const destinationComponentsDir = join(
      destinationDir,
      "KeystaticComponents",
    );
    await fs.rename(sourceComponentsDir, destinationComponentsDir);
    console.log(`Moved ${sourceComponentsDir} to ${destinationComponentsDir}`);
  } catch (error) {
    console.error(`Error moving file: ${error}`);
  }

  // Update astro.config.mjs
  try {
    let astroConfigContent = await fs.readFile(astroConfigPath, "utf-8");

    // remove "import keystatic from "@keystatic/astro";"
    const importRegex = /import keystatic from "@keystatic\/astro";\n?/;
    astroConfigContent = astroConfigContent.replace(importRegex, "");
    await fs.writeFile(astroConfigPath, astroConfigContent, "utf-8");
    // console.log(`Removed import keystatic from ${astroConfigPath}`);

    // remove "keystatic(),"
    const keystaticRegex = /keystatic\(\),?/;
    astroConfigContent = astroConfigContent.replace(keystaticRegex, "");
    await fs.writeFile(astroConfigPath, astroConfigContent, "utf-8");
    // console.log(`Removed keystatic adapter from ${astroConfigPath}`);

    // remove the keystatic redirect
    const redirectRegex = /"\/admin": "\/keystatic",/;
    astroConfigContent = astroConfigContent.replace(redirectRegex, "");
    await fs.writeFile(astroConfigPath, astroConfigContent, "utf-8");
    // console.log(
    //   `Removed the "/admin": "/keystatic"," redirect from ${astroConfigPath}`,
    // );

    // if the user wants to change the rendering to static
    if (changeRendering) {
      // change "output: "hybrid"," to "output: "static",
      const outputRegex = /output: "hybrid",/;
      astroConfigContent = astroConfigContent.replace(
        outputRegex,
        'output: "static",',
      );
      await fs.writeFile(astroConfigPath, astroConfigContent, "utf-8");
      // console.log(
      //   `Changed "output: "hybrid"," to "output: "static"," in ${astroConfigPath}`,
      // );

      // remove "import netlify from "@astrojs/netlify";"
      const netlifyRegex = /import netlify from "@astrojs\/netlify";\n?/;
      astroConfigContent = astroConfigContent.replace(netlifyRegex, "");
      await fs.writeFile(astroConfigPath, astroConfigContent, "utf-8");
      // console.log(`Removed netlify import from ${astroConfigPath}`);

      // remove the adapter
      const adapterRegex = /adapter: [\s\S]*?\),/;
      astroConfigContent = astroConfigContent.replace(adapterRegex, "");
      await fs.writeFile(astroConfigPath, astroConfigContent, "utf-8");
      // console.log(`Removed the adapter from ${astroConfigPath}`);
    }

    // remove any empty lines left behind
    const emptyLineRegex = /^\s*[\r\n]/gm;
    astroConfigContent = astroConfigContent.replace(emptyLineRegex, "");
    await fs.writeFile(astroConfigPath, astroConfigContent, "utf-8");
    // console.log(`Removed any empty lines from ${astroConfigPath}`);

    console.log(`updated ${astroConfigPath}`);

    if (changeRendering) {
      console.log(
        "Uninstalling @keystatic/astro, @keystatic/core, and @astrojs/netlify...",
      );
      await new Promise((resolve, reject) => {
        exec(
          "npm uninstall @keystatic/astro @keystatic/core @astrojs/netlify",
          (error, stdout) => {
            if (error) {
              console.error(`Error uninstalling packages: ${error}`);
              reject(error);
              return;
            }
            console.log(stdout);
            resolve();
          },
        );
      });
    } else {
      // uninstall @keystatic/astro and @keystatic/core from the project
      console.log("Uninstalling @keystatic/astro and @keystatic/core...");
      await new Promise((resolve, reject) => {
        exec(
          "npm uninstall @keystatic/astro @keystatic/core",
          (error, stdout) => {
            if (error) {
              console.error(`Error uninstalling packages: ${error}`);
              reject(error);
              return;
            }
            console.log(stdout);
            resolve();
          },
        );
      });
    }

    console.log("\n...done!\n");
    console.log("=================================================");
    console.log(" Successfully removed Keystatic from the project");
    console.log("=================================================\n");

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // cheers from Cosmic Themes!
    console.log("🚀 Thank you for using Cosmic Themes 🚀\n");

    await new Promise((resolve) => setTimeout(resolve, 1000));
  } catch (error) {
    console.error(`Error updating ${astroConfigPath}: ${error}`);
  }
}

removeKeystatic();
