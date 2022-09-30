import { exec } from "child_process";
import { tmpFile } from "./tmpFile";

/**
 * Node wrapper for the unluac binary
 */
export function createUnluac({
  write,
  read,
  remove,
}: {
  write: (path: string, data: NodeJS.ArrayBufferView) => Promise<void>;
  read: (path: string) => Promise<Buffer>;
  remove: (path: string) => Promise<void>;
}) {
  async function unluac(
    compiledLuaCode: NodeJS.ArrayBufferView
  ): Promise<Buffer> {
    const inputFile = tmpFile("lub");
    const outputFile = tmpFile("lua");
    await write(inputFile, compiledLuaCode);
    try {
      await spawnUnluac(inputFile, outputFile);
      const output = await read(outputFile);
      await remove(outputFile);
      return output;
    } catch {
      throw new Error("Failed to decompile lua code");
    } finally {
      await remove(inputFile);
    }
  }
  return unluac;
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
      } else {
        reject(code);
      }
    });
  });
}
