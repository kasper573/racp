export async function ignoreMissingFileError<T extends Function>(fn: T) {
  try {
    return fn();
  } catch (e) {
    if ((e as NodeJS.ErrnoException)?.code !== "ENOENT") {
      throw e;
    }
    return;
  }
}
