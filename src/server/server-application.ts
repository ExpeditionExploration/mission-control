import { Injectable } from "@module";
import { Container } from "inversify";
import { Application } from "src/application";
import * as controllers from 'src/modules/controllers';

@Injectable()
export class ServerApplication extends Application {
    async init() {
        await super.init(controllers);
    }
}

export default ServerApplication;