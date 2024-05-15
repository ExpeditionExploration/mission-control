import { injectable, inject, Container } from "inversify";
import "reflect-metadata";

@injectable()
class InjectA {
    r = Math.random();
}

@injectable()
class InjectB {
    r = Math.random();
}

@injectable()
class ServiceB {
    @inject(InjectB) private injectB!: InjectB;
}

@injectable()
class ServiceA extends ServiceB {
    @inject(InjectA) private injectA!: InjectA;
}


var container = new Container();
container.bind<InjectA>(InjectA).to(InjectA).inSingletonScope();
container.bind<InjectB>(InjectB).to(InjectB).inSingletonScope();
container.bind<ServiceA>(ServiceA).to(ServiceA).inSingletonScope();
container.bind<ServiceB>(ServiceB).to(ServiceB).inSingletonScope();


var service = container.get<ServiceA>(ServiceA);
console.log(service);