import { Injectable } from "@angular/core";
import { Context as Base, Repository } from "@lmstudios/data";
import { Email, Person, User, PersonEmail } from "./Models";

@Injectable({providedIn:"root"})
export class Context extends Base {
	constructor() { super("http://localhost:53701/api");}
    public Emails = new Repository(Email);
    public People = new Repository(Person);
    public Users = new Repository(User);
    public PeopleEmails = new Repository(PersonEmail);
}
