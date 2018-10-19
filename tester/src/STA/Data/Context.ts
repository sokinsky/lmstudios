import { Injectable } from "@angular/core";
import * as LMS from "@lmstudios/entity";
import * as Models from "./Models";

@Injectable({providedIn:"root"})
export class Context extends LMS.Context{
    constructor(){
        super("http://localhost:53701/api");
    }
    @LMS.Meta.Decorators.Property(()=>LMS.Repository)
    public Emails = new LMS.Repository(this, Models.Email);
    @LMS.Meta.Decorators.Property(()=>LMS.Repository)
    public People = new LMS.Repository(this, Models.Person);
    @LMS.Meta.Decorators.Property(()=>LMS.Repository)
    public Users = new LMS.Repository(this, Models.User);
    @LMS.Meta.Decorators.Property(()=>LMS.Repository)
    public PeopleEmails = new LMS.Repository(this, Models.PersonEmail);
}