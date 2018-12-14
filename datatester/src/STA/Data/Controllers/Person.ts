import { Context, Controller } from "@lmstudios/data";
import { Person as Base } from "../Models";


export class Person extends Controller<Base>{
    public toString(){
        return `${this.Actual.Model.FirstName} ${this.Actual.Model.LastName}`;
    }
}