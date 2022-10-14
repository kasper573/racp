import * as gracefulFs from "graceful-fs";

/**
 * The API only uses this to access the file system.
 * Using the fs module directly is never allowed.
 */
export const gfs = gracefulFs.promises;
