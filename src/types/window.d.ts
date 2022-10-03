import { TRPCClientWindowExtension } from "../app/state/client";

declare global {
  interface Window extends TRPCClientWindowExtension {}
}
