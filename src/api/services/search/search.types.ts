import * as zod from "zod";
import { AnyZodObject, ZodType } from "zod";
import { Path, zodPath } from "../../../lib/zod/zodPath";
import { zodRegexString } from "../../../lib/zod/zodRegexString";

export const sortDirectionType = zod.union([
  zod.literal("asc"),
  zod.literal("desc"),
]);

export function createSearchTypes<T extends AnyZodObject>(entityType: T) {
  type Entity = zod.infer<T>;

  const pathType = zodPath(entityType);

  const filterType = createSearchFilterType(entityType) as ZodType<
    SearchFilterItem<Entity>
  >;

  const sortType: ZodType<SearchSort<Entity>> = zod.array(
    zod.object({
      field: pathType,
      sort: sortDirectionType,
    })
  );

  const queryType: ZodType<SearchQuery<Entity>> = zod.object({
    filter: zod.array(filterType).optional(),
    sort: sortType.optional(),
    offset: zod.number().optional(),
    limit: zod.number().optional(),
  });

  const resultType: ZodType<SearchResult<Entity>> = zod.object({
    total: zod.number(),
    entities: zod.array(entityType),
  });

  return [queryType, resultType] as const;
}

export function createSearchFilterType<T extends AnyZodObject>(entityType: T) {
  const primitive = zod.union([zod.string(), zod.number()]);
  const field = zodPath(entityType);

  function option<OperatorName extends string, Argument extends ZodType>(
    operatorName: OperatorName,
    argument: Argument
  ) {
    return zod.object({
      field,
      operator: zod.literal(operatorName),
      argument,
    });
  }

  return zod.union([
    option("eq", primitive),
    option("ne", primitive),
    option("gt", primitive),
    option("lt", primitive),
    option("gte", primitive),
    option("lte", primitive),
    option("between", zod.tuple([primitive, primitive])),
    option("oneOf", zod.array(primitive)),
    option("regexp", zodRegexString()),
  ]);
}

export type SortDirection = zod.infer<typeof sortDirectionType>;

export interface SearchQuery<T> {
  filter?: SearchFilter<T>;
  sort?: SearchSort<T>;
  offset?: number;
  limit?: number;
}

export type SearchFilter<T> = Array<SearchFilterItem<T>>;

export type AnySearchFilterItem = zod.infer<
  ReturnType<typeof createSearchFilterType>
>;

export type SearchFilterOperator = AnySearchFilterItem["operator"];

export type SearchFilterItem<
  T,
  K extends SearchFilterOperator = SearchFilterOperator
> = Omit<Extract<AnySearchFilterItem, { operator: K }>, "field"> & {
  field: Path<T>;
};

export type SearchSort<T> = Array<{
  field: Path<T>;
  sort: SortDirection;
}>;

export interface SearchResult<T> {
  total: number;
  entities: T[];
}
