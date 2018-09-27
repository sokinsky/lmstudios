import { Assembly } from "@lmstudios/reflection";
import * as Entity from "@lmstudios/entity";
import * as Models from "./Models";
import * as Repositories from "./Repositories";
import { Application } from "../";

export class Context extends Entity.Context{
    constructor(application:Application, assembly:Assembly){
        super(application, assembly, "");
    }

    public People = new Entity.Repository(this, Models.Person);
    //public People:Repositories.Person = new Repositories.Person(this);
}