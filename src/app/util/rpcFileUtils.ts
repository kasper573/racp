import {
  decodeRpcFileData,
  encodeRpcFileData,
  RpcFile,
} from "../../api/common/RpcFile";

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
