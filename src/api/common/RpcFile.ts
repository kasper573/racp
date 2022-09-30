import * as zod from "zod";
import { ZodType } from "zod";
import { base64ToBytes, bytesToBase64 } from "byte-base64";

/**
 * A normalized file type since TRPC doesn't support regular file uploads
 */
export type RpcFile = zod.infer<typeof rpcFile>;

/**
 * Uint8Array encoded as base 64 string.
 * A complex structure to avoid base64 strings being passed as normal strings by mistake
 */
type RpcFileData = {
  $: "Base64String";
};

export const rpcFile = zod.object({
  name: zod.string(),
  data: zod.object({ $: zod.string() }) as ZodType<RpcFileData>,
});

export function decodeRpcFileData({ $ }: RpcFileData): Uint8Array {
  return base64ToBytes($);
}

export function encodeRpcFileData(arr: Uint8Array): RpcFileData {
  return { $: bytesToBase64(arr) as "Base64String" };
}
