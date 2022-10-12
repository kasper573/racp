import fetch, { Response } from "node-fetch";
import * as express from "express";
import * as bodyParser from "body-parser";

export function createIPNRequestHandler(
  env: PaypalEnvironment,
  handleIPN: (result: IPNValidationResult) => Promise<void>
): express.RequestHandler {
  const ipn = express.Router();
  ipn.use(bodyParser.json());
  ipn.post("/", async (request, response) => {
    response.status(200).send("OK");
    response.end();
    await validateIPN(request.body, env).then(handleIPN);
  });
  return ipn;
}

async function validateIPN(
  payload: IPNRequestPayload,
  env: PaypalEnvironment
): Promise<IPNValidationResult> {
  const url = validatorUrls[env];
  const body = new URLSearchParams({
    cmd: "_notify-validate",
    ...payload,
  }).toString();

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      body,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": body.length.toString(),
      },
    });
  } catch (e) {
    return {
      success: false,
      error: `${e}`,
    };
  }

  if (response.status !== 200) {
    return {
      success: false,
      error: response.statusText,
    };
  }

  switch (await response.text()) {
    case "VERIFIED":
      return { success: true, payload };
    case "INVALID":
      return { success: false, error: "INVALID" };
  }
  return {
    success: false,
    error: "Unexpected response from IPN validator",
  };
}

export const paypalEnvironments = ["live", "sandbox"] as const;

export type PaypalEnvironment = typeof paypalEnvironments[number];

export type IPNRequestPayload = Record<string, unknown>;

export type IPNValidationResult =
  | { success: true; payload: IPNRequestPayload }
  | { success: false; error: string };

const validatorUrls: Record<PaypalEnvironment, string> = {
  live: "https://www.paypal.com/cgi-bin/webscr",
  sandbox: "https://www.sandbox.paypal.com/cgi-bin/webscr",
};
