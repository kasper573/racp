import * as nodePath from "path";
import * as fs from "fs";
import { ensureDir } from "./ensureDir";
import { defined } from "./defined";

export function createPublicFileLinker({
  directory,
  location,
  hostname,
  protocol,
  port,
}: {
  directory: string;
  location?: string;
  hostname?: string;
  protocol?: string;
  port?: number;
}): Linker {
  function createPath(childLocation: string) {
    return joinPathParts(directory, childLocation);
  }

  function createUrl(childLocation: string) {
    return joinUrlParts(
      concatUrlParts(
        protocol,
        "//",
        hostname,
        port !== undefined ? `:${port}` : undefined
      ),
      location,
      childLocation
    );
  }

  function createChainedLinker(childDirectory: string) {
    return createPublicFileLinker({
      directory: joinPathParts(directory, childDirectory),
      location: location
        ? joinPathParts(location, childDirectory)
        : childDirectory,
      hostname,
      port,
    });
  }

  function urlToPath(url: string) {
    const expectedStart = createUrl("");
    if (!url.startsWith(expectedStart)) {
      throw new Error("Url must start with " + expectedStart);
    }
    return createPath(url.substring(expectedStart.length));
  }

  return {
    location,
    directory: ensureDir(directory),
    path: createPath,
    url: createUrl,
    chain: createChainedLinker,
    urlToPath,
  };
}

export function autoMapLinkerUrls(
  linker: Linker,
  map = new Map<string, string>()
) {
  async function update() {
    map.clear();
    const names = await fs.promises.readdir(linker.directory);
    for (const name of names) {
      map.set(name, linker.url(name));
    }
    return map;
  }

  const watcher = fs.watch(linker.directory, update);
  return [update(), watcher] as const;
}

export interface Linker {
  directory: string;
  location?: string;
  path(location: string): string;
  url(location: string): string;
  chain(directory: string): Linker;
  urlToPath(url: string): string;
}

const concatUrlParts = (...parts: Array<string | undefined>) =>
  defined(parts).join("");

const joinUrlParts = (...parts: Array<string | undefined>) =>
  defined(parts).join("/");

const joinPathParts = (...parts: Array<string | undefined>) =>
  nodePath.join(...defined(parts));
