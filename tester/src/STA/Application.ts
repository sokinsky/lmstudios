import { Injectable } from "@angular/core";
import * as Entity from "@lmstudios/entity";
import * as Data from "./Data";

@Injectable()
export class Application extends Entity.Application {
    constructor(){
        super();
        this.Context = new Data.Context(this, "");
        console.log(this);
    }
    
}