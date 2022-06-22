export const apiPort = process.env.API_PORT ?? 5432;
export const apiBaseUrl =
  process.env.API_BASE_URL ?? `http://localhost:${apiPort}`;
