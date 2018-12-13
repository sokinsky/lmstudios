import { Context, Controller } from "@lmstudios/data";
import { Person as Base } from "../Models";


export class Person extends Controller<Base>{
    public toString(){
        return `${this.__values.Actual.Model.FirstName} ${this.__values.Actual.Model.LastName}`;
    }
}