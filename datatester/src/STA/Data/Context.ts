import { Injectable, Inject } from "@angular/core";
import { Schema, Context as Base, Repository, Decorators } from "@lmstudios/data";
import { Email, Person, User, PersonEmail } from "./Models";

@Injectable({ providedIn: "root" })
@Decorators.Context("STA.Data.Context", "http://localhost:53701/api")
export class Context extends Base {
    constructor(@Inject(schemaToken) schema:Schema.Context){super(schema)}
    public Emails = new Repository(this, Email);
    public People = new Repository(this, Person);
    public Users = new Repository(this, User);
    public PeopleEmails = new Repository(this, PersonEmail);
}
