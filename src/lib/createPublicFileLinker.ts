import * as path from "path";
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
  return {
    directory: ensureDir(directory),
    location,
    path: (childLocation: string) =>
      path.join(...defined([directory, childLocation])),
    url: (childLocation: string) =>
      join(
        add(
          protocol,
          "//",
          hostname,
          port !== undefined ? `:${port}` : undefined
        ),
        location,
        childLocation
      ),
    chain: (childDirectory) =>
      createPublicFileLinker({
        directory: path.join(directory, childDirectory),
        location: location
          ? path.join(location, childDirectory)
          : childDirectory,
        hostname,
        port,
      }),
  };
}

export interface Linker {
  directory: string;
  location?: string;
  path(location: string): string;
  url(location: string): string;
  chain(directory: string): Linker;
}

const add = (...parts: Array<string | undefined>) => defined(parts).join("");
const join = (...parts: Array<string | undefined>) => defined(parts).join("/");
