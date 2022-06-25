import { TagDescription } from "@reduxjs/toolkit/dist/query/endpointDefinitions";
import { FullTagDescription } from "@reduxjs/toolkit/src/query/endpointDefinitions";

export function createTagFactory<TagType>(type: TagType) {
  function many(ids: TagId[] = []): TagDescription<TagType>[] {
    return ids.map((id) => ({ type, id }));
  }
  function one(id: TagId): TagDescription<TagType> {
    return { type, id };
  }

  return {
    type,
    list: type as TagDescription<TagType>,
    many,
    one,
  };
}

type TagId = FullTagDescription<unknown>["id"];
