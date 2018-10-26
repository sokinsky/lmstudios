import * as LMSData from "@lmstudios/data";
import * as STA from "../";

export class Context extends LMSData.Context{
    constructor(){
        super("http://localhost:53701/api");
    }
    @LMSData.Meta.Decorators.Property(()=>LMSData.Repository)
    public Emails = new LMSData.Repository(this, STA.Data.Models.Email);
    @LMSData.Meta.Decorators.Property(()=>LMSData.Repository)
    public People = new LMSData.Repository(this, STA.Data.Models.Person);
    @LMSData.Meta.Decorators.Property(()=>LMSData.Repository)
    public Users = new LMSData.Repository(this, STA.Data.Models.User);
    @LMSData.Meta.Decorators.Property(()=>LMSData.Repository)
    public PeopleEmails = new LMSData.Repository(this, STA.Data.Models.PersonEmail);
}