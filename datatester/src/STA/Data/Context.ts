import { Injectable } from "@angular/core";
import { Context as Base } from "@lmstudios/data";
import { Decorators, Repository } from "@lmstudios/data";
import * as STA from "../";

@Injectable({providedIn:"root"})
export class Context extends Base {
    constructor(){
        super("http://localhost:53701/api");
    }
    @Decorators.Map(()=>Repository)
    public Emails = new Repository(this, STA.Data.Models.Email);
    @Decorators.Map(()=>Repository)
    public People = new Repository(this, STA.Data.Models.Person);
    @Decorators.Map(()=>Repository)
    public Users = new Repository(this, STA.Data.Models.User);
    @Decorators.Map(()=>Repository)
    public PeopleEmails = new Repository(this, STA.Data.Models.PersonEmail);
}