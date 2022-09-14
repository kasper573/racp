import * as fs from "fs";
import { exec } from "child_process";
import { tmpFile } from "./tmpFile";

/**
 * Node wrapper for the unluac binary
 */
export async function unluac(
  compiledLuaCode: NodeJS.ArrayBufferView
): Promise<Buffer> {
  const inputFile = tmpFile("lub");
  const outputFile = tmpFile("lua");
  await fs.promises.writeFile(inputFile, compiledLuaCode);
  try {
    await spawnUnluac(inputFile, outputFile);
    const output = await fs.promises.readFile(outputFile);
    await fs.promises.unlink(outputFile);
    return output;
  } finally {
    await fs.promises.unlink(inputFile);
  }
}

function spawnUnluac(inputFile: string, outputFile: string) {
  return new Promise<void>((resolve, reject) => {
    const childProcess = exec(
      `java -jar unluac.jar ${inputFile} > ${outputFile}`,
      { cwd: __dirname }
    );
    childProcess.once("exit", (code) => {
      if (code === 0) {
        resolve();
      }
    });
    childProcess.stderr?.once("data", (data) => {
      reject(data);
    });
  });
}
