import {
  TagDescription,
  FullTagDescription,
} from "@reduxjs/toolkit/dist/query/endpointDefinitions";

export function createTagFactory<TagType>(type: TagType) {
  const listTag: TagDescription<TagType> = { type, id: "LIST" };

  function many(ids: TagId[] = []): TagDescription<TagType>[] {
    return [listTag, ...ids.map((id) => ({ type, id }))];
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
