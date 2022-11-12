import { useMemo } from "react";
import {
  decodeRpcFileData,
  encodeRpcFileData,
  RpcFile,
} from "../../api/common/RpcFile";
import { useObjectUrl } from "../../lib/hooks/useObjectUrl";

export async function toRpcFile(
  file: File | { data: Uint8Array; name: string }
): Promise<RpcFile> {
  const data =
    "data" in file ? file.data : new Uint8Array(await file.arrayBuffer());
  return {
    name: file.name,
    data: encodeRpcFileData(data),
  };
}

export function toBrowserFile(file: RpcFile): File {
  const data = decodeRpcFileData(file.data);
  return new File([data], file.name);
}

export function useFileUrl(input?: RpcFile | string): string | undefined {
  const inputAsFile = useMemo(
    () => (typeof input === "object" ? toBrowserFile(input) : undefined),
    [input]
  );
  const objectUrl = useObjectUrl(inputAsFile);
  return typeof input === "string" ? input : objectUrl;
}
