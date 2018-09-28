
import { Assembly } from "@lmstudios/reflection";
import * as Entity from "@lmstudios/entity";
import * as Models from "./Models";
import * as Repositories from "./Repositories";
import { Application } from "../";

export class Context extends Entity.Context{
    constructor(application:Application, api:string|Entity.API){
        super(application, api);
    }

    //public People = new Entity.Repository(this, Models.Person);
    //public People:Repositories.Person = new Repositories.Person(this);
}