import { Model } from "../Model";
//import { Person } from "../Models";
import { Attributes } from "@lmstudios/entity";

@Attributes.Class("STA.Data.Models.User")
export class User extends Model{
    @Attributes.Property(String)
    public Username?:string;
    @Attributes.Property(String)
    public Password?:string;
    @Attributes.Property(String)
    public Token?:string;
    
    @Attributes.Property("STA.Data.Models.Person")
    public Person?:Number;
}