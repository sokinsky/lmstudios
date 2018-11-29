import { Injectable } from "@angular/core";
import { Context as Base, Repository, Decorators } from "@lmstudios/data";
import { Email, Person, User, PersonEmail } from "./Models";

@Injectable({ providedIn: "root" })
@Decorators.Context("STA.Data.Context", "http://localhost:53701/api")
export class Context extends Base {
    public Emails = new Repository(Email);
    public People = new Repository(Person);
    public Users = new Repository(User);
    public PeopleEmails = new Repository(PersonEmail);
}
