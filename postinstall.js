import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { findUp } from "find-up";

// Emulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);

const filename = import.meta.url;

console.log("Running postinstall.js from ", __filename);
console.log();

// Find the top-level directory (project root)
const projectRoot = path.dirname(await findUp("package.json"));

// Define the source paths
const sourcePath1 = path.join(
    projectRoot,
    "node_modules",
    "flex-cms",
    "build",
    "tinymce"
);

const sourcePath2 = path.join(projectRoot, "node_modules", "tinymce");

// Define the destination path
const destinationPath = path.join(projectRoot, "public", "tinymce");

console.log("Checking: ", sourcePath1);
console.log("Checking: ", sourcePath2);
console.log("Checking: ", destinationPath);
console.log();

// Check if source paths exist, and copy accordingly
if (await fse.pathExists(sourcePath1)) {
    console.log("Moving from: ", sourcePath1, "to ", destinationPath);
    fse.copySync(sourcePath1, destinationPath, { overwrite: true });
} else if (await fse.pathExists(sourcePath2)) {
    console.log("Moving from: ", sourcePath2, "to ", destinationPath);
    fse.copySync(sourcePath2, destinationPath, { overwrite: true });
} else {
    console.error("Error copying");
}

console.log();
console.log("Finished running postinstall from ", filename);
