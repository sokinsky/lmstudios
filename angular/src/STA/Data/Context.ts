import { Injectable, Inject, InjectionToken} from "@angular/core";
import { TypeDecorator } from "@lmstudios/types";
import { Context as Base } from "@lmstudios/data";
import { Models } from "./";
import { appSettings } from "../../Configuration/appSettings"

@Injectable({ providedIn: "root" })
@TypeDecorator("STA.Data.Context")
export class Context extends Base {
    constructor(){
        super();
    }
}

