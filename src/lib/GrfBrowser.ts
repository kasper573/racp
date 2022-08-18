import { GrfBrowser as RegularGrfBrowser } from "grf-loader";

export class GrfBrowser extends RegularGrfBrowser {
  dir(directoryPath: string): string[] {
    const normalizedPath = directoryPath.replaceAll("/", "\\");
    return Array.from(this.files.keys()).filter((filePath) =>
      filePath.startsWith(normalizedPath)
    );
  }
  async getFileObject(filename: string, mimeType: string) {
    const file = await this.getFile(filename);
    if (file.error) {
      throw new Error(file.error);
    }
    if (!file.data) {
      throw new Error("File not found");
    }
    return new File([file.data], filename, { type: mimeType });
  }
}
