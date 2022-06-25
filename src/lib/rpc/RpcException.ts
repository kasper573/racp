/**
 * An expected error with a human-readable message to be exposed to the user
 */
export class RpcException {
  constructor(public message: string) {}
}
