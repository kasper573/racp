import { Knex } from "knex";

export function createKnexMatcher<Entries>() {
  return new KnexMatcher({});
}

export class KnexMatcher<
  Builders extends KnexMatcherBuilders = KnexMatcherBuilders
> {
  constructor(public builders: Builders) {}

  add<Name extends string, Builder extends KnexMatcherBuilder>(
    name: Name,
    builder: Builder
  ) {
    return new KnexMatcher<Builders & Record<Name, Builder>>({
      ...this.builders,
      [name]: builder,
    });
  }

  match<
    InputQuery extends Knex.QueryBuilder,
    Payload extends KnexMatchPayload<Builders>
  >(
    query: InputQuery,
    payload: Payload,
    columnMap: KnexMatcherColumnMap<Payload>
  ) {
    let outputQuery = query.clone();
    for (const [field, { matcher, value, options }] of Object.entries(
      payload
    )) {
      const column = columnMap[field];
      if (!column) {
        console.log("Skipping unknown field", field);
        continue;
      }
      outputQuery = this.builders[matcher](query, column, value, options);
    }
    return outputQuery;
  }

  search<
    InputQuery extends Knex.QueryBuilder,
    Payload extends KnexSearchPayload<Builders>
  >(
    query: InputQuery,
    { filter, sort, offset, limit }: Payload,
    columnMap: KnexMatcherColumnMap<Exclude<Payload["filter"], undefined>>
  ) {
    let resultQuery = query.clone();
    if (filter) {
      resultQuery = this.match(resultQuery, filter, columnMap);
    }

    if (sort?.length) {
      const [{ field, sort: direction }] = sort;
      const column = columnMap[field];
      if (column) {
        resultQuery = resultQuery.orderBy(column, direction);
      }
    }

    if (offset !== undefined) {
      resultQuery = resultQuery.offset(offset);
    }

    if (limit !== undefined) {
      resultQuery = resultQuery.limit(limit);
    }

    return resultQuery;
  }
}

export interface KnexSearchPayload<Builders extends KnexMatcherBuilders> {
  filter?: KnexMatchPayload<Builders>;
  sort?: Array<{ field: string; sort: "asc" | "desc" }>;
  offset?: number;
  limit?: number;
}

export type KnexMatcherColumnMap<Payload extends KnexMatchPayload> = Partial<
  Record<keyof Payload, string>
>;

export type KnexMatcherBuilders = Record<string, KnexMatcherBuilder>;

export type KnexMatchPayload<Builders extends KnexMatcherBuilders = any> =
  Record<string, KnexMatchPayloadForBuilders<Builders>>;

export type KnexMatcherBuilder<
  Argument = any,
  Options = any,
  InputQuery extends Knex.QueryBuilder = Knex.QueryBuilder,
  OutputQuery extends Knex.QueryBuilder = Knex.QueryBuilder
> = <Columns extends string>(
  query: InputQuery,
  column: Columns,
  argument: Argument,
  options?: Options
) => OutputQuery;

export type KnexMatchPayloadForBuilders<Builders extends KnexMatcherBuilders> =
  {
    [Name in keyof Builders]: KnexMatchPayloadForBuilder<Name, Builders[Name]>;
  }[keyof Builders];

export type KnexMatchPayloadForBuilder<
  Name extends keyof any,
  Builder extends KnexMatcherBuilder
> = KnexMatchPayloadItem<Name, Parameters<Builder>[2], Parameters<Builder>[3]>;

export interface KnexMatchPayloadItem<Name extends keyof any, Value, Options> {
  matcher: Name;
  value: Value;
  options?: Options;
}
