import fse from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

console.log("🎉 POSTINSTALL RAN!");

// Proper ESM __dirname emulation
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Are we running inside node_modules? (i.e., installed in another project)
const isInstalledAsDependency = __dirname.includes("node_modules/flex-cms");

// Resolve top-level dir of the host project
const topDir = isInstalledAsDependency
    ? path.resolve(__dirname.split("node_modules")[0]) // the app using the package
    : __dirname; // dev mode inside the actual flex-cms repo

try {
    const tinymceSourceDir = isInstalledAsDependency
        ? path.join(topDir, "node_modules", "flex-cms", "build", "tinymce")
        : path.join(topDir, "node_modules", "tinymce");

    const tinymceDestDir = path.join(topDir, "public", "tinymce");

    if (!fse.existsSync(tinymceSourceDir)) {
        console.warn(
            "⚠️ TinyMCE source directory does not exist:",
            tinymceSourceDir
        );
    } else {
        fse.ensureDirSync(tinymceDestDir);
        fse.emptyDirSync(tinymceDestDir);
        fse.copySync(tinymceSourceDir, tinymceDestDir, { overwrite: true });

        console.log(
            `✔ Copied TinyMCE from '${tinymceSourceDir}' to '${tinymceDestDir}'`
        );
    }
} catch (err) {
    console.error("❌ Error copying TinyMCE:", err);
}
