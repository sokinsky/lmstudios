import { Model } from "../Model";
//import { User } from "../Models";
import { Attributes } from "@lmstudios/entity";

@Attributes.Class("STA.Data.Models.Person")
export class Person extends Model{
    @Attributes.Property(String)
    public FirstName?:string;
    @Attributes.Property(String)
    public LastName?:string;
    @Attributes.Property(Date)
    public DOB?:Date;

    @Attributes.Property(Boolean);
    public Alive?:boolean;
    



}