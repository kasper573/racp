export enum AnsiColor {
  FgBlack = 30,
  FgRed = 31,
  FgGreen = 32,
  FgYellow = 33,
  FgBlue = 34,
  FgMagenta = 35,
  FgCyan = 36,
  FgWhite = 37,
  BgBlack = 40,
  BgRed = 41,
  BgGreen = 42,
  BgYellow = 43,
  BgBlue = 44,
  BgMagenta = 45,
  BgCyan = 46,
  BgWhite = 47,
}

export function getTimeColor(timeSpentMs: number): AnsiColor[] {
  if (timeSpentMs < 50) {
    return [AnsiColor.BgGreen, AnsiColor.FgBlack];
  }
  if (timeSpentMs < 150) {
    return [AnsiColor.BgCyan, AnsiColor.FgBlack];
  }
  if (timeSpentMs < 250) {
    return [AnsiColor.BgYellow, AnsiColor.FgBlack];
  }
  return [AnsiColor.BgRed, AnsiColor.FgBlack];
}
