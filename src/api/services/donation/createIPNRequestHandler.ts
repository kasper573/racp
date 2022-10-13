import fetch, { Response } from "node-fetch";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as zod from "zod";

export function createIPNRequestHandler(
  env: PaypalEnvironment,
  handleIPN: (result: IPNValidationResult) => Promise<void>
): express.RequestHandler {
  const ipn = express.Router();
  ipn.use(bodyParser.raw({ type: "*/*" }));
  ipn.post(
    "/",
    async (request: express.Request<any, any, Buffer>, response) => {
      response.status(200).send("OK");
      response.end();
      await validateIPN(request.body.toString("utf8"), env).then(handleIPN);
    }
  );
  return ipn;
}

async function validateIPN(
  ipnQueryString: string,
  env: PaypalEnvironment
): Promise<IPNValidationResult> {
  const url = validatorUrls[env];
  const newRequestBody = "cmd=_notify-validate&" + ipnQueryString;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      body: newRequestBody,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": newRequestBody.length.toString(),
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
      return {
        success: true,
        params: Object.fromEntries(new URLSearchParams(ipnQueryString)),
      };
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

export const ipnValidationResultType = zod.union([
  zod.object({ success: zod.literal(true), params: zod.record(zod.string()) }),
  zod.object({ success: zod.literal(false), error: zod.string() }),
]);

export type IPNValidationResult = zod.infer<typeof ipnValidationResultType>;

const validatorUrls: Record<PaypalEnvironment, string> = {
  live: "https://www.paypal.com/cgi-bin/webscr",
  sandbox: "https://www.sandbox.paypal.com/cgi-bin/webscr",
};
