import { Injectable } from "@angular/core";
import * as Entity from "@lmstudios/entity";
import * as Models from "./Models";

@Injectable({providedIn:"root"})
export class Context extends Entity.Context{
    constructor(){
        super("http://localhost:53701/api");
    }
    public People = new Entity.Repository(this, Models.Person);
    public Users = new Entity.Repository(this, Models.User);
    //public People:Repositories.Person = new Repositories.Person(this);
}