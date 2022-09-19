// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const trimQuotes = (str: string) => /^"?(.*?)"?$/.exec(str)![1];
