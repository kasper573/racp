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

class ResourceManager<Shape, Factories extends ResourceFactories<Shape>> {
  private readonly _instances: Resource<Shape>[] = [];
  readonly create: Factories;

  get instances(): ReadonlyArray<Resource<Shape>> {
    return this._instances;
  }

  constructor(factories: Factories) {
    this.create = bindFactories(factories, this._instances);
  }

  dispose(instance: Resource<Shape>) {
    const index = this._instances.indexOf(instance);
    if (index !== -1) {
      this._instances.splice(index, 1);
      instance.dispose?.();
    }
  }
}

function bindFactories<Shape, Factories extends ResourceFactories<Shape>>(
  factories: Factories,
  instances: Resource<Shape>[]
): Factories {
  return Object.entries(factories).reduce(
    (acc, [name, factory]) => ({
      ...acc,
      [name]: (...args) => {
        const instance = factory(...args);
        instances.push(instance);
        instance.initialize?.();
        return instance;
      },
    }),
    {} as Factories
  );
}

type ResourceFactories<Shape> = Record<string, ResourceFactory<Shape>>;

type ResourceFactory<Shape> = (...args: any[]) => Resource<Shape>;

export type Resource<Shape> = Shape & {
  dispose?: () => void;
  initialize?: () => void;
};
