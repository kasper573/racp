const { exec } = require("child_process");
const path = require("path");
const yargs = require("yargs");

// Simple script to execute the given command with the cwd being the project root folder
// Useful for running yarn scripts via PM2 (pm2 only supports running node scripts)

const { command } = yargs(process.argv.slice(2))
  .version(false)
  .options({
    command: { type: String, required: true },
  })
  .parseSync();

const cwd = path.join(__dirname, "..");
const cp = exec(command, { cwd });
cp.stdout?.pipe(process.stdout);
cp.stderr?.pipe(process.stderr);
