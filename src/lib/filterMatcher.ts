export type FilterMatcherRecord = Record<string, FilterMatcherFn>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FilterMatcherFn<Target = any, Argument = any> = (
  target: Target,
  argument: Argument
) => boolean;

export interface FilterMatcher<Matchers extends FilterMatcherRecord> {
  add<MatcherName extends string, Matcher extends FilterMatcherFn>(
    name: MatcherName,
    matcher: Matcher
  ): FilterMatcher<Matchers & Record<MatcherName, Matcher>>;
  match<Argument extends FilterArgument<Matchers>>(
    target: FilterTarget<Matchers, Argument["matcher"]>,
    argument: Argument
  ): boolean;
}

export type FilterArgument<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Matchers extends FilterMatcherRecord = any,
  MatcherName extends keyof Matchers = keyof Matchers
> = {
  matcher: MatcherName;
  value: Parameters<Matchers[MatcherName]>[1];
};

export type FilterTarget<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Matchers extends FilterMatcherRecord = any,
  MatcherName extends keyof Matchers = keyof Matchers
> = Parameters<Matchers[MatcherName]>[0];

export function createFilterMatcher() {
  function create<Matchers extends FilterMatcherRecord>(
    matchers: Matchers
  ): FilterMatcher<Matchers> {
    return {
      add(type, matcher) {
        return create({ ...matchers, [type]: matcher });
      },
      match(target, filter) {
        return matchers[filter.matcher](target, filter.value);
      },
    };
  }
  return create({});
}
