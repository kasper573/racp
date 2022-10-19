export function createResourceManager<Shape>() {
  return new ResourceManagerBuilder<Shape, {}>({});
}

class ResourceManagerBuilder<
  Shape,
  Factories extends ResourceFactories<Shape>
> {
  constructor(private factories: Factories) {}

  add<Name extends string, Factory extends ResourceFactory<Shape>>(
    name: Name,
    factory: Factory
  ) {
    return new ResourceManagerBuilder<Shape, Factories & Record<Name, Factory>>(
      {
        ...this.factories,
        [name]: factory,
      }
    );
  }

  build() {
    return new ResourceManager<Shape, Factories>(this.factories);
  }
}

/**
 * Do not use this directly. You should only create resource managers using the builder.
 * @deprecated
 */
export class ResourceManager<
  Shape,
  Factories extends ResourceFactories<Shape>
> {
  private readonly _instances: Resource<Shape>[] = [];
  readonly create: Factories;

  get instances(): ReadonlyArray<Resource<Shape>> {
    return this._instances;
  }

  constructor(factories: Factories) {
    this.create = Object.entries(factories).reduce(
      (bound, [name, factory]) => ({
        ...bound,
        [name]: (...args) => this.createUsing(factory, ...args),
      }),
      {} as Factories
    );
  }

  createUsing<Factory extends ResourceFactory<Shape>>(
    factory: Factory,
    ...args: Parameters<Factory>
  ): ReturnType<Factory> {
    const instance = factory(...args);
    this._instances.push(instance);
    instance.initialize?.();
    return instance as ReturnType<Factory>;
  }

  dispose(instance: Resource<Shape>) {
    const index = this._instances.indexOf(instance);
    if (index !== -1) {
      this._instances.splice(index, 1);
      instance.dispose?.();
    }
  }
}

type ResourceFactories<Shape> = Record<string, ResourceFactory<Shape>>;

type ResourceFactory<Shape> = (...args: any[]) => Resource<Shape>;

export type Resource<Shape> = Shape & {
  dispose?: () => void;
  initialize?: () => void;
};
