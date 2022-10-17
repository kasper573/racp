export function createResourceManager() {
  return new ResourceManagerBuilder({});
}

export class ResourceManagerBuilder<Factories extends ResourceFactories> {
  constructor(private factories: Factories) {}

  add<Name extends string, Factory extends ResourceFactory>(
    name: Name,
    factory: Factory
  ) {
    return new ResourceManagerBuilder({
      ...this.factories,
      [name]: factory,
    });
  }

  build() {
    return new ResourceManager(this.factories);
  }
}

class ResourceManager<Factories extends ResourceFactories> {
  private readonly _instances: Resource[] = [];
  readonly create: Factories;

  get instances(): ReadonlyArray<Resource> {
    return this._instances;
  }

  constructor(factories: Factories) {
    this.create = bindFactories(factories, this._instances);
  }

  dispose(instance: Resource) {
    const index = this._instances.indexOf(instance);
    if (index !== -1) {
      this._instances.splice(index, 1);
      instance.dispose?.();
    }
  }
}

function bindFactories<Factories extends ResourceFactories>(
  factories: Factories,
  instances: Resource[]
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

export type ResourceFactories = Record<string, ResourceFactory>;

export type ResourceFactory = (...args: any[]) => Resource;

export interface Resource {
  dispose?: () => void;
  initialize?: () => void;
}
